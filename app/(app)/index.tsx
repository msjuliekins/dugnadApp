import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { theme } from "@/constants/theme";
import * as dugnadApi from "@/api/dugnadApi";
import { DugnadData } from "@/types/dugnad";
import { router } from "expo-router";
import { getUserById } from "@/utils/firebaseHelpers";

export default function HomeScreen() {
  const [dugnader, setDugnader] = useState<DugnadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function load() {
      const fetched = await dugnadApi.getAllDugnads();
      const authorMap: { [key: string]: string } = {};
      for (const d of fetched) {
        const user = await getUserById(d.authorId);
        authorMap[d.authorId] = user?.name || "Ukjent";
      }

      setAuthors(authorMap);
      setDugnader(fetched);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Laster dugnader...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alle dugnader</Text>
      <FlatList
        data={dugnader}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/dugnad/details/[id]",
                params: { id: item.id },
              })
            }
          >
            <Image source={{ uri: item.imageUri }} style={styles.image} />

            <View style={{ padding: 10 }}>
              <Text style={styles.dugnadTitle}>{item.title}</Text>
              <Text style={styles.author}>
                Opprettet av: {authors[item.authorId] || "Ukjent"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: theme.spacing.medium,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  image: {
    height: 160,
    width: "100%",
  },

  dugnadTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  author: {
    marginTop: 4,
    color: "gray",
  },
});