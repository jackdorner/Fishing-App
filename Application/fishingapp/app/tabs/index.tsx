import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService, FishEntry, Contest } from '../../services/apiService';

// Define interfaces for contest categories and scoring
interface ContestCategory {
  name: string;
  icon: string;
  calculateWinner: (fish: FishEntry[]) => Record<string, number>;
}

interface ParticipantScore {
  name: string;
  totalPoints: number;
  categoryPoints: Record<string, number>;
  categoryRanks: Record<string, number>;
}

export default function Index() {
  const [fish, setFish] = useState<FishEntry[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [scores, setScores] = useState<ParticipantScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define contest categories and how to determine winners
  const contestCategories: ContestCategory[] = [
    {
      name: 'Largest Walleye',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Walleye');
      }
    },
    {
      name: 'Largest Pike',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Pike');
      }
    },
    {
      name: 'Largest Bass',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Bass');
      }
    },
    {
      name: 'Largest Perch',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Perch');
      }
    },
    {
      name: 'Largest Crappie',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Crappie');
      }
    },
    {
      name: 'Most Fish',
      icon: 'fish',
      calculateWinner: (fish) => {
        return countFishByPerson(fish);
      }
    },
    {
      name: 'Most Fish in 1 Day',
      icon: 'calendar',
      calculateWinner: (fish) => {
        return mostFishInOneDay(fish);
      }
    },
    {
      name: 'Most Walleye',
      icon: 'fish',
      calculateWinner: (fish) => {
        return countSpeciesByPerson(fish, 'Walleye');
      }
    },
    {
      name: 'Largest Musky',
      icon: 'fish',
      calculateWinner: (fish) => {
        return findLargestBySpecies(fish, 'Musky');
      }
    },
    {
      name: 'Most Walleye >= 20"',
      icon: 'ruler',
      calculateWinner: (fish) => {
        return countQualifyingWalleye(fish);
      }
    },
  ];

  // Helper functions for contest calculations
  const findLargestBySpecies = (fish: FishEntry[], species: string): Record<string, number> => {
    const filtered = fish.filter(f => f.species.toLowerCase() === species.toLowerCase());
    const result: Record<string, number> = {};
    
    filtered.forEach(f => {
      if (!result[f.caught_by] || f.length_inches > result[f.caught_by]) {
        result[f.caught_by] = f.length_inches;
      }
    });
    
    return result;
  };

  const countFishByPerson = (fish: FishEntry[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    fish.forEach(f => {
      counts[f.caught_by] = (counts[f.caught_by] || 0) + 1;
    });
    
    return counts;
  };

  const mostFishInOneDay = (fish: FishEntry[]): Record<string, number> => {
    // Define the correct type for fishByDay
    const fishByDay: Record<string, { count: number, person: string }> = {};
    
    fish.forEach(f => {
      const date = f.catch_date.split('T')[0];
      const key = `${f.caught_by}-${date}`;
      
      if (!fishByDay[key]) {
        fishByDay[key] = { count: 0, person: f.caught_by };
      }
      
      fishByDay[key].count++;
    });
    
    const result: Record<string, number> = {};
    
    Object.values(fishByDay).forEach(entry => {
      if (!result[entry.person] || entry.count > result[entry.person]) {
        result[entry.person] = entry.count;
      }
    });
    
    return result;
  };

  const countSpeciesByPerson = (fish: FishEntry[], species: string): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    fish.filter(f => f.species.toLowerCase() === species.toLowerCase())
      .forEach(f => {
        counts[f.caught_by] = (counts[f.caught_by] || 0) + 1;
      });
    
    return counts;
  };

  const countQualifyingWalleye = (fish: FishEntry[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    fish.filter(f => 
      f.species.toLowerCase() === 'walleye' && 
      f.length_inches >= 20
    ).forEach(f => {
      counts[f.caught_by] = (counts[f.caught_by] || 0) + 1;
    });
    
    return counts;
  };

  // Calculate points and rankings
  const calculateScores = (fish: FishEntry[]) => {
    // Get all unique participants
    const participants = [...new Set(fish.map(f => f.caught_by))];
    
    // Initialize scores
    const participantScores: ParticipantScore[] = participants.map(name => ({
      name,
      totalPoints: 0,
      categoryPoints: {},
      categoryRanks: {}
    }));
    
    // Calculate rankings for each category
    contestCategories.forEach(category => {
      const results = category.calculateWinner(fish);
      
      // Sort participants by their category result (higher is better)
      const ranked = Object.entries(results)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));
      
      // Assign points (1st = 1 point, 2nd = 2 points, etc.)
      let currentRank = 1;
      let prevValue = Infinity;
      let pointsForRank = 1;
      
      ranked.forEach((entry, i) => {
        // If there's a tie, they share the same rank and points
        if (i > 0 && entry.value !== prevValue) {
          currentRank = i + 1;
          pointsForRank = currentRank;
        }
        
        const participant = participantScores.find(p => p.name === entry.name);
        if (participant) {
          participant.categoryPoints[category.name] = entry.value;
          participant.categoryRanks[category.name] = pointsForRank;
          participant.totalPoints += pointsForRank;
        }
        
        prevValue = entry.value;
      });
    });
    
    // Sort by total points (lower is better)
    return participantScores.sort((a, b) => a.totalPoints - b.totalPoints);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both fish and contests data
      const [fishData, contestsData] = await Promise.all([
        apiService.getAllFish(),
        apiService.getAllContests()
      ]);
      
      setFish(fishData);
      setContests(contestsData);
      
      // Calculate scores
      const calculatedScores = calculateScores(fishData);
      setScores(calculatedScores);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      Alert.alert('Error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.text}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Fishing Tournament</Text>
        <Link href="/tabs/settings" asChild>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#ffd33d" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ffd33d"]}
              tintColor="#ffd33d"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Overall Leaders */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Tournament Leaders</Text>
            {scores.length > 0 ? (
              scores.map((participant, index) => (
                <View key={participant.name} style={styles.participantRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantPoints}>{participant.totalPoints} pts</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No participants yet</Text>
            )}
          </View>
          
          {/* Category Winners */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Category Leaders</Text>
            {contestCategories.map((category) => {
              // Find top performer in this category
              const topPerformers = scores
                .filter(p => p.categoryRanks[category.name] === 1)
                .sort((a, b) => {
                  const valueA = a.categoryPoints[category.name] || 0;
                  const valueB = b.categoryPoints[category.name] || 0;
                  return valueB - valueA;
                });
                
              return (
                <View key={category.name} style={styles.simplifiedCategoryItem}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  
                  {topPerformers.length > 0 ? (
                    <View>
                      {topPerformers.map((performer, i) => (
                        <Text key={i} style={styles.categoryParticipant}>
                          {performer.name}: {performer.categoryPoints[category.name]} 
                          {category.name.includes("Most") ? " fish" : "\""}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noParticipantText}>No entries yet</Text>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Recent Catches */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Recent Catches</Text>
            {fish.length > 0 ? (
              fish.slice(0, 5).map((item, index) => (
                <View key={`${item.id || ''}-${index}`} style={styles.fishCard}>
                  <View style={styles.fishHeader}>
                    <Ionicons name="fish" size={24} color="#ffd33d" />
                    <Text style={styles.fishSpecies}>{item.species}</Text>
                  </View>
                  <View style={styles.fishDetails}>
                    <Text style={styles.fishInfo}>
                      <Text style={styles.label}>Length: </Text>
                      {item.length_inches} inches
                    </Text>
                    <Text style={styles.fishInfo}>
                      <Text style={styles.label}>Caught by: </Text>
                      {item.caught_by}
                    </Text>
                    <Text style={styles.fishInfo}>
                      <Text style={styles.label}>Date: </Text>
                      {formatDate(item.catch_date)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="fish-outline" size={48} color="#aaa" />
                <Text style={styles.emptyText}>No fish caught yet</Text>
                <Link href="/tabs/manageFish" asChild>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Your First Catch</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
            
            <Link href="./contests" asChild>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Contests</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  headerText: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: '#ffd33d',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#25292e',
    fontWeight: 'bold',
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  participantPoints: {
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  simplifiedCategoryItem: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryParticipant: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  noParticipantText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  fishCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  fishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fishSpecies: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fishDetails: {
    marginLeft: 32,
  },
  fishInfo: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewAllButton: {
    backgroundColor: '#444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: '#fff',
    marginTop: 12,
  },
});
