import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_LINK_KEY = 'api_link';
const API_KEY_KEY = 'api_key';

export default function SettingsScreen() {
  const [apiLink, setApiLink] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load saved values when component mounts
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedApiLink = await AsyncStorage.getItem(API_LINK_KEY);
      const savedApiKey = await AsyncStorage.getItem(API_KEY_KEY);
      
      if (savedApiLink) setApiLink(savedApiLink);
      if (savedApiKey) setApiKey(savedApiKey);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(API_LINK_KEY, apiLink);
      await AsyncStorage.setItem(API_KEY_KEY, apiKey);
      setSaveStatus('Settings saved successfully!');
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>API Configuration</Text>
        
        <Text style={styles.label}>API Link</Text>
        <TextInput
          style={styles.input}
          value={apiLink}
          onChangeText={setApiLink}
          placeholder="Enter API endpoint URL"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>API Key</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter API key"
            placeholderTextColor="#aaa"
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowApiKey(!showApiKey)}
          >
            <Ionicons 
              name={showApiKey ? 'eye-off' : 'eye'} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        {saveStatus ? (
          <Text style={styles.saveStatus}>{saveStatus}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    color: '#ffd33d',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  passwordInput: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: 5,
    padding: 12,
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  saveButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveStatus: {
    color: '#4cd964',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  text: {
    color: '#fff',
  },
});