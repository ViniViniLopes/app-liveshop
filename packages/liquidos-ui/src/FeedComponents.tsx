import React from 'react';

/**
 * Painel de Vidro (Glassmorphism)
 */
export const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`
    bg-white/5 backdrop-blur-[24px] 
    border border-white/15 
    shadow-[0_0_20px_rgba(160,251,0,0.15)]
    ${className}
  `}>
    {children}
  </div>
);

/**
 * Botão Neon de Ação
 */
export const NeonButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, onClick, className, icon }) => (
  <button 
    onClick={onClick}
    className={`
      flex-1 bg-[#a0fb00] hover:bg-[#8cdc00] 
      text-[#102000] font-bold text-sm py-3 px-6
      rounded-full flex items-center justify-center gap-2 
      transition-all active:scale-95 shadow-[0_0_20px_rgba(160,251,0,0.25)]
      ${className}
    `}
  >
    {icon}
    {children}
  </button>
);

/**
 * Badge de Status (ex: Em Alta, Live)
 */
export const StatusBadge: React.FC<{ children: React.ReactNode; variant?: 'error' | 'success' }> = ({ children, variant = 'error' }) => (
  <span className={`
    ${variant === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#a0fb00]/20 text-[#a0fb00] border-[#a0fb00]/30'}
    px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider
  `}>
    {children}
  </span>
);

/**
 * Bottom Sheet de Detalhes do Produto
 */
