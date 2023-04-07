import {
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import { FastField, useFormikContext } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { GREY_900, ORANGE, RED } from '../assets/colors';
import { redMark } from '../common/Elements';
import { FieldTextContent } from '../common/FieldContent';
import { some, TRIPIONE_CAID } from '../utils/constants';
import { isEmpty } from '../utils/helpers';
type Props = {
  channelId: string | number;
  caId: string | number;
  setFieldValue: (field: string, value: any) => void;
  question: any;
  teamId: string | number;
  scriptSetting: some;
};

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
const ChatSettingScript = (props: Props) => {
  const { channelId, teamId, question, setFieldValue, caId, scriptSetting } =
    props;
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const { submitCount } = useFormikContext();
  const { formatMessage } = useIntl();

  const handleQuestionTeam = () => {
    const resultGlobal = handleQuestion(scriptSetting?.questions) || [];
    const resultTeam =
      handleQuestion(
        scriptSetting?.question?.questionsByTeams?.[`${teamId}`]
      ) || [];
    setQuestions([...resultGlobal, ...resultTeam]);
  };

  const handleQuestion = useCallback((script: any) => {
    let list: any[] = [];
    if (isEmpty(script)) {
      return;
    } else {
      script?.forEach((v: any) => {
        list.push({ ...v });
        if (!isEmpty(v?.answers)) {
          v?.answers?.forEach((v2: any) => {
            if (!isEmpty(v2?.questions)) {
              const arrQ = handleQuestion(v2?.questions) || [];
              list = [...list, ...arrQ];
            }
          });
        }
      });
    }
    return list || [];
  }, []);

  const answerWith = (parent: any, answer: any) => {
    let listHidden: any[] = [];
    let listShow: any[] = [];
    parent?.answers.forEach((v: any) => {
      if (v?.id === answer) {
        v?.questions?.forEach((v: any) => {
          listShow = [...listShow, v];
        });
      } else {
        const a = handleQuestion(v?.questions) || [];
        listHidden = [...listHidden, ...a];
      }
    });
    const temp = questions?.map((v) => {
      if (listShow?.some((v2) => v2?.id === v?.id)) {
        return { ...v, isShow: true };
      }
      if (listHidden?.some((v2) => v2?.id === v?.id)) {
        return { ...v, isShow: false };
      }
      return v;
    });
    setQuestions(temp);
    listHidden?.forEach((v) => {
      setFieldValue(`question.quetion_id_${v?.id}`, undefined);
    });
  };

  const validate = (value: any) => {
    let error;
    if (isEmpty(value?.answer?.trim())) {
      error = `${formatMessage({ id: 'IDS_CHAT_VALIDATE_REQUIRED' })}`;
    }
    return error;
  };

  useEffect(() => {
    if (!isEmpty(scriptSetting)) {
      setFieldValue('question', undefined);
      if (!isEmpty(teamId)) {
        handleQuestionTeam();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptSetting, teamId]);

  return (
    <>
      {!isEmpty(questions) &&
        questions
          ?.filter((v) => {
            return v?.isShow || isEmpty(v?.answerParent);
          })
          .map((v: some) => (
            <React.Fragment key={v?.id}>
              {v?.type === 'CHOICE' && (
                <>
                  <InputLabel
                    style={{
                      color: GREY_900,
                      fontSize: 14,
                      lineHeight: '20px',
                      marginTop: 5,
                    }}
                  >
                    {v?.title}
                    {v?.required ? redMark : undefined}
                  </InputLabel>
                  <FastField
                    name={`question.quetion_id_${v?.id}`}
                    validate={v?.required ? validate : undefined}
                    as={(propsField: any) => (
                      <>
                        <RadioGroup
                          label
                          style={{
                            marginLeft: 10,
                            width: '100%',
                          }}
                          {...propsField}
                          value={question?.[`quetion_id_${v?.id}`]?.id}
                          onChange={(e: any, value: any) => {
                            setFieldValue(`question.quetion_id_${v?.id}`, {
                              id: value,
                              answer:
                                v?.answers?.find((v2: any) => {
                                  return v2?.id === value;
                                })?.name || '',
                              question: v?.question,
                              required: v?.required,
                            });
                            answerWith(v, value);
                          }}
                        >
                          {!!v?.answers &&
                            v?.answers?.map((answer: any) => {
                              return (
                                <FormControlLabel
                                  style={{
                                    alignItems: 'start',
                                    marginBottom: 5,
                                    marginTop: 5,
                                    marginLeft: 5,
                                  }}
                                  value={answer?.id}
                                  control={
                                    caId === TRIPIONE_CAID ? (
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
                                      {answer?.name}
                                    </span>
                                  }
                                />
                              );
                            })}
                        </RadioGroup>
                        {submitCount > 0 &&
                          v?.required &&
                          isEmpty(propsField?.value) && (
                            <FormHelperText
                              style={{
                                minHeight: 20,
                                fontSize: 12,
                                color: RED,
                              }}
                            >
                             {formatMessage({id:'IDS_CHAT_SELECT_REQUIRED'})}
                            </FormHelperText>
                          )}
                      </>
                    )}
                  />
                </>
              )}
              {v?.type === 'TEXT' && (
                <>
                  <InputLabel
                    style={{
                      color: GREY_900,
                      fontSize: 14,
                      lineHeight: '20px',
                    }}
                  >
                    {v?.title}
                    {v?.required ? redMark : undefined}
                  </InputLabel>
                  <CusTomField
                    name={`question.quetion_id_${v?.id}`}
                    onChange={(e: any) => {
                      setFieldValue(`question.quetion_id_${v?.id}`, {
                        answer: e.target.value,
                        question: v?.question,
                        required: v?.required,
                      });
                    }}
                    value={question?.[`quetion_id_${v?.id}`]?.answer}
                    formControlStyle={{ width: '100%', marginRight: 0 }}
                    label=""
                    placeholder={v?.title}
                    inputProps={{ maxLength: 50, autoComplete: 'none' }}
                    validate={v?.required ? validate : undefined}
                  />
                </>
              )}
              {v?.type === 'LABEL' && (
                <>
                  <Typography
                    variant="body2"
                    style={{
                      fontWeight: 400,
                      margin: '10 0',
                      color: '#677072',
                      marginBottom: 5,
                      marginTop: 5,
                    }}
                  >
                    {v?.question}
                  </Typography>
                </>
              )}
            </React.Fragment>
          ))}
    </>
  );
};
const areEqual = (prevProps: any, nextProps: any) =>
  prevProps.channelId === nextProps.channelId &&
  prevProps.caId === nextProps.caId &&
  prevProps.teamId === nextProps.teamId &&
  JSON.stringify(prevProps.question) === JSON.stringify(nextProps.question) &&
  JSON.stringify(prevProps.scriptSetting) ===
    JSON.stringify(nextProps.scriptSetting);

export default React.memo(ChatSettingScript, areEqual);
