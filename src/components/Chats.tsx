import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import JSONbig from "json-bigint";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  actionSettingWidget,
  apiGetAccountDetail,
  apiGetAccountFree,
  apiGetCurrentTicket,
  apiGetUserAvatarInfo,
} from "../api/apiTicket";
import { BLUE_NAVY, PRIMARY, RED, WHITE } from "../assets/colors";
import {
  AvatarChatIcon,
  AvatarIconMyTour,
  MoreIcon,
} from "../assets/iconMytour/icons";
import { ReactComponent as ChatWidgetIcon } from "../assets/icons/ic_chat_widget.svg";
import { ReactComponent as ChatWidgetMytourEvent } from "../assets/icons/ic_chat_widget_mytour_event.svg";
import { ReactComponent as ChatWidgetMyFresh } from "../assets/icons/ic_chat_widget_my_fresh.svg";
import { ReactComponent as ChatWidgetMyTable } from "../assets/icons/ic_chat_widget_my_table.svg";
import { ReactComponent as ChatWidgetTripiOne } from "../assets/icons/ic_chat_widget_tripi_one.svg";
import { ReactComponent as DislikeIcon } from "../assets/icons/ic_dislike.svg";
import { ReactComponent as LikeIcon } from "../assets/icons/ic_like.svg";
import { ReactComponent as RuleHorizontalIcon } from "../assets/icons/ic_rule_horizontal.svg";
import { Col, Row } from "../common/Elements";
import {
  ACCESS_TOKEN,
  ACCOUNT,
  MYTOUR_EVENT,
  MY_ADVENTURE,
  MY_FRESH_CHANNEL,
  MY_TABLE_CHANNEL,
  MY_TOUR,
  DINOGO_IO,
  some,
  STATUS_MESSAGE,
  SUCCESS_CODE,
  TOKEN,
  TRIPI_ONE_CHANNEL,
  TYPE_EVENT,
  TYPE_MESSAGE,
  DINOGO_COM,
} from "../utils/constants";
import { getAudioPermision, getSendMessage, isEmpty } from "../utils/helpers";
import ChatClose from "./ChatClose";
import ChatContent from "./ChatContent";
import ChatDialog from "./ChatDialog";
import ChatInfo from "./ChatInfo";
import ChatInput from "./ChatInput";
import ChatWelcome from "./ChatWelcome";
import ChatVoiceSimmplePeer from "./VoiceChat/ChatVoiceSimmplePeer";
import { Signal, SignalTarget } from "./VoiceChat/constants";
import "../locationchange";

interface Props {
  configureVnt: some;
  socket: any;
  isOnline: boolean;
  reconnectWebSocket: () => void;
}

let valueForm: some = {};

