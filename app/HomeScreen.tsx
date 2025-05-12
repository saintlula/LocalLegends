import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, Image, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLegends } from '../hooks/useLegends';
import useCustomFont from '../hooks/useCustomFont'
import { useWindowDimensions } from 'react-native';

const categories = [
  { name: 'Historical Events' },
  { name: 'Myth' },
  { name: 'Urban Legends' }
];

export default function HomeScreen() {
  const router = useRouter();
  const { username = 'Guest', isPremium = 'false' } = useLocalSearchParams();
  const { legends, loading } = useLegends();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // New state for modal
  const [selectedCategory, setSelectedCategory] = useState('');
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
    setSelectedCategory(category); // Set selected category
    setShowCategoryModal(true); // Show the modal
  };

  const handleCategoryClose = () => {
    setShowCategoryModal(false); // Close the modal
  };

  const handleStoryClick = (storyId: string) => {
    router.push({ pathname: '/StoryDetails', params: { id: storyId } });
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
    const title = typeof legend.title === 'string' ? legend.title.toLowerCase() : '';
    const locationName = typeof legend.locationName === 'string' ? legend.locationName.toLowerCase() : '';
    return title.includes(query) || locationName.includes(query);
  });

  const filteredCategoryLegends = selectedCategory
    ? legends.filter((legend) => legend.category === selectedCategory)
    : [];

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
                onPress={() => handleStoryClick(legend.id)}
              >
                <Text style={styles.searchResultTitle}>{legend.title}</Text>
                <Text style={styles.searchResultLocation}>{legend.locationName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Category Filter</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress('Urban Legends')}>
            <Text style={styles.categoryText}>Urban Legends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress('Historical Events')}>
            <Text style={styles.categoryText}>Historical Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress('Myth')}>
            <Text style={styles.categoryText}>Myth</Text>
          </TouchableOpacity>
        </ScrollView>

        <ImageBackground
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Old-world-map.jpg' }}
          style={styles.imageBackground}
        >
        </ImageBackground>

        <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.mapPreview} onPress={handleMapActivityPress}>
          <Text style={styles.mapPreviewText}>Featured and Trending Local Legends near you</Text>
        </TouchableOpacity>

            <View style={styles.middleButtons}>
              <TouchableOpacity style={styles.bottomButton} onPress={handleMapView}>
                <Text style={styles.bottomButtonText}>Map View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomButton} onPress={handleListView}>
                <Text style={styles.bottomButtonText}>List of Local Legends</Text>
              </TouchableOpacity>
            </View>

        <TouchableOpacity style={styles.addStoryButton} onPress={handleSubmitStory}>
          <Text style={styles.addStoryButtonText}>Have a story to tell? You can add it!</Text>
        </TouchableOpacity>

        </View>

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCategoryClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalClose} onPress={handleCategoryClose}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Stories in {selectedCategory}</Text>
              <ScrollView style={styles.modalScroll}>
                {filteredCategoryLegends.map((legend) => (
                  <TouchableOpacity
                    key={legend.id}
                    style={styles.modalStoryItem}
                    onPress={() => handleStoryClick(legend.id)}
                  >
                    <Text style={styles.modalStoryTitle}>{legend.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', // pure black background
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 50
    ,
    color: '#f8d06f',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Jacquard12-Regular',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5, // soft yellow glow
  },
  userText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Jacquard12-Regular',
    color: '#f8d06f',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#f8d06f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  badgeText: { color: '#000', fontWeight: 'bold', fontFamily: 'PixelifySans-Regular' },

  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#f8d06f',
    padding: 12,
    borderRadius: 10,
    marginBottom: 70,
    fontFamily: 'PixelifySans-Regular',
    borderWidth: 1,
    borderColor: '#f8d06f',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 10,
    alignSelf: 'flex-start',
  },
  categoryButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f8d06f',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 16,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
//??
  mapPreview: {
    backgroundColor: '#f8d06f',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  //no
  mapPreviewText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    color: '#000',
  },

  bottomButtons: {
    marginBottom: 10,
  },

  middleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  bottomButton: {
    backgroundColor: '#f8d06f',
    padding: 4,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  
  },
  //no
  bottomButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PixelifySans-Regular',
    color: '#000',
  },

  addStoryButton: {
    backgroundColor: '#f8d06f',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
  addStoryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    fontSize: 18,
  },

  searchResults: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#f8d06f',
    borderWidth: 1,
  },
  searchResultItem: { marginBottom: 10 },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    
  },
  searchResultLocation: {
    fontSize: 14,
    color: '#aaa',
  },

  imageBackground: {
    width: '100%',
    height: 210,
    marginBottom: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  popupContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    backgroundColor: 'transperent',
    borderRadius: 12,
    padding: 10,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  popupImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  popupClose: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalCloseText: {
    color: '#f8d06f',
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 30,
    marginBottom: 10,
    color: '#f8d06f',
    fontFamily: 'Jacquard12-Regular',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalStoryItem: {
    marginBottom: 15,
  },
  modalStoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
});