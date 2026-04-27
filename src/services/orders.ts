import type { CartItem } from '@/types/catalog';
import type { CheckoutInput } from '@/lib/validation';

const API_URL = 'http://localhost:8000/api';
const SHIPPING_FREE_THRESHOLD_CENTS = 50000;
const SHIPPING_FLAT_CENTS = 2500;

export const computeShipping = (subtotalCents: number) =>
  subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;

export const createOrder = async (params: {
  userId: string;
  items: CartItem[];
  address: CheckoutInput;
}) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) throw new Error('Falha ao criar pedido');
  const data = await response.json();
  return data.id;
};

export const listMyOrders = async () => {
  const response = await fetch(`${API_URL}/orders`);
  if (!response.ok) throw new Error('Falha ao buscar pedidos');
  return response.json();
};