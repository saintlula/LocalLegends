import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Platform, StyleSheet } from 'react-native';
import { getAuth, updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingScreen() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleCustomerSupport = () => {
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 4000);
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please enable notifications in your settings.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Notifications enabled!');
    }
  };

  const handleChangeEmail = () => {
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    Alert.prompt(
      'Change Email',
      'Enter your new email address:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async (newEmail) => {
            if (newEmail) {
              try {
                await updateEmail(user, newEmail);
                Alert.alert('Success', 'Email updated!');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to update email.');
              }
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const handleChangePassword = () => {
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    Alert.prompt(
      'Change Password',
      'Enter your new password:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async (newPassword) => {
            if (newPassword) {
              try {
                await updatePassword(user, newPassword);
                Alert.alert('Success', 'Password updated!');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to update password.');
              }
            }
          },
        },
      ],
      'secure-text',
    );
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user);
              Alert.alert('Account deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {bannerVisible && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            The developers don’t seem to have support for you yet! Oops!
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={requestNotificationPermission}>
        <Text style={styles.buttonText}>🔔 Notification Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
        <Text style={styles.buttonText}>📧 Change Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>🔒 Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>🗑️ Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCustomerSupport}>
        <Text style={styles.buttonText}>🆘 Customer Support</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    backgroundColor: '#121212', 
    paddingTop: 10, // Adds padding on top to avoid content going under the status bar
  },
  title: {
    fontSize: 32,
    color: '#f8d06f',
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f8d06f',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#ff4444cc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
});