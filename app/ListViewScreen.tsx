import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListViewScreen() {
  const [legends, setLegends] = useState<any[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchLegends();
  }, []);

  const fetchLegends = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'legends'));
      const fetchedLegends: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const geo = data.location;

        const latitude = geo?.latitude ?? geo?._lat;
        const longitude = geo?.longitude ?? geo?._long;

        fetchedLegends.push({
          id: doc.id,
          ...data,
          latitude,
          longitude,
        });
      });
      setLegends(fetchedLegends);
    } catch (error) {
      console.error('Error fetching legends:', error);
    }
  };

  const handleLegendPress = (legendId: string) => {
    router.push({
      pathname: '/StoryDetails',
      params: { id: legendId },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleLegendPress(item.id)}>
      <Text style={styles.title}>{item.title}</Text>
      {item.latitude && item.longitude && (
        <Text style={styles.description}>
          Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      )}
      {item.hiddenGem && <Text style={styles.hiddenGem}>💎 Hidden Gem</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea]}>
      {/* Back Button with dynamic safe top spacing */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>⬅ Back to Home</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 20 }}
        data={legends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#3b6e82' },
  description: { fontSize: 14, color: '#555', marginTop: 4 },
  hiddenGem: { marginTop: 6, color: 'blue', fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
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