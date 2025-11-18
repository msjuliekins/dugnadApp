import { db, getDownloadUrl } from "@/firebaseConfig";
import { DugnadData } from "@/types/dugnad";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayRemove,
  arrayUnion
} from "firebase/firestore";
import { uploadImageToFirebase } from "./imageAPI";

export async function createDugnad(dugnad: DugnadData) {
  try {
    const firebaseImage = await uploadImageToFirebase(dugnad.imageUri);
    if (!firebaseImage) {
      console.error("Error while uplaoding image");
      return;
    }

    const dugnadImageDownloadUrl = await getDownloadUrl(firebaseImage);
    const dugnadWithImage: DugnadData = {
      ...dugnad,
      imageUri: dugnadImageDownloadUrl,
    };
    const docRef = await addDoc(collection(db, "dugnader"), dugnadWithImage);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.log("Error creating dugnad", e);
  }
}

export async function getAllDugnads() {
  try {
    const queryResult = await getDocs(collection(db, "dugnader"));
    const dugnads = queryResult.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        } as DugnadData)
    );
    console.log("Successfully fetched dugnads: ", dugnads);
    return dugnads;
  } catch (e) {
    console.log("Error getting all dugnads", e);
    return [] as DugnadData[];
  }
}

export async function getDugnadById(id: string) {
  try {
    const specificDugnad = await getDoc(doc(db, "dugnader", id));
    return {
      ...specificDugnad.data(),
      id: specificDugnad.id,
    } as DugnadData;
  } catch (e) {
    console.log("Error getting document by id: ", e);
    return null;
  }
}

export async function getDugnadsForUser(userId: string) {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "dugnader"), where("authorId", "==", userId))
    );
    return querySnapshot.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as DugnadData;
    });
  } catch (e) {
    console.log("Error getting all dugnads for user", e);
    return [] as DugnadData[];
  }
}

export async function joinDugnad(dugnadId: string, userId: string) {
  const response = await fetch(`api/dugnad/${dugnadId}/join`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({userId}),
  });

  if (!response.ok) throw Error("Kunne ikke meldes på");

  return response.json();
}

export async function likeDugnad(dugnadId: string, userId: string) {
  const dugnadRef = doc(db, "dugnader", dugnadId);
  const dugnadSnap = await getDoc(dugnadRef);
  if (!dugnadSnap.exists()) throw new Error("Dugnad finnes ikke");

  const likes: string[] = dugnadSnap.data()?.likes || [];

  if (likes.includes(userId)) {
    await updateDoc(dugnadRef, { likes: arrayRemove(userId) });
  } else {
    await updateDoc(dugnadRef, { likes: arrayUnion(userId) });
  }
}

export const favoriteDugnad = async (dugnadId: string, userId: string, add: boolean) => {
  const dugnadRef = doc(db, "dugnader", dugnadId);

  if (add) {
    await updateDoc(dugnadRef, {
      favorites: arrayUnion(userId),
    });
  } else {
    await updateDoc(dugnadRef, {
      favorites: arrayRemove(userId),
    });
  }
};