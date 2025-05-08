import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function MapViewScreen() {
  const [legends, setLegends] = useState<any[]>([]);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchLegends();
  }, []);

  const fetchLegends = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'legends'));
      const fetchedLegends: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedLegends.push({ id: doc.id, ...doc.data() });
      });
      setLegends(fetchedLegends);

      if (fetchedLegends.length > 0) {
        const first = fetchedLegends[0].location;
        setInitialRegion({
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    } catch (error) {
      console.error('Error fetching legends:', error);
    }
  };

  const handleMarkerPress = (legendId: string) => {
    router.push({
      pathname: '/StoryDetails',
      params: { id: legendId },
    });
  };

  return (
    <View style={styles.container}>
      {initialRegion ? (
        <MapView style={StyleSheet.absoluteFillObject} initialRegion={initialRegion}>
          {legends.map((legend) => (
            <Marker
              key={legend.id}
              coordinate={{
                latitude: legend.location.latitude,
                longitude: legend.location.longitude,
              }}
              title={legend.title}
              description={legend.description}
              pinColor={legend.hiddenGem ? 'blue' : 'red'}
              onPress={() => handleMarkerPress(legend.id)}
            />
          ))}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 100 }} />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>⬅ Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  backButtonText: {
    color: '#3b6e82',
    fontWeight: 'bold',
  },
});