import { PublicKey, PrivateKey } from "@libp2p/interface";

export interface RoomDetails {
  name: string;
  peerId: string;
  keys?: RoomKeys;
}

export interface RoomKeys {
  priv: PrivateKey,
  pub: PublicKey,
}

export interface SerializedRoomKeys {
  priv: string,
  pub: string,
}

export interface PeerDetails {
  sdp: RTCSessionDescription;
}
