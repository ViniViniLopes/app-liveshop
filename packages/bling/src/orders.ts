import { BlingClient } from './index';

export async function createOrderFromLiveShop(
  bling: BlingClient,
  orderData: {
    externalId: string;
    customer: {
      name: string;
      email: string;
      cpfCnpj: string;
    };
    items: Array<{
      blingProductId: string;
      quantity: number;
      price: number;
    }>;
    paymentMethod: string;
  }
) {
  const blingOrder = {
    numeroLoja: orderData.externalId,
    data: new Date().toISOString().split('T')[0],
    contato: {
      nome: orderData.customer.name,
      tipoPessoa: orderData.customer.cpfCnpj.length > 11 ? 'J' : 'F',
      numeroDocumento: orderData.customer.cpfCnpj
    },
    itens: orderData.items.map(item => ({
      codigo: item.blingProductId,
      quantidade: item.quantity,
      valor: item.price
    })),
    pagamentos: [
      {
        formaPagamento: { id: 0 }, // Map this correctly in production
        valor: orderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      }
    ]
  };

  return await bling.createOrder(blingOrder);
}

export function generateProductSnapshot(product: any) {
  return {
    id: product.bling_product_id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    main_image_url: product.main_image_url,
    synced_at: new Date().toISOString()
  };
}
