import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, AddContest, RemoveContest } from '../../services/apiService';

const ACTION_TYPES = ['Add', 'Remove'];
const CONTESTANTS = ['Jack', 'Bob', 'Mark', 'Brent', 'Glen'];

export interface ContestPlace {
  place: number;
  name: string;
}

export default function ContestsScreen() {
  const [actionType, setActionType] = useState('Add');
  const [showActionTypes, setShowActionTypes] = useState(false);
  const [contestName, setContestName] = useState('');
  const [contestDate, setContestDate] = useState(new Date().toISOString().split('T')[0]);
  const [places, setPlaces] = useState<ContestPlace[]>(
    [
      { place: 1, name: '' },
      { place: 2, name: '' },
      { place: 3, name: '' },
      { place: 4, name: '' },
      { place: 5, name: '' }
    ]
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showContestantDropdowns, setShowContestantDropdowns] = useState<{[key: number]: boolean}>({});

  const validateInputs = () => {
    if (actionType === 'Add') {
      if (!contestName.trim()) {
        setErrorMessage('Please enter a contest name');
        return false;
      }
      if (!contestDate.trim() || isNaN(Date.parse(contestDate))) {
        setErrorMessage('Please enter a valid contest date');
        return false;
      }
      if (!places[0].name.trim()) {
        setErrorMessage('Please select a name for the 1st place');
        return false;
      }
      if (!places[1].name.trim()) {
        setErrorMessage('Please select a name for the 2nd place');
        return false;
      }
      if (!places[2].name.trim()) {
        setErrorMessage('Please select a name for the 3rd place');
        return false;
      }
      if (!places[3].name.trim()) {
        setErrorMessage('Please select a name for the 4th place');
        return false;
      }
      if (!places[4].name.trim()) {
        setErrorMessage('Please select a name for the 5th place');
        return false;
      }
    } else {
      if (!contestName.trim()) {
        setErrorMessage('Please enter a contest name to remove');
        return false;
      }
    }
    
    setErrorMessage(null);
    return true;
  };

  const handleAddContest = async () => {
    if (!validateInputs()) return;

    setSubmitting(true);

    try {
      const contestData = {
        contest_name: contestName.trim(),
        contest_date: contestDate,
        place1: places[0].name,
        place2: places[1].name,
        place3: places[2].name,
        place4: places[3].name,
        place5: places[4].name
      };

      await apiService.addContest(contestData);
      
      Alert.alert(
        'Success',
        'Contest added successfully!',
        [
          { 
            text: 'Dismiss', 
            onPress: () => {
              setContestName('');
              setContestDate(new Date().toISOString().split('T')[0]);
              setPlaces([
                { place: 1, name: '' },
                { place: 2, name: '' },
                { place: 3, name: '' },
                { place: 4, name: '' },
                { place: 5, name: '' }
              ]);
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveContest = async () => {
    if (!validateInputs()) return;

    setSubmitting(true);

    try {
      const contestData = {
        contest_name: contestName.trim()
      };

      await apiService.deleteContest(contestData);
      
      Alert.alert(
        'Success',
        'Contest removed successfully!',
        [
          { 
            text: 'Dismiss', 
            onPress: () => {
              setContestName('');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove contest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (actionType === 'Add') {
      handleAddContest();
    } else {
      handleRemoveContest();
    }
  };

  const toggleContestantDropdown = (placeIndex: number) => {
    setShowContestantDropdowns(prev => ({
      ...prev,
      [placeIndex]: !prev[placeIndex]
    }));
  };

  const selectContestant = (placeIndex: number, contestantName: string) => {
    const updatedPlaces = [...places];
    updatedPlaces[placeIndex] = { ...updatedPlaces[placeIndex], name: contestantName };
    setPlaces(updatedPlaces);
    toggleContestantDropdown(placeIndex);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manage Contests</Text>
        <MaterialCommunityIcons name="trophy" size={30} color="#ffd33d" />
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

        {actionType === 'Add' ? (
          <>
            <Text style={styles.label}>Contest Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contest name"
              placeholderTextColor="#aaa"
              value={contestName}
              onChangeText={setContestName}
            />

            <Text style={styles.label}>Contest Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#aaa"
              value={contestDate}
              onChangeText={setContestDate}
            />

            <Text style={styles.label}>Contest Places</Text>
            {places.map((place, index) => (
              <View key={index} style={styles.placeContainer}>
                <Text style={styles.placeNumber}>{place.place}.</Text>
                <View style={styles.placeInputContainer}>
                  <TouchableOpacity 
                    style={styles.placeInput} 
                    onPress={() => toggleContestantDropdown(index)}
                  >
                    <Text style={place.name ? styles.inputText : styles.placeholderText}>
                      {place.name || `Select name for ${place.place}${place.place === 1 ? 'st' : place.place === 2 ? 'nd' : place.place === 3 ? 'rd' : 'th'} place`}
                    </Text>
                    <Ionicons name={showContestantDropdowns[index] ? "chevron-up" : "chevron-down"} size={20} color="#aaa" />
                  </TouchableOpacity>
                  
                  {showContestantDropdowns[index] && (
                    <View style={styles.contestantDropdown}>
                      {CONTESTANTS.map((contestant) => (
                        <TouchableOpacity 
                          key={contestant} 
                          style={styles.dropdownItem} 
                          onPress={() => selectContestant(index, contestant)}
                        >
                          <Text style={styles.dropdownText}>{contestant}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.label}>Contest Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contest name to remove"
              placeholderTextColor="#aaa"
              value={contestName}
              onChangeText={setContestName}
            />
          </>
        )}

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={styles.submitButtonText}>{actionType === 'Add' ? 'Add Contest' : 'Remove Contest'}</Text>
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
    paddingBottom: 100,
    paddingTop: 70,
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
    marginBottom: 20,
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
    maxHeight: 300,
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
  noContestsText: {
    textAlign: 'center',
    padding: 12,
    fontStyle: 'italic',
  },
  placeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeNumber: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 20,
  },
  placeInputContainer: {
    flex: 1,
    position: 'relative',
  },
  placeInput: {
    flex: 1,
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 12,
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contestantDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#444',
    borderRadius: 5,
    marginTop: 2,
    zIndex: 10,
    elevation: 10,
    maxHeight: 300,
  },
  customEntryItem: {
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  customEntryText: {
    color: '#ffd33d',
    fontStyle: 'italic',
  },
  placeName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
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
  contestsListContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  contestsListTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  contestItem: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  contestName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contestDate: {
    color: '#aaa',
    fontSize: 14,
  },
  placesContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#555',
    paddingTop: 8,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});