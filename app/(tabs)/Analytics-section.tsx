import {
    Activity,
    CheckCircle,
    Clock,
    Target,
    Zap
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import mineAlerts from "../../data/mine_alerts_telangana_openpit.json";

const screenWidth = Dimensions.get("window").width - 40;

interface Alert {
  id: number;
  mine_name: string;
  district: string;
  alert_type: string;
  risk_level: "Low" | "Medium" | "High";
  confidence: number;
  timestamp: string;
  resolved?: boolean;
}

export default function StatsScreen() {
  const isDarkMode = useColorScheme() === "dark";
  const data = mineAlerts as Alert[];

  const analytics = useMemo(() => {
    const total = data.length;
    const high = data.filter((a) => a.risk_level === "High").length;
    const med = data.filter((a) => a.risk_level === "Medium").length;
    const low = data.filter((a) => a.risk_level === "Low").length;
    const avgConfidence =
      data.reduce((sum, a) => sum + (a.confidence ?? 0), 0) / total || 0;

    const resolved = data.filter((_, i) => i % 3 === 0).length;
    const avgResponse = (Math.random() * 3 + 1).toFixed(1);

    // quick mock for weekly bars
    const byDay = Array.from({ length: 7 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      alerts: Math.floor(Math.random() * 8) + 1,
      resolved: Math.floor(Math.random() * 6) + 1,
    }));

    return {
      total,
      high,
      med,
      low,
      avgConfidence,
      resolved,
      avgResponse,
      byDay,
    };
  }, [data]);

  const chartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDarkMode ? `rgba(34,211,238,${opacity})` : "#22d3ee",
    labelColor: () => (isDarkMode ? "#94a3b8" : "#64748b"),
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" },
      ]}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 , paddingTop:90}}
    >
      <Text style={[styles.header, { color: isDarkMode ? "#fff" : "#0f172a" }]}>
        Analytics
      </Text>
      <Text
        style={[styles.subheader, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}
      >
        Telangana Open-Pit Mine Data Insights
      </Text>

      {/* Quick Stats */}
      <View style={styles.grid}>
        {[
          {
            label: "Active Alerts",
            value: analytics.total.toString(),
            icon: <Zap color="#a855f7" size={18} />,
          },
          {
            label: "Avg Confidence",
            value: `${analytics.avgConfidence.toFixed(1)}%`,
            icon: <Target color="#22d3ee" size={18} />,
          },
          {
            label: "Avg Response",
            value: `${analytics.avgResponse}m`,
            icon: <Clock color="#f59e0b" size={18} />,
          },
          {
            label: "Resolved Alerts",
            value: `${analytics.resolved}`,
            icon: <CheckCircle color="#84cc16" size={18} />,
          },
        ].map((stat, i) => (
          <View
            key={i}
            style={[
              styles.card,
              {
                backgroundColor: isDarkMode ? "#162c46" : "#fff",
                borderColor: isDarkMode ? "#22d3ee20" : "#e2e8f0",
              },
            ]}
          >
            <View style={styles.statHeader}>
              {stat.icon}
              <Text
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? "#94a3b8" : "#64748b" },
                ]}
              >
                {stat.label}
              </Text>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: isDarkMode ? "#fff" : "#0f172a" },
              ]}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Weekly Alert Activity */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: isDarkMode ? "#162c46" : "#fff" },
        ]}
      >
        <Text
          style={[styles.chartTitle, { color: isDarkMode ? "#fff" : "#0f172a" }]}
        >
          Weekly Alert Activity
        </Text>
        <BarChart
          data={{
            labels: analytics.byDay.map((d) => d.day),
            datasets: [
              { data: analytics.byDay.map((d) => d.alerts), color: () => "#22d3ee" },
              { data: analytics.byDay.map((d) => d.resolved), color: () => "#84cc16" },
            ],
          }}
          width={screenWidth}
          height={220}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Confidence Trend */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: isDarkMode ? "#162c46" : "#fff" },
        ]}
      >
        <Text
          style={[styles.chartTitle, { color: isDarkMode ? "#fff" : "#0f172a" }]}
        >
          Confidence Trend
        </Text>
        <LineChart
          data={{
            labels: ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
            datasets: [{ data: [88, 90, 93, 92, 95, 94] }],
          }}
          width={screenWidth}
          height={200}
          yAxisSuffix="%"
          bezier
          chartConfig={chartConfig}
          style={styles.chart}
        />
        <View style={styles.currentAccuracy}>
          <Text
            style={[styles.accuracyText, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}
          >
            Current Accuracy
          </Text>
          <Text style={styles.accuracyValue}>
            {analytics.avgConfidence.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: isDarkMode ? "#1e293b" : "#f3e8ff",
            borderColor: isDarkMode ? "#a855f740" : "#e9d5ff",
          },
        ]}
      >
        <View style={styles.summaryHeader}>
          <Activity size={20} color="#a855f7" />
          <View>
            <Text
              style={[styles.chartTitle, { color: isDarkMode ? "#fff" : "#0f172a" }]}
            >
              Monthly Summary
            </Text>
            <Text
              style={[styles.chartDesc, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}
            >
              Based on alert data
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View>
            <Text style={styles.summaryLabel}>Total Alerts</Text>
            <Text style={styles.summaryValue}>{analytics.total}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>High Risk</Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {analytics.high}
            </Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Medium Risk</Text>
            <Text style={[styles.summaryValue, { color: "#f97316" }]}>
              {analytics.med}
            </Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Low Risk</Text>
            <Text style={[styles.summaryValue, { color: "#84cc16" }]}>
              {analytics.low}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: "700" },
  subheader: { fontSize: 13, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22d3ee20",
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  chartDesc: { fontSize: 12, marginBottom: 10 },
  chart: { borderRadius: 12 },
  currentAccuracy: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  accuracyText: { fontSize: 13 },
  accuracyValue: { fontSize: 16, fontWeight: "bold", color: "#84cc16" },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 40,
  },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  summaryLabel: { fontSize: 12, color: "#94a3b8" },
  summaryValue: { fontSize: 18, fontWeight: "600" },
});
