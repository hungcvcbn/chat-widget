import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import bigInt from 'big-integer';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FormattedMessage } from 'react-intl';
import { apiGetMessages } from '../api/apiTicket';
import '../assets/Chat.scss';
import { ORANGE, PRIMARY, WHITE } from '../assets/colors';
import { Col, Row } from '../common/Elements';
import JSONbig from 'json-bigint';
import {
  PAGE_SIZE,
  some,
  SUCCESS_CODE,
  TYPE_EVENT,
  TYPE_MESSAGE,
  UUID,
} from '../utils/constants';
import { isEmpty } from '../utils/helpers';
import ChatItem from './ChatItem';

interface Props {
  listMessage: some[];
  chatGroup: some;
  socket: any;
  accountInfo: some;
  isTyping: boolean;
  users: some;
  fetchCurrentTicket: () => void;
  handleRestartChat: () => void;
  setListMessage: (v: some[]) => void;
}

const ChatContent: React.FC<Props> = (props) => {
  const {
    listMessage,
    chatGroup,
    socket,
    accountInfo,
    handleRestartChat,
    fetchCurrentTicket,
    setListMessage
  } = props;
  const [isLoadingMoreMsg, setLoadMoreMsg] = useState<boolean>(true);
  const [historyMessage, setHistoryMessage] = useState<some[]>([]);

  const fetchMessages = async (
    startMessageId?: string,
    endMessageId?: string
  ) => {
    if (!isEmpty(chatGroup?.chatGroupId)) {
      try {
        const res: some = await apiGetMessages({
          page: 0,
          pageSize: PAGE_SIZE,
          chatGroupId: `${chatGroup?.chatGroupId}`,
          startMessageId,
          endMessageId,
        });
        if (res?.code === SUCCESS_CODE) {
          const historyMsg: some[] = res?.data?.items || [];
          // console.log('historyMsg', historyMsg);
          if (historyMsg.length < PAGE_SIZE) setLoadMoreMsg(false);
          const tempHistory: some[] = historyMsg.filter((v: some) => {
            return (
              !v?.content.includes(TYPE_EVENT.REQUEST_VOTE) &&
              // v?.contentType !== TYPE_MESSAGE.VoIP_CONTENT &&
              !v?.content.includes('RING')
            );
          });
          // console.log('tempHistory', tempHistory);
          setHistoryMessage([...tempHistory, ...historyMessage]);
        }
      } catch (error) { }
    }
  };

  const clearHistory = () => {
    setHistoryMessage([]);
    fetchMessages();
  };

  useEffect(() => {
    clearHistory();
    // eslint-disable-next-line
  }, [socket]);

  const scrollToBottom = () => {
    const chatBoxWrapper: any = document.querySelector('.bottom-chat-content');
    if (chatBoxWrapper) {
      chatBoxWrapper.scrollIntoView();
    }
  };
  useEffect(() => {
    if (historyMessage.length <= 15) scrollToBottom();
    // eslint-disable-next-line
  }, [historyMessage]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const tempHistory = historyMessage.filter(
    (v: some) =>
      !(
        v?.contentType === TYPE_MESSAGE.EVENT &&
        v.content.includes(TYPE_EVENT.REQUEST_VOTE)
      ) && !listMessage.find((u: some) => `${u?.id}` === `${v?.id}`)
  );
  const allMessage = [...tempHistory, ...listMessage];



  return (
    <>
      <div className="chat-content-box">
        <InfiniteScroll
          isReverse
          initialLoad={false}
          pageStart={0}
          loadMore={() => {
            fetchMessages(
              !isEmpty(historyMessage)
                ? `${bigInt(historyMessage[0]?.id).minus(1)}`
                : undefined
            );
          }}
          hasMore={isLoadingMoreMsg}
          loader={<div className="loader" key={0} />}
          useWindow={false}
        >
          <div style={{ margin: '12px 9px', marginTop: 72 }}>
            {!isEmpty(allMessage) &&
              allMessage.map((item: some, idx: number) => {
                const senderIDBefore = allMessage[idx - 1]?.sender?.id;
                const senderID = item?.sender?.id;
                const alignType =
                  `${senderID}` === `${accountInfo?.id}` ||
                    `${senderID}` === localStorage.getItem(UUID)
                    ? 'right'
                    : 'left';
                return (
                  <ChatItem
                    align={alignType}
                    item={item}
                    key={item?.id}
                    isLast={idx === allMessage.length - 1}
                    isFirst={
                      senderID !== senderIDBefore ||
                      idx === 0 ||
                      allMessage[idx - 1]?.contentType === TYPE_MESSAGE.EVENT
                    }
                    chatGroup={chatGroup}
                    socket={socket}
                    accountInfo={accountInfo}
                    fetchCurrentTicket={fetchCurrentTicket}
                  />
                );
              })}

            {!chatGroup?.id &&
              (!allMessage.find((v: some) =>
                v.content.includes(TYPE_EVENT.REQUEST_VOTE)
              ) ||
                !isEmpty(chatGroup?.customerRating)) && (
                <Button
                  style={{
                    width: "100%",
                    height: 36,
                    backgroundColor: PRIMARY,
                    margin: "12px 0px",
                  }}
                  variant="contained"
                  color="secondary"
                  disableElevation
                  onClick={() => {
                    setHistoryMessage([]);
                    handleRestartChat();
                  }}
                >
                  <Typography variant="subtitle2" style={{ textTransform: 'none' }}>
                    <FormattedMessage id="IDS_CHAT_START_AGAIN" />
                  </Typography>
                </Button>
              )}
            {/* {isTyping && (
              <div style={{ fontSize: 14, color: GREY_600, display: 'flex' }}>
                {users[`${chatGroup?.employee?.id}`]?.name}
                &nbsp;is typing&nbsp;
                <div className="dot-pulse" />
              </div>
            )} */}
          </div>
        </InfiniteScroll>
        <div className="bottom-chat-content" />
      </div>
    </>
  );
};

export default ChatContent;
