enum Events {
  Message = 'message',
}
class SignalingChannel {
  private subscribers: Record<Events, any[]> = Object.fromEntries(Object.keys(Events).map((k) => [k as keyof typeof Events, []]))

  addEventListener(event: Events, callback: any) {
    this.subscribers[event].push(callback);
  }

  send(data: any) {

  }
}

// Set up an asynchronous communication channel that will be
// used during the peer connection setup
const signalingChannel = new SignalingChannel();

// Send an asynchronous message to the remote client
signalingChannel.send('Hello!');

// signalingChannel.addEventListener('message', async (message) => {
//     if (message.offer) {
//         peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         signalingChannel.send({'answer': answer});
//     }
// });

export async function makeCall(stunServer: string) {
  const configuration = { 'iceServers': [{ 'urls': stunServer }] }
  const peerConnection = new RTCPeerConnection(configuration);
  signalingChannel.addEventListener('message', async (message) => {
    if (message.answer) {
      const remoteDesc = new RTCSessionDescription(message.answer);
      await peerConnection.setRemoteDescription(remoteDesc);
    }
  });
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingChannel.send({ 'offer': offer });
}
