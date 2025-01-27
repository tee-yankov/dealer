import request from "./request";

export const fetchOwnIP = request("https://api.ipify.org?format=json")
  .then((data) => data.ip)

export default fetchOwnIP
