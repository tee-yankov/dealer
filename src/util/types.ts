export interface RoomDetails {
  name: string;
  uid: string;
}

export interface RoomMember {
  name: string;
  iceCandidates?: RTCIceCandidate[];
  answers: Record<string, RTCSessionDescriptionInit>;
}
