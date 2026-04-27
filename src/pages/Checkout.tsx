import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkoutSchema, type CheckoutInput } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { computeShipping, createOrder } from '@/services/orders';
import { startPaymentSession } from '@/services/payments';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotalCents, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const shipping = computeShipping(subtotalCents);
  const total = subtotalCents + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  });

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-3xl">Carrinho vazio</p>
        <Button asChild className="mt-6"><a href="/loja">Ver coleção</a></Button>
      </div>
    );
  }

  const onSubmit = async (address: CheckoutInput) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const orderId = await createOrder({ userId: user.id, items, address });
      try {
        const { url } = await startPaymentSession(orderId);
        clear();
        window.location.href = url;
      } catch {
        clear();
        toast.success('Pedido registrado', {
          description: 'O pagamento será habilitado em breve. Acompanhe em "Minha conta".',
        });
        navigate('/conta', { replace: true });
      }
    } catch (err) {
      toast.error('Não foi possível concluir', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-16 md:py-24">
      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <p className="eyebrow">Endereço de entrega</p>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="line1">Endereço</Label>
            <Input id="line1" {...register('line1')} />
            {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input id="state" maxLength={2} {...register('state')} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">CEP</Label>
            <Input id="zip" {...register('zip')} />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar pedido
          </Button>
        </form>

        <aside className="h-fit space-y-4 border border-border bg-card p-6">
          <p className="font-display text-2xl">Seu pedido</p>
          <ul className="space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="flex-1">{i.name} <span className="text-muted-foreground">× {i.quantity}</span></span>
                <span>{formatPrice(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotalCents)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base"><span>Total</span><span className="font-medium">{formatPrice(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;