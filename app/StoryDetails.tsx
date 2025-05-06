// app/StoryDetailsScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; // for icons like diamonds, back button

const StoryDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id: storyId } = route.params as { id: string };
  const [legend, setLegend] = useState<any>(null);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const fetchLegend = async () => {
      const docRef = doc(db, 'legends', storyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLegend(docSnap.data());
      }
    };

    fetchLegend();
  }, [storyId]);

  const handleAddReview = async () => {
    if (!newReview.trim()) return;

    try {
      const newReviewData = {
        reviewer: 'Admin User',
        rating: newRating,
        comment: newReview,
      };

      const docRef = doc(db, 'legends', storyId);

      await updateDoc(docRef, {
        reviews: arrayUnion(newReviewData),
      });

      setLegend((prevLegend: any) => ({
        ...prevLegend,
        reviews: prevLegend.reviews ? [...prevLegend.reviews, newReviewData] : [newReviewData],
      }));

      setNewReview('');
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  if (!legend) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>{legend.title}</Text>
        <Text style={styles.subtitle}>
          {legend.isUserSubmitted ? "User Submitted" : "Pre-Added"} {legend.isHiddenGem && " 💎 Hidden Gem"}
        </Text>
      </View>

      {/* INFO CARDS */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text>{legend.location}</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: '#f9f9f9' }]}>
          <Text style={styles.infoLabel}>Author:</Text>
          <Text>{legend.isUserSubmitted ? legend.author : 'Pre-Added'}</Text>
        </View>
      </View>

      {/* STORY DESCRIPTION */}
      <View style={styles.descriptionCard}>
        <Text style={styles.infoLabel}>Story Description:</Text>
        <Text>{legend.description}</Text>
      </View>

      {/* USER REVIEWS */}
      <View style={styles.reviewsSection}>
        <Text style={styles.infoLabel}>User Reviews:</Text>
        <FlatList
          data={legend.reviews || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={{ fontWeight: 'bold' }}>{item.reviewer}</Text>
              <Text>{'⭐'.repeat(item.rating)}</Text>
              <Text>{item.comment}</Text>
            </View>
          )}
        />
      </View>

      {/* ADD REVIEW */}
      <View style={styles.addReviewSection}>
        <TextInput
          style={styles.input}
          placeholder="Write your review..."
          value={newReview}
          onChangeText={setNewReview}
        />
        <Button title="Submit Review" onPress={handleAddReview} disabled={!newReview.trim()} />
      </View>
    </SafeAreaView>
  );
};

export default StoryDetailsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginTop: 10, marginBottom: 10 },
  headerCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#777', marginTop: 4 },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoCard: {
    flex: 0.48,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  infoLabel: { fontWeight: 'bold', marginBottom: 4 },
  descriptionCard: {
    backgroundColor: '#fafafa',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 1,
  },
  reviewsSection: {
    marginVertical: 10,
  },
  reviewCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
  },
  addReviewSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#efefef',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
});
