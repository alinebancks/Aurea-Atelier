import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/catalog/ProductCard';
import { listProducts } from '@/services/catalog';

const Home = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => listProducts(),
  });

  const featured = products.slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container grid gap-12 py-20 md:grid-cols-2 md:py-32">
          <div className="flex flex-col justify-center animate-fade-up">
            <p className="eyebrow mb-6">Coleção Outono · Edição Limitada</p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-7xl text-balance">
              Roupas pensadas para <span className="italic text-gold">durar gerações</span>.
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground">
              Tecidos nobres, modelagens precisas e acabamento artesanal. Cada peça do Auréa Atelier nasce
              do encontro entre tradição e olhar contemporâneo.
            </p>
            <div className="mt-10 flex gap-3">
              <Button asChild size="lg">
                <Link to="/loja">Ver coleção</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/loja/alfaiataria">Alfaiataria</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200"
              alt="Modelo vestindo peça da coleção Auréa"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Selecionados</p>
            <h2 className="font-display text-4xl">Em destaque</h2>
          </div>
          <Link to="/loja" className="text-sm text-gold underline-offset-4 hover:underline">
            Ver tudo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container grid gap-10 md:grid-cols-3">
          {[
            { title: 'Edição limitada', text: 'Pequenas séries numeradas. Sem reposições.' },
            { title: 'Feito à mão', text: 'Costureiras parceiras em São Paulo e Curitiba.' },
            { title: 'Tecidos nobres', text: 'Seda, linho italiano, lã fria e couro legítimo.' },
          ].map((b) => (
            <div key={b.title} className="text-center">
              <p className="font-display text-2xl">{b.title}</p>
              <p className="mt-3 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;