import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { fishApi } from '../api/fishApi';

const AddFishScreen = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caught_by: '',
    species: '',
    length_inches: '',
    catch_date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
  });

  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.caught_by.trim()) {
      Alert.alert('Error', 'Please enter who caught the fish');
      return false;
    }
    if (!formData.species.trim()) {
      Alert.alert('Error', 'Please enter the fish species');
      return false;
    }
    if (!formData.length_inches || isNaN(parseFloat(formData.length_inches))) {
      Alert.alert('Error', 'Please enter a valid length in inches');
      return false;
    }
    if (!formData.catch_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Convert length string to number
    const fishData = {
      ...formData,
      length_inches: parseFloat(formData.length_inches),
    };

    try {
      setLoading(true);
      const result = await fishApi.addFish(fishData);
      Alert.alert('Success', 'Fish catch recorded successfully!');
      
      // Clear form
      setFormData({
        caught_by: '',
        species: '',
        length_inches: '',
        catch_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      Alert.alert('Error', `Failed to record catch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Record a New Catch" />
        <Card.Content>
          <TextInput
            label="Caught By"
            value={formData.caught_by}
            onChangeText={(value) => updateFormField('caught_by', value)}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Species"
            value={formData.species}
            onChangeText={(value) => updateFormField('species', value)}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Length (inches)"
            value={formData.length_inches}
            onChangeText={(value) => updateFormField('length_inches', value)}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Catch Date (YYYY-MM-DD)"
            value={formData.catch_date}
            onChangeText={(value) => updateFormField('catch_date', value)}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            mode="outlined"
          />
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Catch'}
          </Button>
          
          {loading && <ActivityIndicator style={styles.loader} />}
        </Card.Content>
      </Card>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0077b6',
    paddingVertical: 6,
  },
  loader: {
    marginTop: 16,
  },
});

export default AddFishScreen;