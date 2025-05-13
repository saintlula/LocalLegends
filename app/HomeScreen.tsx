import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, Image, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLegends } from '../hooks/useLegends';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getAuth } from 'firebase/auth';

//The local legend catagories
const categories =
[
  { name: 'Historical Events' },
  { name: 'Myth' },
  { name: 'Urban Legends' }
];


export default function HomeScreen() 
{
  const router = useRouter();
  const { isPremium = 'false' } = useLocalSearchParams();
  const { legends, loading } = useLegends();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayName, setDisplayName] = useState('Guest'); 
  const slideAnim = useState(new Animated.Value(-300))[0];

  //on load, set user display name from Firebase Auth. basically say hi.
  useEffect(() => 
  {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.displayName) 
    {
      setDisplayName(user.displayName);
    } else if (user?.email) 
    {
      const namePart = user.email.split('@')[0];
      setDisplayName(namePart);
    }
  }, []);

  //Premium user pop up, only if the user is premium. 
  useEffect(() => 
  {
    if (isPremium === 'true') 
    {
      setTimeout(() => 
      {
        setShowPopup(true);
        Animated.timing(slideAnim, 
        {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000); //show after 2 secs
    }
  }, [isPremium]);
  //handler when user clicks a category
  const handleCategoryPress = (category: string) => 
  {
    setSelectedCategory(category);
    setShowCategoryModal(true); 
  };

  const handleCategoryClose = () => 
  {
    setShowCategoryModal(false);
  };

  const handleStoryClick = (storyId: string) => 
  {
    router.push({ pathname: '/StoryDetails', params: { id: storyId } });
  };
  //navigation handlers.
  const handleMapActivityPress = () => 
  {
    router.push('/LocalLegendsNear');
  };

  const handleMapView = () => 
  {
    router.push('/MapViewScreen');
  };

  const handleListView = () => 
  {
    router.push('/ListViewScreen');
  };

  const handleSubmitStory = () => 
  {
    router.push('/UserStoryAdd');
  };

  const handleHiddenGemPress = () => 
  {
    router.push('/HiddenGemScreen');
  };

  //Local Legends Search filter
  const filteredLegends = legends.filter((legend) => 
    {
    const query = searchQuery.toLowerCase();
    const title = typeof legend.title === 'string' ? legend.title.toLowerCase() : '';
    const locationName = typeof legend.locationName === 'string' ? legend.locationName.toLowerCase() : '';
    return title.includes(query) || locationName.includes(query);
  });
  //Filter legends by selected category
  const filteredCategoryLegends = selectedCategory
    ? legends.filter((legend) => legend.category === selectedCategory)
    : [];

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={styles.container}>
        
      <View style={styles.profileNsetting}>
            <TouchableOpacity onPress={() => router.push('/SettingScreen')} style={{ padding: 10 }}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/ProfileScreen')} style={{ padding: 10 }}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </TouchableOpacity>
          </View>
          
        <View style={styles.titlebox}>
          <Text style={styles.title}>LOCAL LEGENDS</Text>
        </View>

        <View style={styles.userText}>
        <Text style={styles.userText}>Welcome, {displayName}</Text>
        {isPremium === 'true' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌟 Premium Member</Text>
          </View>
        )}
        </View>

        <View style={styles.popupContainer}>
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
        </View>
        
        
        <View style={styles.searchContainer}>
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
        </View>

        
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
                    onPress={() => {
                      handleCategoryClose(); 
                      handleStoryClick(legend.id);
                    }}
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
//STYLIIINNNGG!!
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', 
    padding: 20,
    paddingTop: 60,
  },

  //Local Legends(box)
  titlebox:
  {
    width: wp('90%'),
    height: hp('10%'),
  },

  //Local Legends(text)
  title: 
  {
    fontSize: 50,
    color: '#f8d06f',
    textAlign: 'center',
    marginBottom: 10,
    width: wp('90%'),
    height: hp('20%'),
    fontFamily: 'Jacquard12-Regular',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5, 
  },


  profileNsetting:
  {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  
  //Welcome
  userText: 
  {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Jacquard12-Regular',
    color: '#f8d06f',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  //Premium
  badge: 
  {
    alignSelf: 'center',
    backgroundColor: '#f8d06f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  badgeText: 
  { 
    color: '#000', 
    fontWeight: 'bold', 
    fontFamily: 'PixelifySans-Regular',
   },

  //search box
  searchContainer: 
  {
    marginBottom: 10,
  },

  searchInput: 
  {
    backgroundColor: '#1a1a1a',
    color: '#f8d06f',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontFamily: 'PixelifySans-Regular',
    borderWidth: 1,
    borderColor: '#f8d06f',
  },

  sectionTitle: 
  {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  categoryContainer: 
  {
    flexDirection: 'row',
    paddingRight: 10,
    marginBottom: 10,
  },
  
  categoryButton: 
  {
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
  categoryText: 
  {
    fontSize: 16,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },

  mapPreview: 
  {
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
  
  mapPreviewText: 
  {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    color: '#000',
  },

  bottomButtons: 
  {
    width: wp('90%'),
    height: hp('20%'),
  },

  middleButtons:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  bottomButton: 
  {
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
  
  bottomButtonText: 
  {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'PixelifySans-Regular',
    color: '#000',
  },

  addStoryButton: 
  {
    backgroundColor: '#f8d06f',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
  addStoryButtonText: 
  {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    fontSize: 18,
  },

  searchResults: 
  {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#f8d06f',
    borderWidth: 1,
  },
  
  searchResultItem: 
  {
    marginBottom: 5,
  },

  searchResultTitle: 
  {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    
  },
  searchResultLocation: 
  {
    fontSize: 14,
    color: '#aaa',
  },

  imageBackground: 
  {
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  popupContainer: 
  {
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
  popupImage: 
  {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  popupClose: 
  {
    position: 'absolute',
    zIndex: 1,
    top: 5,
    right: 15,

  },
  modalOverlay: 
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: 
  {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },

  modalClose: 
  {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  modalCloseText: 
  {
    color: '#f8d06f',
    fontWeight: 'bold',
    fontSize: 20,
  },

  modalTitle: 
  {
    fontSize: 30,
    marginBottom: 10,
    color: '#f8d06f',
    fontFamily: 'Jacquard12-Regular',
  },

  modalScroll: 
  {
    maxHeight: '70%',
  },

  modalStoryItem: 
  {
    marginBottom: 15,
  },

  modalStoryTitle: 
  {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
});