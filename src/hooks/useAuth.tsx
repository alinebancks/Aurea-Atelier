import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type User = { id: string; email?: string };
type Session = { access_token: string; user: User };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; emailConfirmed?: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
      setSession({ access_token: token, user: { id: userEmail, email: userEmail } });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        setSession({ access_token: data.token, user: { id: email, email } });
        
        // Devolve o status da confirmação para a tela de login decidir o que fazer
        return { success: true, emailConfirmed: data.email_confirmed };
      } else {
        return { success: false, error: data.detail || 'Erro ao fazer login' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signOut: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};