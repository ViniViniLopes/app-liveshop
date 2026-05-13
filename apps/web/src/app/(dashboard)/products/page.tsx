import { Card, Button } from '@liveshop/liquidos-ui';

export default function ProductsPage() {
  // Mock data - will be replaced with DB fetch
  const products = [
    { id: '1', sku: 'CAM-LS-01', name: 'Camiseta LiveShop Neon', price: 89.90, stock: 150, status: 'active' },
    { id: '2', sku: 'BON-LS-02', name: 'Boné Glassmorphism', price: 129.00, stock: 45, status: 'active' },
    { id: '3', sku: 'MOU-LS-03', name: 'Mousepad Electric Lime', price: 59.00, stock: 12, status: 'low_stock' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-1">Produtos</h1>
          <p className="text-zinc-500 text-sm">Gerencie o inventário sincronizado do seu ERP Bling.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Sincronizar Bling</Button>
          <Button variant="neon">Novo Produto</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Produto</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Preço</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Estoque</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10" />
                    <span className="font-medium text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400 font-mono">{p.sku}</td>
                <td className="px-6 py-4 text-sm font-bold">R$ {p.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{p.stock}</span>
                    {p.stock < 20 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    p.status === 'active' ? "text-live-neon border-live-neon/20 bg-live-neon/5" : "text-zinc-500 border-white/10 bg-white/5"
                  )}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-500 hover:text-white transition-colors">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
