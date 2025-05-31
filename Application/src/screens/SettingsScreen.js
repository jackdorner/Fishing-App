import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key constants
const API_KEY_STORAGE_KEY = '@fishing_app_api_key';
const API_URL_STORAGE_KEY = '@fishing_app_api_url';

const SettingsScreen = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load saved settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
        const savedApiUrl = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        
        if (savedApiUrl) {
          setApiUrl(savedApiUrl);
        } else {
          // Default API URL if none is stored
          setApiUrl('https://your-api-gateway-url.amazonaws.com/prod');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      await AsyncStorage.setItem(API_URL_STORAGE_KEY, apiUrl);
      
      setSnackbarMessage('Settings saved successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="API Settings" />
        <Card.Content>
          <Text style={styles.description}>
            Enter your API key and URL to connect to the fishing tournament backend.
          </Text>
          
          <TextInput
            label="API URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            style={styles.input}
            mode="outlined"
            placeholder="https://your-api-gateway-url.amazonaws.com/prod"
          />
          
          <TextInput
            label="API Key"
            value={apiKey}
            onChangeText={setApiKey}
            style={styles.input}
            mode="outlined"
            secureTextEntry={true}
            placeholder="Enter your API key"
          />
          
          <Button
            mode="contained"
            onPress={saveSettings}
            style={styles.button}
          >
            Save Settings
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  description: {
    marginBottom: 20,
    fontSize: 14,
    color: '#555',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0077b6',
    paddingVertical: 6,
  },
});

export default SettingsScreen;