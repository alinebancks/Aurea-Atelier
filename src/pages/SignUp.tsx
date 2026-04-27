import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpSchema, type SignUpInput } from '@/lib/validation';
import { toast } from 'sonner';
import { PatternFormat } from 'react-number-format';

const SignUp = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpInput) => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao registrar usuário');
      }

      toast.success('Conta criada com sucesso!', { 
        description: 'Agora faça login para validar seu acesso.' 
      });
      
      // Enviamos para o login para seguir o fluxo de verificação
      navigate('/entrar', { replace: true });
    } catch (error: any) {
      toast.error('Não foi possível criar a conta', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md py-20">
      <h1 className="font-display text-4xl">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Junte-se ao círculo Auréa Atelier.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <PatternFormat
                format="+55 (##) #####-####"
                mask="_"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={value}
                onValueChange={(values) => {
                  // Manda o valor limpo com +55 para o banco
                  onChange('+' + values.value);
                }}
                placeholder="+55 (41) 99999-9999"
              />
            )}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/entrar" className="text-gold underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
};

export default SignUp;