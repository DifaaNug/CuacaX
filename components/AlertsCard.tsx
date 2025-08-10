import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { Alert } from '../types/weather';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AlertsCardProps {
  alerts: Alert[];
  onDismissAlert?: (alertId: string) => void;
}

export function AlertsCard({ alerts, onDismissAlert }: AlertsCardProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return '#48BB78';
      case 'medium': return '#ED8936';
      case 'high': return '#F56565';
      case 'extreme': return '#9F1239';
      default: return '#9BB5D6';
    }
  };

  const getSeverityText = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'Rendah';
      case 'medium': return 'Sedang';
      case 'high': return 'Tinggi';
      case 'extreme': return 'Ekstrem';
      default: return 'Normal';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'heat_wave': return '🔥';
      case 'cold_wave': return '❄️';
      case 'poor_air_quality': return '🌫️';
      case 'high_uv': return '☀️';
      case 'severe_weather': return '⛈️';
      default: return '⚠️';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timestamp.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return timestamp.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (alerts.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <ThemedText style={styles.title}>Peringatan Cuaca</ThemedText>
        </View>
        <View style={styles.noAlertsContainer}>
          <Text style={styles.noAlertsIcon}>✅</Text>
          <ThemedText style={styles.noAlertsText}>
            Tidak ada peringatan cuaca aktif saat ini
          </ThemedText>
          <ThemedText style={styles.noAlertsSubtext}>
            Kami akan memberi tahu Anda jika ada kondisi cuaca yang perlu diwaspadai
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Separate active and dismissed alerts
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const dismissedAlerts = alerts.filter(alert => !alert.isActive);

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <ThemedText style={styles.title}>Peringatan Cuaca</ThemedText>
        {activeAlerts.length > 0 && (
          <View style={[styles.alertBadge, { backgroundColor: getSeverityColor('high') }]}>
            <Text style={styles.alertBadgeText}>{activeAlerts.length}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.alertsContainer} showsVerticalScrollIndicator={false}>
        {/* Active Alerts */}
        {activeAlerts.map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard,
              styles.activeAlert,
              { borderLeftColor: getSeverityColor(alert.severity) }
            ]}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
              <View style={styles.alertHeaderText}>
                <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                <View style={styles.alertMeta}>
                  <Text style={[
                    styles.alertSeverity,
                    { color: getSeverityColor(alert.severity) }
                  ]}>
                    {getSeverityText(alert.severity)}
                  </Text>
                  <ThemedText style={styles.alertTime}>
                    {formatDate(alert.timestamp)} • {formatTime(alert.timestamp)}
                  </ThemedText>
                </View>
              </View>
              {onDismissAlert && (
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => onDismissAlert(alert.id)}
                >
                  <Text style={styles.dismissButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ThemedText style={styles.alertMessage}>
              {alert.message}
            </ThemedText>

            <View style={styles.alertLocation}>
              <Text style={styles.locationIcon}>📍</Text>
              <ThemedText style={styles.locationText}>{alert.location}</ThemedText>
            </View>

            {alert.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <ThemedText style={styles.recommendationsTitle}>
                  Rekomendasi:
                </ThemedText>
                {alert.recommendations.slice(0, 3).map((rec, index) => (
                  <ThemedText key={index} style={styles.recommendationItem}>
                    • {rec}
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Recently Dismissed Alerts */}
        {dismissedAlerts.length > 0 && activeAlerts.length > 0 && (
          <View style={styles.sectionDivider}>
            <ThemedText style={styles.sectionTitle}>Peringatan Sebelumnya</ThemedText>
          </View>
        )}

        {dismissedAlerts.slice(0, 3).map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard,
              styles.dismissedAlert,
              { borderLeftColor: getSeverityColor(alert.severity) + '40' }
            ]}
          >
            <View style={styles.alertHeader}>
              <Text style={[styles.alertIcon, styles.dismissedIcon]}>
                {getAlertIcon(alert.type)}
              </Text>
              <View style={styles.alertHeaderText}>
                <ThemedText style={[styles.alertTitle, styles.dismissedText]}>
                  {alert.title}
                </ThemedText>
                <ThemedText style={[styles.alertTime, styles.dismissedText]}>
                  {formatDate(alert.timestamp)} • {formatTime(alert.timestamp)}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  alertBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noAlertsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  alertsContainer: {
    maxHeight: 400,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  activeAlert: {
    backgroundColor: 'rgba(245, 101, 101, 0.05)',
  },
  dismissedAlert: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  dismissedIcon: {
    opacity: 0.5,
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  alertTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    color: '#666',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.7,
  },
  recommendationsContainer: {
    backgroundColor: 'rgba(0, 102, 204, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  sectionDivider: {
    marginVertical: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  dismissedText: {
    opacity: 0.6,
  },
});
