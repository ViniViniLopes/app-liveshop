import { Card, Button, Input } from '@liveshop/liquidos-ui';

export default function BrandingPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Marca & Cores</h1>
        <p className="text-zinc-500 text-sm">Personalize a identidade visual da sua vitrine e checkout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-6">
            <h2 className="text-lg font-bold">Identidade Base</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Nome da Loja</label>
                <Input placeholder="Ex: Vinao Studio" defaultValue="Vinao Studio" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Descrição SEO</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/5 rounded-liquid-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-live-neon min-h-[100px]"
                  placeholder="Descrição que aparecerá no Google..."
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <h2 className="text-lg font-bold">Paleta de Cores</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Cor Primária (Accent)</label>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-live-neon border border-white/10" />
                  <Input defaultValue="#A3FF00" className="font-mono uppercase" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Fundo (Background)</label>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-white/10" />
                  <Input defaultValue="#0A0A0A" className="font-mono uppercase" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Descartar</Button>
            <Button variant="neon">Salvar Alterações</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Logo da Loja</h2>
            <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-live-neon/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🖼️</div>
              <span className="text-xs text-zinc-500 group-hover:text-live-neon">Upload Logo</span>
            </div>
            <p className="text-[10px] text-zinc-600 text-center">SVG ou PNG (512x512px recomendado)</p>
          </Card>

          <Card className="bg-live-neon/5 border-live-neon/10">
            <h2 className="text-sm font-bold text-live-neon mb-2">Dica Pro</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use cores de alto contraste para botões. O verde neon é excelente para conversão em ambientes escuros.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
