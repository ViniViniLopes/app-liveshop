import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface ProductPickerProps {
  products: any[];
  onSelect: (product: any) => void;
  featuredProductId?: string;
}

export function ProductPicker({ products, onSelect, featuredProductId }: ProductPickerProps) {
  return (
    <BlurView intensity={80} style={styles.container}>
      <Text style={styles.title}>Selecionar Produto</Text>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isFeatured = item.bling_product_id === featuredProductId;
          return (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelect(item);
              }}
              style={[styles.productCard, isFeatured && styles.featuredCard]}
            >
              <Image source={{ uri: item.main_image_url }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>R$ {item.price}</Text>
              </View>
              {isFeatured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>AO VIVO</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 30,
    padding: 20,
    overflow: 'hidden',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productCard: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginRight: 12,
    padding: 10,
  },
  featuredCard: {
    borderColor: '#A3FF00',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  info: {
    marginTop: 8,
  },
  name: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    color: '#A3FF00',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#A3FF00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'black',
  },
});
