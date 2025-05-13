import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, GeoPoint } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
const OPENCAGE_API_KEY = '23bd5b7d226f4185be5b5a391cbb4add'; //For converting address into coordinates

const StoryAddScreen = () => 
{
  const navigation = useNavigation();
  //Local state to hold story data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [storyType, setStoryType] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  //Opens image picker
  const pickImage = async () => 
  {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) 
    {
      setImage(result.assets[0].uri);
    }
  };
  //Converts address string to latitude & longitude using OpenCage API instructions
  const geocodeLocation = async (locationStr: string) => 
  {
    try 
    {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationStr)}&key=${OPENCAGE_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) 
      {
        const { lat, lng } = data.results[0].geometry;
        return new GeoPoint(lat, lng);
      } else
      {
        return null;
      }
    } catch (error) 
    {
      console.error('Geocoding error:', error);
      return null;
    }
  };
  //Submits the new story to Firestore so we can see it!
  const handleSubmit = async () => 
  {
    if (!title || !description || !location || !storyType) {
      alert('Please fill in all required fields.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) 
    {
      alert('You must be logged in to submit a story.');
      return;
    }

    const geoPoint = await geocodeLocation(location);

    if (!geoPoint) 
    {
      alert('Could not find location. Please try a different name.');
      return;
    }

    try 
    {
      await addDoc(collection(db, 'legends'), 
      {
        title,
        description,
        location: geoPoint,
        category: storyType,
        image: image || '',
        userId: user.uid,
        author: user.email ? user.email.split('@')[0] : 'unknown',
        createdAt: new Date(),
      });

      alert('Story was submitted! You have bypassed moderation due to this being a prototype :)');
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
        {['Urban Legends', 'Myth', 'Historical Event'].map((type) => (
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
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Story for Moderation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StoryAddScreen;


const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    padding: 20,
    backgroundColor: '#000', 
  },
  header: 
  {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  subHeader: 
  {
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
  label: 
  {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  input: 
  {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: '#888',
    fontFamily: 'PixelifySans-Regular',
  },
  storyTypeContainer: 
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  storyTypeButton: 
  {
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
  storyTypeButtonSelected: 
  {
    backgroundColor: '#f8d06f',
  },
  storyTypeText: 
  {
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  storyTypeTextSelected: 
  {
    color: '#000',
    fontFamily: 'PixelifySans-Regular',
  },
  imageUploadButton: 
  {
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
  previewImage: 
  {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  hiddenGemTitle: 
  {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#f8d06f',
    fontFamily: 'PixelifySans-Regular',
  },
  premiumText: 
  {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'PixelifySans-Regular',
  },
  submitButton: 
  {
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
  submitButtonText: 
  {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
  },
});