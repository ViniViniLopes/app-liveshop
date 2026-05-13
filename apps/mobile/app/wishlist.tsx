import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ChevronLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fetchUserWishlist, toggleWishlist } from '../src/lib/wishlist';

const { width } = Dimensions.get('window');

export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    const data = await fetchUserWishlist();
    setItems(data);
    setLoading(false);
  };

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    setItems(prev => prev.filter(item => item.product_id !== productId));
  };

  return (
    <View style={styles.container}>
      {/* 🏷️ HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Favoritos</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length > 0 ? items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image 
              source={{ uri: item.products?.raw_bling_data?.media?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' }} 
              style={styles.itemImage} 
            />
            <div style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.products?.name}</Text>
              <Text style={styles.itemPrice}>R$ {item.products?.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </div>
            <TouchableOpacity onPress={() => handleRemove(item.product_id)} style={styles.removeButton}>
              <Trash2 size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )) : (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color="rgba(255,255,255,0.05)" />
            <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
            <Text style={styles.emptySubtitle}>Favorite os produtos que você mais gostou nos drops para vê-los aqui.</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.exploreButton}>
              <Text style={styles.exploreText}>Explorar Drops</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#A3FF00',
    fontSize: 16,
    fontWeight: '900',
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#A3FF00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
  },
  exploreText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
});
