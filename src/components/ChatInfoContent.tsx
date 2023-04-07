import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { withStyles } from '@mui/styles';
import { Field } from 'formik';
import { get } from 'lodash';
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GREEN, GREY_900, ORANGE, RED } from '../assets/colors';
import { redMark } from '../common/Elements';
import { FieldSelectContent, FieldTextContent } from '../common/FieldContent';
import { some, TRIPIONE_CAID } from '../utils/constants';
import { isEmpty } from '../utils/helpers';
import ChatSettingScript from './ChatSettingScript';

const CustomRadioTripiOne = withStyles({
  root: {
    width: 20,
    height: 20,
    color: ORANGE,
    '&$checked': {
      color: ORANGE,
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const CustomRadio = withStyles({
  root: {
    color: ORANGE,
    '&$checked': {
      color: ORANGE,
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const CusTomField: any = withStyles({
  root: {
    '& input': {
      fontSize: 14,
    },
  },
})((props) => <FieldTextContent {...props} />);

interface Props {
  configureVnt?: some;
  accountInfo: some;
  teams: some;
  setFieldValue: (field: string, value: any) => void;
  submitCount: number;
  errors: any;
  values: some;
  handleUpdateForm: (value: some) => void;
  scriptSetting: some,
  orderInfo: some;
  onChangeTeam:(value:any)=>void
}
const ChatInfoContent: React.FC<Props> = (props) => {
  const intl = useIntl();
  const {
    configureVnt,
    setFieldValue,
    accountInfo,
    teams,
    submitCount,
    errors,
    values,
    handleUpdateForm,
    scriptSetting,
    orderInfo,
    onChangeTeam
  } = props;
  useEffect(() => {
    handleUpdateForm(values); // eslint-disable-next-line
  }, [values]);

  // useEffect(() => {
  //   if (teams?.items) setFieldValue('teamId', get(teams?.items, '0.id'));
  //   // eslint-disable-next-line
  // }, [teams?.items]);
  return (
    <>
      <Typography variant="body1" style={{ marginBottom: 10 }}>
        <FormattedMessage id="IDS_CHAT_WELCOME_DESCRIPTION" />
      </Typography>
      {isEmpty(accountInfo?.phone) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_PHONE_NUMBER" />
            {redMark}
          </InputLabel>

          <CusTomField
            className="aaa123"
            name="customerPhone"
            formControlStyle={{ width: '100%', marginRight: 0 }}
            label=""
            disabled={!isEmpty(accountInfo?.phone)}
            placeholder={intl.formatMessage({
              id: 'IDS_CHAT_INSERT_PHONE_NUMBER',
            })}
            inputProps={{ fontSize: 14, maxLength: 13, autoComplete: 'none' }}
          />
        </>
      )}
      <InputLabel style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}>
        <FormattedMessage id="IDS_CHAT_SUPPORT_CONTENT" />
        {redMark}
      </InputLabel>

      <FieldSelectContent
        name="teamId"
        label=""
        placeholder={intl.formatMessage({ id: 'IDS_CHAT_CHOOSE' })}
        options={teams?.items || []}
        getOptionLabel={(v: any) => (
          <Tooltip
            title={v?.name || ''}
            placement="top"
            style={{ zIndex: '2147483639' }}
          >
            <div
              style={{
                display: 'flex',
              }}
            >
              <span
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  width: '80%',
                  fontSize: 14,
                }}
              >
                <span>{v?.name}</span>
                &nbsp;
              </span>
              <span
                style={{ color: v?.status === 0 ? RED : GREEN, fontSize: 14 }}
              >
                {`(${v?.status === 0 ? 'offline' : 'online'})`}
              </span>
            </div>
          </Tooltip>
        )}
        renderValueInput={(v: any) => v?.name}
        inputProps={{ style: { fontSize: 14 } }}
        value={!isEmpty(values?.teamId) ? values?.teamId : null}
        onSelectOption={(value: any) => {
          setFieldValue('teamId', value);
          onChangeTeam(value)
          
        }}
        
        formControlStyle={{ width: '100%', marginRight: 0 }}
      />
      {/* <InputLabel
        style={{
          color: GREY_900,
          fontSize: 14,
          lineHeight: '20px',
          whiteSpace: 'normal',
        }}
      >
        <FormattedMessage id="IDS_CHAT_REQUIREMENT_DESCRIPTION" />
      </InputLabel>
      <FieldTextContent
        name="customerContentRequest"
        formControlStyle={{ width: '100%', marginRight: 0 }}
        label=""
        multiline
        rows={4}
        placeholder={intl.formatMessage({ id: 'IDS_CHAT_INSERT_DESCRIPTION' })}
        inputProps={{ maxLength: 500, autoComplete: 'none' }}
      /> */}
      {isEmpty(accountInfo?.gender) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_CHOOSE_TITLE" />
            {redMark}
          </InputLabel>
          <Field
            name="customerTitle"
            as={(propsField: any) => (
              <RadioGroup
                name="customerTitle"
                style={{ flexDirection: 'row', marginLeft: 10 }}
                {...propsField}
              >
                <FormControlLabel
                  value={intl.formatMessage({ id: 'IDS_CHAT_FEMALE' })}
                  control={
                    configureVnt?.caId === TRIPIONE_CAID ? (
                      <CustomRadioTripiOne />
                    ) : (
                      <CustomRadio />
                    )
                  }
                  label={
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: '20px',
                        marginLeft: 5,
                      }}
                    >
                      <FormattedMessage id="IDS_CHAT_FEMALE" />
                    </span>
                  }
                />
                <FormControlLabel
                  value={intl.formatMessage({ id: 'IDS_CHAT_MALE' })}
                  control={
                    configureVnt?.caId === TRIPIONE_CAID ? (
                      <CustomRadioTripiOne />
                    ) : (
                      <CustomRadio />
                    )
                  }
                  label={
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: '20px',
                        marginLeft: 5,
                      }}
                    >
                      <FormattedMessage id="IDS_CHAT_MALE" />
                    </span>
                  }
                />
              </RadioGroup>
            )}
          />
          {submitCount > 0 && (errors as any)?.customerTitle ? (
            <Typography
              variant="body2"
              style={{
                color: RED,
                marginBottom: 8,
                marginTop: 0,
                fontSize: 13,
                marginLeft: 14
              }}
            >
              {(errors as any)?.customerTitle}
            </Typography>
          ) : undefined}
        </>
      )}
      {isEmpty(accountInfo?.name) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_FULL_NAME" />
            {redMark}
          </InputLabel>

          <CusTomField
            name="customerName"
            formControlStyle={{ width: '100%', marginRight: 0 }}
            label=""
            placeholder={intl.formatMessage({
              id: 'IDS_CHAT_INSERT_FULL_NAME',
            })}
            inputProps={{ maxLength: 255, autoComplete: 'none' }}
          />
        </>
      )}
      {isEmpty(accountInfo?.id) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_ID_AGENCY" />
            {redMark}
          </InputLabel>
          <FieldTextContent
            name="agencyId"
            formControlStyle={{ width: '100%', marginRight: 0 }}
            label=""
            placeholder={intl.formatMessage({
              id: 'IDS_CHAT_INSERT_ID_AGENCY',
            })}
            inputProps={{ maxLength: 13, autoComplete: 'none' }}
          />
        </>
      )}
      {isEmpty(accountInfo?.email) && (
        <InputLabel>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_EMAIL" />
            {redMark}
          </InputLabel>
          <CusTomField
            name="customerEmail"
            formControlStyle={{ width: '100%', marginRight: 0 }}
            label=""
            placeholder={intl.formatMessage({ id: 'IDS_CHAT_INSERT_EMAIL' })}
            inputProps={{ maxLength: 50, autoComplete: 'none' }}
          />
        </InputLabel>
      )}
      {isEmpty(orderInfo) &&
        <ChatSettingScript
          channelId={configureVnt?.channelId}
          caId={configureVnt?.caId}
          setFieldValue={setFieldValue}
          question={values?.question}
          teamId={values?.teamId}
          scriptSetting={scriptSetting}
        />
      }
    </>
  );
};

export default ChatInfoContent;
