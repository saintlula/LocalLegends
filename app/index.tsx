import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import useCustomFonts from '../hooks/useCustomFont';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const fontsLoaded = useCustomFonts();
  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (username === 'admin@gmail.com' && password === 'adminll') {
      // User is the admin, so we set premium to true
      router.push({
        pathname: '/HomeScreen',
        params: {
          username: 'admin',
          isGuest: 'false',
          isPremium: 'true',
        },
      });
      return;
    }

    try {
      // Regular user login with Firebase Authentication
      await signInWithEmailAndPassword(auth, username, password);

      // Check if the logged-in user is admin
      const user = auth.currentUser;
      if (user && user.email === 'admin@gmail.com') {
        router.push({
          pathname: '/HomeScreen',
          params: {
            username: user.email,
            isGuest: 'false',
            isPremium: 'true',  // Admin is a premium user
          },
        });
      } else {
        router.push({
          pathname: '/HomeScreen',
          params: {
            username: user ? user.email : username,
            isGuest: 'false',
            isPremium: 'false',  // Regular user, not premium
          },
        });
      }
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  const handleGuestLogin = () => {
    router.push({
      pathname: '/HomeScreen',
      params: {
        username: 'Guest',
        isGuest: 'true',
        isPremium: 'false',
      },
    });
  };

  const handleHelp = () => {
    Alert.alert(
      "Hang tight!",
      "The developer will soon explain how everything works, I promise!"
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.logo}>Local Legends</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGuestLogin}>
          <Text style={styles.guestText}>Or enter as a guest!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
          <Text style={styles.signupText}>Or... Sign up!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHelp} style={styles.helpContainer}>
          <Text style={styles.helpText}>Not sure how this works?</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 35,
    color: '#fefefe',
    marginBottom: 4,
    fontFamily: 'Jacquard12-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logo: {
    fontSize: 65,
    color: '#f8d06f',
    marginBottom: 32,
    fontFamily: 'Jacquard12-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderColor: '#333',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#2c2c2c',
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    backgroundColor: '#f8d06f',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#f8d06f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#b69c53',
  },
  buttonText: {
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
  },
  guestText: {
    color: '#f8d06f',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'PixelifySans-Regular',
  },
  signupText: {
    color: '#f8d06f',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 10,
    fontFamily: 'PixelifySans-Regular',
  },
  helpContainer: {
    marginTop: 40,
  },
  helpText: {
    color: '#999',
    fontSize: 13,
    fontFamily: 'PixelifySans-Regular',
  },
});