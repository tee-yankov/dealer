import { requestText } from "./request";

const fetchSTUNServerIPs = async (): Promise<string[]> =>
  requestText(
    "https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt",
  ).then((stunServerIPs) => stunServerIPs.split("\n"));

export default fetchSTUNServerIPs;
