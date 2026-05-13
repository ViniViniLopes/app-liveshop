import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CreditCard, QrCode, ShieldCheck, Lock, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<'card' | 'pix'>('card');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RESUMO DO PEDIDO</Text>
          <View style={styles.row}>
            <Text style={styles.itemText}>Zen Runner Pro v1 (42)</Text>
            <Text style={styles.priceText}>R$ 899,00</Text>
          </View>
          <View style={[styles.row, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalPrice}>R$ 899,00</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodTabs}>
          <TouchableOpacity 
            onPress={() => setMethod('card')}
            style={[styles.tab, method === 'card' && styles.activeTab]}
          >
            <CreditCard size={20} color={method === 'card' ? '#000' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabText, method === 'card' && styles.activeTabText]}>CARTÃO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMethod('pix')}
            style={[styles.tab, method === 'pix' && styles.activeTab]}
          >
            <QrCode size={20} color={method === 'pix' ? '#000' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabText, method === 'pix' && styles.activeTabText]}>PIX</Text>
          </TouchableOpacity>
        </View>

        {/* Card Form */}
        {method === 'card' ? (
          <View style={styles.form}>
            <TextInput placeholder="Número do Cartão" placeholderTextColor="rgba(255,255,255,0.2)" style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Nome Impresso" placeholderTextColor="rgba(255,255,255,0.2)" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TextInput placeholder="MM/AA" placeholderTextColor="rgba(255,255,255,0.2)" style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="CVV" placeholderTextColor="rgba(255,255,255,0.2)" style={[styles.input, { flex: 1 }]} keyboardType="numeric" />
            </View>
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
            <View style={styles.qrPlaceholder}>
              <QrCode size={120} color="#000" />
            </View>
            <Text style={styles.pixInstructions}>Escaneie o QR Code ou copie a chave PIX abaixo.</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyText}>COPIAR CHAVE PIX</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.securityInfo}>
          <ShieldCheck size={14} color="rgba(255,255,255,0.3)" />
          <Text style={styles.securityText}>PAGAMENTO PROTEGIDO PCI COMPLIANT</Text>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => Alert.alert('Processando...', 'Validando pagamento com Pagar.me')}
        >
          <Lock size={20} color="#000" />
          <Text style={styles.payButtonText}>FINALIZAR R$ 899,00</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  totalPrice: {
    color: '#A3FF00',
    fontSize: 22,
    fontWeight: '900',
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 6,
    gap: 6,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#A3FF00',
  },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '900',
  },
  activeTabText: {
    color: '#000',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 14,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pixInstructions: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  copyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  copyText: {
    color: '#A3FF00',
    fontSize: 12,
    fontWeight: '900',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  payButton: {
    backgroundColor: '#A3FF00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
  },
  payButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
});
