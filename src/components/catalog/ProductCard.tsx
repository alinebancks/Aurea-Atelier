import { Link } from 'react-router-dom';
import type { Product } from '@/types/catalog';
import { formatPrice } from '@/lib/format';

export const ProductCard = ({ product }: { product: Product }) => (
  <Link
    to={`/produto/${product.slug}`}
    className="group block animate-fade-up"
  >
    <div className="aspect-[3/4] overflow-hidden bg-muted">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
        />
      ) : (
        <div className="h-full w-full bg-gradient-gold opacity-30" />
      )}
    </div>
    <div className="mt-4 space-y-1">
      <h3 className="font-display text-lg leading-tight">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{formatPrice(product.price_cents)}</p>
    </div>
  </Link>
);