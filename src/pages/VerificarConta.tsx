import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const VerificarConta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [step, setStep] = useState<1 | 2>(1);
  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!email) {
    navigate('/entrar');
    return null;
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCode.length !== 6) {
      toast.error('O código precisa ter 6 números.');
      return;
    }
    setStep(2);
  };

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode.length !== 6) {
      toast.error('O código do WhatsApp precisa ter 6 números.');
      return;
    }

    setSubmitting(true);
    try {
      // AJUSTE AQUI: Enviamos emailCode e phoneCode como o Back-end espera
      const response = await fetch('http://localhost:8000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            emailCode: emailCode, // código do passo 1
            phoneCode: smsCode    // código do passo 2
        }),
      });

      if (response.ok) {
        toast.success('Conta confirmada com sucesso!');
        navigate('/loja');
      } else {
        const data = await response.json();
        toast.error('Erro na verificação', { 
            description: data.detail || 'Um ou ambos os códigos estão incorretos.' 
        });
        // Se der erro, você pode escolher se volta pro passo 1 ou deixa o usuário tentar o SMS de novo
        // setStep(1); 
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md py-20">
      <h1 className="font-display text-4xl">
        {step === 1 ? 'Confirme seu e-mail' : 'Confirme seu WhatsApp'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {step === 1
          ? `Enviamos um código de 6 dígitos para o e-mail ${email}.`
          : `Enviamos um código de 6 dígitos para o seu WhatsApp.`}
      </p>

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="emailCode">Código do E-mail</Label>
            <Input
              id="emailCode"
              type="text"
              maxLength={6}
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={emailCode.length !== 6}>
            Avançar para WhatsApp
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSmsSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="smsCode">Código do WhatsApp</Label>
            <Input
              id="smsCode"
              type="text"
              maxLength={6}
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting || smsCode.length !== 6}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finalizar Cadastro
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
            Voltar para E-mail
          </Button>
        </form>
      )}
    </div>
  );
};

export default VerificarConta;