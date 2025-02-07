export interface RoomDetails {
  name: string;
  uid: string;
}

export interface Answer {
  to: string;
  description: RTCSessionDescriptionInit;
}

export interface RoomMember {
  name: string;
  sdp: RTCSessionDescriptionInit | null;
  iceCandidates?: RTCIceCandidate[];
  answers?: Answer[];
}
