import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/services/catalog';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="container py-24"><div className="h-96 animate-pulse bg-muted" /></div>;
  }

  if (!product) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-2xl">Peça não encontrada</p>
        <Link to="/loja" className="mt-4 inline-block text-gold underline-offset-4 hover:underline">
          Voltar para a coleção
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  const handleAdd = () => {
    add(product, qty);
    toast.success('Peça adicionada ao carrinho', {
      description: product.name,
    });
  };

  return (
    <div className="container py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex flex-col">
          <p className="eyebrow mb-3">Auréa Atelier</p>
          <h1 className="font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl text-gold-deep">{formatPrice(product.price_cents)}</p>

          {product.description && (
            <p className="mt-8 text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="mt-10 space-y-6">
            <div>
              <p className="eyebrow mb-3">Quantidade</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 hover:bg-secondary transition-colors"
                  aria-label="Diminuir"
                >
                  <Minus className="mx-auto h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="h-11 w-11 hover:bg-secondary transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>

            <Button size="lg" className="w-full md:w-auto" disabled={!inStock} onClick={handleAdd}>
              {inStock ? 'Adicionar ao carrinho' : 'Esgotado'}
            </Button>

            {inStock && product.stock <= 5 && (
              <p className="text-xs text-gold-deep">Restam apenas {product.stock} peças.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;