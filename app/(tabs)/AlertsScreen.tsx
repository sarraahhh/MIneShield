import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  MapPin,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import mineAlerts from "../../data/mine_alerts_telangana_openpit.json";

type AlertItem = typeof mineAlerts extends (infer T)[] ? T : any;

export default function AlertsScreen() {
  const isDarkMode = useColorScheme() === "dark";

  
  const alerts = useMemo(() => {
    return (mineAlerts as AlertItem[]).map((a, i) => ({
      id: a.id ?? i,
      severity: (a.risk_level || "Low").toLowerCase(),
      title: a.alert_type || "Alert",
      location: `${a.mine_name ?? "Unknown Mine"} — ${a.district ?? "N/A"}`,
      time: new Date(a.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "active",
      description: a.message ?? "No description provided",
      confidence: a.confidence ?? 80,
    }));
  }, []);

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case "high":
        return <AlertTriangle color="#ef4444" size={20} />;
      case "medium":
        return <AlertCircle color="#f97316" size={20} />;
      case "low":
      default:
        return <Info color="#22d3ee" size={20} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" },
        ]}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 , paddingTop:90}}
      >
        {/* Header */}
        <Text style={[styles.header, { color: isDarkMode ? "#fff" : "#0f172a" }]}>
          Live Alerts
        </Text>
        <Text
          style={[styles.subheader, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}
        >
          Real-time safety warnings and notifications
        </Text>

        {/* Alerts List */}
        {alerts.slice(0,6).map((a) => {
          const borderColor =
            a.severity === "high"
              ? "#ef4444"
              : a.severity === "medium"
              ? "#f59e0b"
              : "#22d3ee";

          return (
            <TouchableOpacity
              key={a.id}
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? "#162c46" : "#fff",
                  borderColor,
                },
              ]}
            >
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={styles.iconWrap}>{getSeverityIcon(a.severity)}</View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.title,
                      { color: isDarkMode ? "#fff" : "#0f172a" },
                    ]}
                  >
                    {a.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <MapPin size={14} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                    <Text
                      style={[
                        styles.loc,
                        { color: isDarkMode ? "#94a3b8" : "#64748b" },
                      ]}
                    >
                      {a.location}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.desc,
                      { color: isDarkMode ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    {a.description}
                  </Text>
                  <View style={styles.meta}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                    >
                      <Clock size={12} color={isDarkMode ? "#64748b" : "#94a3b8"} />
                      <Text
                        style={[
                          styles.time,
                          { color: isDarkMode ? "#94a3b8" : "#64748b" },
                        ]}
                      >
                        {a.time}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color:
                          a.severity === "high"
                            ? "#ef4444"
                            : a.severity === "medium"
                            ? "#f59e0b"
                            : "#22d3ee",
                        fontSize: 12,
                      }}
                    >
                      Conf: {a.confidence}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* AI Monitoring Status */}
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: isDarkMode
                ? "rgba(168,85,247,0.1)"
                : "#faf5ff",
              borderColor: "#c084fc",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={styles.pulseDot} />
            <Text
              style={{
                color: isDarkMode ? "#fff" : "#0f172a",
                fontWeight: "500",
              }}
            >
              AI Alert System Active
            </Text>
          </View>
          <Text
            style={[
              styles.aiDesc,
              { color: isDarkMode ? "#94a3b8" : "#64748b" },
            ]}
          >
            Monitoring 47 sensors across all sectors for potential hazards
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <CheckCircle size={14} color="#84cc16" />
            <Text style={{ color: "#84cc16", fontSize: 13 }}>
              All systems operational
            </Text>
          </View>
        </View>
      </ScrollView>

      
      
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subheader: { fontSize: 13, marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  title: { fontSize: 15, fontWeight: "600" },
  loc: { fontSize: 12 },
  desc: { fontSize: 12, marginTop: 6 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  time: { fontSize: 12 },
  aiCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    marginBottom: 60,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#84cc16",
  },
  aiDesc: { fontSize: 12, marginTop: 6, marginBottom: 6 },
});
