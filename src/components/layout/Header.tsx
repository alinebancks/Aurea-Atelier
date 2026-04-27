import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-2xl tracking-wide">
          Auréa <span className="text-gold">Atelier</span>
        </Link>

        <div className="flex items-center gap-1 ml-auto">
          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/conta')} aria-label="Minha conta">
                <User2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/entrar')}>
              Entrar
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={() => navigate('/carrinho')} aria-label="Carrinho" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};