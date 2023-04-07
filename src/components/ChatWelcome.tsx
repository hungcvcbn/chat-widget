import { Typography } from '@mui/material';
import bigInt from 'big-integer';
import JSONbig from 'json-bigint';
import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FormattedMessage, useIntl } from 'react-intl';
import { apiGetMessages } from '../api/apiTicket';
import { CustomerServiceIcon } from '../assets/iconMytour/icons';
import {
  MY_TOUR,
  PAGE_SIZE,
  some,
  SUCCESS_CODE,
  TYPE_EVENT,
  TYPE_MESSAGE,
  UUID,
} from '../utils/constants';
import { isEmpty } from '../utils/helpers';
import ChatEvaluate from './ChatEvaluate';
import ChatItem from './ChatItem';
import WelcomeMessage from './WelcomeMessage';

interface Props {
  accountFree: some;
  chatGroup: some;
  socket: any;
  accountInfo: some;
  fetchCurrentTicket: () => void;
  scriptSetting: any;
  channelId: string | number;
}
let count = 0;
const ChatWelcome: React.FC<Props> = (props) => {
  const {
    accountFree,
    chatGroup,
    socket,
    accountInfo,
    fetchCurrentTicket,
    scriptSetting,
    channelId,
  } = props;
  const [isLoadingMoreMsg, setLoadMoreMsg] = useState<boolean>(true);
  const [historyMessage, setHistoryMessage] = useState<some[]>([]);

  const divRef: any = useRef();
  const { formatMessage } = useIntl();

  const fetchMessages = async (
    startMessageId?: string,
    endMessageId?: string
  ) => {
    count = count + 1;
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
          if (historyMsg.length < PAGE_SIZE) setLoadMoreMsg(false);
          else {
            setLoadMoreMsg(true);
          }
          const tempHistory: some[] = historyMsg.filter((v: some) => {
            return (
              !v?.content.includes(TYPE_EVENT.REQUEST_VOTE) &&
              v?.contentType !== TYPE_MESSAGE.VoIP_CONTENT &&
              !v?.content.includes('RING')
            );
          });
          setHistoryMessage([...tempHistory, ...historyMessage]);
        }
      } catch (error) {}
    }
  };
  const clearHistory = () => {
    setHistoryMessage([]);
    fetchMessages();
  };
  const handleCloseTicketSuccess = (check: boolean) => {
    if (check) {
      // clearHistory();
    }
  };
  useEffect(() => {
    clearHistory(); // eslint-disable-next-line
  }, [accountInfo]);

  useEffect(() => {
    if (divRef && count <= 2) {
      divRef?.current?.scrollIntoView({});
    }
  }, [historyMessage, count]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', (e: any) => {
        const resFull = JSONbig.parse(e.data);
        const res = resFull?.body?.data || resFull?.body;
        const contentInfo = JSONbig.parse(res?.content);

        if (
          resFull?.headers?.command === 'sendCSGroupMessage' &&
          contentInfo?.type === TYPE_EVENT.VOTED
        ) {
          setHistoryMessage([...historyMessage, res]);
        }
      });
    }
  }, [socket]);

  const getAccountName = () =>
    accountFree?.name || (channelId === MY_TOUR ? 'Mytour CSKH' : 'Tripi CSKH');
  return (
    <>
      {!isEmpty(historyMessage) ? (
        <div className="chat-content-box">
          <InfiniteScroll
            isReverse
            initialLoad
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
            <div style={{ margin: '12px 0', marginTop: 72 }}>
              {!isEmpty(chatGroup) &&
                !isEmpty(historyMessage) &&
                historyMessage.map((item: some, idx: number) => {
                  const senderIDBefore = historyMessage[idx - 1]?.sender?.id;

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
                      isLast={idx === historyMessage.length - 1}
                      isFirst={
                        senderID !== senderIDBefore ||
                        idx === 0 ||
                        historyMessage[idx - 1]?.contentType ===
                          TYPE_MESSAGE.EVENT
                      }
                      chatGroup={chatGroup}
                      socket={socket}
                      accountInfo={accountInfo}
                      fetchCurrentTicket={fetchCurrentTicket}
                    />
                  );
                })}
              {scriptSetting?.extra?.forceVote &&
              isEmpty(chatGroup?.customerRating) &&
              !isEmpty(chatGroup) ? (
                <ChatEvaluate
                  chatGroup={chatGroup}
                  socket={socket}
                  item={{
                    id: chatGroup?.lastTicketId,
                    rate: 1,
                    type: 'VOTED',
                  }}
                  messageId={`${
                    historyMessage[historyMessage?.length - 1]?.id
                  }`}
                  fetchCurrentTicket={fetchCurrentTicket}
                  handleCloseTicketSuccess={handleCloseTicketSuccess}
                />
              ) : (
                // <></>
                <>
                  <WelcomeMessage
                    accountInfo={accountInfo}
                    employeeName={getAccountName()}
                    avatarUrl={accountFree?.profilePhoto}
                  />
                </>
              )}
            </div>
          </InfiniteScroll>
          {/* <div className="bottom-chat" /> */}
          <div ref={divRef} />
        </div>
      ) : (
        <div className="chat-content-box empty-content-welcome">
          <CustomerServiceIcon style={{ marginBottom: 24 }} />
          <Typography
            variant="body2"
            component="p"
            style={{ fontSize: 14, lineHeight: '22px' }}
          >
            <FormattedMessage
              id="IDS_CHAT_WELCOME"
              values={{
                customerName: accountInfo?.name || formatMessage({id:'IDS_CHAT_CUSTOMER'}),
                b: (customerName: any) => <b>{customerName}</b>,
              }}
            />
            {/* &nbsp;
          <b>{accountInfo?.name || "Quý khách"}!</b> */}
            <br />
            <span>
              {formatMessage({id:'IDS_CHAT_I_AM'})} <b>{getAccountName() || 'Mytour CSKH'}</b>,
              {formatMessage({ id: 'IDS_CHAT_WELCOM_DESCRIPTION' })}
            </span>
          </Typography>
        </div>
      )}
    </>
  );
};

export default ChatWelcome;
