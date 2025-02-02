import { ipns } from "@helia/ipns";
import { unixfs } from "@helia/unixfs";
import {
  generateKeyPair,
  privateKeyFromRaw,
  publicKeyFromRaw,
} from "@libp2p/crypto/keys";
import { Ed25519PrivateKey, PublicKey, PrivateKey } from "@libp2p/interface";
import { createHelia, HeliaLibp2p, libp2pDefaults } from "helia";
import { PeerDetails, RoomDetails, SerializedRoomKeys } from "./types";
import { Libp2p } from "libp2p";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { base64ToBytes, bytesToBase64 } from "./base64";
import { CID } from "multiformats";
import { iceServers } from "./ice";

let privateKey: Ed25519PrivateKey;
let helia: HeliaLibp2p<Libp2p>;

async function initializeHelia() {
  if (helia) {
    return;
  }

  const libp2pConfig = { ...libp2pDefaults() };

  libp2pConfig.transports = [
    webSockets(),
    webRTC({
      rtcConfiguration: {
        iceServers,
      },
    }),
    webRTCDirect(),
    circuitRelayTransport(),
  ];

  helia = await createHelia({ libp2p: libp2pConfig });

  helia.libp2p.addEventListener("peer:connect", (e) => {
    console.debug(`Connected to ${e.detail.toString()}`);
  });

  helia.libp2p.addEventListener("peer:discovery", (e) => {
    console.debug(`Discovered peer ${e.detail.id.toString()}`);
  });

  helia.libp2p.addEventListener("peer:disconnect", (e) => {
    console.debug(`Disconnected from ${e.detail.toString()}`);
  });

  while (!helia.libp2p.getMultiaddrs().length) {
    console.debug("Awaiting multiaddrs");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const addrs = helia.libp2p.getMultiaddrs();
  for (const ma of addrs) {
    console.debug("Found multiaddrs");
    console.debug(ma.toString());
  }
}

export function decodeBinary(bytes: Uint8Array): string {
  const decoder = new TextDecoder("utf8");
  return decoder.decode(bytes);
}

async function initializeKeys() {
  if (privateKey) {
    return privateKey;
  }

  privateKey = await generateKeyPair("Ed25519");
}

let initialized = false;
let initializing: Promise<void>;

export async function initialize() {
  if (initialized) {
    return;
  }
  if (initializing) {
    return initializing;
  }
  initializing = Promise.all([initializeHelia(), initializeKeys()]).then();
  await initializing;
  initialized = true;
}

function encodeJSON(obj: object) {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(obj));
}

export function encodeString(str: string) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function decodeString(buf: Uint8Array) {
  const encoder = new TextDecoder();
  return encoder.decode(buf);
}

export const getPublicKey = () => privateKey.publicKey;

export async function createRoomDirectory(
  roomDetails: RoomDetails,
  peerDetails: PeerDetails,
) {
  await initialize();
  const name = ipns(helia);

  const fs = unixfs(helia);
  const cid = await fs.addBytes(encodeJSON(peerDetails));

  const dirCid = await fs.addDirectory();
  const finalDirCid = await fs.cp(cid, dirCid, "index");

  await name.publish(privateKey, `/ipfs/${finalDirCid}`);

  console.log("finalDirCid", finalDirCid.toString());

  helia.routing.provide(finalDirCid);
  helia.pins.add(finalDirCid);

  return serializeRoomPayload(privateKey, roomDetails);
}

export const serializeRoomPayload = (
  key: PrivateKey,
  room: RoomDetails,
): string => {
  const roomDetails: Omit<RoomDetails, "keys"> & { keys: SerializedRoomKeys } =
    {
      name: room.name,
      peerId: room.peerId,
      keys: {
        priv: serializeKey(key),
        pub: serializeKey(key.publicKey),
      },
    };

  return btoa(JSON.stringify(roomDetails));
};

export const deserializeRoomPayload = (payload: string): RoomDetails => {
  const base = JSON.parse(atob(payload));

  return {
    ...base,
    keys: {
      pub: deserializePublicKey(base.keys.pub),
      priv: deserializePrivateKey(base.keys.priv),
    },
  };
};

export const serializeKey = (key: PublicKey | PrivateKey): string =>
  encodeURIComponent(bytesToBase64(key.raw));

const deserializePublicKey = (key: string): PublicKey =>
  publicKeyFromRaw(base64ToBytes(decodeURIComponent(key)));

const deserializePrivateKey = (key: string): PrivateKey =>
  privateKeyFromRaw(base64ToBytes(decodeURIComponent(key)));

export async function resolveIPNSName(pubKey: PublicKey) {
  await initialize();
  const names = ipns(helia);
  const result = await names.resolve(pubKey);

  return result;
}

export async function lsDirectory(cid: CID) {
  const fs = unixfs(helia);
  const files = [];

  for await (const file of fs.ls(cid)) {
    files.push(file);
  }

  return files;
}

export async function addCallingCard(
  dirCid: CID,
  peerDetails: PeerDetails,
  privateKey: PrivateKey,
) {
  const fs = unixfs(helia);
  const name = ipns(helia);
  const fileCid = await fs.addBytes(encodeJSON(peerDetails));

  const finalDirCid = await fs.cp(
    fileCid,
    dirCid,
    helia.libp2p.peerId.toString(),
  );

  await name.publish(privateKey, finalDirCid);

  helia.routing.provide(finalDirCid);
  helia.pins.add(finalDirCid);
}

export const getOwnPeerId = async () => {
  await initialize();
  return helia.libp2p.peerId.toString();
};