const Chats: React.FC<Props> = (props) => {
  const { configureVnt, socket, isOnline, reconnectWebSocket } = props;
  const [isOpen, setOpen] = useState<boolean>(false); // open chat dialog
  const [typeLike, setTypeLike] = useState<"like" | "dislike" | "">("");
  const [type, setType] = useState<"welcome" | "info" | "chat">("welcome"); // type screen
  const [message, setMessage] = useState<string>(""); // message input
  const [listMessage, setListMessage] = useState<some[]>([]); // list message chat by socket
  const [historyMessage, setHistoryMessage] = useState<some[]>([]);

  const [fileUploads, setFileUploads] = useState<some[]>([]); // list file upload
  const [accountFree, setAccountFree] = useState<some>({}); // account free when start
  const [accountInfo, setAccountInfo] = useState<some>({}); // account when login success
  const [chatGroup, setChatGroup] = useState<some>({}); // chat group information
  const [isClosed, setClosed] = useState<"closed" | "comment" | "">(""); // type dialog
  const [scriptSetting, setScriptSetting] = useState<some>({}); //chatScript
  const [detailConfigTeam, setDetailConfigTeam] = useState<some>(); //config Team

  const [users, setUsers] = useState<some>(
    JSONbig.parse(localStorage.getItem(ACCOUNT) || "{}")
  ); // user info in system
  const [orderInfo, setOrderInfo] = useState<some>({});
  const [isSupportOrder, setIsSupportOrder] = useState<boolean>(false);
  const { formatMessage } = useIntl();
  const channelId = configureVnt?.channelId
    ? configureVnt.channelId
    : MY_ADVENTURE;

  const [isTyping, setTyping] = useState<boolean>(false); // detect typing

  const isCloseTicket = isEmpty(chatGroup?.id);
  // const [chatGroup] = useState<some>({ id: localStorage.getItem(UUID) || ' ' });
  const [openRequestCall, setOpenRequestCall] = useState(false);
  const [receiverInfoRequestJoin, setReceiverInfoRequestJoin] = useState<
    SignalTarget | undefined
  >(undefined);
  const [isOutSupport, setOutSupport] = useState<boolean>(false);

  const _width: number = window.innerWidth || 0;
  const _height: number = window.innerHeight || 0;
  const [size, setSize] = useState<some>({
    left: _width - 52,
    top: (_height - 52) / 2,
  });
  const ref = useRef<any>();

  const checkOutSupport = () => {
    if (
      moment().isAfter(
        moment(scriptSetting?.activeTime?.[0]?.to, "HH:mm:ss")
      ) ||
      moment().isBefore(
        moment(scriptSetting?.activeTime?.[0]?.from, "HH:mm:ss")
      )
    ) {
      setOutSupport(true);
    } else {
      setOutSupport(false);
    }
  };

  const fetchAccountDetail = async (userId: Array<string | number>) => {
    try {
      const res: some = await apiGetUserAvatarInfo(userId.filter((v) => v));
      if (res?.code === SUCCESS_CODE) {
        let temp: some = { ...users };
        (res?.data?.items || []).forEach((userItem: some) => {
          temp = { ...users, [userItem?.id]: userItem };
        });
        localStorage.setItem(ACCOUNT, JSONbig.stringify(temp));
        setUsers(temp);
      }
    } catch (error) {}
  };

  const fetchAccount = async () => {
    try {
      const res: some = await apiGetAccountFree({
        channelId: channelId,
      });
      if (res?.code === SUCCESS_CODE) {
        setAccountFree(res?.data);
        if (isEmpty(users[`${res?.data?.id}`]))
          fetchAccountDetail([res?.data?.id]);
      }
    } catch (error) {}
  };

  const fetchAccountInfo = async () => {
    try {
      if (
        Cookies.get(ACCESS_TOKEN) ||
        localStorage.getItem(ACCESS_TOKEN) ||
        Cookies.get(TOKEN)
      ) {
        const res: some = await apiGetAccountDetail();
        if (res?.code === SUCCESS_CODE) setAccountInfo(res?.data);
      }
    } catch (error) {}
  };

  const fetchCurrentTicket = async () => {
    try {
      const res: some = await apiGetCurrentTicket({
        channelId: channelId,
      });
      if (res?.code === SUCCESS_CODE) {
        const ticket: some = res?.data;
        setChatGroup(ticket);
        setTypeLike(
          ticket?.customerRating === 1
            ? "like"
            : ticket?.customerRating === 0
            ? "dislike"
            : ""
        );
        if (res?.data && res?.data?.id) {
          setType("chat");
          if (isEmpty(users[`${res?.data?.employee?.id}`]))
            fetchAccountDetail([res?.data?.employee?.id]);
        }
      }
    } catch (error) {}
  };
  const resetChat = () => {
    setListMessage([]);
    setAccountInfo({});
    setChatGroup({});
    setType("welcome");
  };
  const fetchScriptSetting = useCallback(async () => {
    const res: any = await actionSettingWidget({
      channelId: channelId,
    });
    if (res?.code === SUCCESS_CODE) {
      setScriptSetting(res?.data);
    } else {
      setScriptSetting({});
    }
  }, [channelId]);

  useEffect(() => {
    fetchAccountInfo();
    fetchCurrentTicket();
    resetChat();
    valueForm = {}; // eslint-disable-next-line
  }, [socket]);
  useEffect(() => {
    if (!isEmpty(channelId)) {
      fetchScriptSetting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);
  useEffect(() => {
    fetchAccount();
    // fetchCurrentTicket() // eslint-disable-next-line
  }, []);
  useEffect(() => {
    window.addEventListener("openChat", (e: any) => {
      setOpen(true);
      if (chatGroup?.bookingId?.toString() !== e?.detail?.id.toString()) {
        setOrderInfo(e?.detail);
        setIsSupportOrder(true);
      } else {
        setOrderInfo({});
        setIsSupportOrder(false);
      }
    });
    return () => {
      window.removeEventListener("openChat", (e: any) => {
        setOpen(true);
        setOrderInfo(e?.detail);
        setIsSupportOrder(true);
      });
    };
  }, [chatGroup]);

  useEffect(() => {
    if (!isEmpty(ref) && _width <= 600 && !isOpen) {
      ref.current.style.left = size.left + "px";
      ref.current.style.top = size.top + "px";

      ref.current.addEventListener(
        "touchstart",
        (e: any) => {
          e.stopImmediatePropagation();
          ref.current.style.transition = "unset";
        },
        false
      );

      ref.current.addEventListener("touchmove", (e: any) => {
        const touchLocation = e.targetTouches[0];
        ref.current.style.left = touchLocation.clientX - 20 + "px";
        ref.current.style.top = touchLocation.clientY - 20 + "px";
      });
      ref.current.addEventListener("touchend", (e: any) => {
        const left = parseFloat(ref.current.style.left.toString().slice(0, -2));
        const top = parseFloat(ref.current.style.top.toString().slice(0, -2));
        ref.current.style.transition = "all 0.3s";
        if (left > _width / 2) {
          ref.current.style.left = _width - 52 + "px";
        } else {
          ref.current.style.left = "0px";
        }

        if (top > _height - 52) {
          ref.current.style.top = _height - 52 + "px";
        }
        if (top < 0) {
          ref.current.style.top = "0px";
        }
        setSize({
          left: parseFloat(ref.current.style.left.toString().slice(0, -2)),
          top: parseFloat(ref.current.style.top.toString().slice(0, -2)),
        });
      });
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      checkOutSupport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  useEffect(() => {
    if (!isEmpty(orderInfo)) {
      window.addEventListener("locationchange", () => {
        setOrderInfo({});
        setIsSupportOrder(false);
      });
    }
    return () => {
      window.removeEventListener("locationchange", () => {});
    };
  }, [orderInfo]);
  const handleCloseTicket = () => {
    if (!isCloseTicket && socket && socket.readyState === 1) {
      socket.send(
        getSendMessage(
          JSON.stringify({
            type: TYPE_EVENT.REQUEST_VOTE,
            id: chatGroup?.id,
            rate: chatGroup?.customerRating,
            comment: chatGroup?.customerComment,
            closed: true,
          }),
          TYPE_MESSAGE.EVENT,
          `${chatGroup?.chatGroupId}`,
          `${chatGroup?.id}`
        )
      );
    }
  };

  const handleRestartChat = () => {
    setListMessage([]);
    setMessage("");
    setFileUploads([]);
    setType("info");
    setIsSupportOrder(false);
  };

  const handleDeleteFile = (idx: number) => {
    const result: some[] = fileUploads.filter(
      (v: some, i: number) => i !== idx
    );
    setFileUploads(result);
  };

  const scrollToBottom = () => {
    const chatBoxWrapper: any = document.querySelector(".bottom-chat-content");
    if (chatBoxWrapper) chatBoxWrapper.scrollIntoView();
  };

  const updateStatusMessage = (messages: some[], res: some) => {
    const temp: some[] = [];
    messages.forEach((element: some) => {
      if (`${element?.id}` === `${res?.content}`) {
        temp.push({ ...element, status: res?.contentType });
      } else {
        temp.push(element);
      }
    });
    return temp;
  };

  socket.onclose = (e: any) => {
    if (e?.code !== 1000 && e?.code !== 2001) reconnectWebSocket();
  };

  socket.onmessage = (e: any) => {
    const resFull = JSONbig.parse(e.data);
    const res = resFull?.body?.data || resFull?.body;
    const contentInfo = res?.content;
    if (
      resFull?.headers?.command === "sendCSGroupMessage" &&
      Object.values(TYPE_MESSAGE).includes(res?.contentType)
    ) {
      if (res?.contentType) {
        // console.log('tin nhắn mới do mình gửi đi', res);
        if (res?.contentType === TYPE_MESSAGE.EVENT) {
          const contentEvent = JSONbig.parse(res?.content);
          if (
            contentEvent?.type === TYPE_EVENT.REQUEST_VOTE ||
            contentEvent?.type === TYPE_EVENT.VOTED
          ) {
            setListMessage((messages: some[]) => [
              ...messages.filter(
                (v) =>
                  !(
                    v?.contentType === TYPE_MESSAGE.EVENT &&
                    v.content.includes(TYPE_EVENT.REQUEST_VOTE)
                  )
              ),
              res,
            ]);
            if (contentEvent?.closed) fetchCurrentTicket();
          } else setListMessage((messages: some[]) => [...messages, res]);
        } else if (
          res?.contentType !== STATUS_MESSAGE.TYPING &&
          res?.contentType !== STATUS_MESSAGE.STOPPED_TYPING
        ) {
          setListMessage((messages: some[]) => [...messages, res]);
        }
        if (contentInfo) setFileUploads([]);
        setMessage("");
        scrollToBottom();
      }
    } else if (resFull?.headers?.command === "messageArrived") {
      if (Object.values(TYPE_MESSAGE).includes(res?.contentType)) {
        // console.log('nhận được tin nhắn mới do người khác gửi', res);
        if (res?.contentType === TYPE_MESSAGE.EVENT) {
          const contentEvent = JSONbig.parse(res?.content);
          if (
            contentEvent?.type === TYPE_EVENT.ADD_MEMBER ||
            contentEvent?.type === TYPE_EVENT.REMOVE_MEMBER ||
            contentEvent?.type === TYPE_EVENT.WELCOME ||
            contentEvent?.type === TYPE_EVENT.NEW_TICKET ||
            contentEvent?.type === TYPE_EVENT.VOTED
          ) {
            fetchCurrentTicket();
          }
          if (contentEvent?.type !== TYPE_EVENT.NEW_TICKET) {
            if (
              contentEvent?.type === TYPE_EVENT.REQUEST_VOTE ||
              contentEvent?.type === TYPE_EVENT.VOTED
            ) {
              setListMessage((messages: some[]) => [
                ...messages.filter(
                  (v) =>
                    !(
                      v?.contentType === TYPE_MESSAGE.EVENT &&
                      v.content.includes(TYPE_EVENT.REQUEST_VOTE)
                    )
                ),
                res,
              ]);
              if (contentEvent?.closed) fetchCurrentTicket();
            } else setListMessage((messages: some[]) => [...messages, res]);
          } else setListMessage((messages: some[]) => [...messages, res]);
        } else {
          if (socket && socket.readyState === 1) {
            socket.send(
              getSendMessage(
                `${res?.id}`,
                STATUS_MESSAGE.DELIVERED,
                `${chatGroup?.chatGroupId}`,
                `${chatGroup?.id}`
              )
            );
          }
          setListMessage((messages: some[]) => [...messages, res]);
        }
        scrollToBottom();
      } else if (
        res?.contentType === STATUS_MESSAGE.TYPING ||
        res?.contentType === STATUS_MESSAGE.STOPPED_TYPING
      ) {
        setTyping(res?.contentType === STATUS_MESSAGE.TYPING);
      } else {
        // console.log('cập nhật trạng thái message', res, listMessage);
        setListMessage((messages: some[]) => [
          ...updateStatusMessage(messages, res),
        ]);
      }
    }
  };

  const handleSendMessage = () => {
    if (!isEmpty(fileUploads)) {
      if (socket && socket.readyState === 1) {
        fileUploads.forEach((it) => {
          socket.send(
            getSendMessage(
              JSON.stringify([it]),
              TYPE_MESSAGE.FILE,
              `${chatGroup?.chatGroupId}`,
              `${chatGroup?.id}`
            )
          );
        });
      }
    }
    if (!isEmpty(message.trim())) {
      if (socket && socket.readyState === 1)
        socket.send(
          getSendMessage(
            message.trim(),
            TYPE_MESSAGE.TEXT,
            `${chatGroup?.chatGroupId}`,
            `${chatGroup?.id}`
          )
        );
    }
  };

  const handleLike = (value: "like" | "dislike") => {
    setClosed("comment");
    setTypeLike(value);
  };

  const handleTyping = (typing: boolean) => {
    if (socket && socket.readyState === 1) {
      socket.send(
        getSendMessage(
          "",
          typing ? STATUS_MESSAGE.TYPING : STATUS_MESSAGE.STOPPED_TYPING,
          `${chatGroup?.chatGroupId}`,
          `${chatGroup?.id}`
        )
      );
    }
  };

  const handleSeen = () => {
    const messageId = !isEmpty(listMessage)
      ? `${
          !isEmpty(listMessage[listMessage.length - 1]?.id)
            ? listMessage[listMessage.length - 1]?.id
            : ""
        }`
      : `${!isEmpty(chatGroup?.startMsgId) ? chatGroup?.startMsgId : ""}`;
    if (
      socket &&
      socket.readyState === 1 &&
      !isEmpty(messageId) &&
      !isEmpty(chatGroup?.id)
    ) {
      socket.send(
        getSendMessage(
          `${messageId}`,
          STATUS_MESSAGE.SEEN,
          `${chatGroup?.chatGroupId}`,
          `${chatGroup?.id}`
        )
      );
    }
  };

  const renderDisconnected = () => {
    if (socket && socket.readyState === 0) {
      return (
        <Typography
          variant="body2"
          component="p"
          className="disconnected-text connecting-text"
        >
          <FormattedMessage id="IDS_CHAT_CONNECTING" />
        </Typography>
      );
    }
    if (isOnline) return null;
    return (
      <Typography variant="body2" component="p" className="disconnected-text">
        <FormattedMessage id="IDS_CHAT_DISCONNECTED" />
      </Typography>
    );
  };
  useEffect(() => {
    socket.addEventListener("message", (e: any) => {
      const resFull = JSON.parse(e.data);
      if (resFull.body?.contentType === TYPE_MESSAGE.VoIP_TRANSFER) {
        const contentData = JSON.parse(resFull?.body?.content);
        console.log("handleSignalForReceiver_main", chatGroup);
        if (contentData?.data) {
          const command = contentData?.command;
          if (command === "REQUEST_JOIN") {
            const data = contentData?.data;
            const payload: SignalTarget = data;
            if (payload.userToSignal + "" === chatGroup?.customerId + "") {
              console.log(
                `REQUEST_JOIN: Sender${payload?.callerID} --- Receiver: ${chatGroup?.customerId}`,
                data
              );
            } else {
              console.log(
                `Ignore command REQUEST_JOIN: Sender${payload?.callerID} --- Receiver: ${chatGroup?.customerId}`,
                data
              );
              return;
            }
            setReceiverInfoRequestJoin(payload);
            setOpenRequestCall(true);

            const _data: SignalTarget = {
              signal: data.signal,
              userToSignal: payload.callerID,
              callerID: chatGroup?.id,
            };
            socket.send(
              getSendMessage(
                JSON.stringify({
                  command: Signal.RING,
                  data: _data,
                }),
                TYPE_MESSAGE.VoIP_TRANSFER,
                `${payload?.ticket?.chatGroupId}`,
                `${payload?.ticket?.id}`
              )
            );
          }
        }
      }
    });
  }, [socket, chatGroup]);

  const handleRequestCall = async () => {
    console.log("handleRequestCall");

    const audioPermissions = await getAudioPermision();
    // const videoPermissions = await getVideoPermision();

    if (audioPermissions) {
      setOpenRequestCall(true);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="chat" onClick={handleSeen} aria-hidden="true">
          <div className="chat-content-container  ">
            <div className="chat-content">
              <div
                className="chat-header"
                style={{
                  backgroundColor: PRIMARY,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {(type === "welcome" || type === "info") && (
                  <>
                    {/* <MoreHorizontalIcon style={{ width: 24, height: 24 }} /> */}
                    <p className="header-text">
                      {formatMessage({ id: "IDS_CHAT_SUPPORT_CONSULTING" })}
                    </p>
                    <RuleHorizontalIcon
                      style={{
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                      }}
                      onClick={() => setOpen(false)}
                    />
                  </>
                )}
                {type === "chat" && (
                  <>
                    <Row style={{ margin: "6px 0", width: "100%" }}>
                      <Col
                        style={{
                          width: "100%",
                          fontSize: 14,
                          lineHeight: "17px",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {!isCloseTicket && (
                          <ChatClose openModal={() => setClosed("closed")} />
                        )}
                        {formatMessage({ id: "IDS_CHAT_SUPPORT_CONSULTING" })}
                      </Col>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          justifyItems: "center",
                        }}
                      >
                        {scriptSetting?.personalConfig?.voiceCall && (
                          <PhoneCallbackIcon
                            style={{
                              border: "1px solid #ccc",
                              cursor: "pointer",
                              borderRadius: "50%",
                              backgroundColor: BLUE_NAVY,
                            }}
                            onClick={() => handleRequestCall()}
                          />
                        )}
                        <RuleHorizontalIcon
                          style={{
                            width: 24,
                            height: 24,
                            cursor: "pointer",
                            marginLeft: 8,
                          }}
                          onClick={() => setOpen(false)}
                        />
                      </div>
                    </Row>
                  </>
                )}
              </div>
              {isOutSupport && isCloseTicket && type !== "info" ? (
                <div className="sub-header" style={{ backgroundColor: RED }}>
                  <Typography
                    variant="body2"
                    component="p"
                    style={{ paddingRight: 10, color: WHITE, fontSize: 14 }}
                  >
                    <FormattedMessage
                      id="IDS_CHAT_OUT_SUPPORT_MESSAGE"
                      values={{
                        from: moment(
                          scriptSetting?.activeTime[0]?.from,
                          "HH:mm:ss"
                        ).format("HH:mm"),
                        to: moment(
                          scriptSetting?.activeTime[0]?.to,
                          "HH:mm:ss"
                        ).format("HH:mm"),
                      }}
                    />
                  </Typography>
                  {renderDisconnected()}
                </div>
              ) : (
                type !== "info" && (
                  <div
                    className="sub-header"
                    style={{
                      backgroundColor:
                        (type === "chat" &&
                          isEmpty(chatGroup?.employee) &&
                          !isCloseTicket) ||
                        (isSupportOrder && !isEmpty(chatGroup?.employee)) ||
                        isOutSupport
                          ? RED
                          : WHITE,
                    }}
                  >
                    {isSupportOrder &&
                    !isEmpty(chatGroup?.id) &&
                    !isEmpty(orderInfo) ? (
                      <Typography
                        variant="body2"
                        component="p"
                        style={{
                          paddingRight: 10,
                          color: WHITE,
                          fontSize: 14,
                          lineHeight: "17px",
                          backgroundColor: RED,
                        }}
                      >
                        <FormattedMessage id="IDS_END_REQUEST" />
                      </Typography>
                    ) : isOutSupport ? (
                      <Typography
                        variant="body2"
                        component="p"
                        style={{
                          paddingRight: 10,
                          color: WHITE,
                          fontSize: 14,
                          backgroundColor: RED,
                        }}
                      >
                        <FormattedMessage
                          id="IDS_CHAT_OUT_SUPPORT_MESSAGE"
                          values={{
                            from: moment(
                              scriptSetting?.activeTime[0]?.from,
                              "HH:mm:ss"
                            ).format("HH:mm"),
                            to: moment(
                              scriptSetting?.activeTime[0]?.to,
                              "HH:mm:ss"
                            ).format("HH:mm"),
                          }}
                        />
                      </Typography>
                    ) : type === "chat" &&
                      isEmpty(chatGroup?.employee) &&
                      !isCloseTicket ? (
                      <Typography
                        variant="body2"
                        component="p"
                        style={{
                          paddingRight: 10,
                          color: WHITE,
                          fontSize: 14,
                          lineHeight: "17px",
                        }}
                      >
                        {channelId === MY_TOUR ? (
                          <FormattedMessage id="IDS_CHAT_CV_BUSY_MESSAGE_MYTOUR" />
                        ) : (
                          <FormattedMessage id="IDS_CHAT_CV_BUSY_MESSAGE" />
                        )}
                      </Typography>
                    ) : (
                      <Row style={{ margin: "6px 0", width: "100%" }}>
                        {users[`${chatGroup?.employee?.id}`]?.profilePhoto ? (
                          <img
                            src={
                              users[`${chatGroup?.employee?.id}`]?.profilePhoto
                            }
                            alt=""
                            style={{ maxWidth: 40, maxHeight: 40 }}
                          />
                        ) : (
                          <Box className="avatar-box">
                            {configureVnt?.channelId === MY_TOUR ? (
                              <>
                                <AvatarIconMyTour
                                  className="svgFill"
                                  style={{ fill: PRIMARY }}
                                />{" "}
                                <Box className="dot-online" />
                              </>
                            ) : (
                              <>
                                {" "}
                                <AvatarChatIcon />
                              </>
                            )}
                          </Box>
                        )}
                        <Col style={{ marginLeft: 12 }}>
                          <Typography
                            variant="body2"
                            component="p"
                            style={{
                              fontSize: 14,
                              lineHeight: "17px",
                              color: "#000000",
                              fontWeight: 600,
                            }}
                          >
                            {type === "chat"
                              ? users[`${chatGroup?.employee?.id}`]?.name ||
                                users[`${accountFree?.id}`]?.name ||
                                "Mytour CSKH"
                              : users[`${accountFree?.id}`]?.name ||
                                "Mytour CSKH"}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="p"
                            style={{
                              fontSize: 12,
                              lineHeight: "14px",
                              color: "#718096",
                            }}
                          >
                            <FormattedMessage id="IDS_CHAT_CV_CSKH" />
                          </Typography>
                        </Col>
                        <span
                          style={{
                            marginLeft: "auto",
                            whiteSpace: "nowrap",
                            display: "flex",
                            opacity: type === "chat" ? 1 : 0.5,
                          }}
                        >
                          <LikeIcon
                            style={{
                              cursor:
                                type === "chat" && !isCloseTicket
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                            onClick={() =>
                              type === "chat" &&
                              !isCloseTicket &&
                              handleLike("like")
                            }
                            className={`like-icon ${
                              isCloseTicket ? "disable-icon" : ""
                            } ${typeLike === "like" ? "active-icon" : ""} `}
                          />
                          <DislikeIcon
                            style={{
                              marginLeft: 8,
                              marginRight: 12,
                              cursor:
                                type === "chat" && !isCloseTicket
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                            onClick={() =>
                              type === "chat" &&
                              !isCloseTicket &&
                              handleLike("dislike")
                            }
                            className={`dislike-icon ${
                              isCloseTicket ? "disable-icon" : ""
                            } ${typeLike === "dislike" ? "active-icon" : ""} `}
                          />
                        </span>
                      </Row>
                    )}

                    {renderDisconnected()}
                  </div>
                )
              )}
              {type === "info" && detailConfigTeam?.isShowdescription && (
                <div style={{ backgroundColor: RED }}>
                  <Typography
                    variant="body2"
                    component="p"
                    style={{
                      padding: 10,
                      color: WHITE,
                      fontSize: 14,
                      lineHeight: "17px",
                    }}
                  >
                    {detailConfigTeam?.supportConfig?.description}
                  </Typography>
                </div>
              )}
              <div style={{ overflow: "auto", padding: "0", height: "100%" }}>
                {type === "welcome" && (
                  <ChatWelcome
                    accountFree={{
                      ...accountFree,
                      name: users[`${accountFree?.id}`]?.name,
                      profilePhoto: users[`${accountFree?.id}`]?.profilePhoto,
                    }}
                    chatGroup={chatGroup}
                    scriptSetting={scriptSetting}
                    socket={socket}
                    accountInfo={accountInfo}
                    fetchCurrentTicket={fetchCurrentTicket}
                    channelId={channelId}
                  />
                )}
                {type === "info" && (
                  <>
                    <ChatInfo
                      configureVnt={configureVnt}
                      channelId={channelId}
                      accountInfo={accountInfo}
                      valueForm={valueForm}
                      handleRegister={(group) => {
                        valueForm = {};
                        setChatGroup(group);
                        setTypeLike(
                          group?.customerRating === 1
                            ? "like"
                            : group?.customerRating === 0
                            ? "dislike"
                            : ""
                        );
                        if (isEmpty(users[`${group?.employee?.id}`]))
                          fetchAccountDetail([group?.employee?.id]);
                        setType("chat");
                      }}
                      handleUpdateForm={(value) => {
                        valueForm = { ...value };
                      }}
                      socket={socket}
                      scriptSetting={scriptSetting}
                      orderInfo={orderInfo}
                      setDetailConfigTeam={setDetailConfigTeam}
                      detailConfigTeam={detailConfigTeam}
                    />
                  </>
                )}
                {type === "chat" && !isEmpty(chatGroup) && (
                  <ChatContent
                    listMessage={listMessage}
                    setListMessage={setListMessage}
                    chatGroup={chatGroup}
                    socket={socket}
                    accountInfo={accountInfo}
                    handleRestartChat={handleRestartChat}
                    isTyping={isTyping}
                    users={users}
                    fetchCurrentTicket={fetchCurrentTicket}
                  />
                )}
              </div>
              <div className="chat-footer">
                <ChatInput
                  type={type}
                  fileUploads={fileUploads}
                  isCloseTicket={isCloseTicket}
                  message={message}
                  handleSendMessage={handleSendMessage}
                  handleTyping={handleTyping}
                  handleDeleteFile={handleDeleteFile}
                  setMessage={setMessage}
                  setFileUploads={setFileUploads}
                  setType={setType}
                  setIsSupportOrder={setIsSupportOrder}
                  isHidden={
                    !scriptSetting?.extra?.forceVote ||
                    !isEmpty(chatGroup?.customerRating) ||
                    isEmpty(chatGroup)
                  }
                />
              </div>

              {isClosed !== "" && (
                <ChatDialog
                  handleClose={() => {
                    setClosed("");
                    setTypeLike("");
                    if (
                      chatGroup?.bookingId?.toString() ===
                        orderInfo?.id?.toString() &&
                      !isEmpty(chatGroup?.bookingId)
                    ) {
                      setOrderInfo({});
                      setIsSupportOrder(false);
                    }
                    fetchCurrentTicket();
                  }}
                  chatGroup={chatGroup}
                  handleSuccess={handleCloseTicket}
                  type={isClosed}
                  typeLike={typeLike}
                  socket={socket}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {_width >= 600 ? (
            <div className="chat-hidden">
              {configureVnt?.channelId === MY_FRESH_CHANNEL ? (
                <ChatWidgetMyFresh
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              ) : configureVnt?.channelId === MY_TABLE_CHANNEL ? (
                <ChatWidgetMyTable
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              ) : configureVnt?.channelId === TRIPI_ONE_CHANNEL ? (
                <ChatWidgetTripiOne
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              ) : configureVnt?.channelId === MYTOUR_EVENT ? (
                <ChatWidgetMytourEvent
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              ) : configureVnt?.channelId === MY_TOUR ||
                configureVnt?.channelId === DINOGO_IO ||
                configureVnt?.channelId === DINOGO_COM ? (
                <div
                  className="chat-hidden-header"
                  onClick={() => setOpen(true)}
                  aria-hidden="true"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <p className="header-hidden-text">
                    {formatMessage({ id: "IDS_CHAT_SUPPORT_CONSULTING" })}
                  </p>
                  <RuleHorizontalIcon
                    style={{ width: 24, height: 24, cursor: "pointer" }}
                  />
                </div>
              ) : (
                <ChatWidgetIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpen(true)}
                />
              )}
            </div>
          ) : (
            <div
              className="mobile-chat-container"
              style={{ backgroundColor: PRIMARY, touchAction: "none" }}
              onClick={() => setOpen(true)}
              ref={ref}
            >
              <MoreIcon />
              <Typography
                variant="body2"
                style={{ fontSize: 10, lineHeight: "12px", fontWeight: 600 }}
              >
                {formatMessage({ id: "IDS_CHAT_SUPPORT" })}
              </Typography>
            </div>
          )}
        </>
      )}
      {openRequestCall && (
        <ChatVoiceSimmplePeer
          open={openRequestCall}
          socket={socket}
          ticket={chatGroup}
          receiverInfoRequestJoin={receiverInfoRequestJoin}
          setReceiverInfoRequestJoin={(r) => setReceiverInfoRequestJoin(r)}
          setOpenRequestCall={(open) => setOpenRequestCall(open)}
        />
      )}
    </>
  );
};
export default Chats;
