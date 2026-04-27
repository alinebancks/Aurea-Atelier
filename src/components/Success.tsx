import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sucesso = () => {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="font-display text-4xl md:text-5xl">Pedido Recebido!</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Obrigado pela sua compra na <strong>Auréa Atelier</strong>. 
        Seu pagamento foi processado com sucesso e logo você receberá os detalhes por e-mail.
      </p>

      <div className="mt-10 flex gap-4">
        <Button asChild variant="outline">
          <Link to="/loja">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuar comprando
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Sucesso;