import * as commentApi from "@/api/commentApi";
import * as dugnadApi from "@/api/dugnadApi";
import { useAuthSession } from "@/providers/authctx";
import { DugnadComment, DugnadData } from "@/types/dugnad";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View} from "react-native";
export default function DugnadDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthSession();

  const [dugnad, setDugnad] = useState<DugnadData | null>(null);
  const [comments, setComments] = useState<DugnadComment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleFavorite = async () => {
    if (!dugnad || !user) return;
  
    const isFavorite = dugnad.favorites?.includes(user.uid);
    await dugnadApi.favoriteDugnad(dugnad.id, user.uid, !isFavorite);
  
    setDugnad({
      ...dugnad,
      favorites: isFavorite
        ? dugnad.favorites?.filter(uid => uid !== user.uid)
        : [...(dugnad.favorites || []), user.uid],
    });
  };

  const handleJoin = async () => {
    if (!dugnad || !user) return;
  
    if (dugnad.participants.includes(user.uid)) {
      console.log("Du er allerede med på denne dugnaden");
      return;
    }
  
    if (dugnad.participants.length >= dugnad.maxParticipants) {
      console.log("Beklager, dugnaden er full");
      return;
    }
  
    await dugnadApi.joinDugnad(dugnad.id, user.uid);
    setDugnad({ ...dugnad, participants: [...dugnad.participants, user.uid] });
  };
  
  const handleLike = async () => {
    if (!dugnad || !user) return;
  
    let newLikes: string[];
    if (dugnad.likes.includes(user.uid)) {
      newLikes = dugnad.likes.filter(uid => uid !== user.uid);
    } else {
      newLikes = [...dugnad.likes, user.uid];
    }
  
    await dugnadApi.likeDugnad(dugnad.id, user.uid);
    setDugnad({ ...dugnad, likes: newLikes });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !dugnad || !user) return;

    const comment: DugnadComment = {
      id: Date.now().toString(),
      authorId: user.uid,
      author: user.displayName || "Ukjent",
      comment: newComment,
    };

    await commentApi.createComment(comment, dugnad.id);
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  async function fetchDugnadFromApi(inputId: string) {
    const dugnad = await dugnadApi.getDugnadById(inputId);
    setDugnad(dugnad);
    if (dugnad) {
      await fetchCommentsFromApi(dugnad.comments);
    }
  }

  async function fetchCommentsFromApi(ids: string[]) {
    const comments = await commentApi.getCommentsByIds(ids);
    setComments(comments);
  }

  useEffect(() => {
    fetchDugnadFromApi(id);
  }, [id]);

  if (dugnad === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Henter dugnad</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Image style={styles.imageStyle} source={{ uri: dugnad.imageUri }} />
      <View style={styles.contentContainer}>
        <Text style={styles.titleStyle}>{dugnad.title}</Text>
        <Text style={[styles.textStyle, { paddingTop: 6 }]}>
          {dugnad.description}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>

        <Pressable style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>
            {dugnad.participants.includes(user?.uid || "") ? "Du er med" : "Bli med"}
            </Text>
        </Pressable>
        <Pressable style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.likeButtonText}>
            {dugnad.likes.includes(user?.uid || "") ? "💖 Liker" : "🤍 Liker"}
            </Text>
        </Pressable>
        <Pressable style={styles.likeButton} onPress={handleFavorite}>
            <Text style={styles.likeButtonText}>
            {dugnad.favorites?.includes(user?.uid || "") ? "⭐ Favoritt" : "☆ Favoritt"}
            </Text>
        </Pressable>
      </View>
      <View style={styles.commentsContainer}>
        <Text style={styles.commentTitle}>Kommentarer</Text>
        <View style={styles.commentsList}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={(comment) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.commentItem}>
                  <Text style={[styles.smallTextStyle, { color: "gray" }]}>
                    {comment.item.author}:
                  </Text>
                  <Text style={styles.smallTextStyle}>
                    {comment.item.comment}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (comment.item.authorId !== user?.uid) return;
                    commentApi.deleteComment(comment.item.id, dugnad.id);
                    setComments(
                      comments.filter((c) => c.id !== comment.item.id)
                    );
                  }}
                >
                  <MaterialIcons name="delete-outline" size={20} color="red" />
                </Pressable>
              </View>
            )}
          />
        </View>
        <View style={styles.addCommentContainer}>
          <TextInput
            onChangeText={setNewComment}
            style={styles.commentTextField}
            placeholder="Skriv en kommentar"
          />
          <Pressable onPress={handleAddComment}>
              <Text style={styles.smallTextStyle}>Legg til</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleStyle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  textStyle: {
    fontSize: 18,
  },
  smallTextStyle: {
    fontSize: 16,
  },
  dugnadDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  commentsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentsList: {
    maxHeight: 140,
    marginTop: 2,
  },
  addCommentContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  commentTextField: {
    borderBottomWidth: 1,
    borderColor: "gray",
    width: "70%",
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
    joinButtonText: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 16 
  },
    likeButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  likeButtonText: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});