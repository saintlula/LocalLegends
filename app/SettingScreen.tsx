import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { getAuth, deleteUser, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

const SettingsScreen = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'email' | 'password' | 'reauth-email' | 'reauth-password' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const auth = getAuth();
  const navigation = useNavigation();

  const openModal = (step: typeof modalStep) => {
    setModalStep(step);
    setInputValue('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalStep(null);
    setInputValue('');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Are you sure?',
      'Your account will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              try {
                await deleteUser(user);
                await signOut(auth);
                Alert.alert('Sorry to see you go!', 'Your account has now been deleted.');
                router.replace('/');
              } catch (error) {
                console.error('Error deleting user:', error);
                Alert.alert('Error', 'Unable to delete account. Please reauthenticate.');
              }
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
      Alert.alert('Permission Denied', 'You will not receive notifications from this app.');
    }
  };

  const handleModalSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    try {
      if (modalStep === 'email') {
        setTempEmail(inputValue);
        closeModal();
        openModal('reauth-email');
      } else if (modalStep === 'reauth-email') {
        const credential = EmailAuthProvider.credential(user.email, inputValue);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, tempEmail);
        Alert.alert('Success', 'Your email has been updated.');
        closeModal();
      } else if (modalStep === 'password') {
        setTempPassword(inputValue);
        closeModal();
        openModal('reauth-password');
      } else if (modalStep === 'reauth-password') {
        const credential = EmailAuthProvider.credential(user.email, inputValue);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, tempPassword);
        Alert.alert('Success', 'Your password has been updated.');
        closeModal();
      }
    } catch (error) {
      console.error('Credential error:', error);
      Alert.alert('Error', 'Update failed. Please try again.');
      closeModal();
    }
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

        <TouchableOpacity style={styles.optionRow} onPress={() => openModal('email')}>
          <MaterialIcons name="email" size={20} color="#f8d06f" style={styles.icon} />
          <Text style={styles.optionText}>Change Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={() => openModal('password')}>
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

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modalStep === 'email' && 'Enter New Email'}
              {modalStep === 'reauth-email' && 'Enter Current Password'}
              {modalStep === 'password' && 'Enter New Password'}
              {modalStep === 'reauth-password' && 'Enter Current Password'}
            </Text>
            <TextInput
              secureTextEntry={modalStep?.includes('password')}
              style={styles.modalInput}
              placeholder="Enter here"
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleModalSubmit}>
                <Text style={styles.modalButton}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000aa',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#f8d06f',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans-Regular',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontFamily: 'PixelifySans-Regular',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    color: '#f8d06f',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans-Regular',
  },
});

export default SettingsScreen;