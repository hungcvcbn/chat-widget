import React, { useState, useEffect } from 'react';
import JSONbig from 'json-bigint';
import moment, { Moment } from 'moment';
import DescriptionIcon from '@mui/icons-material/Description';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  GREEN,
  GREEN_300,
  GREY_100,
  GREY_600,
  GREY_900,
  WHITE,
} from '../assets/colors';
import { ReactComponent as AvatarChatIcon } from '../assets/icons/ic_avatar_chat.svg';
import {
  DATE_FORMAT_ALL,
  HOUR_MINUTE,
  some,
  TYPE_MESSAGE,
  TYPE_EVENT,
  ACCOUNT,
  SUCCESS_CODE,
  MY_TOUR,
} from '../utils/constants';
import { formatBytes, getConfig, isEmpty } from '../utils/helpers';
import { Row } from '../common/Elements';
import ChatEvaluate from './ChatEvaluate';
import { apiGetUserAvatarInfo } from '../api/apiTicket';
import ChatCustomerInfo from './ChatCustomerInfo';
import WelcomeMessage from './WelcomeMessage';
import { Avatar } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

interface Props {
  align: 'left' | 'right';
  item: some;
  isLast: boolean;
  isFirst: boolean;
  chatGroup: some;
  socket: any;
  accountInfo: some;
  fetchCurrentTicket: () => void;
}
const ChatItem: React.FC<Props> = (props) => {
  const {
    align,
    item,
    isLast,
    isFirst,
    chatGroup,
    socket,
    accountInfo,
    fetchCurrentTicket,
  } = props;
  const [users, setUsers] = useState<some>(
    JSONbig.parse(localStorage.getItem(ACCOUNT) || '{}')
  );
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const configureVnt = getConfig();
  const { formatMessage } = useIntl();

  const getTime = (timeInfo: string | number) => {
    const time: Moment = moment(new Date(timeInfo));
    if (time.isSame(moment(), 'days')) return time.format(HOUR_MINUTE);
    return time.format(DATE_FORMAT_ALL);
    // return new Date(timeInfo).toLocaleString('en-US');
  };
  const getAccountDetail = async (userId: Array<string | number>) => {
    try {
      const res: some = await apiGetUserAvatarInfo(userId);
      if (res?.code === SUCCESS_CODE) {
        let temp: some = { ...users };
        (res?.data?.items || []).forEach((userItem: some) => {
          temp = { ...users, [userItem?.id]: userItem };
        });
        localStorage.setItem(ACCOUNT, JSONbig.stringify(temp));
        setUsers(temp);
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', (e: any) => {
        const resFull = JSONbig.parse(e.data);
        const res = resFull?.body?.data || resFull?.body;
        if (resFull?.headers?.command === "messageArrived") {
          if (res?.contentType === 'NOTIFICATION') {
            try {
              const messageUpdate = JSONbig.parse(resFull?.body?.content);
              if (messageUpdate?.type === "UPDATED_MESSAGE") {
                if (`${item?.id}` === `${messageUpdate?.data?.id}`) {
                  setNewMessage(messageUpdate?.data?.content);
                }
              }
            } catch (error) {

            }
          }
        }
      });
    }
  }, [socket]);
  const renderContent = () => {
    if (item?.contentType === TYPE_MESSAGE.TEXT) {
      return (
        <>
          <Typography
            variant="body2"
            style={{
              backgroundColor: align === 'left' ? GREY_100 : configureVnt.channelId === MY_TOUR ? "rgb(0, 182, 243)" : GREEN,
              color: align === 'left' ? GREY_900 : WHITE,
              maxWidth: 'calc(100% - 60px)',
              marginLeft: 36,
              padding: '8px 12px',
              borderRadius: 8,
              wordBreak: 'break-word',
              fontSize: 14,
              whiteSpace: 'pre-line',
            }}
          >
            {newMessage || item?.content}
          </Typography>
          {(!isEmpty(item?.lastEdited) || !isEmpty(newMessage)) &&
            <EditOutlinedIcon style={{ fontSize: 15 }} />
          }
        </>
      );
    }
    if (item?.contentType === TYPE_MESSAGE.FILE) {
      const contentMessage: some[] = JSON.parse(item?.content);
      return (
        <Row
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: align === 'left' ? 'flex-start' : 'flex-end',
            marginLeft: align === 'left' ? 36 : 0,
          }}
        >
          {!isEmpty(contentMessage) &&
            contentMessage.map((el: some, i: number) => {
              if (el?.contentType && el?.url) {
                const isImage = el?.contentType.toLowerCase().includes('image');
                if (isImage) {
                  return (
                    <a
                      href={el.url}
                      download={el?.fileName || el?.url.split('/').pop()}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={el?.url}
                    >
                      <img
                        alt=""
                        src={
                          el?.extension
                            ? el?.extension?.thumbnailUrl?.url
                            : el?.url
                        }
                        style={{
                          width: '100%',
                          maxWidth: 280,
                          marginBottom: 4,
                        }}
                      />
                    </a>
                  );
                } else if (el?.url) {
                  return (
                    <a
                      key={el.url}
                      href={el.url}
                      target="_blank"
                      download={el?.fileName || el?.url.split('/').pop()}
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Row
                        style={{
                          marginTop: 4,
                          padding: '0 4px',
                          borderRadius: 12,
                          backgroundColor:
                            align === 'left' ? GREY_100 : configureVnt.channelId === MY_TOUR ? "rgb(0, 182, 243)" : GREEN,
                          color: align === 'left' ? GREY_900 : WHITE,
                        }}
                      >
                        <DescriptionIcon
                          style={{
                            width: 80,
                            height: 80,
                            color: align === 'left' ? GREY_600 : GREY_100,
                          }}
                        />
                        <Row
                          style={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={el?.fileName || el?.url.split('/').pop()}
                          >
                            {el?.fileName || el?.url.split('/').pop()}
                          </span>
                          {el.size && <span>{formatBytes(el.size)}</span>}
                        </Row>
                      </Row>
                    </a>
                  );
                }
              }
            })}
        </Row>
      );
    }
    if (item?.contentType === TYPE_MESSAGE.EVENT) {
      const contentEvent = JSONbig.parse(item?.content);
      if (contentEvent?.type === TYPE_EVENT.REQUEST_VOTE) {
        return (
          <ChatEvaluate
            chatGroup={chatGroup}
            socket={socket}
            item={contentEvent}
            messageId={`${item?.id}`}
            fetchCurrentTicket={fetchCurrentTicket}
          />
        );
      }
      if (contentEvent?.type === TYPE_EVENT.VOTED) {
        return (
          <ChatEvaluate
            chatGroup={chatGroup}
            socket={socket}
            isVoted
            item={contentEvent}
            messageId={`${item?.id}`}
            fetchCurrentTicket={fetchCurrentTicket}
          />
        );
      }
      if (
        contentEvent?.type === TYPE_EVENT.ADD_MEMBER ||
        contentEvent?.type === TYPE_EVENT.REMOVE_MEMBER ||
        contentEvent?.type === TYPE_EVENT.WELCOME
      ) {
        let text: string = '';
        const totalUserItem: Array<string | number> = [
          ...contentEvent?.controlled,
        ];
        const temp = totalUserItem.filter((u: string | number) =>
          isEmpty(users[`${u}`])
        );
        if (!isEmpty(temp)) getAccountDetail(temp);
        const tempControlled = contentEvent?.controlled.map(
          (v: string | number) => users[`${v}`]?.name
        );
        if (contentEvent?.type === TYPE_EVENT.WELCOME) {
          return (
            <WelcomeMessage
              employeeName={tempControlled.join(', ')}
              accountInfo={accountInfo}
              timestamp={item?.createdTime}
              avatarUrl={users[`${contentEvent?.controlled[0]}`]?.profilePhoto}
            />
          );
        }
        text =
          contentEvent?.type === TYPE_EVENT.ADD_MEMBER
            ? `${tempControlled.join(', ')} ${formatMessage({ id: 'IDS_CHAT_ADD_MEMBER' })}`
            : `${tempControlled.join(', ')} ${formatMessage({ id: 'IDS_CHAT_REMOVE_MEMBER' })}`;
        return (
          <Typography
            variant="body2"
            component="p"
            style={{
              color: GREY_600,
              width: '100%',
              textAlign: 'center',
              margin: 12,
            }}
          >
            {text}
          </Typography>
        );
      }
      if (contentEvent?.type === TYPE_EVENT.NEW_TICKET) {
        return (
          <ChatCustomerInfo
            item={contentEvent?.data}
            accountInfo={accountInfo}
          />
        );
      }
      return null;
    }
    return null;
  };
  if (align === 'left' && item?.contentType !== TYPE_MESSAGE.EVENT) {
    if (isEmpty(users[`${item?.sender?.id}`]))
      getAccountDetail([item?.sender?.id]);
    return (
      <>
        {isFirst ? (
          <Row style={{ marginBottom: 4 }}>
            {users[`${item?.sender?.id}`]?.profilePhoto ? (
              <Avatar
                src={users[`${item?.sender?.id}`]?.profilePhoto}
                alt=""
                style={{ maxWidth: 24, maxHeight: 24 }}
              />
            ) : (
              <AvatarChatIcon />
            )}
            <Typography
              variant="body2"
              style={{ marginLeft: 4, color: GREY_600, fontSize: 14 }}
            >
              {users[`${item?.sender?.id}`]?.name}
              &nbsp;
              {getTime(item?.createdTime)}
            </Typography>
          </Row>
        ) : (
          <Row style={{ marginBottom: 4 }} />
        )}
        <Row style={{ marginBottom: 2 }}>{renderContent()}</Row>
      </>
    );
  }


  return (
    <>
      {isFirst ? (
        <Row style={{ marginBottom: 4, justifyContent: 'flex-end' }}>
          <Typography
            variant="body2"
            style={{ marginLeft: 6, color: GREY_600 }}
          >
            {getTime(Number(item?.createdTime))}
          </Typography>
        </Row>
      ) : (
        <Row style={{ marginBottom: 4, justifyContent: 'flex-end' }} />
      )}
      <Row style={{ justifyContent: 'flex-end' }}>{renderContent()}</Row>
      {!isEmpty(item) && isLast && item?.contentType !== TYPE_MESSAGE.EVENT && (
        <Row style={{ marginBottom: 4, justifyContent: 'flex-end' }}>
          <Typography
            variant="body2"
            style={{ marginLeft: 4, color: GREY_600 }}
          >
            <FormattedMessage
              id={`IDS_CHAT_${item?.status === 'SEEN'
                ? 'DELIVERED'
                : item?.status || 'DELIVERED'
                }`}
            />
          </Typography>
        </Row>
      )}
    </>
  );
};

export default ChatItem;
