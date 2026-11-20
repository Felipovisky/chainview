import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface UserAccount {
  name: string;
  email: string;
  password: string;
}

interface Props {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [savedAccount, setSavedAccount] = useState<UserAccount | null>(() => {
    const raw = localStorage.getItem('chainview_user_account');
    return raw ? JSON.parse(raw) : null;
  });

  const [mode, setMode] = useState<'login' | 'register'>(() => (savedAccount ? 'login' : 'register'));

  const [name, setName] = useState(savedAccount?.name || '');
  const [email, setEmail] = useState(savedAccount?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || password.length < 4) {
        setError('Preencha todos os campos (senha mínima de 4 caracteres).');
        return;
      }
      const newAccount: UserAccount = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };
      localStorage.setItem('chainview_user_account', JSON.stringify(newAccount));
      setSavedAccount(newAccount);
      onLoginSuccess({ name: newAccount.name, email: newAccount.email });
      return;
    }

    if (!savedAccount) {
      setError('Nenhuma conta encontrada neste navegador. Crie um acesso primeiro.');
      return;
    }

    if (
      email.trim().toLowerCase() === savedAccount.email.toLowerCase() &&
      password === savedAccount.password
    ) {
      onLoginSuccess({ name: savedAccount.name, email: savedAccount.email });
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-center items-center p-6 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Brilho sutil de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Marca */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-4">
            <Zap size={24} className="fill-emerald-400/20" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">ChainView</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão Tática de Portfólio & Valuation Fibonacci
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-[#121824] border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          {/* Seletor Entrar / Criar Acesso */}
          <div className="flex bg-[#0b0e14] p-1 rounded-lg border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {savedAccount ? 'Redefinir Acesso' : 'Criar Acesso'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Seu Nome
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Felipe Lima"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium px-3.5 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-lg shadow-emerald-500/15 active:scale-[0.99] transition mt-2"
            >
              {mode === 'login' ? 'Acessar Portfólio' : 'Salvar e Entrar'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Rodapé de Segurança */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-6">
          <ShieldCheck size={14} className="text-emerald-500/70" />
          <span>Seus dados permanecem armazenados localmente no seu navegador.</span>
        </div>
      </div>
    </div>
  );
};