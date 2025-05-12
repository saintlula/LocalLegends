import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, collection, addDoc, getDocs,getFirestore } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

const StoryDetailsScreen = () => 
{
  const route = useRoute();
  const navigation = useNavigation();
  const { id: storyId } = route.params as { id: string };
  const [legend, setLegend] = useState<any>(null);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const auth = getAuth();  
  //Fetch legend and reviews on load
  useEffect(() => 
  {
    const fetchLegend = async () => 
    {
      const docRef = doc(db, 'legends', storyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setLegend(docSnap.data());
    };
  
    const fetchReviews = async () => 
    {
      const reviewsRef = collection(db, 'legends', storyId, 'reviews');
      const snapshot = await getDocs(reviewsRef);
      const reviewsList = snapshot.docs.map((doc) => doc.data());
      setReviews(reviewsList);
    };
  
    const fetchUsername = () => 
    {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) 
      {
        const nameFromEmail = currentUser.email.split('@')[0];
        setUsername(nameFromEmail);
      }
    };
  
    fetchLegend();
    fetchReviews();
    fetchUsername();
  }, [storyId]);
  //Add a new review
  const handleAddReview = async () => 
  {
    if (!newReview.trim()) return;
  
    try 
   {
      const reviewerName = isAnonymous ? 'Anonymous' : username;
      const newReviewData = 
     {
        reviewer: reviewerName,
        rating: newRating,
        comment: newReview,
        createdAt: serverTimestamp(),
      };
  
      const reviewsRef = collection(db, 'legends', storyId, 'reviews');
      await addDoc(reviewsRef, newReviewData);
      //Optimistically update UI
      setReviews((prev: any[]) => [...prev, newReviewData]);
  
      setNewReview('');
      setNewRating(5);
    } catch (error) 
    {
      console.error('Error adding review:', error);
    }
  };
  //Show loading screen if legend isn't fetched yet
  if (!legend) 
    {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#f8d06f" />
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <Text style={styles.title}>{legend.title}</Text>
        <Text style={styles.subtitle}>
          {legend.isUserSubmitted ? 'User Submitted' : 'Pre-Added'} {legend.isHiddenGem && '💎 Hidden Gem'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>
            {typeof legend.location === 'string'
              ? legend.location
              : `Lat: ${legend.location.latitude.toFixed(4)}, Lng: ${legend.location.longitude.toFixed(4)}`}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Author:</Text>
          <Text style={styles.infoValue}>{legend.isUserSubmitted ? legend.author : 'Pre-Added'}</Text>
        </View>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.infoLabel}>Story Description:</Text>
        <Text style={styles.infoValue}>{legend.description}</Text>
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.infoLabel}>User Reviews:</Text>
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewer}>{item.reviewer}</Text>
              <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
              <Text style={styles.comment}>{item.comment}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.addReviewSection}>
  <TextInput
    style={styles.input}
    placeholder="Write your review..."
    placeholderTextColor="#ccc"
    value={newReview}
    onChangeText={setNewReview}
  />

  <View style={styles.starSelector}>
    <Text style={styles.infoLabel}>Your Rating:</Text>
    <View style={{ flexDirection: 'row', marginTop: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
          <Ionicons
            name={newRating >= star ? 'star' : 'star-outline'}
            size={28}
            color="#f8d06f"
            style={{ marginRight: 6 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>

  <View style={{ marginVertical: 10, alignItems: 'center' }}>
  <Text style={styles.infoLabel}>Post as anonymous?</Text>
  <Switch
    value={isAnonymous}
    onValueChange={setIsAnonymous}
    thumbColor={isAnonymous ? '#f8d06f' : '#ccc'}
    trackColor={{ true: '#f8d06f', false: '#888' }}
  />
</View>

<Button
  title="Submit Review"
  onPress={handleAddReview}
  disabled={!newReview.trim()}
  color="#f8d06f"
/>
</View>
    </SafeAreaView>
  );
};

export default StoryDetailsScreen;
//A lot of styling :(
const styles = StyleSheet.create({
  safeArea: 
  {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  centered: 
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: 
  {
    color: '#f8d06f',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  backButton: 
  {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  headerCard: 
  {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#f8d06f',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  title: 
  {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    color: '#f8d06f',
    textShadowColor: '#fff899',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: 
  {
    color: '#f0e68c',
    marginTop: 6,
    fontFamily: 'PixelifySans-Regular',
  },
  infoSection: 
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoCard: 
  {
    flex: 0.48,
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 14,
    borderColor: '#f8d06f',
    borderWidth: 1,
  },
  infoLabel: 
  {
    color: '#f8d06f',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 6,
    fontSize: 14,
  },
  infoValue: 
  {
    color: '#f4f4f4',
    fontSize: 13,
    fontFamily: 'PixelifySans-Regular',
  },
  descriptionCard: 
  {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderColor: '#f8d06f',
    borderWidth: 1,
    
  },
  reviewsSection: 
  {
    marginVertical: 12,
  },

  starSelector: 
  {
    marginBottom: 12,
  },

  reviewCard: 
  {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderColor: '#f8d06f88',
    borderWidth: 1,
  },
  reviewer: 
  {
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 4,
  },
  rating:
  {
    color: '#ffe066',
    marginBottom: 4,
  },
  comment:
  {
    color: '#eee',
    fontFamily: 'PixelifySans-Regular',
  },
  addReviewSection: 
  {
    marginTop: 20,
    marginBottom: 30,
  },
  input: 
  {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderColor: '#f8d06f88',
    borderWidth: 1,
    fontFamily: 'PixelifySans-Regular',
  },
  anonymityToggle: 
  {
    marginBottom: 12,
  },
});