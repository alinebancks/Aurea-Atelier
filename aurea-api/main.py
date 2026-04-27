import os
import jwt
import random
import string
import bcrypt
import resend
import mercadopago
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg_pool import AsyncConnectionPool
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
DB_DSN = os.getenv("DB_DSN")
resend.api_key = os.getenv("RESEND_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

# Inicialização Mercado Pago
sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = AsyncConnectionPool(conninfo=DB_DSN, open=False)
    await app.state.pool.open()
    print("--- SERVIDOR ONLINE ---")
    yield
    await app.state.pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    fullName: str = ""
    phone: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    email: str
    emailCode: str
    phoneCode: str

class CheckoutRequest(BaseModel):
    email: str
    items: list

# --- ROTAS DE AUTENTICAÇÃO ---

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    hashed_pwd = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    email_code = ''.join(random.choices(string.digits, k=6))
    phone_code = ''.join(random.choices(string.digits, k=6))
    
    async with app.state.pool.connection() as conn:
        async with conn.cursor() as cur:
            try:
                await cur.execute(
                    """INSERT INTO accounts 
                       (email, password_hash, full_name, phone, confirmation_token, phone_token) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (req.email, hashed_pwd, req.fullName, req.phone, email_code, phone_code)
                )
                
                try:
                    resend.Emails.send({
                        "from": "onboarding@resend.dev",
                        "to": req.email,
                        "subject": "Código de E-mail - Auréa Atelier",
                        "html": f"<p>Seu código de E-MAIL é: <strong>{email_code}</strong></p>"
                    })
                except Exception as e:
                    print(f"Erro Resend: {e}")

                if req.phone:
                    try:
                        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                        clean_phone = ''.join(filter(str.isdigit, req.phone))
                        if clean_phone.startswith('55'): clean_phone = clean_phone[2:]
                        if len(clean_phone) == 11: clean_phone = clean_phone[:2] + clean_phone[3:]
                        
                        client.messages.create(
                            from_=TWILIO_WHATSAPP_NUMBER,
                            body=f"Auréa Atelier: Código WhatsApp: {phone_code}",
                            to=f"whatsapp:+55{clean_phone}"
                        )
                    except Exception as e:
                        print(f"Erro Twilio: {e}")

                return {"message": "Cadastro realizado."}
            except Exception as e:
                print(f"Erro: {e}")
                raise HTTPException(status_code=400, detail="Erro ao registrar usuário.")

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    async with app.state.pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT password_hash, email_confirmed, phone_confirmed FROM accounts WHERE email = %s", (req.email,))
            user = await cur.fetchone()
            if not user or not bcrypt.checkpw(req.password.encode('utf-8'), user[0].encode('utf-8')):
                raise HTTPException(status_code=401, detail="Email ou senha incorretos")
            
            token = jwt.encode({"sub": req.email, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}, SECRET_KEY, algorithm=ALGORITHM)
            return {"token": token, "email_confirmed": user[1], "phone_confirmed": user[2]}

@app.post("/api/auth/verify")
async def verify(req: VerifyRequest):
    async with app.state.pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT confirmation_token, phone_token FROM accounts WHERE email = %s", (req.email,))
            row = await cur.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Usuário não encontrado.")

            if row[0] != req.emailCode or row[1] != req.phoneCode:
                raise HTTPException(status_code=400, detail="Código(s) incorreto(s).")
            
            await cur.execute("UPDATE accounts SET email_confirmed = true, phone_confirmed = true WHERE email = %s", (req.email,))
            return {"message": "Verificado!"}

# --- ROTA DE PAGAMENTO ---

@app.post("/api/checkout/create")
async def create_preference(req: CheckoutRequest):
    print(f"--- INICIANDO CHECKOUT PARA: {req.email} ---")
    
    items_to_pay = []
    for item in req.items:
        items_to_pay.append({
            "title": item.get("name", "Produto Auréa"),
            "quantity": int(item.get("quantity", 1)),
            "unit_price": 0.01, # Valor fixo de teste
            "currency_id": "BRL"
        })

    preference_data = {
        "items": items_to_pay,
        "payer": {
            "email": req.email
        },
        "back_urls": {
            "success": "http://localhost:5173/sucesso",
            "failure": "http://localhost:5173/erro",
            "pending": "http://localhost:5173/pendente"
        },
        
    }

    try:
        response = sdk.preference().create(preference_data)
        
        if response["status"] >= 400:
            print(f"--- ERRO API MERCADO PAGO: {response['response']} ---")
            raise HTTPException(status_code=400, detail="Erro na configuração do pagamento")

        return {"init_point": response["response"]["init_point"]}
        
    except Exception as e:
        print(f"--- ERRO INTERNO NO PYTHON: {e} ---")
        raise HTTPException(status_code=500, detail=str(e))

# --- PRODUTOS ---

@app.get("/api/products")
async def get_products():
    async with app.state.pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id, name, slug, price_cents, image_url, description FROM products WHERE active = true")
            rows = await cur.fetchall()
            cols = [desc[0] for desc in cur.description]
            products = [dict(zip(cols, row)) for row in rows]
            for p in products:
                p['stock_quantity'] = 10 
                p['in_stock'] = True
            return products

@app.get("/api/products/{slug}")
async def get_product_by_slug(slug: str):
    async with app.state.pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM products WHERE slug = %s", (slug,))
            row = await cur.fetchone()
            if not row: raise HTTPException(status_code=404, detail="Não encontrado")
            cols = [desc[0] for desc in cur.description]
            product = dict(zip(cols, row))
            product.update({'stock_quantity': 99, 'in_stock': True, 'active': True})
            return product