import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { PerformanceData, SportSuitability } from '../../types';
import { DataService } from '../../services/dataService';
import { TrendingUp, Target, Shield, Share2 } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function PerformanceScreen() {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'posture' | 'technique'>('score');

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    const data = await DataService.getPerformanceData();
    setPerformances(data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  };

  const generateQRCode = () => {
    // In production, this would generate an actual QR code with performance data
    console.log('Generating QR code for performance report...');
  };

  const getChartData = () => {
    const labels = performances.map((_, index) => `Test ${index + 1}`);
    let data: number[];
    
    switch (selectedMetric) {
      case 'posture':
        data = performances.map(p => p.posture);
        break;
      case 'technique':
        data = performances.map(p => p.technique);
        break;
      default:
        data = performances.map(p => p.score);
    }

    return {
      labels,
      datasets: [{
        data: data.length > 0 ? data : [0],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const getLatestSuitability = (): SportSuitability[] => {
    if (performances.length === 0) return [];
    return performances[performances.length - 1].suitability;
  };

  const getPieChartData = () => {
    const suitability = getLatestSuitability();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return suitability.map((item, index) => ({
      name: item.sport,
      population: item.score,
      color: colors[index % colors.length],
      legendFontColor: '#64748B',
      legendFontSize: 12,
    }));
  };

  const getAverageScore = () => {
    if (performances.length === 0) return 0;
    return Math.round(performances.reduce((sum, p) => sum + p.score, 0) / performances.length);
  };

  const getGrowthTrend = () => {
    if (performances.length < 2) return 0;
    const recent = performances.slice(-3).map(p => p.score);
    const older = performances.slice(-6, -3).map(p => p.score);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  };

  const chartConfig = {
    backgroundColor: '#1E293B',
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#334155',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6'
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <TouchableOpacity style={styles.shareButton} onPress={generateQRCode}>
          <Share2 size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={32} color="#3B82F6" />
          <Text style={styles.statValue}>{getAverageScore()}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        
        <View style={styles.statCard}>
          <Target size={32} color="#10B981" />
          <Text style={styles.statValue}>+{getGrowthTrend()}%</Text>
          <Text style={styles.statLabel}>Growth Trend</Text>
        </View>
        
        <View style={styles.statCard}>
          <Shield size={32} color="#F59E0B" />
          <Text style={styles.statValue}>
            {performances.length > 0 ? performances[performances.length - 1].injuryRisk : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Injury Risk</Text>
        </View>
      </View>

      {performances.length > 0 && (
        <>
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Performance Trends</Text>
            
            <View style={styles.metricSelector}>
              {(['score', 'posture', 'technique'] as const).map((metric) => (
                <TouchableOpacity
                  key={metric}
                  style={[
                    styles.metricButton,
                    selectedMetric === metric && styles.metricButtonActive
                  ]}
                  onPress={() => setSelectedMetric(metric)}
                >
                  <Text style={[
                    styles.metricButtonText,
                    selectedMetric === metric && styles.metricButtonTextActive
                  ]}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <LineChart
              data={getChartData()}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          {getLatestSuitability().length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Sports Suitability</Text>
              <PieChart
                data={getPieChartData()}
                width={screenWidth - 48}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </View>
          )}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Latest Performance Details</Text>
            {performances.slice(-3).reverse().map((performance, index) => (
              <View key={performance.id} style={styles.performanceDetailCard}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceTitle}>{performance.testType}</Text>
                  <Text style={styles.performanceDate}>
                    {new Date(performance.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{performance.score}%</Text>
                    <Text style={styles.metricLabel}>Overall</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{performance.posture}%</Text>
                    <Text style={styles.metricLabel}>Posture</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{performance.technique}%</Text>
                    <Text style={styles.metricLabel}>Technique</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={[
                      styles.metricValue,
                      { color: performance.injuryRisk === 'Low' ? '#10B981' : 
                               performance.injuryRisk === 'Medium' ? '#F59E0B' : '#EF4444' }
                    ]}>
                      {performance.injuryRisk}
                    </Text>
                    <Text style={styles.metricLabel}>Risk</Text>
                  </View>
                </View>

                {performance.suitability.length > 0 && (
                  <View style={styles.suitabilitySection}>
                    <Text style={styles.suitabilityTitle}>Top Sport Recommendations:</Text>
                    {performance.suitability.slice(0, 2).map((sport, sportIndex) => (
                      <Text key={sportIndex} style={styles.suitabilityItem}>
                        {sport.sport}: {sport.score.toFixed(0)}% - {sport.recommendation}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {performances.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Performance Data Yet</Text>
          <Text style={styles.emptyDescription}>
            Complete your first fitness test to see detailed analytics and insights.
          </Text>
        </View>
      )}
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  chartSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  metricSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: '#3B82F6',
  },
  metricButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  metricButtonTextActive: {
    color: 'white',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailsSection: {
    padding: 24,
  },
  performanceDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  performanceDate: {
    fontSize: 14,
    color: '#64748B',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  suitabilitySection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  suitabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  suitabilityItem: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});