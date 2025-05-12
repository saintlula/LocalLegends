import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, Dimensions } from 'react-native';
import { getDocs, collection, GeoPoint } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

//Defining the shape of the hidden gem
type Gem = 
{
  id: string;
  title: string;
  description: string;
  category: 'scenic' | 'bar' | 'other';
  latitude: number;
  longitude: number;
};

const HiddenGemScreen = () => 
{
  //state veriables
  const [gems, setGems] = useState<Gem[]>([]); //all of the fetched gems
  const [filteredGems, setFilteredGems] = useState<Gem[]>([]);//gems after filtering
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'scenic' | 'bar' | 'other' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  //calculating distance using Haversine formula (in km)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => 
  {
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

  //fetching gems from firestore
  const fetchGems = async () => 
  {
    try 
    {
      const querySnapshot = await getDocs(collection(db, 'legendsWgem'));
      const loadedGems: Gem[] = [];

      querySnapshot.forEach(doc => 
      {
        const data = doc.data();
        const location = data.location;

        //make sure that the location is a valid geopoint
        if (!(location instanceof GeoPoint)) 
        {
          console.warn('Invalid GeoPoint:', doc.id, location);
          return;
        }

        loadedGems.push
        ({
          id: doc.id,
          title: data.title || 'No title',
          description: data.description || 'No description',
          category: data.category || 'other',
          latitude: location.latitude,
          longitude: location.longitude,
        });
      });

      console.log('✅ All fetched gems:', loadedGems);
      setGems(loadedGems);
    } catch (error) {
      console.error('❌ Error fetching gems:', error);
    }
  };
  //requesting the users location permission and retrieve the current location
  const requestLocation = async () => 
  {
    try 
    {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Permission status:', status);

      if (status !== 'granted') 
      {
        Alert.alert('Location Required', 'Please allow location access to view nearby gems.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('📍 Location obtained:', location.coords);

      setUserLocation
      ({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) 
    {
      console.error('Error getting location:', error);
    }
  };
  //fetch gems and location
  useEffect(() => 
  {
    fetchGems();
    requestLocation();
    //if location isnt revieved (in 3 secs) use fallback coordinates. Melbourne CBD.
    setTimeout(() => {
      if (!userLocation) 
      {
        console.log('🧪 Setting fallback location...');
        setUserLocation({ latitude: -37.81, longitude: 144.96 });
      }
    }, 3000);
  }, []);
  //filter gems whenever location, category, or search changes
  useEffect(() => {
    if (!userLocation) 
    {
      console.log('Skipping distance filtering: user location not available yet.');
      return;
    }

    let results = gems;
    //filter gems within 50km radius
    results = results.filter(gem => 
    {
      const distance = getDistance(userLocation.latitude, userLocation.longitude, gem.latitude, gem.longitude);
      return distance <= 50;
    });

    if (selectedCategory !== 'all') 
    {
      results = results.filter(g => g.category === selectedCategory);
    }
    //filter by search query
    if (searchQuery.trim() !== '') 
    {
      results = results.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGems(results);
  }, [gems, userLocation, selectedCategory, searchQuery]);

  const categoryButtons = ['all', 'scenic', 'bar', 'other'];

  return (
    <View style={styles.container}>
      {userLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude ?? -37.8136, 
            longitude: userLocation?.longitude ?? 144.9631,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {filteredGems.map(gem => (
            <Marker
              key={gem.id}
              coordinate={{ latitude: gem.latitude, longitude: gem.longitude }}
              title={gem.title}
              description={gem.description}
            />
          ))}
        </MapView>
      )}

      <TextInput
        style={styles.search}
        placeholder="Search gems..."
        placeholderTextColor="#ccc"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoryBar}>
        {categoryButtons.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat ? styles.activeCategory : null,
            ]}
            onPress={() => setSelectedCategory(cat as any)}
          >
            <Text style={styles.categoryText}>{cat.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredGems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => 
          {
          const distance = userLocation
            ? getDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude).toFixed(1)
            : '?';

          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardDistance}>📍 {distance} km away</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.noResults}>No gems found nearby.</Text>}
      />
    </View>
  );
};

export default HiddenGemScreen;
//Styliiing!!
const styles = StyleSheet.create({
  container: 
  { 
  flex: 1, 
  backgroundColor: '#0e0e0e' 
 },

  map: 
  { 
    width: '100%', 
    height: Dimensions.get('window').height * 0.3, borderRadius: 12, marginBottom: 16,    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5, 
  },
  
  search: 
  {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  categoryBar: 
 {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryBtn:
  {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  activeCategory: 
  {
    backgroundColor: '#facc15',
  },
  categoryText: 
  {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: 
  {
    backgroundColor: '#1f2937',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 0,
  },
  cardTitle: 
  {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDesc: 
  {
    color: '#d1d5db',
    marginTop: 6,
    fontSize: 14,
  },
  cardDistance: 
  {
    marginTop: 6,
    color: '#86efac',
    fontSize: 14,
  },
  noResults: 
  {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});