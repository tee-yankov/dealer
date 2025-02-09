import { QuerySnapshot } from "firebase/firestore";
import debounce from "./debounce";
import { publishOwnAnswer, updateMember } from "./firebase";
import { iceServers } from "./ice";
import { authState, roomState, updateState, webRtcState } from "./state";
import { RoomMember } from "./types";
import { selectPeerConnection } from "./selectors";

export enum WebRTCMode {
  Server = "server",
  Client = "client",
}

export async function initializeWebRTC(
  mode: WebRTCMode,
  { roomId, uid }: { roomId: string; uid?: string },
) {
  if (webRtcState.value.peers[uid!]) {
    return webRtcState.value.peers[uid!];
  }
  console.log(`Starting WebRTC in ${mode} mode`);
  const peerConnection = new RTCPeerConnection({ iceServers });

  if (mode === WebRTCMode.Server) {
    const sendChannel = peerConnection.createDataChannel("sendChannel");

    sendChannel.onopen = () => {
      console.log("send channel open");
    };
    sendChannel.onclose = () => {
      console.log("send channel closed");
    };

    peerConnection.onnegotiationneeded = async () => {
      console.log("negotiation needed");
      await peerConnection.setLocalDescription(
        await peerConnection.createOffer(),
      );
      if (uid) {
        await publishOwnAnswer(
          roomId,
          peerConnection.localDescription!.toJSON(),
          uid,
        );
      }
    };
  } else {
    peerConnection.ondatachannel = () => {
      console.log("data channel received");
    };
  }

  const iceCandidates: RTCIceCandidate[] = [];
  const flushIceCandidates = debounce(async () => {
    if (roomId && iceCandidates.length) {
      console.log("flushing ice candidates");
      console.log(iceCandidates);
      await updateMember(roomId, authState.value.user?.uid!, {
        iceCandidates: iceCandidates.map((v) => v.toJSON()),
      });
    }
  }, 1000);

  peerConnection.onicecandidate = (e) => {
    console.log("ice candidate");
    if (e.candidate?.candidate) {
      iceCandidates.push(e.candidate);
      flushIceCandidates();
    }
  };

  updateState(webRtcState, (state) => ({
    mode,
    localDescription: peerConnection.localDescription,
    peers: uid
      ? {
          ...state.peers,
          [uid]: peerConnection,
        }
      : state.peers,
  }));

  return peerConnection;
}

export async function setRemoteDescriptionAndAnswer(
  roomId: string,
  hostUid: string,
  sdp: RTCSessionDescriptionInit,
) {
  const peerConnection = selectPeerConnection(hostUid);

  await peerConnection.setRemoteDescription(sdp);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await publishOwnAnswer(roomId, answer, hostUid);

  return answer;
}

export async function setRemoteDescription(
  sdp: RTCSessionDescriptionInit,
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);
  await peerConnection.setRemoteDescription(sdp);
}

export async function addIceCandidates(
  candidates: RTCIceCandidate[],
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);
  for (const candidate of candidates) {
    const existingCandidate = !webRtcState.value.iceCandidates.find(
      (c) => candidate.candidate === c.candidate,
    );
    if (!existingCandidate && candidate.candidate) {
      console.log("adding local ICE candidate", candidate);
      await peerConnection.addIceCandidate(candidate);
    }
  }
  updateState(webRtcState, (state) => ({
    iceCandidates: [...state.iceCandidates, ...candidates],
  }));
}

export async function handleRoomMemberChanges(snapshot: QuerySnapshot) {
  const { room, roomId } = roomState.value;
  const { mode } = webRtcState.value;
  const ownUid = authState.value.user!.uid;
  if (!roomId || !room) {
    throw new Error("no roomId in room member handler");
  }
  const hostUid = room.uid;

  for (const change of snapshot.docChanges()) {
    // skip changes to ourself
    if (change.doc.id === ownUid) {
      continue;
    }

    if (mode === WebRTCMode.Server) {
      if (change.type === "added") {
        console.log("creating offer for", [change.doc.id, change.doc.data()]);
        await initializeWebRTC(WebRTCMode.Server, {
          uid: change.doc.id,
          roomId,
        });
      } else {
        console.log("change", change);
      }
    } else if (mode === WebRTCMode.Client) {
      // ignore messages other than the host's
      if (change.doc.id !== hostUid) {
        continue;
      }

      if (change.type === "modified") {
        const data = change.doc.data() as RoomMember;
        const answer = data.answers[ownUid];
        console.log(data, answer);
        if (answer?.type === "offer" && !webRtcState.value.peers[hostUid]) {
          await initializeWebRTC(mode, { roomId, uid: hostUid });
          await setRemoteDescriptionAndAnswer(roomId, hostUid, answer);
        }
        console.log("modified", change);
      }
    }
  }
}
