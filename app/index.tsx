import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // adjust path if needed
import { Colors } from '@/constants/Colors';
import { DarkTheme } from '@react-navigation/native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (username === 'admin' && password === 'admin') {
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
      await signInWithEmailAndPassword(auth, username, password);
      router.push({
        pathname: '/HomeScreen',
        params: {
          username,
          isGuest: 'false',
          isPremium: 'false',
        },
      });
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.logo}>Local Legends</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e5e5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3b6e82',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3b6e82',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  guestText: {
    color: '#333',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  helpContainer: {
    marginTop: 40,
  },
  helpText: {
    color: '#555',
    fontSize: 14,
  },

  signupText: {
    color: '#333',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  
});
