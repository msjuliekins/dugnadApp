import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velkommen til DugnadHub</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Neste dugnad</Text>
        <Text style={styles.cardText}>Ingen kommende dugnader</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Se alle dugnader</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.small,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: theme.spacing.small,
    color: theme.colors.textPrimary,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.small,
    padding: theme.spacing.small,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  cardText: {
    marginVertical: theme.spacing.medium,
    color: theme.colors.textSecondary,
  },

  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
