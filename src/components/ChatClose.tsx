import React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { FormattedMessage } from 'react-intl'
import { ReactComponent as MoreIcon } from '../assets/icons/ic_more.svg'
import { ReactComponent as CloseCircleIcon } from '../assets/icons/ic_close_circle.svg'
import { Row } from '../common/Elements'

interface Props {
  openModal: () => void
}

const ChatClose: React.FC<Props> = (props) => {
  const { openModal } = props
  const [anchorEl, setAnchorEl] = React.useState<any>(null)
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const open = Boolean(anchorEl)
  const id = open ? 'close-chat' : undefined

  return (
    <>
      <MoreIcon
        style={{ cursor: 'pointer', marginRight: 10 }}
        onClick={handleClick}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ zIndex: 2147483638 }}
      >
        <Row
          className="popper-item"
          onClick={() => {
            handleClose()
            openModal()
          }}
        >
          <CloseCircleIcon />
          <Typography variant="body2" style={{ marginLeft: 4, fontSize: 14 }}>
            <FormattedMessage id="IDS_CHAT_STOP_SUPPORT" />
          </Typography>
        </Row>
      </Popover>
    </>
  )
}

export default ChatClose
