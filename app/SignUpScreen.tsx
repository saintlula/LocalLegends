import React, { useState } from 'react';
import {View,TextInput,Text,TouchableOpacity,Alert,StyleSheet,Keyboard,TouchableWithoutFeedback} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import useCustomFonts from '../hooks/useCustomFont';

export default function SignUpScreen() 
{
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const fontsLoaded = useCustomFonts();
  if (!fontsLoaded) return null;

  const handleSignUp = async () => 
  {
    try 
    {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created!");
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Join the legend</Text>
        <Text style={styles.logo}>Sign Up</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Create password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: 
  {
    fontSize: 35,
    color: '#fefefe',
    marginBottom: 4,
    fontFamily: 'Jacquard12-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logo: 
  {
    fontSize: 55,
    color: '#f8d06f',
    marginBottom: 32,
    fontFamily: 'Jacquard12-Regular',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  inputContainer: 
  {
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
  input: 
  {
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
  button: 
  {
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
  buttonText: 
  {
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
  },
  backText: 
  {
    color: '#f8d06f',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'PixelifySans-Regular',
  },
});