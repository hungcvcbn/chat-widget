import {
  APP_ID_MYTOUR_EVENT,
  APP_ID_TRIPI_PARTNER,
  APP_KEY_MYTOUR_EVENT,
  APP_KEY_TRIPI_PARTNER,
  MYTOUR_EVENT_CAID,
  MYTOUR_EVENT_CHANNEL_ID,
  TRIPIONE_CAID,
  TRIPI_ONE_CHANNEL,
  TRIPI_PARTNER,
  TRIPI_PARTNER_CHANNEL_ID,
} from './constants'
import { getConfig } from './helpers'

export const configs = () => {
  const configureVnt = getConfig()
  if (
    configureVnt &&
    configureVnt?.caId === TRIPIONE_CAID &&
    configureVnt?.channelId === TRIPI_ONE_CHANNEL
  ) {
    return {
      APP_KEY: APP_KEY_TRIPI_PARTNER,
      APP_ID: APP_ID_TRIPI_PARTNER,
      VERSION: '1.0',
      UPLOAD_URL: 'https://assets.tripi.vn',
      BASE_URL: 'https://apis.tripi.vn',
      SOCKET: 'wss://chat.tripi.vn',
    }
  } else if (
    configureVnt &&
    configureVnt?.caId == MYTOUR_EVENT_CAID &&
    configureVnt?.channelId === MYTOUR_EVENT_CHANNEL_ID
  ) {
    return {
      APP_KEY: APP_KEY_MYTOUR_EVENT,
      APP_ID: APP_ID_MYTOUR_EVENT,
      VERSION: '1.0',
      UPLOAD_URL: 'https://assets.tripi.vn',
      BASE_URL: 'https://apis.tripi.vn',
      SOCKET: 'wss://chat.tripi.vn',
    }
  }
  if (
    configureVnt &&
    configureVnt?.caId === TRIPI_PARTNER &&
    configureVnt?.channelId + '' === TRIPI_PARTNER_CHANNEL_ID + '' &&
    process.env.REACT_APP_NODE_ENV === 'development'
  ) {
    return {
      APP_KEY: '123axxafafacaxxaf1',
      APP_ID: 'csp_portal',
      VERSION: '1.0',
      UPLOAD_URL: 'https://assets.dev.tripi.vn',
      BASE_URL: 'https://apis.dev.tripi.vn',
      SOCKET: 'wss://chat.dev.tripi.vn',
    }
  } else {
    if (
      process.env.REACT_APP_NODE_ENV === 'production' ||
      process.env.REACT_APP_NODE_ENV === 'stage'
    ) {
      return {
        APP_KEY: '741ccvca-8a14-9063-8769-abnn1akax',
        APP_ID: 'vntravel-group-csp',
        VERSION: '1.0',
        UPLOAD_URL: 'https://assets.tripi.vn',
        BASE_URL: 'https://apis.tripi.vn',
        SOCKET: 'wss://chat.tripi.vn',
      }
    }

    return {
      APP_KEY: 'f95f5e49-0fc9-4e3f-8a38-e9096ea96fe6123',
      APP_ID: 'vntravel-group-csp',
      VERSION: '1.0',
      UPLOAD_URL: 'https://assets.dev.tripi.vn',
      BASE_URL: 'https://apis.dev.tripi.vn',
      SOCKET: 'wss://chat.dev.tripi.vn',
    }
  }
}
