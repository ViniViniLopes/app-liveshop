import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';

interface LivePlayerProps {
  uri: string;
  posterSource?: string;
  isMuted?: boolean;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ uri, posterSource, isMuted = false }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [muted, setMuted] = useState(isMuted);

  const togglePlay = () => {
    if (status.isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri }}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted={muted}
        shouldPlay
        onPlaybackStatusUpdate={status => setStatus(() => status)}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        posterSource={{ uri: posterSource }}
        usePoster={!!posterSource}
      />

      {/* Overlay Controls */}
      <View style={styles.overlay}>
        {isLoading && (
          <ActivityIndicator size="large" color="#A3FF00" />
        )}

        {!isLoading && (
          <>
            <View style={styles.topRow}>
              <View style={styles.liveBadge}>
                <View style={styles.dot} />
                <Text style={styles.liveText}>AO VIVO</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <TouchableOpacity onPress={togglePlay} style={styles.controlButton}>
                {status.isPlaying ? (
                  <Pause size={24} color="#fff" />
                ) : (
                  <Play size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMuted(!muted)} style={styles.controlButton}>
                {muted ? (
                  <VolumeX size={24} color="#fff" />
                ) : (
                  <Volume2 size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topRow: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 15,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
