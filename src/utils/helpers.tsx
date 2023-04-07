import { CONFIGURE_VNT } from "./constants"

export const getSendMessage = (
  contentMessage: string,
  typeMessage: string,
  chatGroupId: string,
  ticketId: string,
) => {
  return JSON.stringify({
    headers: {
      command: 'sendCSGroupMessage',
    },
    body: {
      transactionId: `${new Date().getTime()}`,
      envelop: {
        content: contentMessage,
        contentType: typeMessage,
        receiver: chatGroupId,
        receiverType: 'GROUP',
        extraInfos: { ticketId },
      },
    },
  })
}
export const formatBytes = (a: number, b = 2) => {
  if (a === 0) return '0 Bytes'
  const c = b < 0 ? 0 : b
  const d = Math.floor(Math.log(a) / Math.log(1024))
  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  }`
}

const has = Object.prototype.hasOwnProperty
export const isEmpty = (prop: any) => {
  return (
    prop === null ||
    prop === undefined ||
    (has.call(prop, 'length') && prop.length === 0) ||
    (prop.constructor === Object && Object.keys(prop).length === 0)
  )
}
export const getAudioPermision = async () => {
  let audioPermissions = false;
  const audio = navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  await audio
    .then((stream) => {
      audioPermissions = !audioPermissions;
      console.log(`Microphone Permission : ${audioPermissions}`);
    })
    .catch((err) => {
      audioPermissions = false;
      console.log(`${err.name} : Microphone : ${err.message}`);
      alert("Bạn cần cấp quyền truy cập Microphone của Browser!");
    });
  return audioPermissions;
};
export const getConfig = () =>{
  if (window.vntInit) {
    let _config = window?.vntInit() || {}
    return _config
  }
  else{
    return  JSON.parse(localStorage.getItem(CONFIGURE_VNT) || '{}')
  }
}