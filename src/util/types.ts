export interface RoomDetails {
  name: string;
  peerId: string;
}

export interface SerializedRoomKeys {
  priv: string,
  pub: string,
}

export interface PeerDetails {
  sdp: RTCSessionDescription;
}
