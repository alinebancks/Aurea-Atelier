const API_URL = 'http://localhost:8000/api';

export const startPaymentSession = async (email: string, items: any[]) => {
  const response = await fetch(`${API_URL}/checkout/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: email, 
      items: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.priceCents / 100 // O backend vai ignorar isso e cobrar 0.01 por enquanto
      }))
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro na sessão de pagamento');
  }

  return response.json(); // Retorna o init_point vindo do Python
};