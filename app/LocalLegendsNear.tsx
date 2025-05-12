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
      if (selectedLegend && selectedLegend.location?.latitude && selectedLegend.location?.longitude) {
        const { latitude, longitude } = selectedLegend.location;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
      } else {
        Alert.alert('Location info not available for this legend');
      }
    } else {
      Alert.alert('Please select a legend first');
    }
  };

  if (!locationGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.userText}>Requesting location permission...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Stavanger_city_map_cut.jpg' }}
          style={styles.mapBackground}
        />
        <View style={styles.statsOverlay}>
          <Text style={styles.statsText}>{legends.length} Legends Nearby</Text>
        </View>
      </View>

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Nearby Legends</Text>
        <FlatList
          data={legends}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.legendList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.legendItem,
                selectedLegendId === item.id && styles.selectedLegend,
              ]}
              onPress={() => setSelectedLegendId(item.id)}
            >
              <Text style={styles.legendName}>{item.title}</Text>
              <Text style={styles.legendCategory}>{item.category}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={handleShowDetails} style={styles.floatingButton}>
          <Image
            source={require('../assets/images/bookPixel.png')}
            style={styles.floatingImage1}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigateToLegend} style={styles.floatingButton}>
            <Image
            source={require('../assets/images/locationPixel.png')}
            style={styles.floatingImage2}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapWrapper: {
    height: '45%',
    position: 'relative',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  statsOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f8d06f',
  },
  statsText: {
    color: '#f8d06f',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
    fontWeight: 'bold',
  },
  legendCard: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 16,
    elevation: 10,
    shadowColor: '#f8d06f',
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  legendTitle: {
    fontSize: 18,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 10,
  },
  legendList: {
    paddingBottom: 80,
  },
  legendItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedLegend: {
    borderColor: '#f8d06f',
    backgroundColor: '#222',
  },
  legendName: {
    color: '#f8d06f',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    
  },
  legendCategory: {
    color: 'gray',
    fontSize: 12,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  floatingImage1: {
    width: 70,
    height: 70,
    resizeMode: 'contain', 
  },

  floatingImage2: {
    width: 60,
    height: 60,
    resizeMode: 'contain', 
  },
  
  userText: {
    color: '#f8d06f',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});