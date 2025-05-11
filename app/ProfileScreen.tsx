import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function ProfileScreen() {
  const [user, setUser] = useState({ uid: '', email: '' });
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllStories, setShowAllStories] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({ uid: currentUser.uid, email: currentUser.email || '' });
      fetchUserProfile(currentUser.uid);
      fetchUserStories(currentUser.uid);
      fetchUserRatings(currentUser.uid);
    }
  }, []);

  const fetchUserProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUsername(userSnap.data().username || '');
    }
  };

  const fetchUserStories = async (uid: string) => {
    try {
      const legendsRef = collection(db, 'legends');
      const snapshot = await getDocs(legendsRef);
      const userStories = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((story: any) => story.createdBy === uid);
      setStories(userStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async (uid: string) => {
    try {
      const legendsRef = collection(db, 'legends');
      const snapshot = await getDocs(legendsRef);
      let count = 0;
      snapshot.docs.forEach((doc) => {
        const reviewsRef = collection(db, 'legends', doc.id, 'reviews');
        getDocs(reviewsRef).then((reviewSnap) => {
          reviewSnap.forEach((reviewDoc) => {
            if (reviewDoc.data().userId === uid) {
              count++;
            }
          });
          setRatingsCount(count);
        });
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const saveUsername = () => {
    // Replace with logic to save username to Firestore
    setEditingUsername(false);
    console.log('Saved username:', username);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.infoText}>{user.email}</Text>

        <Text style={styles.label}>Username</Text>
        {editingUsername ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.iconButton} onPress={saveUsername}>
              <Feather name="check" size={20} color="#f8d06f" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <Text style={styles.infoText}>{username || 'Not set'}</Text>
            <TouchableOpacity style={styles.iconButton} onPress={() => setEditingUsername(true)}>
              <Feather name="edit" size={20} color="#f8d06f" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Contribution Stats</Text>
        <Text style={styles.infoText}>Stories posted: {stories.length}</Text>
        <Text style={styles.infoText}>Ratings given: {ratingsCount}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.subscriptionText}>Manage Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.subscriptionText}>Manage Stories</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Stories</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#f8d06f" />
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
                    {showAllStories ? 'Show Less' : 'View All Stories'}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#f8d06f',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PixelifySans-Regular',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    color: '#f8d06f',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f8d06f',
    color: '#fff',
    fontFamily: 'PixelifySans-Regular',
    paddingVertical: 4,
    marginRight: 10,
  },
  iconButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  subscriptionText: {
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    fontSize: 14,
  },
  storyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  storyTitle: {
    color: '#f8d06f',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
  },
  storyCategory: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'PixelifySans-Regular',
  },
  viewAll: {
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
});