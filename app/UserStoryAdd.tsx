import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig'; // make sure the path is correct

const StoryAddScreen = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [storyType, setStoryType] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !storyType) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert('You must be logged in to submit a story.');
      return;
    }
  
    try {
      await addDoc(collection(db, 'legends'), {
        title,
        description,
        location,
        category: storyType,
        image: image || '',
        latitude: 0, // placeholder for now
        longitude: 0,
        userId: user.uid, // ✅ user ID added safely
        createdAt: new Date(),
      });
  
      alert('Story submitted for moderation!');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Submit a Story</Text>
      <Text style={styles.subHeader}>Local Legends</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the title of the legend"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Describe the legend"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the location of the legend"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Story Type</Text>
      <View style={styles.storyTypeContainer}>
        {['Folklore', 'Myth', 'Historical Event'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.storyTypeButton,
              storyType === type && styles.storyTypeButtonSelected,
            ]}
            onPress={() => setStoryType(type)}
          >
            <Text style={storyType === type ? styles.storyTypeTextSelected : styles.storyTypeText}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Upload an Image</Text>
      <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
        <Text style={{ color: '#555' }}>{image ? 'Change Image' : 'Pick an Image'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <Text style={styles.hiddenGemTitle}>Is There a Hidden Gem?</Text>
      <Text style={styles.premiumText}>For Premium Members Only</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Story for Moderation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StoryAddScreen;


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', alignSelf: 'center' },
  subHeader: { fontSize: 30, fontWeight: 'bold', alignSelf: 'center', marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 4, fontWeight: 'bold' },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  storyTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  storyTypeButton: {
    backgroundColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  storyTypeButtonSelected: {
    backgroundColor: '#000',
  },
  storyTypeText: {
    color: '#333',
  },
  storyTypeTextSelected: {
    color: '#fff',
  },
  imageUploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginTop: 10 },
  hiddenGemTitle: { marginTop: 20, fontWeight: 'bold', fontSize: 16 },
  premiumText: { color: '#888', fontSize: 14, marginBottom: 20 },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
});
