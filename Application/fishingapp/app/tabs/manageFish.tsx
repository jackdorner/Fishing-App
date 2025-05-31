import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

// Common fish species for dropdown
const FISH_SPECIES = [
  'Bass', 'Trout', 'Perch', 'Pike', 'Walleye',
  'Catfish', 'Sunfish', 'Crappie', 'Bluegill', 'Other'
];

// Available action types
const ACTION_TYPES = ['Add', 'Remove'];

export default function ManageFishScreen() {
  const [actionType, setActionType] = useState('Add');
  const [showActionTypes, setShowActionTypes] = useState(false);
  const [species, setSpecies] = useState('');
  const [caughtBy, setCaughtBy] = useState('');
  const [length, setLength] = useState('');
  const [catchDate, setCatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSpeciesList, setShowSpeciesList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateInputs = () => {
    if (!species.trim()) {
      setErrorMessage('Please select or enter fish species');
      return false;
    }
    if (!caughtBy.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }
    if (!length.trim() || isNaN(parseFloat(length)) || parseFloat(length) <= 0) {
      setErrorMessage('Please enter a valid length in inches');
      return false;
    }
    if (!catchDate.trim() || isNaN(Date.parse(catchDate))) {
      setErrorMessage('Please enter a valid catch date');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleRemoveFish = async () => {
    if (!validateInputs()) return;

    setSubmitting(true);

    try {
      const fishData = {
        species: species.trim(),
        caught_by: caughtBy.trim(),
        length_inches: parseFloat(length),
        catch_date: catchDate
      };

      await apiService.deleteFish(fishData);
      
      Alert.alert(
        'Success',
        'Fish catch removed successfully!',
        [
          { 
            text: 'Dismiss', 
            onPress: () => router.push('./manageFish')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove fish catch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (actionType === 'Add') {
      handleAddFish();
    } else {
      handleRemoveFish();
    }
  };

  const handleAddFish = async () => {
    if (!validateInputs()) return;

    setSubmitting(true);

    try {
      const fishData = {
        species: species.trim(),
        caught_by: caughtBy.trim(),
        length_inches: parseFloat(length),
        catch_date: catchDate
      };

      await apiService.addFish(fishData);
      
      Alert.alert(
        'Success',
        'Fish catch recorded successfully!',
        [
          { 
            text: 'Dismiss', 
            onPress: () => router.push('./manageFish')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add fish catch');
    } finally {
      setSubmitting(false);
    }
  };

  const selectSpecies = (selected: string) => {
    setSpecies(selected);
    setShowSpeciesList(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manage Fish Catch</Text>
        <MaterialCommunityIcons name="fish" size={30} color="#ffd33d" />
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Action</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowActionTypes(!showActionTypes)}
        >
          <Text style={actionType ? styles.inputText : styles.placeholderText}>
            {actionType}
          </Text>
          <Ionicons name={showActionTypes ? "chevron-up" : "chevron-down"} size={20} color="#aaa" />
        </TouchableOpacity>

        {showActionTypes && (
          <View style={styles.dropdown}>
            {ACTION_TYPES.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.dropdownItem} 
                onPress={() => {
                  setActionType(item);
                  setShowActionTypes(false);
                }}
              >
                <Text style={styles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Fish Species</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowSpeciesList(!showSpeciesList)}
        >
          <Text style={species ? styles.inputText : styles.placeholderText}>
            {species || 'Select or enter species'}
          </Text>
          <Ionicons name={showSpeciesList ? "chevron-up" : "chevron-down"} size={20} color="#aaa" />
        </TouchableOpacity>

        {showSpeciesList && (
          <View style={styles.dropdown}>
            {FISH_SPECIES.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.dropdownItem} 
                onPress={() => selectSpecies(item)}
              >
                <Text style={styles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.customSpeciesContainer}>
              <TextInput
                style={styles.customSpeciesInput}
                placeholder="Or enter custom species"
                placeholderTextColor="#aaa"
                value={species}
                onChangeText={setSpecies}
                onSubmitEditing={() => setShowSpeciesList(false)}
              />
            </View>
          </View>
        )}

        <Text style={styles.label}>Caught By</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#aaa"
          value={caughtBy}
          onChangeText={setCaughtBy}
        />

        <Text style={styles.label}>Length (inches)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter length in inches"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={length}
          onChangeText={setLength}
        />

        <Text style={styles.label}>Catch Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#aaa"
          value={catchDate}
          onChangeText={setCatchDate}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    color: '#fff',
  },
  placeholderText: {
    color: '#aaa',
  },
  dropdown: {
    backgroundColor: '#444',
    borderRadius: 5,
    marginTop: -16,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  customSpeciesContainer: {
    padding: 8,
  },
  customSpeciesInput: {
    backgroundColor: '#555',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
});