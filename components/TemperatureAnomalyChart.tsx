import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TemperatureAnomaly } from '../types/weather';

interface TemperatureAnomalyChartProps {
  anomalies: TemperatureAnomaly[];
  width?: number;
  height?: number;
}

export function TemperatureAnomalyChart({ 
  anomalies, 
  width = Dimensions.get('window').width - 32, 
  height = 220 
}: TemperatureAnomalyChartProps) {

  if (anomalies.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header dengan aksen biru */}
        <LinearGradient
          colors={['#4A90E2', '#2563EB']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.header}>
            <Text style={styles.headerIcon}>📊</Text>
            <Text style={styles.title}>Grafik Anomali Suhu (7 Hari Terakhir)</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>📈</Text>
          <Text style={styles.noDataText}>Memuat data anomali suhu...</Text>
          <Text style={styles.noDataSubtext}>Grafik akan menampilkan perbandingan suhu aktual dengan suhu normal</Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: anomalies.map(a => {
      const date = new Date(a.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: anomalies.map(a => a.temperature),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: anomalies.map(a => a.normalTemp),
        color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        strokeWidth: 2,
      }
    ],
    legend: ["Suhu Aktual", "Suhu Normal"]
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#FFFFFF"
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#E5E7EB"
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '500'
    }
  };

  const detectedAnomalies = anomalies.filter(a => a.type !== 'normal');

  return (
    <View style={styles.container}>
      {/* Header dengan aksen biru */}
      <LinearGradient
        colors={['#4A90E2', '#2563EB']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={styles.title}>Grafik Anomali Suhu (7 Hari Terakhir)</Text>
        </View>
      </LinearGradient>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={true}
          withShadow={false}
          withHorizontalLines={true}
          withVerticalLines={false}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Suhu Aktual</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.legendText}>Suhu Normal</Text>
        </View>
      </View>

      {detectedAnomalies.length > 0 && (
        <View style={styles.anomalySection}>
          <View style={styles.anomalyHeader}>
            <Text style={styles.anomalyIcon}>⚠️</Text>
            <Text style={styles.anomalyTitle}>Anomali Terdeteksi</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.anomalyCards}>
              {detectedAnomalies.map((anomaly, index) => (
                <View key={index} style={[styles.anomalyCard, { backgroundColor: '#FFFFFF' }]}>
                  <View style={styles.anomalyCardHeader}>
                    <Text style={styles.anomalyDate}>
                      {new Date(anomaly.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </Text>
                    <View style={[styles.severityBadge, { 
                      backgroundColor: anomaly.severity === 'high' ? '#EF4444' : 
                                    anomaly.severity === 'medium' ? '#F59E0B' : '#10B981'
                    }]}>
                      <Text style={styles.severityText}>
                        {anomaly.severity === 'high' ? 'TINGGI' : 
                         anomaly.severity === 'medium' ? 'SEDANG' : 'RENDAH'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.anomalyContent}>
                    <Text style={styles.anomalyTypeIcon}>
                      {anomaly.type === 'cold_wave' ? '❄️' : '🔥'}
                    </Text>
                    <Text style={styles.anomalyType}>
                      {anomaly.type === 'cold_wave' ? 'Gelombang Dingin' : 'Gelombang Panas'}
                    </Text>
                    <Text style={[styles.anomalyTemp, { 
                      color: anomaly.type === 'cold_wave' ? '#3B82F6' : '#EF4444' 
                    }]}>
                      {anomaly.type === 'cold_wave' ? '' : '+'}{Math.abs(anomaly.anomaly).toFixed(1)}°C
                    </Text>
                    <Text style={styles.anomalyDesc}>dari normal</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  anomalySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  anomalyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  anomalyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  anomalyCards: {
    flexDirection: 'row',
    gap: 12,
  },
  anomalyCard: {
    width: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  anomalyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  anomalyDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  anomalyContent: {
    alignItems: 'center',
  },
  anomalyTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  anomalyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  anomalyTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  anomalyDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
