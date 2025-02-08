export interface RoomDetails {
  name: string;
  uid: string;
}

export interface RoomMember {
  name: string;
  sdp: RTCSessionDescriptionInit | null;
  iceCandidates?: RTCIceCandidate[];
  answers: Record<string, RTCSessionDescriptionInit>;
}
