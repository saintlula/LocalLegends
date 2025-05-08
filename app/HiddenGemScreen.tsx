import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';

type Gem = {
  id: string;
  title: string;
  description: string;
  category: 'scenic' | 'bar' | 'other';
  latitude: number;
  longitude: number;
};

const HiddenGemScreen = () => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [filteredGems, setFilteredGems] = useState<Gem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchUserStatus = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdTokenResult();
      setIsPremium(!!token.claims.isPremium);
    }
  };

  const fetchGems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'legendsWgem'));
      const loadedGems: Gem[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.location) return;

        loadedGems.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
      });

      setGems(loadedGems);
    } catch (error) {
      console.error('Error fetching hidden gems:', error);
    }
  };

  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  useEffect(() => {
    fetchUserStatus();
    fetchGems();
    requestLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const nearby = gems.filter(gem => {
        const dist = getDistance(userLocation.latitude, userLocation.longitude, gem.latitude, gem.longitude);
        return dist <= 50;
      });
      setFilteredGems(nearby);
    }
  }, [gems, userLocation]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGems(gems);
    } else {
      setFilteredGems(
        gems.filter(gem =>
          gem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gem.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery]);

  const renderGem = (category: 'scenic' | 'bar' | 'other') => {
    return (
      <View style={styles.categoryBlock}>
        <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
        {filteredGems.filter(g => g.category === category).map(gem => {
          const distance = userLocation
            ? getDistance(userLocation.latitude, userLocation.longitude, gem.latitude, gem.longitude).toFixed(1)
            : '?';
          return (
            <View key={gem.id} style={styles.card}>
              <Text style={styles.title}>{gem.title}</Text>
              <Text style={styles.desc}>{gem.description}</Text>
              <Text style={styles.distance}>Distance: {distance} km</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (!isPremium) {
    return (
      <View style={styles.center}>
        <Text style={styles.notPremiumText}>🚫 This feature is only available for premium users.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search hidden gems..."
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />

      <FlatList
        data={['scenic', 'bar', 'other']}
        keyExtractor={item => item}
        renderItem={({ item }) => renderGem(item as Gem['category'])}
      />
    </View>
  );
};

export default HiddenGemScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  notPremiumText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  searchInput: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    color: '#fff',
    marginBottom: 16,
  },
  categoryBlock: { marginBottom: 24 },
  categoryTitle: { fontSize: 20, color: '#facc15', marginBottom: 8 },
  card: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  desc: { color: '#cbd5e1' },
  distance: { marginTop: 4, color: '#a3e635' },
});