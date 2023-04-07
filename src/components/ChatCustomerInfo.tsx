import {
  default as Divider,
  default as Paper,
  default as Typography,
} from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from '../common/Elements';
import { MY_TOUR, some } from '../utils/constants';
import { getConfig } from '../utils/helpers';

interface Props {
  item: some;
  accountInfo: some;
}

const ChatCustomerInfo: React.FC<Props> = (props) => {
  const { item, accountInfo } = props;

  const configureVnt = getConfig();

  return (
    <>
      {configureVnt?.channelId === MY_TOUR ? (
        <Paper
          className="chat-evaluate support-info"
          style={{ boxShadow: 'none', borderRadius:8}}
        >
          <Typography
            variant="body2"
            className="title-box"
            style={{ textAlign: 'left' }}
          >
            <FormattedMessage id="IDS_CHAT_CONTENT_SUPPORT" />
          </Typography>
          <Typography variant="body2" className="title-item">
            <FormattedMessage id="IDS_CHAT_SUPPORT_CONTENT" />
          </Typography>
          <Typography variant="body2" style={{ marginBottom: 8, fontSize: 14 }}>
            {item?.teamName}
          </Typography>
          {/* <Typography variant="body2" className="title-item">
         <FormattedMessage id="IDS_CHAT_CONTENT_REQUIRE" />
       </Typography>
       <Typography variant="body2" style={{ marginBottom: 8, fontSize: 14 }}>
         {item?.customerContentRequest}
       </Typography> */}
          <Divider
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', height: 1 }}
          />
          <Row style={{ marginTop: 8 }}>
            <Col style={{ width: '100%' }}>
              <Typography variant="body2" className="title-item">
                {item?.customerTitle ||
                  (accountInfo?.gender === 'M' ? 'Anh' : 'Anh/Chị')}
              </Typography>
              <Typography
                variant="body2"
                className="text-content"
                title={item?.customerName || accountInfo?.name}
              >
                {item?.customerName || accountInfo?.name}
              </Typography>
              <Typography variant="body2" className="title-item">
                <FormattedMessage id="IDS_CHAT_PHONE_NUMBER" />
              </Typography>
              <Typography
                variant="body2"
                className="text-content"
                title={item?.customerPhone || accountInfo?.phone}
              >
                {item?.customerPhone || accountInfo?.phone}
              </Typography>
            </Col>
            {/* <Col style={{ width: "50%" }}>
           <Typography variant="body2" className="title-item">
             <FormattedMessage id="IDS_CHAT_ID_AGENCY" />
           </Typography>
           <Typography
             variant="body2"
             className="text-content"
             title={item?.agencyId || `${accountInfo?.id || ""}`}
           >
             {item?.agencyId || `${accountInfo?.id || ""}`}
           </Typography>
           <Typography variant="body2" className="title-item">
             <FormattedMessage id="IDS_CHAT_EMAIL" />
           </Typography>
           <Typography
             variant="body2"
             className="text-content"
             title={item?.customerEmail || accountInfo?.emailInfo}
           >
             {item?.customerEmail || accountInfo?.emailInfo}
           </Typography>
         </Col> */}
          </Row>
        </Paper>
      ) : (
        <Paper
          className="chat-evaluate support-info"
          style={{ boxShadow: 'none' }}
        >
          <Typography
            variant="body2"
            className="title-box"
            style={{ textAlign: 'left' }}
          >
            <FormattedMessage id="IDS_CHAT_CONTENT_SUPPORT" />
          </Typography>
          <Typography variant="body2" className="title-item">
            <FormattedMessage id="IDS_CHAT_SUPPORT_CONTENT" />
          </Typography>
          <Typography variant="body2" style={{ marginBottom: 8, fontSize: 14 }}>
            {item?.teamName}
          </Typography>
          <Typography variant="body2" className="title-item">
            <FormattedMessage id="IDS_CHAT_CONTENT_REQUIRE" />
          </Typography>
          <Typography
            variant="body2"
            style={{ marginBottom: 8, fontSize: 14, whiteSpace: 'pre-line' }}
          >
            {item?.customerContentRequest}
          </Typography>
          <Divider />
          <Row style={{ marginTop: 8 }}>
            <Col style={{ width: '50%' }}>
              <Typography variant="body2" className="title-item">
                {item?.customerTitle ||
                  (accountInfo?.gender === 'M' ? 'Anh' : 'Chị')}
              </Typography>
              <Typography
                variant="body2"
                className="text-content"
                title={item?.customerName || accountInfo?.name}
              >
                {item?.customerName || accountInfo?.name}
              </Typography>
              <Typography variant="body2" className="title-item">
                <FormattedMessage id="IDS_CHAT_PHONE_NUMBER" />
              </Typography>
              <Typography
                variant="body2"
                className="text-content"
                title={item?.customerPhone || accountInfo?.phone}
              >
                {item?.customerPhone || accountInfo?.phone}
              </Typography>
            </Col>
            <Col style={{ width: '50%' }}>
              {/* <Typography variant="body2" className="title-item">
            <FormattedMessage id="IDS_CHAT_ID_AGENCY" />
          </Typography> */}
              {/* <Typography
            variant="body2"
            className="text-content"
            title={item?.agencyId || `${accountInfo?.id || ''}`}
          >
            {item?.agencyId || `${accountInfo?.id || ''}`}
          </Typography> */}
              <Typography variant="body2" className="title-item">
                <FormattedMessage id="IDS_CHAT_EMAIL" />
              </Typography>
              <Typography
                variant="body2"
                className="text-content"
                style={{overflow:'hidden'}}
                title={item?.customerEmail || accountInfo?.emailInfo}
              >
                {item?.customerEmail || accountInfo?.emailInfo}
              </Typography>
            </Col>
          </Row>
        </Paper>
      )}
    </>
  );
};

export default ChatCustomerInfo;
