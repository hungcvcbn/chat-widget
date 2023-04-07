import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { apiCloseTicket, apiVoteTicket } from '../api/apiTicket'
import { PRIMARY } from '../assets/colors'
import FormControlTextField from '../common/FormControlTextField'
import LoadingButton from '../common/LoadingButton'
import {
  some,
  SUCCESS_CODE,
  TYPE_EVENT,
  TYPE_MESSAGE
} from '../utils/constants'
import { getSendMessage } from '../utils/helpers'

interface Props {
  chatGroup: some;
  handleClose: () => void;
  handleSuccess: () => void;
  type: 'closed' | 'comment';
  typeLike: 'like' | 'dislike' | '';
  socket: any;
}

const ChatDialog: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { chatGroup, handleClose, handleSuccess, type, typeLike, socket } =
    props;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [customerComment, setComment] = React.useState<string>('');
  const onSubmit = async () => {
    try {
      setLoading(true);
      if (type === 'closed') {
        handleSuccess();
        const res: some = await apiCloseTicket({
          id: chatGroup?.id,
          status: 4,
        });
        if (res?.code === SUCCESS_CODE) handleClose();
      } else {
        const res: some = await apiVoteTicket({
          id: chatGroup?.id,
          customerRating: typeLike === 'like' ? 1 : 0,
          customerComment,
        });
        if (res?.code === SUCCESS_CODE) {
          handleClose();
          if (socket && socket.readyState === 1) {
            socket.send(
              getSendMessage(
                JSON.stringify({
                  type: TYPE_EVENT.VOTED,
                  rate: typeLike === 'like' ? 1 : 0,
                  comment: customerComment,
                }),
                TYPE_MESSAGE.EVENT,
                `${chatGroup?.chatGroupId}`,
                `${chatGroup?.id}`
              )
            );
          }
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <Typography
          variant="subtitle2"
          className="chat-header-dialog"
          style={{ fontSize: 14 }}
        >
          <FormattedMessage
            id={
              type === "closed"
                ? "IDS_CHAT_CLOSE_TITLE"
                : "IDS_CHAT_ADD_COMMENT"
            }
          />
        </Typography>
        <Divider />
        <DialogContent>
          {type === "closed" ? (
            <Typography
              variant="body2"
              style={{ fontSize: 14, lineHeight: "17px" }}
            >
              <FormattedMessage id="IDS_CHAT_CLOSE_QUESTION" />
            </Typography>
          ) : (
            <>
              <Typography
                variant="body2"
                style={{ fontSize: 14, lineHeight: "17px" }}
              >
                <FormattedMessage id="IDS_CHAT_ADD_COMMENT_DESCRIPTION" />
              </Typography>
              <FormControlTextField
                formControlStyle={{
                  width: "100%",
                  marginRight: 0,
                  marginTop: 8,
                  minWidth:180
                }}
                label=""
                multiline
                rows={4}
                placeholder={intl.formatMessage({
                  id: "IDS_CHAT_ENTER_CUSTOMER_COMMENT",
                })}
                inputProps={{ maxLength: 500, autoComplete: "none" }}
                value={customerComment}
                onChange={(e:any) => setComment(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: 16, justifyContent: "flex-end" }}>
          <LoadingButton
            variant="contained"
            color="secondary"
            size="medium"
            style={{
              width: "50%",
              margin: 0,
              height: 36,
              backgroundColor: PRIMARY,
              fontSize: 14,
              borderRadius: 8,
              textTransform:'none',
              lineHeight: 1.3
            }}
            onClick={onSubmit}
            disableElevation
            loading={loading}
          >
            <FormattedMessage
              id={
                type === "closed" ? "IDS_CHAT_CLOSE" : "IDS_CHAT_COMMENT_BUTTON"
              }
            />
          </LoadingButton>
          <Button
            variant="outlined"
            size="medium"
            style={{
              width: "50%",
              height: 36,
              fontSize: 14,
              borderRadius: 8,
              backgroundColor: "#E2E8F0",
              borderColor: "#E2E8F0",
              textTransform:'none',
              lineHeight: 1.3
            }}
            onClick={handleClose}
            disableElevation
          >
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ color: "#1A202C", fontWeight: 600 }}
            >
              <FormattedMessage id="IDS_CHAT_REJECT" />
            </Typography>
          </Button>
        </DialogActions>
      </div>
    </div>
  );
};

export default ChatDialog;
