import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0); // Placeholder
  const [showAllStories, setShowAllStories] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserStories();
      fetchRatingsCount(); // Placeholder function
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserStories = async () => {
    try {
      if (user) {
        const q = query(collection(db, 'legends'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userStories: any[] = [];
        querySnapshot.forEach(doc => {
          userStories.push({ id: doc.id, ...doc.data() });
        });
        setStories(userStories);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user stories:', error);
    }
  };

  const fetchRatingsCount = async () => {
    // Placeholder: Replace this logic with your actual ratings data fetch
    setRatingsCount(0);
  };

  const saveUsername = async () => {
    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), { username }, { merge: true });
        setEditingUsername(false);
      }
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.infoText}>You need to be logged in to view your profile.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.infoText}>{user.email}</Text>

      <Text style={styles.label}>Username:</Text>
      {editingUsername ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveUsername}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <Text style={styles.infoText}>{username || 'Not set'}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditingUsername(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Contribution Stats:</Text>
      <Text style={styles.infoText}>Stories posted: {stories.length}</Text>
      <Text style={styles.infoText}>Ratings given: {ratingsCount}</Text>

      <TouchableOpacity style={styles.subscriptionButton}>
        <Text style={styles.subscriptionText}>Manage Subscription</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Your Stories:</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={showAllStories ? stories : stories.slice(0, 3)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.storyItem}>
              <Text style={styles.storyTitle}>{item.title}</Text>
              <Text style={styles.storyCategory}>Category: {item.category}</Text>
            </View>
          )}
          ListFooterComponent={
            stories.length > 3 ? (
              <TouchableOpacity onPress={() => setShowAllStories(!showAllStories)}>
                <Text style={styles.viewAll}>
                  {showAllStories ? 'Show Less' : 'View All of Them'}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, marginTop: 12, fontWeight: '600' },
  infoText: { fontSize: 16, marginVertical: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 6 },
  saveButton: { backgroundColor: '#28a745', padding: 8, borderRadius: 6 },
  saveButtonText: { color: '#fff' },
  editButton: { backgroundColor: '#007bff', padding: 8, borderRadius: 6 },
  editButtonText: { color: '#fff' },
  subscriptionButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    alignItems: 'center',
  },
  subscriptionText: { color: '#fff', fontWeight: '600' },
  storyItem: { padding: 10, backgroundColor: '#f4f4f4', marginVertical: 5, borderRadius: 6 },
  storyTitle: { fontSize: 16, fontWeight: '600' },
  storyCategory: { fontSize: 14, color: '#555' },
  viewAll: { textAlign: 'center', marginTop: 10, color: '#007bff' },
});