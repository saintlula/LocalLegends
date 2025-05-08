import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, Image } from 'react-native';
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

  const [showPopup, setShowPopup] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0]; // start offscreen left

  useEffect(() => {
    if (isPremium === 'true') {
      setTimeout(() => {
        setShowPopup(true);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000);
    }
  }, [isPremium]);

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

  const handleHiddenGemPress = () => {
    router.push('/HiddenGemScreen');
  };

  const filteredLegends = legends.filter((legend) => {
    const query = searchQuery.toLowerCase();
    return (
      legend.title.toLowerCase().includes(query) ||
      legend.location.toLowerCase().includes(query)
    );
  });

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ position: 'relative', marginBottom: 10 }}>
          <Text style={styles.title}>LOCAL LEGENDS</Text>
          <View style={{ position: 'absolute', right: 0, top: 0, flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => router.push('/SettingScreen')} style={{ padding: 10 }}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={{ padding: 10 }}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.userText}>Welcome, {username}</Text>
        {isPremium === 'true' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌟 Premium Member</Text>
          </View>
        )}

{isPremium === 'true' && showPopup && (
  <Animated.View style={[styles.popupContainer, { transform: [{ translateX: slideAnim }] }]}>
    <TouchableOpacity style={styles.popupClose} onPress={() => setShowPopup(false)}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={handleHiddenGemPress}>
      <Image
        source={require('../assets/images/LocalLegenHiddenGem.png')}
        style={styles.popupImage}
      />
    </TouchableOpacity>
  </Animated.View>
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

        <ImageBackground
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Old-world-map.jpg' }}
          style={styles.imageBackground}
        >
          <View style={styles.overlay} />
        </ImageBackground>

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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8d06f',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4
  },
  userText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'SpaceMono',
    color: 'black'
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeText: { color: '#000', fontWeight: 'bold' },
  searchInput: {
    backgroundColor: '#ffffffcc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontFamily: 'SpaceMono',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
    color: '#f8d06f'
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    padding: 8,
    backgroundColor: '#ffffffaa',
    borderRadius: 12,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  categoryText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'SpaceMono',
  },
  mapPreview: {
    backgroundColor: '#f8d06f',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  mapPreviewText: {
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    color: '#000'
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  bottomButton: {
    backgroundColor: '#f8d06f',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    color: '#000'
  },
  addStoryButton: {
    backgroundColor: '#f8d06f',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  addStoryButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    fontSize: 24
  },
  searchResults: {
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20
  },
  searchResultItem: { marginBottom: 10 },
  searchResultTitle: { fontSize: 16, fontWeight: 'bold' },
  searchResultLocation: { fontSize: 14, color: '#555' },
  imageBackground: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)', flex: 1, borderRadius: 10 },

  popupContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    backgroundColor: 'transparent',  // Changed from #000 to transparent
    borderRadius: 12,
    padding: 10,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center'
  },
  popupImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  popupClose: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1
  },
});