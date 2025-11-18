import * as dugnadApi from "@/api/dugnadApi";
import { useAuthSession } from "@/providers/authctx";
import { DugnadData } from "@/types/dugnad";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SelectImageModal from "./SelectImageModal";

export type DugnadModalProps = {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  confirmDugnadAdded: VoidFunction;
};

export default function DugnadFormModal({
  isVisible,
  setIsVisible,
  confirmDugnadAdded,
}: DugnadModalProps) {
  const [titleText, setTitleText] = useState("");
  const [descText, setDescText] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dateText, setDateText] = useState(""); 
  const [timeText, setTimeText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthSession();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] =
    useState<Location.LocationGeocodedAddress | null>(null);

  const dugnadCoordinatesData = useRef<Location.LocationObjectCoords | null>(
    null
  );

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Tillatelse til å bruke lokasjon ble ike gitt");
      return;
    }

    let location = await Location.getCurrentPositionAsync();
    dugnadCoordinatesData.current = location.coords;
    const locationAddress = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setLocation(locationAddress[0]);
    console.log(locationAddress);
  }

  let locationPlaceholderText = "Her kommer addresse";
  if (errorMsg) {
    locationPlaceholderText = errorMsg;
  }

  const handleAddDugnad = async () => {
    if (!image || !user) return;

    const dateTimeISO = new Date(`${dateText}T${timeText}:00`).toISOString();

    setIsLoading(true);

    const newDugnad: DugnadData = {
      id: titleText + descText,
      authorId: user.uid,
      title: titleText,
      description: descText,
      dato: dateTimeISO,
      imageUri: image,
      comments: [],
      participants: [],
      maxParticipants: parseInt(maxParticipants, 10) || 10,
      likes: [],
      favorites: []
    };

    try {
      await dugnadApi.createDugnad(newDugnad);

      setTitleText("");
      setDescText("");
      setMaxParticipants("10");
      setDateText("");
      setTimeText("");
      setImage(null);
      confirmDugnadAdded();
      setIsVisible(false);
    } catch (e) {
      console.log("Kunne ikke opprette dugnad");
    }

    setIsLoading(false);
  }

  return (
    <Modal transparent visible={isVisible} animationType="slide">
      <Modal visible={isCameraOpen}>
        <SelectImageModal
          closeModal={() => setIsCameraOpen(false)}
          setImage={(img) => {
            setImage(img);
            getLocation();
          }}
        />
      </Modal>

      <View style={styles.modalVisible}>
        <Pressable
          onPress={() => setIsCameraOpen(true)}
          style={styles.addImageButton}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ resizeMode: "cover", width: "100%", height: 300 }}
            />
          ) : (
            <EvilIcons name="image" size={80} color="black" />
          )}
        </Pressable>

        <View style={{ marginTop: 8, marginBottom: 16 }}>
          {location ? (
            <Text>{`${location.name} - ${location.city}, ${location.country}`}</Text>
          ) : (
            <Text>{locationPlaceholderText}</Text>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={titleText}
                placeholder="Tittel"
                onChangeText={setTitleText}
              />
              <TextInput
                style={styles.textInput}
                value={descText}
                placeholder="Beskrivelse"
                onChangeText={setDescText}
              />
              <TextInput
                style={styles.textInput}
                value={dateText}
                placeholder="Dato (YYYY-MM-DD)"
                onChangeText={setDateText}
              />
              <TextInput
                style={styles.textInput}
                value={timeText}
                placeholder="Tid (HH:MM)"
                onChangeText={setTimeText}
              />
              <TextInput
                style={styles.textInput}
                value={maxParticipants}
                placeholder="Maks deltakere"
                keyboardType="number-pad"
                onChangeText={setMaxParticipants}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, { borderWidth: 2, borderColor: "gray" }]}
                onPress={handleAddDugnad}
              >
                <Text>Legg til</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsVisible(false)}
                style={[styles.button, { backgroundColor: "gray" }]}
              >
                <Text>Lukk</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalVisible: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "50%",
    justifyContent: "space-between",
    // paddingHorizontal: 30,
    marginTop: 16,
  },
  textInputContainer: {
    gap: 16,
    alignItems: "center",
    width: "100%",
  },
  textInput: {
    borderBottomWidth: 1,
    width: "75%",
    fontSize: 18,
  },
  button: {
    // backgroundColor: "red",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addImageButton: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
});