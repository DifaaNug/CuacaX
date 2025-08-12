import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HealthTip } from '../types/weather';


interface EmergencyTipsModalProps {
  visible: boolean;
  onClose: () => void;
  emergencyTips: HealthTip[];
}

export const EmergencyTipsModal: React.FC<EmergencyTipsModalProps> = ({
  visible,
  onClose,
  emergencyTips,
}) => {
  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'heat_wave':
        return '🔥';
      case 'cold_wave':
        return '❄️';
      case 'air_quality':
        return '😷';
      case 'uv_high':
        return '☀️';
      default:
        return '⚠️';
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case 'heat_wave':
        return '#EF4444';
      case 'cold_wave':
        return '#3B82F6';
      case 'air_quality':
        return '#8B5CF6';
      case 'uv_high':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🚨</Text>
            </View>
            <Text style={styles.title}>Tips Darurat</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {emergencyTips.length > 0 ? (
              emergencyTips.map((tip, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipCard,
                    { borderLeftColor: getEmergencyColor(tip.type || 'general') },
                  ]}
                >
                  <View style={styles.tipHeader}>
                    <Text style={styles.tipIcon}>
                      {getEmergencyIcon(tip.type || 'general')}
                    </Text>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                  </View>
                  <Text style={styles.tipDescription}>
                    {tip.description}
                  </Text>
                  {tip.action && (
                    <View style={styles.actionContainer}>
                      <Text style={styles.actionIcon}>👆</Text>
                      <Text style={styles.actionText}>{tip.action}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noTipsContainer}>
                <Text style={styles.noTipsIcon}>✅</Text>
                <Text style={styles.noTipsText}>
                  Tidak ada tips darurat saat ini. Kondisi cuaca relatif aman.
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.emergencyButton} onPress={onClose}>
            <Text style={styles.emergencyButtonIcon}>📞</Text>
            <Text style={styles.emergencyButtonText}>
              Hubungi Layanan Darurat: 112
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tipCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  tipDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    flex: 1,
  },
  noTipsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noTipsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noTipsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  emergencyButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
