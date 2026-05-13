'use client';

import React, { useState } from 'react';
import { OTPInput, NeonButton } from '@liveshop/liquidos-ui';
import { ChevronLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OTPVerificationPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");

  React.useEffect(() => {
    const storedEmail = localStorage.getItem('auth_email');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      router.push('/'); // Login bem-sucedido
    } catch (error: any) {
      alert(error.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* 🖼️ BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a0fb00]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[48px] p-10 flex flex-col items-center border border-white/10 shadow-2xl">
          
          <div className="w-full flex justify-start mb-8">
            <Link href="/auth/email" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-[#a0fb00]/10 border border-[#a0fb00]/20 flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-[#a0fb00]" />
          </div>

          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-2">Verifique seu E-mail</h1>
          <p className="text-sm text-white/40 font-bold text-center mb-10 px-4">
            Enviamos um código de 6 dígitos para <span className="text-[#a0fb00]">{email || 'seu e-mail'}</span>
          </p>

          <OTPInput length={6} onChange={setCode} />

          <div className="mt-12 w-full flex flex-col gap-4">
            <NeonButton 
              onClick={handleVerify}
              className="py-4 uppercase tracking-widest font-black italic"
            >
              {loading ? "Verificando..." : "Confirmar Acesso"}
            </NeonButton>

            <button className="flex items-center justify-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-[#a0fb00] transition-colors">
              <RefreshCw className="w-3 h-3" />
              Reenviar Código em 0:59
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}
