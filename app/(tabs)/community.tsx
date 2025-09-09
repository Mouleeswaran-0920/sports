import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Challenge, LeaderboardEntry } from '../../types';
import { DataService } from '../../services/dataService';
import { Trophy, Users, Calendar, Medal, Target, Zap } from 'lucide-react-native';

export default function CommunityScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'challenges' | 'leaderboard'>('challenges');

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    const challengeData = await DataService.getChallenges();
    const leaderboardData = await DataService.getLeaderboard();
    setChallenges(challengeData);
    setLeaderboard(leaderboardData);
  };

  const joinChallenge = (challengeId: string) => {
    console.log('Joining challenge:', challengeId);
    // In production, this would update the challenge participation
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Target size={24} color="#EF4444" />;
      case 'speed':
        return <Zap size={24} color="#F59E0B" />;
      case 'flexibility':
        return <Medal size={24} color="#10B981" />;
      default:
        return <Trophy size={24} color="#3B82F6" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#F59E0B'; // Gold
      case 2:
        return '#94A3B8'; // Silver
      case 3:
        return '#CD7C2F'; // Bronze
      default:
        return '#64748B';
    }
  };

  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          {getChallengeIcon(item.type)}
          <View style={styles.challengeText}>
            <Text style={styles.challengeTitle}>{item.name}</Text>
            <Text style={styles.challengeDescription}>{item.description}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <Users size={16} color="#64748B" />
          <Text style={styles.statText}>{item.participants} joined</Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.statText}>Ends {new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => joinChallenge(item.id)}
      >
        <Text style={styles.joinButtonText}>Join Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, { color: getRankColor(item.rank) }]}>
          {item.rank}
        </Text>
        {item.rank <= 3 && (
          <Medal size={20} color={getRankColor(item.rank)} />
        )}
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerScore}>{item.score}% average</Text>
      </View>
      
      {item.rank <= 3 && (
        <View style={styles.trophyContainer}>
          <Trophy size={24} color={getRankColor(item.rank)} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'challenges' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('challenges')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'challenges' && styles.activeTabText
            ]}>
              Challenges
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'leaderboard' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('leaderboard')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'leaderboard' && styles.activeTabText
            ]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'challenges' ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <Text style={styles.sectionSubtitle}>
            Join challenges to compete with athletes across India
          </Text>
          
          <FlatList
            data={challenges}
            renderItem={renderChallengeItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.challengesList}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>National Leaderboard</Text>
            <Text style={styles.sectionSubtitle}>
              Top performing athletes this month
            </Text>
          </View>
          
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.leaderboardList}
          />
          
          <View style={styles.motivationalCard}>
            <Trophy size={32} color="#3B82F6" />
            <Text style={styles.motivationalTitle}>Keep Training!</Text>
            <Text style={styles.motivationalText}>
              Complete more tests to climb the rankings and earn recognition from sports authorities.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  challengesList: {
    paddingBottom: 100,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  challengeText: {
    marginLeft: 12,
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardHeader: {
    marginBottom: 24,
  },
  leaderboardList: {
    paddingBottom: 20,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'center',
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  playerScore: {
    fontSize: 14,
    color: '#64748B',
  },
  trophyContainer: {
    marginLeft: 16,
  },
  motivationalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  motivationalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});