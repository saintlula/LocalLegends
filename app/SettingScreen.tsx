import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { getAuth, deleteUser } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const auth = getAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Are you sure?',
      'Your account will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const user = auth.currentUser;
            if (user) {
              deleteUser(user)
                .then(() => {
                  console.log('User deleted');
                })
                .catch((error) => {
                  console.error('Error deleting user:', error);
                });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCustomerSupport = () => {
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 4000);
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'You will not receive notifications from this app.'
      );
    } else {
      console.log('Notification permissions granted.');
    }
  };

  const handleChangeEmail = () => {
    console.log('Change email');
  };

  const handleChangePassword = () => {
    console.log('Change password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      {bannerVisible && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            The developers don’t seem to have support for you yet! Oops!
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <TouchableOpacity style={styles.optionRow} onPress={requestNotificationPermission}>
          <Feather name="bell" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Notification Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleChangeEmail}>
          <MaterialIcons name="email" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Change Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleChangePassword}>
          <Feather name="lock" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.optionRow} onPress={handleDeleteAccount}>
          <AntDesign name="deleteuser" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleCustomerSupport}>
          <Feather name="help-circle" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Customer Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
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
  banner: {
    backgroundColor: '#ff4444cc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#ff4444',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    textAlign: 'center',
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  optionText: {
    color: '#f8d06f',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
    textShadowColor: '#f8d06f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

export default SettingsScreen;