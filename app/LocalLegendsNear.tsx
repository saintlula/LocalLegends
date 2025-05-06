import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useLegends } from '../hooks/useLegends';

export default function LocalLegendsMapActivity() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedLegendId, setSelectedLegendId] = useState<string | null>(null);
  const router = useRouter();
  const { legends } = useLegends();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
      } else {
        setLocationGranted(true);
      }
    })();
  }, []);

  if (!locationGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Requesting location permission...</Text>
      </SafeAreaView>
    );
  }

  const handleShowDetails = () => {
    if (selectedLegendId) {
      router.push({ pathname: '/StoryDetails', params: { id: selectedLegendId } });
    } else {
      Alert.alert('Please select a legend first');
    }
  };

  const handleNavigateToLegend = () => {
    if (selectedLegendId) {
      const selectedLegend = legends.find(l => l.id === selectedLegendId);
      if (selectedLegend && selectedLegend.latitude && selectedLegend.longitude) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLegend.latitude},${selectedLegend.longitude}`;
        Linking.openURL(url);
      } else {
        Alert.alert('Location info not available for this legend');
      }
    } else {
      Alert.alert('Please select a legend first');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Local Legends Map Activity</Text>

      <View style={styles.mapContainer}>
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Stavanger_city_map_cut.jpg',
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <Text style={styles.mapText}>There are {legends.length} local legends near you!</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Local Legends</Text>
        <Text style={styles.listSubtitle}>Tap a legend to select</Text>
        <FlatList
          data={legends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.legendItem,
                selectedLegendId === item.id && styles.selectedLegend,
              ]}
              onPress={() => setSelectedLegendId(item.id)}
            >
              <View>
                <Text style={styles.legendName}>{item.title}</Text>
                <Text style={styles.legendCategory}>Category: {item.category}</Text>
              </View>
              <Text style={styles.legendDistance}>
                Distance: {item.distance || 'N/A'} miles
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleShowDetails}>
        <Text style={styles.buttonText}>Show Legend Details</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.blackButton]}
        onPress={handleNavigateToLegend}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Navigate to Legend</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  mapContainer: {
    backgroundColor: '#d9e3f0',
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  mapImage: { width: '100%', height: 150, borderRadius: 12 },
  mapText: { marginTop: 10, fontWeight: 'bold', fontSize: 16 },
  listContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
  },
  listTitle: { fontSize: 18, fontWeight: 'bold' },
  listSubtitle: { fontSize: 14, color: 'gray', marginBottom: 10 },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedLegend: { backgroundColor: '#cde1f9' },
  legendName: { fontWeight: 'bold' },
  legendCategory: { fontSize: 12, color: 'gray' },
  legendDistance: { fontSize: 12, color: 'gray' },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  blackButton: { backgroundColor: '#000' },
});
