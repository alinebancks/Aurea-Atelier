import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/format';
import { computeShipping } from '@/services/orders';
import { toast } from 'sonner';

// Importação do serviço que vamos ajustar no passo abaixo
import { startPaymentSession } from '@/services/payments';

const Cart = () => {
  const { items, setQuantity, remove, subtotalCents } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);


  const userEmail = "user@teste.com"; 

  const shipping = computeShipping(subtotalCents);
  const total = subtotalCents + shipping;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    try {
      const data = await startPaymentSession(userEmail, items);
      
      if (data.init_point) {
        // Redireciona direto para o Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não gerado');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-3xl">Seu carrinho está vazio</p>
        <p className="mt-3 text-muted-foreground">Descubra a coleção atual.</p>
        <Button asChild className="mt-8" size="lg">
          <Link to="/loja">Ver coleção</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-16 md:py-24">
      <h1 className="font-display text-4xl md:text-5xl">Carrinho</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-4 py-6">
              <Link to={`/produto/${i.slug}`} className="h-32 w-24 flex-shrink-0 overflow-hidden bg-muted">
                {i.imageUrl && <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/produto/${i.slug}`} className="font-display text-lg hover:text-gold transition-colors">
                      {i.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{formatPrice(i.priceCents)}</p>
                  </div>
                  <button
                    onClick={() => remove(i.productId)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setQuantity(i.productId, i.quantity - 1)} className="h-9 w-9 hover:bg-secondary">
                      <Minus className="mx-auto h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => setQuantity(i.productId, i.quantity + 1)} className="h-9 w-9 hover:bg-secondary">
                      <Plus className="mx-auto h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm">{formatPrice(i.priceCents * i.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 border border-border bg-card p-6">
          <p className="font-display text-2xl">Resumo</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <span>Total</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full" 
            onClick={handleCheckout} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Finalizar compra'
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">Frete grátis acima de R$ 500,00</p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;