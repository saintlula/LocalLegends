import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLegends } from '../hooks/useLegends';

const categories = [
  { name: 'Historical Events', emoji: '🏰' },
  { name: 'Myths', emoji: '🧝‍♂️' },
  { name: 'Urban Legends', emoji: '👻' }
];

export default function HomeScreen() {
  const router = useRouter();
  const { username = 'Guest', isPremium = 'false' } = useLocalSearchParams();
  const { legends, loading } = useLegends();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryPress = (category: string) => {
    router.push({ pathname: '/CategoryList', params: { category } });
  };

  const handleMapActivityPress = () => {
    router.push('/LocalLegendsNear');
  };

  const handleMapView = () => {
    router.push('/MapViewScreen');
  };

  const handleListView = () => {
    router.push('/ListViewScreen');
  };

  const handleSubmitStory = () => {
    router.push('/UserStoryAdd');
  };

  const filteredLegends = legends.filter((legend) => {
    const query = searchQuery.toLowerCase();
    return (
      legend.title.toLowerCase().includes(query) ||
      legend.location.toLowerCase().includes(query)
    );
  });

  return (
    <ImageBackground
      source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/000/216/242/small_2x/Ancient-Map-01.jpg' }}
      style={styles.background}
      blurRadius={2}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>LOCAL LEGENDS</Text>

        <Text style={styles.userText}>Welcome, {username}</Text>
        {isPremium === 'true' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌟 Premium Member</Text>
          </View>
        )}

        <TextInput
          placeholder="Search for stories or locations"
          placeholderTextColor="#333"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            {filteredLegends.map((legend) => (
              <TouchableOpacity
                key={legend.id}
                style={styles.searchResultItem}
                onPress={() => router.push({ pathname: '/StoryDetails', params: { id: legend.id } })}
              >
                <Text style={styles.searchResultTitle}>{legend.title}</Text>
                <Text style={styles.searchResultLocation}>{legend.location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Category Filter</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={styles.categoryButton}
              onPress={() => handleCategoryPress(cat.name)}
            >
              <Text style={styles.categoryText}>{cat.emoji} {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.mapPreview} onPress={handleMapActivityPress}>
          <Text style={styles.mapPreviewText}>Featured and Trending Local Legends near you</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.bottomButton} onPress={handleMapView}>
            <Text style={styles.bottomButtonText}>🗺️ Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={handleListView}>
            <Text style={styles.bottomButtonText}>📜 List of Local Legends</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addStoryButton} onPress={handleSubmitStory}>
          <Text style={styles.addStoryButtonText}>Have a story to tell? You can add it!</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'black', textAlign: 'center', marginBottom: 10 },
  userText: { fontSize: 18, textAlign: 'center', marginBottom: 5 },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeText: { color: '#000', fontWeight: 'bold' },
  searchInput: { backgroundColor: '#ffffffcc', padding: 12, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  categoryButton: { padding: 10, backgroundColor: '#ffffffaa', borderRadius: 12 },
  categoryText: { fontSize: 16, color: '#000' },
  mapPreview: { backgroundColor: '#eee', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 30 },
  mapPreviewText: { fontSize: 16, fontWeight: 'bold' },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  bottomButton: { backgroundColor: '#ffffffcc', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  bottomButtonText: { fontSize: 16, fontWeight: '600' },
  addStoryButton: { backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center' },
  addStoryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  searchResults: { backgroundColor: '#ffffffcc', padding: 10, borderRadius: 10, marginBottom: 20 },
  searchResultItem: { marginBottom: 10 },
  searchResultTitle: { fontSize: 16, fontWeight: 'bold' },
  searchResultLocation: { fontSize: 14, color: '#555' },
});
