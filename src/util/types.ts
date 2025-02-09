import { CardRank } from "../components/card";

export interface RoomDetails {
  name: string;
  uid: string;
}

export interface RoomMember {
  profile: MemberProfile;
}

export interface RoundResponse {
  card: CardRank;
}

export enum RoundStatus {
  Pending = "pending",
  Started = "started",
  Ended = "ended",
}

export interface Round {
  id?: string;
  cards: Record<string, RoundResponse>;
  status: RoundStatus;
  createdAt: Date;
}

export interface MemberProfile {
  displayName: string;
  character: string;
}
