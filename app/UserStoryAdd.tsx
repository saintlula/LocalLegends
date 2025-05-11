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
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Describe the legend"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the location of the legend"
        placeholderTextColor="#888"
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000', // black background
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  subHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: '#888',
    fontFamily: 'PixelifySans-Regular',
  },
  storyTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  storyTypeButton: {
    backgroundColor: '#222',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  storyTypeButtonSelected: {
    backgroundColor: '#f8d06f',
  },
  storyTypeText: {
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  storyTypeTextSelected: {
    color: '#000',
    fontFamily: 'PixelifySans-Regular',
  },
  imageUploadButton: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  hiddenGemTitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  premiumText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'PixelifySans-Regular',
  },
  submitButton: {
    backgroundColor: '#f8d06f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: 'FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
  },
});