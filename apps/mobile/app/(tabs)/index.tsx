import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { registerForPushNotificationsAsync } from '../../src/hooks/useNotifications';
import { Heart, ShoppingBag, Zap, Bell, Search, User } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { toggleWishlist, fetchUserWishlist } from '../../src/lib/wishlist';
import { LivePlayer } from '../../src/components/LivePlayer';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
    
    const ws = await fetchUserWishlist();
    if (ws) setWishlist(ws.map((w: any) => w.product_id));
  };

  const handleToggleWishlist = async (productId: string) => {
    await toggleWishlist(productId);
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 🏷️ HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Liveshop Zen</Text>
          <Text style={styles.brandSubtitle}>Equilíbrio & Performance</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => router.push('/wishlist')} style={styles.iconButton}>
            <Heart size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => Alert.alert('Notificações', 'Você receberá alertas de novos drops!')} 
            style={styles.iconButton}
          >
            <Bell size={20} color="#fff" />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 🔥 LIVE HERO */}
        <View style={styles.heroContainer}>
          <LivePlayer 
            uri="https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4" 
            posterSource="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
          />
          
          <View style={styles.heroOverlay} pointerEvents="box-none">
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>DROP EXCLUSIVO</Text>
              <Text style={styles.heroTitle}>Cyber-Zen V1</Text>
              <TouchableOpacity 
                style={styles.heroButton}
                onPress={() => Alert.alert('Entrando na Live...', 'Prepare-se para o Drop!')}
              >
                <Zap size={20} color="#000" fill="#000" />
                <Text style={styles.heroButtonText}>ASSISTIR AGORA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 👟 PRODUCTS GRID */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novos Drops</Text>
            <Text style={styles.seeAll}>Ver Tudo</Text>
          </View>
          
          <View style={styles.grid}>
            {products.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <TouchableOpacity 
                  onPress={() => router.push(`/products/${item.id}`)}
                  style={styles.productImageContainer}
                >
                  <Image 
                    source={{ uri: item.raw_bling_data?.media?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' }} 
                    style={styles.productImage} 
                  />
                  <TouchableOpacity 
                    onPress={() => handleToggleWishlist(item.id)}
                    style={styles.heartButton}
                  >
                    <Heart 
                      size={18} 
                      color={wishlist.includes(item.id) ? '#A3FF00' : '#fff'} 
                      fill={wishlist.includes(item.id) ? '#A3FF00' : 'transparent'} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* 🚀 QUICK ACTION */}
      <TouchableOpacity 
        onPress={() => router.push('/cart')}
        style={styles.fab}
      >
        <ShoppingBag size={24} color="#000" />
      </TouchableOpacity>
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
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  brandTitle: {
    color: '#A3FF00',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3FF00',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  content: {
    paddingBottom: 100,
  },
  heroContainer: {
    height: 450,
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(163, 255, 0, 0.2)',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroContent: {
    gap: 8,
  },
  heroSubtitle: {
    color: '#A3FF00',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroButton: {
    backgroundColor: '#A3FF00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  heroButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  seeAll: {
    color: '#A3FF00',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  productCard: {
    width: (width - 55) / 2,
    marginBottom: 20,
  },
  productImageContainer: {
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    color: '#A3FF00',
    fontSize: 16,
    fontWeight: '900',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#A3FF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A3FF00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
