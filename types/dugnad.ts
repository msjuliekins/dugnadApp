import { LocationObjectCoords } from "expo-location";

export type DugnadData = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  dato: string;
  imageUri: string;
  comments: string[];
  participants: string[];
  maxParticipants: number;
  likes: string[];
  favorites: string[];
};

export interface DugnadComment {
    id: string;
    authorId: string;
    author: string;
    comment: string;
}