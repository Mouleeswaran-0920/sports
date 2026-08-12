import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { User, PerformanceData } from '../../types';
import { DataService } from '../../services/dataService';
import AuthScreen from '../../components/AuthScreen';
import { Play, TrendingUp, Shield, QrCode } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentPerformances, setRecentPerformances] = useState<PerformanceData[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const loadUserData = async () => {
    try {
      const userData = await DataService.getUser();
      setUser(userData);
      
      if (userData) {
        const performances = await DataService.getPerformanceData();
        const userPerformances = performances
          .filter(p => p.userId === userData.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setRecentPerformances(userPerformances);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    triggerHaptic();
    Alert.alert(
      'Sync Data',
      'This will upload your performance data to Sports Authority of India. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync', 
          onPress: async () => {
            await DataService.syncData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            Alert.alert('Success', 'Data synced successfully!');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  const headerPaddingTop = Math.max(insets.top + 16, 50);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user.name}</Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Text style={styles.syncText}>🔄 Sync with SAI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              triggerHaptic();
              router.push('/test');
            }}
          >
            <Play size={32} color="#3B82F6" />
            <Text style={styles.actionTitle}>Start Test</Text>
            <Text style={styles.actionSubtitle}>Begin fitness assessment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              triggerHaptic();
              router.push('/performance');
            }}
          >
            <TrendingUp size={32} color="#10B981" />
            <Text style={styles.actionTitle}>View Progress</Text>
            <Text style={styles.actionSubtitle}>Track improvements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              triggerHaptic();
              router.push('/performance');
            }}
          >
            <Shield size={32} color="#F59E0B" />
            <Text style={styles.actionTitle}>Injury Check</Text>
            <Text style={styles.actionSubtitle}>Risk assessment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              triggerHaptic();
              router.push('/profile');
            }}
          >
            <QrCode size={32} color="#8B5CF6" />
            <Text style={styles.actionTitle}>Share Report</Text>
            <Text style={styles.actionSubtitle}>Generate QR code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {recentPerformances.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Performance</Text>
          {recentPerformances.map((performance) => (
            <TouchableOpacity 
              key={performance.id} 
              style={styles.performanceCard}
              onPress={() => {
                triggerHaptic();
                router.push('/performance');
              }}
            >
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>{performance.testType}</Text>
                <Text style={styles.performanceScore}>{performance.score}%</Text>
              </View>
              <View style={styles.performanceDetails}>
                <Text style={styles.performanceDetail}>
                  Posture: {performance.posture}% | Technique: {performance.technique}%
                </Text>
                <Text style={styles.performanceDate}>
                  {new Date(performance.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.aiInsights}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Personalized Recommendation</Text>
          <Text style={styles.insightText}>
            Based on your profile and recent performance, focus on flexibility training 
            to reduce injury risk and improve overall performance by 12-15%.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  syncText: {
    color: 'white',
    fontWeight: '600',
  },
  quickActions: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  performanceScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  performanceDetails: {
    gap: 4,
  },
  performanceDetail: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  aiInsights: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});