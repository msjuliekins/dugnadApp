import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "@/types/user";

export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    return userSnap.exists() ? (userSnap.data() as UserData) : null;
  } catch (e) {
    console.log("Feil ved henting av bruker", e);
    return null;
  }
}