import DescriptionIcon from '@mui/icons-material/Description';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { apiUploadFile } from '../api/apiTicket';
import { GREY_600, PRIMARY, RED, WHITE } from '../assets/colors';
import { ReactComponent as AddImageIcon } from '../assets/icons/ic_add_image.svg';
import { ReactComponent as AttachFileIcon } from '../assets/icons/ic_attach_file.svg';
import { ReactComponent as CloseFillIcon } from '../assets/icons/ic_close_fill.svg';
import { ReactComponent as SendIcon } from '../assets/icons/ic_send.svg';
import { Row } from '../common/Elements';
import { some, SUCCESS_CODE } from '../utils/constants';

interface Props {
  type: 'welcome' | 'info' | 'chat';
  fileUploads: some[];
  isCloseTicket: boolean;
  message: string;
  setMessage: (value: string) => void;
  setFileUploads: (values: some[]) => void;
  setType: (value: 'welcome' | 'info' | 'chat') => void;
  handleSendMessage: () => void;
  handleTyping: (typing: boolean) => void;
  handleDeleteFile: (idx: number) => void;
  isHidden: boolean;
  setIsSupportOrder: (value: boolean) => void;
}
const ChatInput: React.FC<Props> = (props) => {
  const intl = useIntl();
  const {
    type,
    fileUploads,
    isCloseTicket,
    message,
    setMessage,
    setFileUploads,
    setType,
    handleTyping,
    handleDeleteFile,
    handleSendMessage,
    setIsSupportOrder,
    isHidden,
  } = props;
  const [uploadError, setError] = useState<boolean>(false);

  const handleKeyPress = (e: any) => {
    if (e.keyCode === 13) handleSendMessage();
  };
  const handleUploadFile = async (e: any) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const temp: any[] = [];
      const fileList = Object.values(e.target.files);
      const fileUp = fileList.filter((v: any) => v?.size <= 25 * 1024 * 1024);
      if (fileList.length > fileUp.length) setError(true);
      else setError(false);
      if (!isEmpty(fileUp)) {
        fileUp.forEach((file: any, idx: number) => {
          if (fileUploads.length + idx < 5) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('config', 'CHAT-FILE');
            temp.push(apiUploadFile(formData));
          } else {
            setError(true);
          }
        });
        const res = await Promise.all(temp);
        const fileUploaded: some[] = [];
        res.forEach((v: some) => {
          if (v?.code === SUCCESS_CODE) fileUploaded.push(v?.data);
        });
        setFileUploads([...fileUploads, ...fileUploaded]);
      }
    }
  };

  return (
    <>
      {type === 'welcome' && isHidden && (
        <Row>
          <Button
            style={{
              width: '100%',
              height: 36,
              backgroundColor: PRIMARY,
              margin: 12,
            }}
            type="submit"
            variant="contained"
            color="secondary"
            disableElevation
            onClick={() => {
              setType('info');
              setIsSupportOrder(false);
            }}
          >
            <Typography
              variant="subtitle2"
              style={{
                fontSize: 14,
                color: WHITE,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              <FormattedMessage id="IDS_CHAT_NOW" />
            </Typography>
          </Button>
        </Row>
      )}
      {!isEmpty(fileUploads) && type !== 'welcome' && (
        <div className="files-container">
          {fileUploads.map((el: some, index: number) => (
            <div className="file-wrapper" key={el?.url}>
              {el?.contentType.includes('image') ? (
                <img
                  src={
                    el?.extension ? el?.extension?.thumbnailUrl?.url : el?.url
                  }
                  alt=""
                />
              ) : (
                <DescriptionIcon
                  style={{ width: 80, height: 80, color: GREY_600 }}
                />
              )}

              <CloseFillIcon
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleDeleteFile(index);
                  setError(false);
                }}
              />
            </div>
          ))}
          {fileUploads.length < 5 && (
            <div
              className="add-image-icon"
              onClick={() => document.getElementById('upload_file')?.click()}
              aria-hidden="true"
            >
              <AddImageIcon />
            </div>
          )}
        </div>
      )}
      {uploadError && type !== 'welcome' && (
        <p
          style={{
            color: RED,
            margin: 0,
            textAlign: 'start',
            paddingLeft: 16,
            fontSize: 12,
          }}
        >
          {intl.formatMessage({ id: 'IDS_CHAT_FILE_MAX_MESSAGE' })}
        </p>
      )}
      {type === 'chat' && !isCloseTicket && (
        <InputBase
          className="chat-input"
          startAdornment={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <span>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  id="upload_file"
                  multiple
                  onChange={handleUploadFile}
                />
                <AttachFileIcon
                  onClick={() =>
                    document.getElementById('upload_file')?.click()
                  }
                  style={{ cursor: 'pointer' }}
                />
              </span>
            </div>
          }
          endAdornment={
            <>
              <SendIcon
                onClick={() => {
                  setError(false);
                  handleSendMessage();
                }}
                className={`${!isEmpty(message.trim()) || !isEmpty(fileUploads)
                  ? 'active-icon'
                  : ''
                  } `}
                style={{
                  cursor:
                    !isEmpty(message.trim()) || !isEmpty(fileUploads)
                      ? 'pointer'
                      : 'not-allowed',
                }}
              />
            </>
          }
          inputProps={{ maxLength: 20000 }}
          placeholder={intl.formatMessage({ id: 'IDS_CHAT_WRITE_MESSAGE' })}
          value={message}
          onChange={(e: any) => setMessage(e?.target?.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
        />
      )}
    </>
  );
};

export default ChatInput;