export const ProductDetailSheet: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  product: any;
}> = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm transition-all animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full h-[75vh] bg-[#0a0a0a]/95 backdrop-blur-[40px] rounded-t-[40px] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500">
        
        {/* Handle de Fechar */}
        <div className="w-full flex justify-center py-5">
          <button 
            onClick={onClose}
            className="w-14 h-1.5 bg-[#a0fb00] rounded-full shadow-[0_0_15px_rgba(160,251,0,0.4)]" 
          />
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-32">
          {/* Header do Produto */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">
                {product.brand || 'LiquidOS'}
              </h1>
              <p className="text-xl text-white/60 font-medium">{product.name}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-[#a0fb00]">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-sm">★</span>)}
                </div>
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">(320 Reviews)</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4 bg-white/5 rounded-full px-2 py-1 border border-[#a0fb00]/30">
                <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">-</button>
                <span className="font-bold text-lg">1</span>
                <button className="w-9 h-9 rounded-full bg-[#a0fb00] text-black flex items-center justify-center font-bold">+</button>
              </div>
              <span className="text-[10px] font-black text-[#a0fb00] uppercase tracking-[0.2em] border border-[#a0fb00]/30 px-2 py-1 rounded">Em Estoque</span>
            </div>
          </div>

          {/* Seção de Reviews (Mock) */}
          <h2 className="text-2xl font-black italic uppercase tracking-tight mb-8">Reviews do Clube</h2>
          <div className="space-y-8">
            {[1, 2].map((r) => (
              <div key={r} className="flex gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-base text-white">Malison Aved</span>
                    <span className="text-[#a0fb00] text-xs">★★★★★</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium">
                    "The quality is next level. The neon glow in the dark is perfect for my night runs. Highly recommend!"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Fixo de Compra */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-black/90 backdrop-blur-3xl border-t border-white/10 pb-12">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-white/40 line-through font-bold">R$ 249,90</span>
              <span className="text-4xl font-black text-white">R$ {product.price}</span>
            </div>
            <NeonButton className="px-10 uppercase tracking-[0.1em] font-black italic">
              ADICIONAR AO CARRINHO
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartItem: React.FC<{ 
  name: string; 
  price: string; 
  quantity: number; 
  image: string;
  size?: string;
  color?: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
}> = ({ name, price, quantity, image, size, color, onIncrease, onDecrease, onRemove }) => (
  <div className="flex gap-4 p-4 rounded-[24px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
    <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/5">
      <img src={image} className="w-full h-full object-cover" alt={name} />
    </div>
    <div className="flex flex-col flex-1 justify-between py-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-1">{name}</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
            Tam: {size || 'Único'} • {color || 'N/A'}
          </p>
        </div>
        <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors">
          <span className="text-xs font-bold underline">Remover</span>
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-base font-black text-[#a0fb00]">R$ {price}</span>
        <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 py-1 border border-white/10">
          <button onClick={onDecrease} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white">-</button>
          <span className="text-xs font-bold w-4 text-center">{quantity}</span>
          <button onClick={onIncrease} className="w-6 h-6 flex items-center justify-center text-[#a0fb00]">+</button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Resumo do Carrinho
 */
export const CartSummary: React.FC<{ subtotal: string; total: string }> = ({ subtotal, total }) => (
  <div className="mt-4 p-6 rounded-[32px] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col gap-4">
    <h2 className="text-xs font-black italic uppercase tracking-widest text-white/40">Resumo da Compra</h2>
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/60">Subtotal (3 itens)</span>
      <span className="text-white font-bold">R$ {subtotal}</span>
    </div>
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/60">Frete Expresso</span>
      <span className="text-[#a0fb00] font-bold">Grátis</span>
    </div>
    <div className="h-[1px] w-full bg-white/10 my-2" />
    <div className="flex justify-between items-end">
      <span className="text-base font-bold text-white">Total</span>
      <div className="flex flex-col items-end">
        <span className="text-3xl font-black text-[#a0fb00] tracking-tighter">R$ {total}</span>
        <span className="text-[10px] text-white/40 mt-1 uppercase font-bold">Em até 10x sem juros</span>
      </div>
    </div>
  </div>
);

/**
 * Barra de Progresso Gamificada
 */
export const GamifiedProgress: React.FC<{ current: number; target: number; label: string; sublabel: string }> = ({ current, target, label, sublabel }) => {
  const percent = Math.min((current / target) * 100, 100);
  
  return (
    <div className="mb-6 rounded-3xl bg-white/5 border border-[#a0fb00]/20 p-5 relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#a0fb00]/10 flex items-center justify-center">
          <span className="text-[#a0fb00] font-bold">🎁</span>
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase italic">{label}</h4>
          <p className="text-[11px] text-white/50 font-bold">{sublabel}</p>
        </div>
      </div>
      
      <div className="relative h-2.5 w-full bg-black/40 rounded-full overflow-hidden mb-3">
        <div 
          className="absolute top-0 left-0 h-full bg-[#a0fb00] rounded-full shadow-[0_0_15px_rgba(160,251,0,0.5)] transition-all duration-1000" 
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-[#a0fb00]">R$ {current.toFixed(2)}</span>
        <div className="flex gap-4 text-white/40">
          <span>META: R$ {target.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#a0fb00]/5 blur-[40px] rounded-full" />
    </div>
  );
};

/**
 * Opção de Pagamento
 */
export const PaymentOption: React.FC<{ 
  title: string; 
  subtitle: string; 
  selected: boolean; 
  onSelect: () => void;
  icon?: React.ReactNode;
}> = ({ title, subtitle, selected, onSelect, icon }) => (
  <div 
    onClick={onSelect}
    className={`
      flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all
      ${selected ? 'border-[#a0fb00] bg-[#a0fb00]/5 shadow-[0_0_20px_rgba(160,251,0,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}
    `}
  >
    <div className={`
      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
      ${selected ? 'border-[#a0fb00]' : 'border-white/30'}
    `}>
      {selected && <div className="w-2.5 h-2.5 bg-[#a0fb00] rounded-full" />}
    </div>
    <div className="flex grow flex-col">
      <p className="text-white text-sm font-bold">{title}</p>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{subtitle}</p>
    </div>
    {icon && <div className="text-white/20">{icon}</div>}
  </div>
);

/**
 * Seletor de Tamanho
 */
export const SizeSelector: React.FC<{ 
  sizes: string[]; 
  selected: string; 
  onSelect: (size: string) => void 
}> = ({ sizes, selected, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
    {sizes.map(size => (
      <button 
        key={size}
        onClick={() => onSelect(size)}
        className={`
          flex items-center justify-center h-12 min-w-[3.5rem] px-4 rounded-2xl border font-bold transition-all
          ${selected === size 
            ? 'border-[#a0fb00] bg-[#a0fb00]/10 text-[#a0fb00] shadow-[0_0_15px_rgba(160,251,0,0.2)]' 
            : 'border-white/10 text-white/60 hover:bg-white/5'}
        `}
      >
        {size}
      </button>
    ))}
  </div>
);

/**
 * Seletor de Cor
 */
export const ColorSelector: React.FC<{ 
  colors: { id: string; hex: string; name: string }[]; 
  selected: string; 
  onSelect: (id: string) => void 
}> = ({ colors, selected, onSelect }) => (
  <div className="flex gap-4 items-center">
    {colors.map(color => (
      <button 
        key={color.id}
        onClick={() => onSelect(color.id)}
        className={`
          relative size-12 rounded-full flex items-center justify-center p-1 border-2 transition-all
          ${selected === color.id ? 'border-[#a0fb00] scale-110' : 'border-transparent hover:border-white/20'}
        `}
      >
        <div 
          className="w-full h-full rounded-full shadow-inner border border-white/10" 
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      </button>
    ))}
  </div>
);

/**
 * Banner de Promoção (Slider)
 */
export const PromoBanner: React.FC<{ title: string; subtitle: string; tag: string; image: string }> = ({ title, subtitle, tag, image }) => (
  <div className="relative w-full h-48 rounded-[32px] overflow-hidden bg-white/5 border border-white/10 shrink-0">
    <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent p-8 flex flex-col justify-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a0fb00] mb-2">{tag}</span>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">{title}</h2>
      <p className="text-sm text-white/60 font-medium mb-4">{subtitle}</p>
      <button className="bg-[#a0fb00] text-black text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-full w-max shadow-[0_0_15px_rgba(160,251,0,0.3)]">
        Ver Agora
      </button>
    </div>
  </div>
);

/**
 * Floating Picture-in-Picture Video
 */
export const FloatingPiP: React.FC<{ 
  image: string; 
  username: string;
  onClick?: () => void;
  onClose?: () => void;
}> = ({ image, username, onClick, onClose }) => (
  <div 
    onClick={onClick}
    className="fixed bottom-[100px] right-6 w-[130px] h-[200px] rounded-[24px] overflow-hidden border border-[#a0fb00]/30 shadow-[0_0_30px_rgba(160,251,0,0.4)] z-50 cursor-pointer group active:scale-95 transition-all"
  >
    {/* Live Badge */}
    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full z-20">
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live</span>
    </div>
    
    {/* Close Button */}
    <button 
      onClick={(e) => { e.stopPropagation(); onClose?.(); }}
      className="absolute top-3 right-3 size-6 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white z-20 hover:bg-black/60"
    >
      ×
    </button>
    
    <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Live PiP" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    
    <div className="absolute bottom-3 left-3 right-3">
      <p className="text-[9px] font-black text-[#a0fb00] uppercase tracking-widest truncate">{username}</p>
    </div>
  </div>
);

/**
 * Splash Screen Cinematográfico
 */
export const SplashScreen: React.FC<{ brand: string; subtitle?: string }> = ({ brand, subtitle }) => (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 overflow-hidden">
    {/* Background Video/Image */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVeivqR9RjLkzC_bhnR2v0IQpXnHbsDsgA6FdDA3AsHp9UDs30jxwbRZ1pi0dLvNwWyeuzzrtFRZcoiF7ftgOnXAu9Kv_eTWgVlQK-eLlYyjJgi7R0KnvRpBvP14Gg7B05uaX0N0co_mY2hRk3fU1uFJ-Kcov60B17coKV0UmaOsgV_Z7IAQcTEFVu1FdjEyrVtJDeLperUN9yoe8xxBHXIultlTbKfRQu6bcXqASHQg0YtyVzI5eEjVmeRi40TudAOz95nkIRec0" 
        className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110 animate-pulse-slow" 
        alt="Splash" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
    </div>

    {/* Center Brand */}
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
      <h1 
        className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-[#a0fb00] text-center leading-none animate-in zoom-in duration-1000"
        style={{ textShadow: '0 0 60px rgba(160, 251, 0, 0.6)' }}
      >
        {brand}
      </h1>
    </div>

    {/* Bottom Label */}
    <div className="relative z-10 w-full flex flex-col items-center gap-6 pb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
      <div className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_30px_rgba(160,251,0,0.1)]">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
          {subtitle || 'Powered by Electric Commerce'}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Botão de Login Social
 */
export const SocialLoginButton: React.FC<{ 
  icon: React.ReactNode; 
  onClick?: () => void 
}> = ({ icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 backdrop-blur-xl"
  >
    {icon}
  </button>
);

/**
 * Input com Efeito Neon
 */
export const NeonInput: React.FC<{ 
  icon: React.ReactNode; 
  placeholder: string; 
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
}> = ({ icon, placeholder, type = 'text', value, onChange, rightElement }) => (
  <div className="relative group w-full">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#a0fb00] transition-colors pointer-events-none">
      {icon}
    </div>
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/20 focus:bg-white/10 focus:border-[#a0fb00] focus:ring-1 focus:ring-[#a0fb00] focus:outline-none transition-all shadow-inner"
    />
    {rightElement && (
      <div className="absolute right-5 top-1/2 -translate-y-1/2">
        {rightElement}
      </div>
    )}
  </div>
);

/**
 * Input de Código OTP
 */
export const OTPInput: React.FC<{ length?: number; onChange: (code: string) => void }> = ({ length = 6, onChange }) => {
  const [code, setCode] = React.useState(new Array(length).fill(""));

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);
    onChange(newCode.join(""));

    // Move to next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {code.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onFocus={(e) => e.target.select()}
          className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-[#a0fb00] focus:bg-white/10 focus:border-[#a0fb00] focus:ring-2 focus:ring-[#a0fb00]/50 outline-none transition-all"
        />
      ))}
    </div>
  );
};

/**
 * Estatística de Perfil
 */
export const ProfileStat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex flex-col items-center gap-1 p-4 rounded-3xl bg-white/5 border border-white/5 flex-1">
    <div className="text-[#a0fb00] mb-1 opacity-80">{icon}</div>
    <span className="text-xl font-black italic uppercase tracking-tighter text-white">{value}</span>
    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
  </div>
);

/**
 * Item de Histórico de Pedidos
 */
export const OrderItem: React.FC<{ 
  id: string; 
  date: string; 
  status: string; 
  total: string;
  itemsCount: number;
}> = ({ id, date, status, total, itemsCount }) => (
  <div className="group p-5 rounded-[32px] bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 hover:border-[#a0fb00]/30 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Pedido #{id}</p>
        <p className="text-sm font-bold text-white">{date}</p>
      </div>
      <div className={`
        px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
        ${status === 'Entregue' ? 'bg-[#a0fb00]/10 text-[#a0fb00] border border-[#a0fb00]/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}
      `}>
        {status}
      </div>
    </div>
    
    <div className="flex justify-between items-end">
      <div className="flex -space-x-3">
        {[1, 2, 3].slice(0, Math.min(itemsCount, 3)).map((i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-black">
            {i === 3 && itemsCount > 3 ? `+${itemsCount - 2}` : `📦`}
          </div>
        ))}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total</p>
        <p className="text-xl font-black text-[#a0fb00] tracking-tighter">R$ {total}</p>
      </div>
    </div>
  </div>
);
