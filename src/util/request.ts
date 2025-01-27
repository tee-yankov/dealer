const request = async (options: RequestInfo | URL) => fetch(options).then((res) => res.json())

export const requestText = async (options: RequestInfo | URL) => fetch(options).then((res) => res.text())

export default request
