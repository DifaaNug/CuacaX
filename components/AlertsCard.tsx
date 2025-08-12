import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert } from '../types/weather';
import { shadowPresets } from '../utils/styleUtils';

interface AlertsCardProps {
  alerts: Alert[];
  onDismissAlert?: (alertId: string) => void;
}

export function AlertsCard({ alerts, onDismissAlert }: AlertsCardProps) {
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
      <View style={[styles.container, styles.noAlertsContainer, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <Text style={styles.title}>Peringatan Cuaca</Text>
        </View>
        <View style={styles.noAlertsContent}>
          <Text style={styles.noAlertsIcon}>✅</Text>
          <Text style={styles.noAlertsText}>
            Tidak ada peringatan cuaca aktif saat ini
          </Text>
          <Text style={styles.noAlertsSubtext}>
            Kami akan memberi tahu Anda jika ada kondisi cuaca yang perlu diwaspadai
          </Text>
        </View>
      </View>
    );
  }

  // Separate active and dismissed alerts
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const dismissedAlerts = alerts.filter(alert => !alert.isActive);

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <Text style={styles.title}>Peringatan Cuaca</Text>
        {activeAlerts.length > 0 && (
          <View style={[styles.alertBadge, { backgroundColor: getSeverityColor('high') }]}>
            <Text style={styles.alertBadgeText}>{activeAlerts.length}</Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={[styles.alertsContainer, { maxHeight: 300 }]} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Active Alerts */}
        {activeAlerts.map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard,
              { borderLeftColor: getSeverityColor(alert.severity) }
            ]}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
              <View style={styles.alertHeaderText}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <View style={styles.alertMeta}>
                  <Text style={[
                    styles.alertSeverity,
                    { 
                      color: getSeverityColor(alert.severity),
                      backgroundColor: `${getSeverityColor(alert.severity)}20`
                    }
                  ]}>
                    {getSeverityText(alert.severity)}
                  </Text>
                  <Text style={styles.alertTime}>
                    {formatDate(alert.timestamp)} • {formatTime(alert.timestamp)}
                  </Text>
                </View>
              </View>
              {onDismissAlert && (
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => onDismissAlert(alert.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dismissButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.alertMessage}>
              {alert.message}
            </Text>

            <View style={styles.alertLocation}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{alert.location}</Text>
            </View>

            {alert.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>
                  Rekomendasi:
                </Text>
                {alert.recommendations.slice(0, 3).map((rec, index) => (
                  <Text key={index} style={styles.recommendationItem}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Recently Dismissed Alerts */}
        {dismissedAlerts.length > 0 && activeAlerts.length > 0 && (
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Peringatan Sebelumnya</Text>
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
                <Text style={[styles.alertTitle, styles.dismissedText]}>
                  {alert.title}
                </Text>
                <Text style={[styles.alertTime, styles.dismissedText]}>
                  {formatDate(alert.timestamp)} • {formatTime(alert.timestamp)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    margin: 12,
    overflow: 'hidden',
    ...shadowPresets.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#1F2937',
  },
  titleWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#1F2937',
  },
  alertBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noAlertsContainer: {
    minHeight: 120,
  },
  noAlertsContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noAlertsIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1F2937',
  },
  noAlertsSubtext: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.85,
    color: '#6B7280',
    lineHeight: 18,
  },
  alertsContainer: {
    maxHeight: 400,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  activeAlert: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  dismissedAlert: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
    color: '#1F2937',
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertTime: {
    fontSize: 12,
    opacity: 0.7,
    color: '#6B7280',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: '#374151',
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
    color: '#6B7280',
  },
  recommendationsContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1E40AF',
  },
  recommendationItem: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    color: '#374151',
  },
  sectionDivider: {
    marginVertical: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 114, 128, 0.2)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    color: '#6B7280',
  },
  dismissedText: {
    opacity: 0.6,
  },
});
