import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, FishEntry } from '../../services/apiService';

export default function ContestScreen() {
  const [fishData, setFishData] = useState<FishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organize fish by species for the contest
  const fishBySpecies = fishData.reduce((acc, fish) => {
    if (!acc[fish.species]) {
      acc[fish.species] = [];
    }
    acc[fish.species].push(fish);
    return acc;
  }, {} as Record<string, FishEntry[]>);

  // For each species, get the top 3 fish by length
  const contestResults = Object.entries(fishBySpecies).map(([species, fish]) => {
    const sortedFish = [...fish].sort((a, b) => b.length_inches - a.length_inches);
    return {
      species,
      topCatches: sortedFish.slice(0, 3) // Top 3 catches for each species
    };
  });

  // Get overall top 10 catches regardless of species
  const topOverallCatches = [...fishData]
    .sort((a, b) => b.length_inches - a.length_inches)
    .slice(0, 10);

  const loadFishData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllFish();
      setFishData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load competition data');
      Alert.alert('Error', err.message || 'Failed to load competition data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFishData();
  };

  useEffect(() => {
    loadFishData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderMedal = (position: number) => {
    if (position === 0) return <MaterialCommunityIcons name="medal" size={24} color="#FFD700" />;
    if (position === 1) return <MaterialCommunityIcons name="medal" size={24} color="#C0C0C0" />;
    if (position === 2) return <MaterialCommunityIcons name="medal" size={24} color="#CD7F32" />;
    return null;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Loading competition data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy" size={30} color="#ffd33d" />
        <Text style={styles.headerText}>Fishing Competition</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#ffd33d" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : topOverallCatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="fish-off" size={64} color="#aaa" />
          <Text style={styles.emptyText}>No fish catches recorded yet</Text>
          <Text style={styles.emptySubText}>Add fish catches to see them in the competition</Text>
        </View>
      ) : (
        <FlatList
          data={[{ id: 'overall' }]}
          keyExtractor={(item) => item.id}
          renderItem={() => (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Top 10 Catches Overall</Text>
                {topOverallCatches.map((fish, index) => (
                  <View key={`overall-${index}`} style={styles.fishCard}>
                    <View style={styles.rankContainer}>
                      {index < 3 ? (
                        renderMedal(index)
                      ) : (
                        <Text style={styles.rankText}>{index + 1}</Text>
                      )}
                    </View>
                    <View style={styles.fishInfo}>
                      <Text style={styles.fishSpecies}>{fish.species}</Text>
                      <Text style={styles.fishLength}>
                        <Text style={styles.label}>Length: </Text>
                        {fish.length_inches} inches
                      </Text>
                      <Text style={styles.fishDetails}>
                        <Text style={styles.label}>Caught by: </Text>
                        {fish.caught_by} • {formatDate(fish.catch_date)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {contestResults.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Best By Species</Text>
                  {contestResults.map((result) => (
                    <View key={result.species} style={styles.speciesContainer}>
                      <Text style={styles.speciesTitle}>{result.species}</Text>
                      {result.topCatches.map((fish, index) => (
                        <View key={`${result.species}-${index}`} style={styles.speciesFishCard}>
                          <View style={styles.miniRankContainer}>
                            {renderMedal(index)}
                          </View>
                          <View style={styles.speciesFishInfo}>
                            <Text style={styles.fishLength}>
                              <Text style={styles.label}>Length: </Text>
                              {fish.length_inches} inches
                            </Text>
                            <Text style={styles.fishDetails}>
                              <Text style={styles.label}>Caught by: </Text>
                              {fish.caught_by} • {formatDate(fish.catch_date)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#ffd33d"]}
              tintColor="#ffd33d" 
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingTop: 8,
    gap: 12,
  },
  headerText: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ffd33d',
    paddingBottom: 8,
  },
  fishCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fishInfo: {
    flex: 1,
  },
  fishSpecies: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fishLength: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
  },
  fishDetails: {
    color: '#aaa',
    fontSize: 14,
  },
  speciesContainer: {
    marginBottom: 16,
  },
  speciesTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 5,
  },
  speciesFishCard: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#ffd33d',
  },
  miniRankContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  speciesFishInfo: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
  label: {
    color: '#aaa',
    fontWeight: '500',
  },
});