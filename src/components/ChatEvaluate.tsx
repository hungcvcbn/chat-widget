import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { FormattedMessage, useIntl } from 'react-intl'
import FormControlTextField from '../common/FormControlTextField'
import { ReactComponent as LikeIcon } from '../assets/icons/ic_like.svg'
import { ReactComponent as DislikeIcon } from '../assets/icons/ic_dislike.svg'
import { GREY_600, ORANGE, PRIMARY, SECONDARY } from '../assets/colors'
import {
  some,
  SUCCESS_CODE,
  TYPE_EVENT,
  TYPE_MESSAGE,
} from '../utils/constants'
import { getSendMessage, isEmpty } from '../utils/helpers'
import { apiVoteTicket } from '../api/apiTicket'
import { redMark, Row } from '../common/Elements'

interface Props {
  chatGroup: some
  socket: any
  isVoted?: boolean
  item?: some
  handleCloseTicketSuccess?: (value: boolean) => void
  messageId: string
  fetchCurrentTicket: () => void
}

const ChatEvaluate: React.FC<Props> = (props) => {
  const {
    chatGroup,
    socket,
    isVoted,
    item,
    messageId,
    handleCloseTicketSuccess,
    fetchCurrentTicket,
  } = props
  const intl = useIntl()
  const [data, setData] = useState<some>({
    customerRating: !isEmpty(item?.rate) ? item?.rate : 1,
    customerComment: item?.comment,
  })

  const handleChangeLike = (value: 1 | 0) => {
    setData({ ...data, customerRating: value })
  }

  const handleChangeComment = (e: any) => {
    setData({ ...data, customerComment: e?.target.value })
  }
  const handleSubmit = async () => {
    try {
      const res: some = await apiVoteTicket({
        ...data,
        id: chatGroup?.id || item?.id,
      })
      if (res?.code === SUCCESS_CODE) {
        fetchCurrentTicket()
        if (socket && socket.readyState === 1) {
          socket.send(
            getSendMessage(
              JSON.stringify({
                type: TYPE_EVENT.VOTED,
                rate: data?.customerRating,
                comment: data?.customerComment,
                messageId,
              }),
              TYPE_MESSAGE.EVENT,
              `${chatGroup?.chatGroupId}`,
              `${chatGroup?.id}`,
            ),
          )
        }
        if (handleCloseTicketSuccess) handleCloseTicketSuccess(true)
      }
    } catch (error) {}
  }
  return (
    <Row style={{ flexDirection: 'column' }}>
      <Paper className="chat-evaluate" style={{ boxShadow: 'none' }}>
        {isVoted ? (
          <>
            <Typography variant="body2" className="title-box">
              <FormattedMessage id="IDS_CHAT_THANK" />
            </Typography>
            <Typography
              variant="body2"
              style={{ marginBottom: 12, textAlign: 'center' }}
            >
              <FormattedMessage id="IDS_CHAT_THANK_DES" />
            </Typography>
            <Typography variant="body2" style={{ color: GREY_600 }}>
              <FormattedMessage id="IDS_CHAT_CUSTOMER_COMMENT" />
            </Typography>
            <Typography variant="body2" style={{ wordBreak: 'break-word' }}>
              {isVoted ? item?.comment : data?.customerComment}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" className="title-box">
              <FormattedMessage id="IDS_CHAT_EVALUATE_SERVICE" />
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ marginBottom: 8 }}
            >
              <FormattedMessage id="IDS_CHAT_EVALUATE_SERVICE_DES" />
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ marginBottom: 4, marginTop: 4 }}
            >
              <FormattedMessage id="IDS_CHAT_EVALUATE_SERVICE_QUESTION_2" />
              {redMark}
            </Typography>
            <p style={{ display: 'flex' }}>
              <LikeIcon
                style={{ cursor: 'pointer' }}
                className={`like-icon ${
                  data?.customerRating === 1 ? 'active-icon' : ''
                } `}
                onClick={() => handleChangeLike(1)}
              />
              <DislikeIcon
                style={{ marginLeft: 8, cursor: 'pointer' }}
                className={`dislike-icon ${
                  data?.customerRating === 0 ? 'active-icon' : ''
                } `}
                onClick={() => handleChangeLike(0)}
              />
            </p>

            <Typography
              variant="body2"
              component="p"
              style={{ marginBottom: 4, marginTop: 4 }}
            >
              <FormattedMessage id="IDS_CHAT_EVALUATE_SERVICE_QUESTION_3" />
            </Typography>
            <FormControlTextField
              formControlStyle={{ width: '100%' }}
              label=""
              multiline
              rows={4}
              placeholder={intl.formatMessage({
                id: 'IDS_CHAT_OTHER_SUGGESTION',
              })}
              inputProps={{ maxLength: 500, autoComplete: 'none' }}
              value={data?.customerComment}
              onChange={handleChangeComment}
            />
            <Button
              style={{ width: '100%', height: 36, backgroundColor: PRIMARY }}
              type="submit"
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              disabled={isEmpty(data.customerRating)}
            >
              <Typography variant="subtitle2">
                <FormattedMessage id="IDS_CHAT_SEND" />
              </Typography>
            </Button>
          </>
        )}
      </Paper>
    </Row>
  )
}

export default ChatEvaluate
