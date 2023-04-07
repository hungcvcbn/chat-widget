import React, { useState, useEffect } from 'react'
import moment from 'moment'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'lodash'
import { UUID, ACCESS_TOKEN, TOKEN } from '../utils/constants'
import { configs } from '../utils/configs'
import Chats from './Chats'
import { getConfig } from '../utils/helpers'

// declare global {
//   interface Window {
//     vntInit: () => any
//   }
// }

let interval: any = null

const ChatContainer = () => {
  const [socket, setSocket] = useState<any>(null)
  const [isOnline, setOnline] = useState<boolean>(navigator.onLine)
  let online = navigator.onLine
  let token: any =
    Cookies.get('ACCESS_TOKEN') || localStorage.getItem('ACCESS_TOKEN') || Cookies.get(TOKEN)

  const configureVnt = getConfig();
  const caId = configureVnt?.caId || 9999

  const fetchWebSocket = async () => {
    let uuidVal = localStorage.getItem(UUID)
    if (isEmpty(uuidVal)) {
      uuidVal = uuidv4()
      localStorage.setItem(UUID, uuidVal)
    }
    if (token) {
      setSocket(
        new WebSocket(
          `${configs().SOCKET}/chat/ws?login-token=${token}&ca-id=${caId}`,
        ),
      )
    } else {
      setSocket(
        new WebSocket(
          `${configs().SOCKET}/chat/ws?device-id=${uuidVal}&ca-id=${caId}`,
        ),
      )
    }
  }

  const reconnectWebSocket = () => {
    if (token) {
      setSocket((previewSocket: any) => {
        if (previewSocket && previewSocket.readyState === 1) {
          previewSocket.send(
            JSON.stringify({ headers: { command: 'goodbye' }, body: {} }),
          )
        }
        return new WebSocket(
          `${configs().SOCKET}/chat/ws?login-token=${token}&ca-id=${caId}`,
        )
      })
    } else {
      setSocket((previewSocket: any) => {
        if (previewSocket && previewSocket.readyState === 1) {
          previewSocket.send(
            JSON.stringify({ headers: { command: 'goodbye' }, body: {} }),
          )
        }
        return new WebSocket(
          `${configs().SOCKET}/chat/ws?device-id=${
            localStorage.getItem(UUID) || ''
          }&ca-id=${caId}`,
        )
      })
    }
  }

  const checkCookie = () => {
    const newToken: any =
      Cookies.get(ACCESS_TOKEN) || localStorage.getItem(ACCESS_TOKEN) || Cookies.get(TOKEN)
    if (online !== navigator.onLine) {
      if (!online) {
        setSocket((previewSocket: any) => {
          if (previewSocket && previewSocket.readyState === 1) {
            previewSocket.send(
              JSON.stringify({ headers: { command: 'goodbye' }, body: {} }),
            )
          }
          return new WebSocket(
            `${configs().SOCKET}/chat/ws?login-token=${newToken}&ca-id=${caId}`,
          )
        })
      }
      online = navigator.onLine
      setOnline(navigator.onLine)
    }
    if (token !== newToken) {
      token = newToken
      if (token) {
        setSocket((previewSocket: any) => {
          if (previewSocket && previewSocket.readyState === 1) {
            previewSocket.send(
              JSON.stringify({ headers: { command: 'goodbye' }, body: {} }),
            )
          }
          return new WebSocket(
            `${configs().SOCKET}/chat/ws?login-token=${token}&ca-id=${caId}`,
          )
        })
      } else {
        setSocket((previewSocket: any) => {
          if (previewSocket && previewSocket.readyState === 1) {
            previewSocket.send(
              JSON.stringify({ headers: { command: 'goodbye' }, body: {} }),
            )
          }
          return new WebSocket(
            `${configs().SOCKET}/chat/ws?device-id=${
              localStorage.getItem(UUID) || ''
            }&ca-id=${caId}`,
          )
        })
      }
    }
    // check time open support
  }

  useEffect(() => {
    fetchWebSocket()
    interval = setInterval(checkCookie, 100)
    return () => {
      if (interval) clearInterval(interval)
    } // eslint-disable-next-line
  }, [])

  if (!socket) return null

  return (
    <Chats
      configureVnt={configureVnt}
      socket={socket}
      isOnline={isOnline}
      reconnectWebSocket={reconnectWebSocket}
    />
  )
}

export default ChatContainer
