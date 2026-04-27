import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ProductCard } from '@/components/catalog/ProductCard';
import { listCategories, listProducts } from '@/services/catalog';
import { NavLink } from 'react-router-dom';

const Shop = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', categorySlug ?? 'all'],
    queryFn: () => listProducts(categorySlug),
  });

  const current = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="container py-16 md:py-24">
      <header className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Coleção</p>
        <h1 className="font-display text-5xl">{current?.name ?? 'Toda a coleção'}</h1>
        {current?.description && <p className="mt-4 text-muted-foreground">{current.description}</p>}
      </header>

      <div className="mb-10 flex flex-wrap gap-2 text-sm">
        <NavLink
          to="/loja"
          end
          className={({ isActive }) =>
            `border px-4 py-2 transition-colors ${isActive ? 'border-gold text-gold' : 'border-border hover:border-gold'}`
          }
        >
          Tudo
        </NavLink>
        {categories.map((c) => (
          <NavLink
            key={c.id}
            to={`/loja/${c.slug}`}
            className={({ isActive }) =>
              `border px-4 py-2 transition-colors ${isActive ? 'border-gold text-gold' : 'border-border hover:border-gold'}`
            }
          >
            {c.name}
          </NavLink>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] animate-pulse bg-muted" />
              <div className="h-4 w-3/4 animate-pulse bg-muted" />
              <div className="h-3 w-1/3 animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">Nenhuma peça encontrada nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;