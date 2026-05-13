import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import { ProductPicker } from '@/components/studio/ProductPicker';
import { MockLiveStreamModule, StreamStatus } from '@/modules/LiveStreamModule';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default function LiveStudioScreen({ route }: any) {
  const { tenantId, sessionId } = route.params;
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [products, setProducts] = useState([]);
  const [featuredProductId, setFeaturedProductId] = useState<string | null>(null);
  const streamModule = useRef(new MockLiveStreamModule()).current;

  useEffect(() => {
    streamModule.onStatusChange(setStatus);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');
    setProducts(data || []);
  };

  const handleToggleStream = async () => {
    if (status === 'live') {
      await streamModule.stopStream();
      await supabase.from('live_sessions').update({ 
        status: 'ended', 
        ended_at: new Date().toISOString() 
      }).eq('id', sessionId);
    } else {
      // 1. Get ingest data from session
      const { data: session } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) return;

      // 2. Start Encoder
      await streamModule.startStream({
        rtmpUrl: session.ingest_url,
        streamKey: session.stream_key
      });

      // 3. Update Session Status
      await supabase.from('live_sessions').update({ 
        status: 'live', 
        started_at: new Date().toISOString() 
      }).eq('id', sessionId);
    }
  };

  const handleSelectProduct = async (product: any) => {
    setFeaturedProductId(product.bling_product_id);
    
    // Update Realtime Featured Product
    await supabase.from('live_sessions').update({
      featured_bling_product_id: product.bling_product_id
    }).eq('id', sessionId);
  };

  return (
    <View style={styles.container}>
      {/* Background Camera Preview */}
      <Camera style={StyleSheet.absoluteFill} type={Camera.Constants.Type.back} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: status === 'live' ? '#FF0000' : '#666' }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton}>
             <Text style={{ color: 'white' }}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
           <TouchableOpacity 
             onPress={handleToggleStream}
             style={[styles.streamButton, { borderColor: status === 'live' ? '#FF0000' : '#A3FF00' }]}
           >
              <View style={[styles.innerButton, { backgroundColor: status === 'live' ? '#FF0000' : '#A3FF00' }]} />
           </TouchableOpacity>
        </View>

        <ProductPicker 
          products={products} 
          onSelect={handleSelectProduct}
          featuredProductId={featuredProductId}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButton: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  }
});
