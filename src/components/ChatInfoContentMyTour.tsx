import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { withStyles } from '@mui/styles';
import { Field } from 'formik';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GREEN, GREY_900, ORANGE, PRIMARY, RED } from '../assets/colors';
import { redMark } from '../common/Elements';
import { FieldTextContent } from '../common/FieldContent';
import { some } from '../utils/constants';

const CustomRadio = withStyles({
  root: {
    color: PRIMARY,
    width: 20,
    height: 20,
    "&$checked": {
      color: PRIMARY,
    },
    "& .MuiSvgIcon-root": {
      height: 20,
      weight: 20,
    },
  },
  checked: {},
})((props :any) => <Radio color="default" {...props} />);
interface Props {
  accountInfo: some;
  teams: some;
  setFieldValue: (field: string, value: any) => void;
  submitCount: number;
  errors: any;
  values: some;
  handleUpdateForm: (value: some) => void;
  onChangeTeam: (value:any) => void;
}
const ChatInfoContentMytour: React.FC<Props> = (props) => {
  const intl = useIntl();
  const {
    setFieldValue,
    accountInfo,
    teams,
    submitCount,
    errors,
    values,
    handleUpdateForm,
    onChangeTeam
  } = props;
  useEffect(() => {
    handleUpdateForm(values); // eslint-disable-next-line
  }, [values]);

  return (
    <>
      <Typography style={{ marginBottom: 10 ,fontSize:'14px',lineHeight:'22px'}}>
        <FormattedMessage id="IDS_CHAT_WELCOME_DESCRIPTION" />
      </Typography>
      {isEmpty(accountInfo?.name) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_FULL_NAME" />
            {redMark}
          </InputLabel>
          <FieldTextContent
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
      {isEmpty(accountInfo?.phone) && (
        <>
          <InputLabel
            style={{ color: GREY_900, fontSize: 14, lineHeight: '20px' }}
          >
            <FormattedMessage id="IDS_CHAT_PHONE_NUMBER" />
            {redMark}
          </InputLabel>

          <FieldTextContent
            name="customerPhone"
            formControlStyle={{ width: '100%', marginRight: 0 }}
            label=""
            disabled={!isEmpty(accountInfo?.phone)}
            placeholder={intl.formatMessage({
              id: 'IDS_CHAT_INSERT_PHONE_NUMBER',
            })}
            inputProps={{ maxLength: 13, autoComplete: 'none' }}
          />
        </>
      )}
      <InputLabel
        style={{
          color: GREY_900,
          fontSize: 14,
          lineHeight: '17px',
        }}
      >
        <FormattedMessage id="IDS_CHAT_SUPPORT_CONTENT" />
        {redMark}
      </InputLabel>
      <Field
        name="teamId"
        as={(propsField : any) => (
          <RadioGroup
            style={{ margin: '6px 0' }}
            name="teamId"
            {...propsField}
            // onSelect={(e) => {
            //   console.log("okje")
            //   setFieldValue('teamId', e);
            // }}
          >
            {(teams?.items || []).map((v :any, i:number) => {
              return (
                <FormControlLabel
                  key={v.id}
                  value={v.id}
                  style={{ margin: '6px 0' }}
                  onClick={()=>{
                    onChangeTeam(v.id)
                    setFieldValue('teamId', v.id);
                  }}
                  control={
                    <CustomRadio checked={`${values.teamId}` === `${v.id}`} />
                  }
                  label={
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: '17px',
                        marginLeft: 8,
                        marginBottom: 0,
                        marginTop: 0,
                      }}
                    >
                      <span>{v?.name}</span>
                      &nbsp;
                      <span
                        style={{
                          color: v?.status === 0 ? RED : GREEN,
                          fontSize: 14,
                        }}
                      >
                        {`(${v?.status === 0 ? 'offline' : 'online'})`}
                      </span>
                    </p>
                  }
                />
              );
            })}
          </RadioGroup>
        )}
      />
      {submitCount > 0 && errors?.customerTitle ? (
        <Typography
          variant="body2"
          style={{
            color: RED,
            marginBottom: 8,
            marginTop: -8,
            fontSize: 13,
          }}
        >
          {errors?.customerTitle}
        </Typography>
      ) : undefined}
    </>
  );
};

export default ChatInfoContentMytour;
