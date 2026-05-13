'use client';

import React from 'react';
import { NeonInput, NeonButton, SocialLoginButton } from '@liveshop/liquidos-ui';
import { ChevronLeft, Mail, Lock, ArrowRight, Facebook, Github } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function EmailLoginPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Armazena o e-mail para exibir na tela de OTP
      localStorage.setItem('auth_email', email);
      router.push('/auth/otp');
    } catch (error: any) {
      alert(error.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col items-center justify-end md:justify-center overflow-hidden">
      
      {/* 🖼️ BLURRED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbJH69yj_f6EeOvtIMf1DVxXzlF14bw1kAVM1arKG6EY09pXmrcnI9Hpf4Xo0saO6WU140rBw9VZPQh1YCkfRvgPmsftgLIq4CraBWPo_CZoSmTttrUmdlxvTLXeII9A1VTue1uiW3P_bOiXCbMYQWFgSoMGLc_L_dOtjO2ocvjAFH6yf3DbU91HWT66HmBjqTSEMCY_GiS4x1QQPqJX6mLiET-vcraUY25ilR6t4QjQYEruU5-BebiRZPXP0Y7JuGryoF0LOy6Pk" 
          className="w-full h-full object-cover opacity-40 blur-lg scale-110" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 🛒 LOGIN FORM CARD */}
      <main className="relative z-10 w-full max-w-md bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-t-[48px] md:rounded-[48px] border border-white/10 p-10 flex flex-col gap-10 shadow-2xl">
        
        {/* Header */}
        <header className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-start">
            <Link href="/auth" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-center">
            RUNNERS'<br />
            <span className="text-[#a0fb00]">XCHANGE</span>
          </h1>
          <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Entre no Feed</p>
        </header>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <NeonInput 
            icon={<Mail className="w-5 h-5" />}
            placeholder="Seu E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <NeonInput 
            icon={<Lock className="w-5 h-5" />}
            placeholder="Sua Senha"
            type="password"
            rightElement={
              <button type="button" className="text-[10px] font-black text-[#a0fb00] uppercase tracking-wider">Esqueceu?</button>
            }
          />
          
          <NeonButton 
            icon={<ArrowRight className="w-5 h-5" />}
            className="py-4 mt-4 uppercase tracking-widest font-black italic"
          >
            {loading ? 'Enviando...' : 'Entrar Agora'}
          </NeonButton>
        </form>

        {/* Alternative */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Ou continue com</p>
          <div className="flex gap-4">
            <SocialLoginButton icon={<Facebook className="w-5 h-5 fill-current" />} />
            <SocialLoginButton icon={<Github className="w-5 h-5 fill-current" />} />
          </div>
          
          <p className="text-xs text-white/40 font-bold mt-4">
            Não tem uma conta? <Link href="/auth" className="text-[#a0fb00] hover:underline">Cadastre-se</Link>
          </p>
        </div>

      </main>

    </div>
  );
}
