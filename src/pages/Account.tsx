import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { listMyOrders } from '@/services/orders';
import { formatPrice, formatDate } from '@/lib/format';

const statusLabel: Record<string, string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const Account = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: listMyOrders,
  });

  return (
    <div className="container py-16 md:py-24">
      <p className="eyebrow mb-3">Minha conta</p>
      <h1 className="font-display text-4xl">Olá, {user?.email}</h1>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Meus pedidos</h2>

        {isLoading ? (
          <div className="mt-6 h-32 animate-pulse bg-muted" />
        ) : orders.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Você ainda não possui pedidos.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border border border-border">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">#{o.id.slice(0, 8)} · {formatDate(o.created_at)}</p>
                  <p className="mt-1 font-display text-lg">{formatPrice(o.total_cents)}</p>
                </div>
                <span className="text-xs uppercase tracking-widest text-gold-deep">
                  {statusLabel[o.status] ?? o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Account;