import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInSchema, type SignInInput } from '@/lib/validation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate(); // O navegador mora aqui!
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInInput) => {
    setSubmitting(true);
    try {
      const result = await signIn(values.email, values.password);

      if (result.success) {
        // Redirecionamento seguro com base na resposta do banco
        if (result.emailConfirmed === false) {
          navigate('/verificar-conta', { state: { email: values.email } });
        } else {
          navigate('/loja');
        }
      } else {
        toast.error('Não foi possível entrar', { description: result.error });
      }
    } catch (error: any) {
      toast.error('Erro inesperado', { description: 'Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md py-20">
      <h1 className="font-display text-4xl">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta no Auréa Atelier.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link to="/cadastrar" className="text-gold underline-offset-4 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
};

export default SignIn;