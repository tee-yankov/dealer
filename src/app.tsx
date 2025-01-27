import { useEffect, useState } from 'preact/hooks'
import './app.css'
import request, { requestText } from './util/request'

export function App() {
  const [state, setState] = useState({})

  useEffect(() => {
    request('https://api.ipify.org?format=json')
      .then((data) =>
        setState((state) => ({
          ...state,
          clientIP: data.ip
        }))
      )
      .catch((error) => console.error('Error fetching IP:', error));

    requestText('https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt')
      .then((stunServerIPs) => {
        setState((state) => ({
          ...state,
          stunServerIPs: stunServerIPs.split('\n'),
        }))
      })
  }, [])

  console.log(({ state }))

  return (
    <>
      <div class="card">
        {JSON.stringify(state, undefined, 2)}
      </div>
    </>
  )
}
