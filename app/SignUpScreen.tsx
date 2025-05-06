import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // adjust path as needed
import { useRouter } from 'expo-router';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created!");
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor={Colors.black}/>
      <TextInput placeholder="Create password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}placeholderTextColor={Colors.black} />
      <Button title="Create Account" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 10, borderRadius: 5 },
});
