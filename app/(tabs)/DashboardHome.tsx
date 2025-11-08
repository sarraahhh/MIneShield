import { Activity, Clock, Maximize2, Search, Shield, TrendingDown } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import mineAlerts from "../../data/mine_alerts_telangana_openpit.json";


interface DashboardHomeProps {
  isDarkMode?: boolean;
}

type AlertItem = typeof mineAlerts extends (infer T)[] ? T : any;

export function DashboardHome({ isDarkMode: propIsDarkMode }: DashboardHomeProps) {
  const systemColorScheme = useColorScheme();
  const isDarkMode = propIsDarkMode ?? systemColorScheme === 'dark';
  
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const [onlyHigh, setOnlyHigh] = useState<boolean>(false);

  
  const alerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (mineAlerts as AlertItem[])
      .filter(a => {
        if (onlyHigh && a.risk_level !== "High") return false;
        if (!q) return true;
        return (
          (a.mine_name ?? "").toLowerCase().includes(q) ||
          (a.district ?? "").toLowerCase().includes(q) ||
          (a.alert_type ?? "").toLowerCase().includes(q) ||
          (a.message ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    return filtered;
  }, [query, onlyHigh]);

  function getRiskColorStyle(level: string) {
    if (level === "High") return { backgroundColor: '#ef4444', color: '#ffffff' };
    if (level === "Medium") return { backgroundColor: '#fb923c', color: '#ffffff' };
    return { backgroundColor: '#84cc16', color: '#000000' };
  }

  function prettyTime(ts: string) {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return ts;
    }
  }

  const cardStyle = isDarkMode 
    ? { backgroundColor: '#162c46', borderColor: 'rgba(6, 182, 212, 0.1)' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0' };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, cardStyle]}>
          <Search 
            size={16} 
            color={isDarkMode ? '#64748b' : '#94a3b8'} 
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by mine, district, alert..."
            placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
            style={[
              styles.searchInput,
              { color: isDarkMode ? '#cbd5e1' : '#0f172a' }
            ]}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Active Mines */}
        <View style={[styles.statCard, cardStyle]}>
          <View style={styles.statIconContainer}>
            <Activity size={20} color="#22d3ee" />
          </View>
          <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
            {new Set((mineAlerts as AlertItem[]).map(a => a.mine_name)).size}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Active Mines
          </Text>
          <Text style={styles.statSubtext}>Telangana</Text>
        </View>

        {/* Current Risk Level */}
        <View style={[styles.statCard, cardStyle]}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(132, 204, 22, 0.2)' }]}>
            <Shield size={20} color="#84cc16" />
          </View>
          <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
            {(mineAlerts as AlertItem[]).some(a => a.risk_level === "High") 
              ? "High" 
              : (mineAlerts as AlertItem[]).some(a => a.risk_level === "Medium") 
              ? "Medium" 
              : "Low"}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Current Risk Level
          </Text>
          <Text style={[styles.statSubtext, { color: '#84cc16' }]}>
            {Math.round(((mineAlerts as AlertItem[]).filter(a=>a.risk_level!=="Low").length / (mineAlerts as AlertItem[]).length)*100)}% alerts active
          </Text>
        </View>

        {/* Last Incident */}
        <View style={[styles.statCard, cardStyle]}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
            <Clock size={20} color="#eab308" />
          </View>
          <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
            {(() => {
              const newest = (mineAlerts as AlertItem[]).slice().sort((a,b)=> +new Date(b.timestamp) - +new Date(a.timestamp))[0];
              if (!newest) return "—";
              const diff = Math.floor((Date.now() - new Date(newest.timestamp).getTime())/ (1000*60*60*24));
              return `${diff}d`;
            })()}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Last Incident
          </Text>
          
        </View>

        {/* Safety Index */}
        <View style={[styles.statCard, cardStyle]}>
          <View style={styles.statIconContainer}>
            <TrendingDown size={20} color="#22d3ee" />
          </View>
          <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#0f172a' }]}>98.5%</Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Safety Index
          </Text>
          <Text style={styles.statSubtext}>+2.3% vs last month</Text>
        </View>
      </View>

      {/* Real-Time Risk Map */}
      <View style={[styles.mapCard, cardStyle]}>
        <View style={styles.mapHeader}>
          <View style={styles.mapTitleContainer}>
            <View style={styles.pulsingDot} />
            <Text style={[styles.mapTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
              Real-Time Risk Map
            </Text>
          </View>
          <TouchableOpacity style={styles.maximizeButton}>
            <Maximize2 size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.mapSubtitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
          Interactive mine site overview
        </Text>
        
        {/* Map (replace the placeholder) */}
<View style={{ height: 340, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
  <MapView
    provider={PROVIDER_GOOGLE}
    style={{ flex: 1 }}
    initialRegion={{
      latitude: 18.2,    
      longitude: 80.0,
      latitudeDelta: 1.2,
      longitudeDelta: 1.2,
    }}
    showsUserLocation={false}
    showsMyLocationButton={false}
    loadingEnabled
  >
    {/* Render markers from the currently filtered alerts (so search/filter apply) */}
    {alerts.map((a) => {
      const size = a.risk_level === "High" ? 28 : a.risk_level === "Medium" ? 20 : 14;
      const color = a.risk_level === "High" ? "#ef4444" : a.risk_level === "Medium" ? "#fb923c" : "#84cc16";

      return (
        <Marker
          key={`${a.id}`}
          coordinate={{ latitude: a.latitude, longitude: a.longitude }}
          title={a.mine_name}
          description={`${a.alert_type} • ${a.risk_level}`}
          onPress={() => setSelected(a)}
        >
          <View style={{
            width: size,
            height: size,
            borderRadius: 16,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' }} />
          </View>
        </Marker>
      );
    })}
  </MapView>

  {/* keep badge on top-left */}
  <View style={[styles.alertBadge, { top: 12, left: 12 }]}>
    <Text style={styles.alertBadgeText}>{alerts.length} alerts</Text>
  </View>
</View>


        {/* Legend */}
        <View style={[styles.legend, { borderTopColor: isDarkMode ? 'rgba(6, 182, 212, 0.1)' : '#e2e8f0' }]}>
          <Text style={[styles.legendTitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Risk Levels
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#84cc16' }]} />
              <Text style={[styles.legendText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f97316' }]} />
              <Text style={[styles.legendText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.legendText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>High</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Alerts feed */}
      <View style={[styles.alertsCard, cardStyle]}>
        <View style={styles.alertsHeader}>
          <Text style={[styles.alertsTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
            Live Alerts
          </Text>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>High only</Text>
            <TouchableOpacity 
              onPress={() => setOnlyHigh(s => !s)}
              style={[styles.checkbox, onlyHigh && styles.checkboxChecked]}
            >
              {onlyHigh && <View style={styles.checkmark} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.alertsList}>
          {alerts.length === 0 ? (
            <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>No alerts found.</Text>
          ) : alerts.slice(0,10).map(a => (
            <TouchableOpacity
              key={a.id}
              onPress={() => setSelected(a)}
              style={[styles.alertItem, { backgroundColor: isDarkMode ? '#0f2740' : '#f8fafc' }]}
            >
              <View style={styles.alertContent}>
                <View style={styles.alertTop}>
                  <View style={[styles.riskBadge, getRiskColorStyle(a.risk_level)]}>
                    <Text style={[styles.riskBadgeText, { color: getRiskColorStyle(a.risk_level).color }]}>
                      {a.risk_level}
                    </Text>
                  </View>
                  <Text style={[styles.alertMine, { color: isDarkMode ? '#e2e8f0' : '#0f172a' }]}>
                    {a.mine_name}
                  </Text>
                  <Text style={styles.alertType}>· {a.alert_type}</Text>
                </View>
                <Text style={[styles.alertMessage, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                  {a.message}
                </Text>
              </View>

              <View style={styles.alertRight}>
                <Text style={[styles.alertTime, { color: isDarkMode ? '#cbd5e1' : '#334155' }]}>
                  {prettyTime(a.timestamp)}
                </Text>
                <Text style={styles.alertConfidence}>Conf: {a.confidence}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

     

      {/* AI Status Card */}
      <View style={[styles.aiCard, isDarkMode ? styles.aiCardDark : styles.aiCardLight]}>
        <View style={styles.aiContent}>
          <View style={styles.aiIconContainer}>
            <View style={styles.aiIcon} />
          </View>
          <View style={styles.aiTextContainer}>
            <View style={styles.aiTitleRow}>
              <Text style={[styles.aiTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                AI Prediction Engine
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>
            <Text style={[styles.aiSubtitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
              Processing real-time sensor data from 47 monitoring points
            </Text>
            <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#e2e8f0' }]}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.confidenceRow}>
              <Text style={[styles.confidenceLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                Confidence Level
              </Text>
              <Text style={styles.confidenceValue}>92%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setSelected(null)} 
          />
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#062033' : '#ffffff' }]}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                      {selected.mine_name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selected.district} · {selected.alert_type}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={[styles.modalMessage, { color: isDarkMode ? '#cbd5e1' : '#334155' }]}>
                    {selected.message}
                  </Text>
                  <Text style={styles.modalTimestamp}>
                    Reported: {prettyTime(selected.timestamp)}
                  </Text>
                  <View style={styles.modalBadges}>
                    <View style={[styles.riskBadge, getRiskColorStyle(selected.risk_level)]}>
                      <Text style={[styles.riskBadgeText, { color: getRiskColorStyle(selected.risk_level).color }]}>
                        {selected.risk_level}
                      </Text>
                    </View>
                    <Text style={styles.modalConfidence}>Conf: {selected.confidence}%</Text>
                  </View>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Temp</Text>
                      <Text style={[styles.modalStatValue, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                        {selected.temperature_c} °C
                      </Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Dust index</Text>
                      <Text style={[styles.modalStatValue, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                        {selected.dust_index}
                      </Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Vibration</Text>
                      <Text style={[styles.modalStatValue, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                        {selected.vibration_level}
                      </Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Text style={styles.modalStatLabel}>Rain</Text>
                      <Text style={[styles.modalStatValue, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
                        {selected.rainfall_mm} mm
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      onPress={() => { alert('Acknowledged (demo)'); setSelected(null); }}
                      style={styles.acknowledgeButton}
                    >
                      <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => { alert('Alert sent to supervisors (demo)'); setSelected(null); }}
                      style={styles.alertButton}
                    >
                      <Text style={styles.alertButtonText}>Send Alert</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>

  );

  
}

export default DashboardHome;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
    paddingTop:70,
  },
  searchSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
   
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statSubtext: {
    fontSize: 10,
    color: '#22d3ee',
    marginTop: 4,
  },
  mapCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#84cc16',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  maximizeButton: {
    padding: 6,
  },
  mapSubtitle: {
    fontSize: 11,
    marginBottom: 16,
  },
  mapPlaceholder: {
    aspectRatio: 4/3,
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
  },
  mapDark: {
    backgroundColor: '#0f172a',
  },
  mapLight: {
    backgroundColor: '#f1f5f9',
  },
  alertBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  legend: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  legendTitle: {
    fontSize: 11,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
  },
  alertsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#22d3ee',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22d3ee',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  alertsList: {
    maxHeight: 288,
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertMine: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertType: {
    fontSize: 11,
    color: '#94a3b8',
  },
  alertMessage: {
    fontSize: 11,
    marginTop: 4,
  },
  alertRight: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  alertTime: {
    fontSize: 11,
  },
  alertConfidence: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },

  aiCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  aiCardDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  aiCardLight: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  aiContent: {
    flexDirection: 'row',
    gap: 12,
  },
  aiIconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  aiIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#a855f7',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(132, 204, 22, 0.2)',
  },
  liveBadgeText: {
    fontSize: 10,
    color: '#84cc16',
  },
  aiSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '92%',
    height: '100%',
    backgroundColor: '#a855f7',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 11,
  },
  confidenceValue: {
    fontSize: 11,
    color: '#84cc16',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    borderRadius: 12,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  closeButton: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modalBody: {
    gap: 8,
  },
  modalMessage: {
    fontSize: 13,
  },
  modalTimestamp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  modalConfidence: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  modalStat: {
    width: '47%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.1)',
  },
  modalStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  modalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  acknowledgeButton: {
    flex: 1,
    backgroundColor: '#84cc16',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  alertButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});