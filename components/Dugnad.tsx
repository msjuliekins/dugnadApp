import { useAuthSession } from "@/providers/authctx";
import { DugnadData } from "@/types/dugnad";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as dugnadApi from "@/api/dugnadApi";

export type DugnadProps = {
  dugnadData: DugnadData;
};

export default function Dugnad({ dugnadData }: DugnadProps) {

  const { user } = useAuthSession();
  const [participants, setParticipants] = useState(dugnadData.participants);
  const canJoin = user && participants.length < dugnadData.maxParticipants && !participants.includes(user.uid);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const updateDugnad = await dugnadApi.joinDugnad(dugnadData.id, user.uid );
      setParticipants(updateDugnad.participants);
    } catch(e) {
      console.log("Error joining dugnad")
    }
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/dugnad-details/[id]",
          params: { id: dugnadData.id },
        })
      }
    >
      <View style={styles.dugnadContainer}>
        <Image
          accessible
          accessibilityLabel="Dugnad image, navigate to dugnad details"
          accessibilityRole="link"
          style={styles.dugnadImage}
          source={{ uri: dugnadData.imageUri }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.dugnadTitle}>{dugnadData.title}</Text>
          <Text style={styles.dugnadDescription}>
            {dugnadData.description}
          </Text>
          <View style={styles.infoContainer}>
            <Text>{dugnadData.participants.length}/{dugnadData.maxParticipants} deltakere</Text>
            <Text>{dugnadData.likes.length} <EvilIcons name="like" size={20} color="gray" /></Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dugnadContainer: {
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 6 },
    shadowColor: "black",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderRadius: 10,
  },
  dugnadImage: {
    height: 250,
    width: "100%",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    resizeMode: "cover",
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dugnad: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dugnadTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dugnadDescription: {
    fontSize: 16,
    color: "gray",
  },
  dugnadDescriptionContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentsContainer: {
    flexDirection: "row",
  },
  infoContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});