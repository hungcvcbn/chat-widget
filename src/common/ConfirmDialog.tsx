import {
  Button,
  Dialog,
  DialogActions,
  DialogProps,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import IconClose from "@mui/icons-material/CloseOutlined";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Row } from "./Elements";
import LoadingButton from "./LoadingButton";

interface Props extends DialogProps {
  open: boolean;
  loading?: boolean;
  disabled?: boolean;
  acceptLabel?: string;
  rejectLabel?: string;
  styleCloseBtn?: React.CSSProperties;
  styleHeader?: React.CSSProperties;
  onClose(): void;
  onAccept(): void;
  titleLabel?: React.ReactNode;
  footerLabel?: React.ReactNode;
  onReject?: () => void;
  onExited?: () => void;
  footer?: React.ReactNode;
}

const ConfirmDialog: React.FC<Props> = (props) => {
  const {
    open,
    styleCloseBtn,
    styleHeader,
    loading,
    onClose,
    onExited,
    onAccept,
    onReject,
    titleLabel,
    footerLabel,
    acceptLabel,
    rejectLabel,
    children,
    disabled,
    footer,
    ...rest
  } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: { minWidth: 420 },
      }}
      maxWidth="md"
      {...rest}
    >
      {titleLabel ? (
        <>
          <Row style={styleHeader}>
            <div style={{ flex: 1 }}>{titleLabel}</div>
            <IconButton
              style={{ padding: "8px", ...styleCloseBtn }}
              onClick={onClose}
            >
              <IconClose />
            </IconButton>
          </Row>
          <Divider />
        </>
      ) : (
        <IconButton
          style={{
            position: "absolute",
            right: 0,
            padding: 8,
            ...styleCloseBtn,
          }}
          onClick={onClose}
        >
          <IconClose />
        </IconButton>
      )}
      {children}

      {footer || (
        <>
          <Divider />
          <DialogActions style={{ padding: 16, justifyContent: "flex-end" }}>
            {onReject && (
              <Button
                variant="outlined"
                size="medium"
                style={{ minWidth: 150, marginLeft: 24 }}
                onClick={onReject}
                disableElevation
              >
                <Typography variant="body2">
                  <FormattedMessage id={rejectLabel || "IDS_REJECT"} />
                </Typography>
              </Button>
            )}
            <LoadingButton
              loading={loading}
              variant="contained"
              color="secondary"
              size="medium"
              style={{
                minWidth: 150,
                opacity: disabled ? 0.65 : 1,
              }}
              onClick={onAccept}
              disableElevation
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage id={acceptLabel || "IDS_ACCEPT"} />
              </Typography>
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ConfirmDialog;
