import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListViewScreen() 
{
  const [legends, setLegends] = useState<any[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => 
  {
    fetchLegends();
  }, []);

  const fetchLegends = async () => 
  {
    try 
    {
      const querySnapshot = await getDocs(collection(db, 'legends'));
      const fetchedLegends: any[] = [];
      querySnapshot.forEach((doc) => 
      {
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
    } catch (error) 
    {
      console.error('Error fetching legends:', error);
    }
  };

  const handleLegendPress = (legendId: string) => 
  {
    router.push({
      pathname: '/StoryDetails',
      params: { id: legendId },
    });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => 
  {
    const dynamicHeight = 120 + (index % 3) * 30;
    const rotateDeg = (index % 2 === 0 ? -1 : 1) * (index % 3);
    const isHiddenGem = item.hiddenGem;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            height: dynamicHeight,
            transform: [{ rotate: `${rotateDeg}deg` }],
            borderColor: isHiddenGem ? '#f8d06f' : '#444',
            borderWidth: isHiddenGem ? 2 : 1,
            shadowColor: '#f8d06f',
            shadowOpacity: 0.7,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            backgroundColor: '#111',
          },
        ]}
        onPress={() => handleLegendPress(item.id)}
      >
        <Text style={styles.title}>{item.title}</Text>
        {item.latitude && item.longitude && (
          <Text style={styles.description}>
            📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        )}
        {isHiddenGem && <Text style={styles.hiddenGem}>💎 Hidden Gem</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>⬅ Back to Home</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40 }}
        data={legends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: 
  {
    flex: 1,
    backgroundColor: '#000',
  },
  item: 
  {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#f8d06f',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: 
  {
    fontSize: 20,
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  description: 
  {
    fontSize: 14,
    color: '#ccc',
    marginTop: 6,
    fontFamily: 'Girassol-Regular',
  },
  hiddenGem: 
  {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  backButton: 
  {
    position: 'absolute',
    left: 20,
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 10,
    borderColor: '#f8d06f',
    borderWidth: 1,
    shadowColor: '#f8d06f',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  backButtonText: 
  {
    color: '#f8d06f',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    fontSize: 16,
    textShadowColor: '#f8d06f',
    textShadowRadius: 4,
  },
});