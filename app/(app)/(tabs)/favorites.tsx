import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { theme } from "@/constants/theme";
import * as dugnadApi from "@/api/dugnadApi";
import { DugnadData } from "@/types/dugnad";
import { router } from "expo-router";
import { useAuthSession } from "@/providers/authctx";

export default function Favourites() {
  const { user } = useAuthSession();
  const [allDugnads, setAllDugnads] = useState<DugnadData[]>([]);
  const [filtered, setFiltered] = useState<DugnadData[]>([]);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<
    "none" | "dato" | "alfabetisk" | "likerklikk"
  >("none");

  useEffect(() => {

    async function load() {
      if (!user) return;
      const dugnads = await dugnadApi.getAllDugnads();
      const favs = dugnads.filter((d) => d.favorites.includes(user.uid));
      setAllDugnads(favs);
      setFiltered(favs);
    }
    load();
  }, [user]);

  useEffect(() => {
    let result = [...allDugnads];

    if (search.trim() !== "") {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterMode === "alfabetisk") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (filterMode === "dato") {
      result.sort(
        (a, b) => new Date(a.dato).getTime() - new Date(b.dato).getTime()
      );
    }

    if (filterMode === "likerklikk") {
      result.sort((a, b) => b.likes.length - a.likes.length);
    }

    setFiltered(result);
  }, [search, filterMode, allDugnads]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Du må være innlogget for å se favoritter</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dine favoritter</Text>

      {/* Søk */}
      <TextInput
        style={styles.searchInput}
        placeholder="Søk i favoritter..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filterknapper */}
      <View style={styles.filterRow}>
        <FilterButton
          label="Ingen"
          current={filterMode}
          set={() => setFilterMode("none")}
        />
        <FilterButton
          label="Dato"
          current={filterMode}
          set={() => setFilterMode("dato")}
        />
        <FilterButton
          label="A-Å"
          current={filterMode}
          set={() => setFilterMode("alfabetisk")}
        />
        <FilterButton
          label="Mest likt"
          current={filterMode}
          set={() => setFilterMode("likerklikk")}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Ingen favoritter funnet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/dugnad-details/[id]",
                params: { id: item.id },
              })
            }
          >
            <Image source={{ uri: item.imageUri }} style={styles.image} />

            <View style={{ padding: 10 }}>
              <Text style={styles.dugnadTitle}>{item.title}</Text>
              <Text style={styles.subText}>
                {item.likes.length} likerklikk * {item.participants.length}
                /{item.maxParticipants} deltakere
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function FilterButton({
  label,
  current,
  set,
}: {
  label: string;
  current: string;
  set: () => void;
}) {
  const active = current.toLowerCase() == label.toLowerCase();
  return (
    <TouchableOpacity
      onPress={set}
      style={[
        styles.filterButton,
        active && { backgroundColor: theme.colors.primary },
      ]}
    >
      <Text style={[styles.filterText, active && { color: "white" }]}>
        {label}
      </Text>
    </TouchableOpacity>
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

  searchInput: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#ddd",
  },

  filterText: {
    fontSize: 14,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  image: {
    width: "100%",
    height: 140,
  },

  dugnadTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  subText: {
    color: "gray",
    marginTop: 4,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});