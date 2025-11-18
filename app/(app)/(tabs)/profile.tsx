import * as dugnadApi from "@/api/dugnadApi";
import * as userApi from "@/api/userAPI";
import { useAuthSession } from "@/providers/authctx";
import { DugnadData } from "@/types/dugnad";
import { UserData } from "@/types/user";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ProfilePage() {
  const { user, userNameSession, signOut } = useAuthSession();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [userDugnads, setUserDugnads] = useState<DugnadData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  async function getUserData(userId: string) {
    const userData = await userApi.getUserProfile(userId);
    return userData;
  }

  async function getUserDugnads(userId: string) {
    const userDugnads = await dugnadApi.getDugnadsForUser(userId);
    setUserDugnads(userDugnads);
  }

  async function loadData() {
    setIsLoading(true);
    if (!user) return Alert.alert("Du er ikke logget inn!");
    const userData = await getUserData(user.uid);
    setUserProfile(userData);
    setBioText(userData?.bio ?? "");
    await getUserDugnads(user.uid);
    setIsLoading(false);
  }

  async function createorEditUserProfile() {
    if (bioText.length === 0) {
      Alert.alert("Skriv noe om deg selv");
      return;
    }

    if (userProfile === null) {
      const newUserPortfile: UserData = {
        name: userNameSession ?? "Her er det feil",
        email: user?.email ?? "Her er det feil",
        bio: bioText,
      };
      await userApi.createUserProfile(user?.uid ?? "ERROR", newUserPortfile);
      loadData();
      return;
    }

    if (!isEditingBio) { 
      setIsEditingBio(true);
      return;
    }

    await userApi.editUserBio(user?.uid ?? "ERROR", bioText);
    loadData();
    setIsEditingBio(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={style.mainContainer}>
        
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Link
                style={[style.link, { paddingLeft: 12 }]}
                href={"/declarations"}
              >
                Info
              </Link>
            ),
            headerRight: () => (
              <Pressable
                style={{ paddingRight: 12 }}
                onPress={() => {
                  signOut();
                }}
              >
                <Text>Logg ut</Text>
              </Pressable>
            ),
          }}
        />
        <View style={style.profileContainer}>
          {!isLoading && (
            <>
              <Text>
                {userProfile === null
                  ? "Profil ikke opprettet for " + userNameSession
                  : userProfile.name}
              </Text>
              <TextInput
                style={style.textInput}
                value={bioText}
                placeholder="Beskriv deg selv"
                numberOfLines={2}
                editable={isEditingBio || userProfile === null}
                multiline={true}
                onChangeText={setBioText}
              />
              <Pressable
                style={style.button}
                onPress={async () => {
                  createorEditUserProfile(); 
                }}
              >
                <Text>
                  {userProfile === null
                    ? "Opprett profil"
                    : isEditingBio
                    ? "Oppdater"
                    : "Rediger profil"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <Text>Laster innhold...</Text>
          ) : userDugnads.length !== 0 ? (
            <ScrollView>
              <View style={style.dugnadsGridContainer}>
                {userDugnads.map((dugnad) => (
                  <Pressable
                    key={dugnad.id}
                    style={style.dugnad}
                    onPress={() =>
                      router.push({
                        pathname: "/dugnad_details/[id]",
                        params: { id: dugnad.id },
                      })
                    }
                  >
                    <Image
                      style={{ width: "100%", height: 200 }}
                      source={{ uri: dugnad.imageUri }}
                    />
                    <Text>{dugnad.title}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={style.noDugnadsContainer}>
              <Text>Ingen dugnader enda</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  link: {
    textDecorationLine: "underline",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: "50%",
    fontSize: 16,
    padding: 8,
    borderColor: "gray",
    height: 80,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  profileContainer: {
    height: "30%",
    backgroundColor: "white",
    paddingTop: 20,
    alignItems: "center",
    gap: 8,
  },
  dugnadsGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 40,
    paddingVertical: 16,
    justifyContent: "space-between",
    rowGap: 16,
  },
  dugnad: {
    width: "48%",
    height: 220,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  noDugnadsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});