import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { setToken, validateToken } from '@/lib/cfApi';
import logoLustosa from '@/assets/logo-lustosa.jpg';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Digite a senha');
      return;
    }

    setLoading(true);
    const valid = await validateToken(password.trim());

    if (valid) {
      setToken(password.trim());
      navigate('/admin/products');
    } else {
      setError('Senha inválida');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
            <img src={logoLustosa} alt="Lustosa Sports" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-primary tracking-tight">LUSTOSA SPORTS</h1>
            <p className="text-muted-foreground text-sm">Painel Administrativo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-secondary/50 rounded-xl p-6 border border-border">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Digite a senha de acesso"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
