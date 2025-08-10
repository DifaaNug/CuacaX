import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TemperatureAnomaly } from '../types/weather';
import { ThemedText } from './ThemedText';

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
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📊</Text>
          <ThemedText style={styles.title}>Grafik Anomali Suhu (7 Hari Terakhir)</ThemedText>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>📈</Text>
          <ThemedText style={styles.noDataText}>Tidak ada data anomali suhu</ThemedText>
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
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📊</Text>
        <ThemedText style={styles.title}>Grafik Anomali Suhu (7 Hari Terakhir)</ThemedText>
      </View>

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
          <ThemedText style={styles.legendText}>Suhu Aktual</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
          <ThemedText style={styles.legendText}>Suhu Normal</ThemedText>
        </View>
      </View>

      {detectedAnomalies.length > 0 && (
        <View style={styles.anomalySection}>
          <View style={styles.anomalyHeader}>
            <Text style={styles.anomalyIcon}>⚠️</Text>
            <ThemedText style={styles.anomalyTitle}>Anomali Terdeteksi</ThemedText>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.anomalyCards}>
              {detectedAnomalies.map((anomaly, index) => (
                <View key={index} style={[styles.anomalyCard, { backgroundColor: '#FFFFFF' }]}>
                  <View style={styles.anomalyCardHeader}>
                    <ThemedText style={styles.anomalyDate}>
                      {new Date(anomaly.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </ThemedText>
                    <View style={[styles.severityBadge, { 
                      backgroundColor: anomaly.severity === 'high' ? '#EF4444' : 
                                    anomaly.severity === 'medium' ? '#F59E0B' : '#10B981'
                    }]}>
                      <ThemedText style={styles.severityText}>
                        {anomaly.severity === 'high' ? 'TINGGI' : 
                         anomaly.severity === 'medium' ? 'SEDANG' : 'RENDAH'}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.anomalyContent}>
                    <Text style={styles.anomalyTypeIcon}>
                      {anomaly.type === 'cold_wave' ? '❄️' : '🔥'}
                    </Text>
                    <ThemedText style={styles.anomalyType}>
                      {anomaly.type === 'cold_wave' ? 'Gelombang Dingin' : 'Gelombang Panas'}
                    </ThemedText>
                    <ThemedText style={[styles.anomalyTemp, { 
                      color: anomaly.type === 'cold_wave' ? '#3B82F6' : '#EF4444' 
                    }]}>
                      {anomaly.type === 'cold_wave' ? '' : '+'}{Math.abs(anomaly.anomaly).toFixed(1)}°C
                    </ThemedText>
                    <ThemedText style={styles.anomalyDesc}>dari normal</ThemedText>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  noDataText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  anomalySection: {
    marginTop: 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
