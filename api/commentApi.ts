import { db } from "@/firebaseConfig";
import { DugnadComment } from "@/types/dugnad";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";


export async function createComment(comment: DugnadComment, dugnadId: string) {
    try {
        const docRef = await addDoc(collection(db, "comments"), comment);
        const dugnadRef = doc(db, "dugnader", dugnadId);
        await updateDoc(dugnadRef, {
            comments: arrayUnion(docRef.id),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch(e) {
        console.log("Error creating dugnad", e);
    }
}

export async function getCommentsByIds(ids: string[]) {
    try {
        const queryResult = await getDocs(collection(db, "comments"));
        const targetComments = queryResult.docs.filter((doc) => ids.includes(doc.id));
        const comments = targetComments.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        } as DugnadComment));
        console.log("Successfully fetched comments: ", comments);
        return comments;
    } catch(e) {
        console.log("Error getting all comments", e)
        return [] as DugnadComment[];
    }
}

export async function deleteComment(id: string, dugnadId: string) {
    try {
        const dugnadRef = doc(db, "dugnader", dugnadId);
        await updateDoc(dugnadRef, {
            comments: arrayRemove(id)
        })
        await deleteDoc(doc(db, "comments", id));
    } catch(e) {
        console.log("Error deleting comment", e);
    }
}