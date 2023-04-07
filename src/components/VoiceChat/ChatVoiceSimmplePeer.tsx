import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import MicOffIcon from "@material-ui/icons/MicOff";
// import { ACCOUNTS, some } from 'constants/constants';
import JSONbig from 'json-bigint';
import { delay, find } from 'lodash';
import {
  default as React,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
// import { useSelector } from 'react-redux';
// import { useIntl } from "react-intl";
// import { TYPE_MESSAGE } from "/constants";
// import { BLACK_90, BLUE_NAVY, RED, WHITE, GREEN } from "assets/theme/colors";
// import { getSendMessage, isEmpty } from "utils/helpers/helpers";
import Peer from 'simple-peer';
import styled from 'styled-components';
import { actionGetStunTurnServer } from '../../api/apiTicket';
// import { AppState } from '../../../../rootReducer';
import { BLACK_90, GREEN, RED, WHITE } from '../../assets/colors';
import BootstrapTooltip from '../../common/BootstrapTooltip';
import { ACCOUNT, some, TYPE_MESSAGE, UUID } from '../../utils/constants';
import { getSendMessage, isEmpty } from '../../utils/helpers';
// import LoadingButton from "modules/common/LoadingButton";
// import BootstrapTooltip from 'modules/common/BootstrapTooltip';
// import { AppState } from '../../../../rootReducer';
// import {
//   Signal,
//   SignalAnswerCall,
//   SignalTarget,
//   CallStatus,
// } from './voice/constants';
import ConfirmationDialog from './ConfirmCloseDialog';
import { CallStatus, Signal, SignalAnswerCall, SignalTarget } from './constants';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// const Row = styled.div`
//   display: flex;
//   width: 100%;
// `;

// const Container = styled.div`
//   padding: 20px;
//   display: flex;
//   height: 100vh;
//   width: 100%;
//   margin: auto;
//   flex-wrap: wrap;
// `;

const StyledAudio = styled.audio`
  display: none;
`;

const Audio = (props: any) => {
  const ref: any = useRef();

  useEffect(() => {
    props.peer.on('stream', (stream: any) => {
      // @ts-ignore
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledAudio playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

interface Props {
  open: boolean;
  socket: any;
  ticket: some;
  receiverInfoRequestJoin?: SignalTarget;
  setOpenRequestCall: (open: boolean) => void;
  setReceiverInfoRequestJoin: (r: any) => void;
}

const ChatVoiceSimmplePeer = ({
  open,
  socket,
  ticket,
  receiverInfoRequestJoin,
  setOpenRequestCall,
  setReceiverInfoRequestJoin,
}: Props) => {
  // const profile = useSelector((state: AppState) => state.system.profile);

  const [users, setUsers] = useState<some>(
    JSONbig.parse(localStorage.getItem(ACCOUNT) || '{}'),
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmCall, setOpenConfirmCall] = useState(false);
  const [requestUser, setRequestUser] = useState<SignalTarget | undefined>(
    undefined,
  );
  const [callStatus, setCallStatus] = useState<any>(CallStatus.DEFAULT);
  const [currentStream, setCurrentStream] = useState<MediaStream>();
  const [peers, setPeers] = useState<any[]>([]);
  const [connection, setConnection] = useState<any | undefined>(undefined);
  const [ticketInfo, setTicketInfo] = useState<any>(ticket);
  const [stunTurnServer, setStunTurnServer] = useState<RTCIceServer[]>();

  const socketRef: any = useRef();
  const userAudioRef: any = useRef();

  const intl = useIntl();
  const formatStunTurnServer = (data: some) => {
    return [
      ...data?.stun.map((s: any) => ({ urls: s?.signature })),
      ...data?.turn.map((t: any) => ({
        urls: t?.signature,
        credential: t?.credentials,
        username: t.username,
      })),
    ];
  };

  const fetchStunTurnServer = async () => {
    const res = await actionGetStunTurnServer();
    const _sts = await formatStunTurnServer(res?.data);
    setStunTurnServer(_sts);
  };
  const [profile] = useState<some>({ id: localStorage.getItem(UUID) || ' ' });
  const stopStreamedMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        const stream = mediaStream;
        const tracks = stream.getTracks();

        tracks[0].stop();
      });
  };
  const [isOn, setIsOn] = useState(false);

  const getUserIdToSendRequestCall = (ticket: some) => {
    return ticket?.employee?.id;
  };

  const sendSignal = useCallback(
    (sigName, data) => {
      socket.send(
        getSendMessage(
          JSON.stringify({
            command: sigName,
            data,
          }),
          TYPE_MESSAGE.VoIP_TRANSFER,
          `${data?.ticket?.chatGroupId}`,
          `${data?.ticket?.id}`,
        ),
      );
    },
    [socket, ticket],
  );
  const sendingSignalSenderPeer = (stream: any) => {
    const peers: any[] = [];
    const peer: any = initSenderPeer(ticket?.customerId, stream);
    peers.push(peer);

    setPeers(peers);
  };

  const ready = (conn: any) => {
    conn.on('data', function (data: any) { });
    conn.on('close', function () {
      setConnection(undefined);
    });
  };

  const signal = (sigName: any) => {
    if (connection && connection.open) {
      connection.send(sigName);
    } else {
      stopStreamedMedia();
    }
  };

  const initReceiverPeer = (
    incomingSignal: any,
    callerID: any,
    stream: any,
    sigName: any,
  ) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      sendSignal(sigName, {
        sigName,
        signal,
        userId: callerID,
        ticket: receiverInfoRequestJoin?.ticket || {},
      });
    });

    peer.on('connection', async function (c) {
      // Allow only a single connection
      if (c && c.open) {
        // Disallow incoming connections
        c.on('open', function () {
          c.send('Already connected to another client');
          setTimeout(function () {
            c.close();
          }, 500);
        });
      }
      await setConnection(c);
      ready(c);
    });

    peer.signal(incomingSignal);

    return peer;
  };

  const handleSignalForSender = (e: any, stream: any) => {
    if (localStorage.getItem('INCALL') === 'ON') return;
    const resFull = JSON.parse(e.data);
    if (resFull.body?.contentType === TYPE_MESSAGE.VoIP_TRANSFER) {
      const contentData = JSON.parse(resFull?.body?.content);
      if (contentData?.data) {
        const command = contentData?.command;
        const data = contentData?.data;
        switch (command) {
          case Signal.ACCEPT: {
            const payload: SignalAnswerCall = data;

            if (peers.length > 0) {
              peers[0].signal(payload.signal);
              const data: SignalTarget = {
                userToSignal: payload.userId,
                callerID: ticket?.customerId,
                ticket: ticketInfo,
              };
              sendSignal(Signal.ADD_PEER_RETURN, data);
              setCallStatus(CallStatus.SUCCESS);
            }
            break;
          }

          case Signal.RING: {
            setCallStatus(CallStatus.RINGING);
            break;
          }
          case Signal.IN_CALL: {
            setCallStatus(CallStatus.IN_CALL);
            delay(() => {
              setOpenRequestCall(false);
            }, 3000);
            break;
          }

          case Signal.END_CALL: {
            if (
              !(
                callStatus === CallStatus.CONNECTING ||
                callStatus === CallStatus.SUCCESS
              )
            ) {
              return;
            }
            const payload: SignalTarget = data;
            setOpenRequestCall(false);
            setReceiverInfoRequestJoin(undefined);
            setCallStatus(CallStatus.END_CALL);
            signal('Off');
            stopStreamedMedia();
            setIsOn(true);
            //@ts-ignore
            if (userAudioRef?.current) userAudioRef.current?.destroy();
            break;
          }
        }
      }
    }
  };

  const handleSignalForReceiver = (e: any) => {
    const resFull = JSON.parse(e.data);
    if (resFull.body?.contentType === TYPE_MESSAGE.VoIP_TRANSFER) {
      const contentData = JSON.parse(resFull?.body?.content);
      if (contentData?.data) {
        const command = contentData?.command;
        const data = contentData?.data;
        switch (command) {
          case Signal.ADD_PEER_RETURN: {
            const payload: SignalTarget = data;
            setCallStatus(CallStatus.SUCCESS);
            if (payload.userToSignal + '' === ticket?.customerId + '') {
            } else {
              return;
            }
            break;
          }

          case Signal.REJECT: {
            const payload: SignalTarget = data;

            setCallStatus(CallStatus.REJECTED_CALL);
            delay(() => {
              setOpenRequestCall(false);
              setCallStatus(CallStatus.DEFAULT);
            }, 3000);
            break;
          }

          case Signal.END_CALL: {
            if (
              !(
                callStatus === CallStatus.CONNECTING ||
                callStatus === CallStatus.SUCCESS
              )
            ) {
              return;
            }
            stopStreamedMedia();
            const payload: SignalTarget = data;
            setOpenRequestCall(false);
            setReceiverInfoRequestJoin(undefined);
            setCallStatus(CallStatus.END_CALL);
            signal('Off');
            //@ts-ignore
            if (userAudioRef?.current) userAudioRef.current?.destroy();
            break;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!isEmpty(receiverInfoRequestJoin?.ticket)) {
      setTicketInfo(receiverInfoRequestJoin?.ticket);
      setRequestUser(receiverInfoRequestJoin);
      setOpenConfirmCall(true);
    }
  }, [receiverInfoRequestJoin]);

  useEffect(() => {
    fetchStunTurnServer();
  }, []);

  useEffect(() => {
    setTicketInfo(ticket);
  }, []);

  useEffect(() => {
    if (open && isEmpty(receiverInfoRequestJoin)) setOpenDialog(open);
  }, [open]);

  // @ts-ignore
  useEffect(() => {
    if (socket) {
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          socketRef.current = socket;
          if (userAudioRef?.current) {
            // @ts-ignore
            userAudioRef.current.srcObject = stream;
          }
          setCurrentStream(stream);
          socket.addEventListener('message', (e: any) =>
            handleSignalForSender(e, stream),
          );
          socket.addEventListener('message', (e: any) =>
            handleSignalForReceiver(e),
          );
          return stream;
        });
    }
  }, [socket, userAudioRef, peers, openDialog]);

  const initSenderPeer = (callerID: string, stream: any) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: stunTurnServer,
      },
    });

    peer.on('signal', (signal: string) => {
      const target: SignalTarget = {
        callerID: callerID,
        signal,
        userToSignal: getUserIdToSendRequestCall(ticket),
        ticket: ticketInfo,
      };

      sendSignal(Signal.REQUEST_JOIN, target);
    });

    peer.on('connection', function (c) {
      // Disallow incoming connections
      c.on('open', function () {
        c.send('Sender does not accept incoming connections');
        setTimeout(function () {
          c.close();
        }, 500);
      });
    });

    return peer;
  };

  const handleClose = useCallback(() => {
    setOpenDialog(false);
  }, []);

  useEffect(() => {
    if (!openDialog) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          const stream: any = mediaStream;
          const tracks: any = stream.getTracks();
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          tracks[0].stop;
        });
    }
  }, [openDialog]);

  const requestACall = () => {
    setCallStatus(CallStatus.CONNECTING);
    sendingSignalSenderPeer(currentStream);
  };

  const endCall = () => {
    console.log(callStatus);
    stopStreamedMedia();
    signal('Off');

    let _data = !isEmpty(receiverInfoRequestJoin)
      ? {
        userToSignal: receiverInfoRequestJoin?.callerID,
        callerID: ticket?.customerId,
        ticket: receiverInfoRequestJoin?.ticket,
      }
      : {
        userToSignal: getUserIdToSendRequestCall(ticket),
        callerID: ticket?.customerId,
        ticket: ticket,
      };
    sendSignal(Signal.END_CALL, _data);
    setOpenRequestCall(false);
    setReceiverInfoRequestJoin(undefined);
  };

  const rejectCall = () => {
    let _data = !isEmpty(receiverInfoRequestJoin)
      ? {
        userToSignal: receiverInfoRequestJoin?.callerID,
        callerID: profile?.id,
        ticket: receiverInfoRequestJoin?.ticket,
      }
      : {};
    sendSignal(Signal.REJECT, _data);
    setOpenConfirmCall(false);
    setOpenRequestCall(false);
    setReceiverInfoRequestJoin(undefined);
  };

  const acceptCall = () => {
    const peer = initReceiverPeer(
      requestUser?.signal,
      ticket?.customerId,
      currentStream,
      Signal.ACCEPT,
    );
    setPeers([peer]);
    setOpenDialog(true);
    setOpenConfirmCall(false);
  };
  useEffect(() => {
    if (callStatus === CallStatus.SUCCESS) {
      localStorage.setItem('INCALL', 'ON');
    } else {
      localStorage.setItem('INCALL', 'OFF');
    }
    if (
      callStatus === CallStatus.CONNECTING ||
      callStatus === CallStatus.RINGING
    ) {
      const interval = setInterval(() => {
        endCall();
      }, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  return (
    <div>
      <Dialog
        style={{ zIndex: 19999 }}
        onClose={handleClose}
        open={openDialog}
        PaperProps={{
          style: {
            width: '100%',
            borderRadius: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: BLACK_90,
          },
        }}
        fullScreen
      >
        <IconButton
          aria-label="close"
          onClick={() => endCall()}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            color: WHITE,
          }}
        >
          <CloseIcon style={{ width: 30, height: 30 }} />
        </IconButton>
        <div style={{ marginTop: 30, color: WHITE, fontWeight: 'bold' }}>
          {intl?.formatMessage({ id: callStatus })}
        </div>
        <div
          style={{
            height: '90%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="wrapper">
            {callStatus === CallStatus.DEFAULT ? (
              <div>
                <AccountCircleOutlinedIcon
                  className="svgFullfill"
                  style={{ fill: WHITE, width: 150, height: 150 }}
                />
              </div>
            ) : (
              <div className="ring">
                <div className="coccoc-alo-phone coccoc-alo-green coccoc-alo-show">
                  <div className="coccoc-alo-ph-circle"></div>
                  <div className="coccoc-alo-ph-circle-fill"></div>
                  <div className="coccoc-alo-ph-img-circle"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          {!isOn && (
            <StyledAudio muted ref={userAudioRef} autoPlay playsInline />
          )}
          {peers.map((peer, index) => {
            return <Audio key={index} peer={peer} />;
          })}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            margin: 20,
            zIndex: 99999,
          }}
        >
          {callStatus === CallStatus?.DEFAULT ? (
            <>
              {isEmpty(receiverInfoRequestJoin) && (
                <Tooltip title={intl.formatMessage({ id: 'IDS_START_CALL' })}>
                  <CallIcon
                    style={{
                      width: 35,
                      height: 35,
                      // border: `1px solid ${WHITE}`,
                      color: GREEN,
                      borderRadius: '50%',
                      padding: 3,
                      backgroundColor: WHITE,
                      cursor: 'pointer',
                    }}
                    onClick={() => requestACall()}
                  />
                </Tooltip>
              )}
            </>
          ) : (
            <>
              {' '}
              <BootstrapTooltip title={intl.formatMessage({ id: 'IDS_CHAT_CALL_MUTE' })}>
                <MicIcon
                  style={{
                    width: 35,
                    height: 35,
                    // border: `1px solid ${WHITE}`,
                    color: WHITE,
                    borderRadius: '50%',
                    padding: 3,
                    // backgroundColor: RED,
                    cursor: 'pointer',
                  }}
                // onClick={() => handleMicrophone()}
                />
              </BootstrapTooltip>
              <BootstrapTooltip title={intl.formatMessage({ id: "IDS_CHAT_END_CALL" })}>
                <CallEndIcon
                  style={{
                    width: 35,
                    height: 35,
                    // border: `1px solid ${WHITE}`,
                    color: RED,
                    borderRadius: '50%',
                    padding: 3,
                    backgroundColor: WHITE,
                    cursor: 'pointer',
                  }}
                  onClick={() => endCall()}
                />
              </BootstrapTooltip>
            </>
          )}
        </div>
      </Dialog>
      <ConfirmationDialog
        dialogTitle={intl.formatMessage({ id: 'IDS_CHAT_CHATVOICE_CONFIRM_TITLE' })}
        dialogContent={intl.formatMessage({ id: 'IDS_CHAT_CHATVOICE_CONFIRM_CONTENT' })}
        values={{
          userId:
            find(
              users,
              (u) => u.id + '' === receiverInfoRequestJoin?.callerID + '',
            )?.name || receiverInfoRequestJoin?.callerID,
        }}
        openDialog={openConfirmCall}
        handleCloseDialog={rejectCall}
        onAcceptDialog={acceptCall}
      />
    </div>
  );
};

const areEqual = (prevProps: any, nextProps: any) =>
  prevProps.open === nextProps.open &&
  JSON.stringify(prevProps.socket) === JSON.stringify(nextProps.socket) &&
  JSON.stringify(prevProps.ticket) === JSON.stringify(nextProps.ticket) &&
  JSON.stringify(prevProps.receiverInfoRequestJoin) ===
  JSON.stringify(nextProps.receiverInfoRequestJoin);

export default memo(ChatVoiceSimmplePeer, areEqual);
