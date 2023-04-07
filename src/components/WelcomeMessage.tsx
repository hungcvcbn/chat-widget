import Typography from '@mui/material/Typography';
import moment, { Moment } from 'moment';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { GREY_100, GREY_600 } from '../assets/colors';
import { Row } from '../common/Elements';
import { DATE_FORMAT_ALL, HOUR_MINUTE, some } from '../utils/constants';
// import { ReactComponent as HandIcon } from '../assets/icons/ic_hand.svg'
// import { ReactComponent as AvatarChatIcon } from '../assets/icons/ic_avatar_chat.svg'
import { Box } from '@mui/material';
import { AvatarIconMyTour, HandIcon } from '../assets/iconMytour/icons';

interface Props {
  accountInfo: some;
  employeeName: string;
  timestamp?: number;
  avatarUrl?: string | null;
}
const WelcomeMessage: React.FC<Props> = (props) => {
  const { accountInfo, employeeName, timestamp, avatarUrl } = props;
  const getTime = () => {
    const time: Moment = timestamp ? moment(new Date(timestamp)) : moment();
    if (time.isSame(moment(), 'days')) return time.format(HOUR_MINUTE);
    return time.format(DATE_FORMAT_ALL);
  };
  return (
    <Row
      style={{
        marginBottom: 12,
        marginTop:6,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Row>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ maxWidth: 24, maxHeight: 24 }} />
        ) : (
          <AvatarIconMyTour />
        )}
        <Typography
          variant="body2"
          style={{ marginLeft: 4, color: GREY_600, fontSize: 14 }}
        >
          {employeeName || ''}
          &nbsp;
          {getTime()}
        </Typography>
      </Row>
      <Row
        style={{
          marginBottom: 12,
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box
          style={{
            backgroundColor: GREY_100,
            maxWidth: 'calc(100% - 60px)',
            marginLeft: 36,
            padding: '8px 12px',
            borderRadius: 8,
          }}
        >
          <HandIcon style={{ marginBottom: 8 }} />
          <Typography
            variant="body2"
            component="p"
            style={{ fontSize: 14, lineHeight: '17px' }}
          >
            <FormattedMessage
              id="IDS_CHAT_WELCOME"
              values={{
                customerName: accountInfo?.name || 'Quý khách',
                b: (customerName: any) => <b>{customerName}</b>,
              }}
            />
            <br />
            <FormattedMessage
              id="IDS_CHAT_WELCOME_MESSAGE"
              values={{
                name: employeeName || '',
                b: (name: any) => <b>{name}</b>,
              }}
            />
          </Typography>
        </Box>
      </Row>
    </Row>
  );
};

export default WelcomeMessage;
