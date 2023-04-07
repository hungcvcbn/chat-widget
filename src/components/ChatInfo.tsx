import Typography from "@mui/material/Typography";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";
import { apiCreateTicket, apiGetTeams } from "../api/apiTicket";
import { GREY_350, PRIMARY, WHITE } from "../assets/colors";
import { Col, Row } from "../common/Elements";
import LoadingButton from "../common/LoadingButton";
import {
  ACCESS_TOKEN,
  ANONYMOUS,
  MY_FRESH_CHANNEL,
  MY_TABLE_CHANNEL,
  MY_TOUR,
  DINOGO_IO,
  NORMAL_ACCOUNT,
  some,
  SUCCESS_CODE,
  DINOGO_COM,
} from "../utils/constants";
import { isEmpty } from "../utils/helpers";
import ChatInfoContent from "./ChatInfoContent";
import ChatInfoContentMyTour from "./ChatInfoContentMyTour";

interface Props {
  configureVnt: some;
  channelId: string;
  accountInfo: some;
  handleRegister: (group: some) => void;
  socket: any;
  handleUpdateForm: (value: some) => void;
  valueForm: some;
  scriptSetting: some;
  orderInfo: some;
  setDetailConfigTeam: (v: any) => void;
  detailConfigTeam: any;
}
const ChatInfo: React.FC<Props> = (props) => {
  const intl = useIntl();
  const {
    configureVnt,
    channelId,
    handleRegister,
    accountInfo,
    socket,
    handleUpdateForm,
    valueForm,
    scriptSetting,
    orderInfo,
    setDetailConfigTeam,
    detailConfigTeam,
  } = props;
  const [loading, setLoading] = React.useState(false);
  const [teams, setTeams] = useState<some>({});
  const [isAnonymous, setAnonymous] = useState<boolean>(
    isEmpty(Cookies.get(ACCESS_TOKEN) || localStorage.getItem(ACCESS_TOKEN))
  );

  const fetchData = async () => {
    try {
      const res: some = await apiGetTeams({
        channelId: channelId,
      });
      if (res?.code === SUCCESS_CODE) {
        setTeams(res?.data);
      }
    } catch (error) {}
  };

  const orderRequest = (_orderInfo: any) => {
    let customerContentRequest = "";
    if (_orderInfo?.chatSupportType === "hotel") {
      customerContentRequest = `Mã đơn hàng : ${_orderInfo?.orderCode} \n Mã đặt phòng : ${_orderInfo?.partnerBookingCode} \nNgày nhận phòng : ${_orderInfo?.checkIn} \nNgày trả phòng : ${_orderInfo?.checkOut} \n    `;
    }
    if (_orderInfo?.chatSupportType === "flight") {
      if (!_orderInfo?.isTwoWay) {
        customerContentRequest = `Mã Đơn hàng : ${_orderInfo?.orderCode} \n Mã Đặt chỗ : ${_orderInfo?.outboundPnrCode} \n  Chiều đi : ${_orderInfo?.outbound?.departureTime} ${_orderInfo?.outbound?.departureDate} `;
      } else {
        customerContentRequest = `Mã Đơn hàng : ${_orderInfo?.orderCode} \n Mã Đặt chỗ chiều đi : ${_orderInfo?.outboundPnrCode} \n Mã Đặt chỗ chiều về : ${_orderInfo?.inboundPnrCode} \n Chiều đi : ${_orderInfo?.outbound?.departureTime} ${_orderInfo?.outbound?.departureDate} \n Chiều về : ${_orderInfo?.inbound?.departureTime} ${_orderInfo?.inbound?.departureDate} \n  `;
      }
    }
    return customerContentRequest;
  };

  const convertExtraInfo = (_orderInfo: any) => {
    let urlCrm = process.env.REACT_APP_CRM_LINK
      ? process.env.REACT_APP_CRM_LINK
      : "https://crm-dev.tripi.vn";
    if (_orderInfo?.chatSupportType === "hotel") {
      return {
        bookingId: {
          link: `${urlCrm}/#!/sale/hotelBookingDetails/${orderInfo?.id}`,
          value: orderInfo?.id,
          displayName: "Mã đơn hàng",
        },
      };
    }
    if (_orderInfo?.chatSupportType === "flight") {
      return {
        bookingId: {
          link: `${urlCrm}#!/sale/flight-booking-detail?bookingId=${orderInfo?.id}`,
          value: orderInfo?.id,
          displayName: "Mã đơn hàng",
        },
      };
    }
    return null;
  };

  const checkShow = (_team: some) => {
    if (isEmpty(_team?.supportConfig)) return false;
    if (
      moment().isAfter(moment(_team?.supportConfig.times[0]?.to, "HH:mm:ss")) ||
      moment().isBefore(moment(_team?.supportConfig.times[0]?.from, "HH:mm:ss"))
    ) {
      return true;
    } else {
      return false;
    }
  };
  const _disable = () => {
    if (isEmpty(detailConfigTeam?.supportConfig))
      return isEmpty(detailConfigTeam);
    else {
      if (detailConfigTeam?.isShowdescription) {
        return !detailConfigTeam?.supportConfig?.isAllowChat;
      } else {
        return false;
      }
    }
  };
  const onChangeTeam = (value: any) => {
    if (!isEmpty(value) && !isEmpty(teams)) {
      let _team = teams?.items.find((v: some) => {
        return `${v?.id}` === `${value}`;
      });
      if (!isEmpty(_team)) {
        const _configTeam = {
          ..._team,
          isShowdescription: checkShow(_team),
        };
        setDetailConfigTeam(_configTeam);
      } else {
        setDetailConfigTeam(null);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setAnonymous(
      isEmpty(Cookies.get(ACCESS_TOKEN) || localStorage.getItem(ACCESS_TOKEN))
    );
  }, [socket]);

  const schema =
    configureVnt?.channelId === MY_TOUR ||
    configureVnt?.channelId === DINOGO_IO ||
    configureVnt?.channelId === DINOGO_COM
      ? yup.object().shape({
          customerPhone: yup
            .string()
            .required(intl.formatMessage({ id: "IDS_CHAT_PHONE_REQUIRE" }))
            .matches(
              /^[0-9]*$/,
              intl.formatMessage({ id: "IDS_CHAT_PHONE_VALIDATE" })
            ),
          teamId: yup
            .number()
            .required(intl.formatMessage({ id: "IDS_CHAT_CHAT_TEAM_REQUIRE" })),
          customerName: yup
            .string()
            .required(intl.formatMessage({ id: "IDS_CHAT_NAME_REQUIRE" })),
        })
      : yup.object().shape({
          customerPhone: yup
            .string()
            .required(intl.formatMessage({ id: "IDS_CHAT_PHONE_REQUIRE" }))
            .matches(
              /^[0-9]*$/,
              intl.formatMessage({ id: "IDS_CHAT_PHONE_VALIDATE" })
            ),
          teamId: yup
            .number()
            .required(intl.formatMessage({ id: "IDS_CHAT_CHAT_TEAM_REQUIRE" })),
          // customerTitle: yup
          //   .string()
          //   .nullable()
          //   .required(
          //     intl.formatMessage({ id: 'IDS_CHAT_CHAT_TITLE_REQUIRE' })
          //   ),
          customerName: yup
            .string()
            .required(intl.formatMessage({ id: "IDS_CHAT_NAME_REQUIRE" })),
          // agencyId: yup
          //   .string()
          //   .required(intl.formatMessage({ id: 'IDS_CHAT_AGENCY_REQUIRE' })),
          customerEmail: yup
            .string()
            .nullable()
            .matches(
              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              intl.formatMessage({ id: "IDS_CHAT_EMAIL_VALIDATE" })
            )
            .required(intl.formatMessage({ id: "IDS_CHAT_EMAIL_REQUIRE" })),
          // question:Yup.array()
        });

  return (
    <>
      <Formik
        initialValues={
          {
            customerPhone: accountInfo?.phone,
            customerTitle: accountInfo?.gender
              ? accountInfo?.gender === "M"
                ? intl.formatMessage({ id: "IDS_CHAT_FEMALE" })
                : intl.formatMessage({ id: "IDS_CHAT_MALE" })
              : intl.formatMessage({ id: "IDS_CHAT_GEMDER_OPTIONAL" }),
            customerName: accountInfo?.name,
            customerEmail: accountInfo?.emailInfo,
            // agencyId: `${accountInfo?.id || ''}`,
            // teamId: 0,
            ...valueForm,
          } as any
        }
        validationSchema={schema}
        onSubmit={async (values: any) => {
          try {
            setLoading(true);
            const team = teams?.items.find(
              (v: some) => v?.id.toString() === values?.teamId.toString()
            );
            if (team) {
              let customerContentRequest = "";
              if (!isEmpty(orderInfo)) {
                customerContentRequest = orderRequest(orderInfo);
              } else {
                customerContentRequest = !isEmpty(
                  values?.customerContentRequest
                )
                  ? values?.customerContentRequest + "\n"
                  : "";
                if (!isEmpty(values?.question)) {
                  Object.values(values?.question).forEach((quiz: any) => {
                    customerContentRequest = ` ${customerContentRequest}    ${quiz?.question} : ${quiz?.answer} . \n `;
                  });
                }
              }
              if (!isEmpty(values?.question)) delete values?.question;
              const res: some = await apiCreateTicket({
                ...values,
                teamName: team?.name,
                customerType: isAnonymous ? ANONYMOUS : NORMAL_ACCOUNT,
                channelId: channelId,
                customerContentRequest: customerContentRequest,
                bookingId: !isEmpty(orderInfo) ? orderInfo?.id : undefined,
                extraInfo: !isEmpty(orderInfo)
                  ? convertExtraInfo(orderInfo)
                  : undefined,
              });

              if (res?.code === SUCCESS_CODE) {
                handleRegister(res?.data);
              }
            }
          } catch (error) {
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, setFieldValue, errors, submitCount }) => {
          return (
            <Form style={{ padding: 12, marginBottom: 50 }}>
              <Col style={{ position: "relative" }}>
                {configureVnt &&
                (configureVnt?.channelId === MY_TABLE_CHANNEL ||
                  configureVnt?.channelId === MY_FRESH_CHANNEL ||
                  configureVnt?.channelId === MY_TOUR ||
                  configureVnt?.channelId === DINOGO_IO ||
                  configureVnt?.channelId === DINOGO_COM) ? (
                  <ChatInfoContentMyTour
                    accountInfo={accountInfo}
                    teams={teams}
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    submitCount={submitCount}
                    handleUpdateForm={handleUpdateForm}
                    onChangeTeam={onChangeTeam}
                  />
                ) : (
                  <ChatInfoContent
                    configureVnt={configureVnt}
                    accountInfo={accountInfo}
                    teams={teams}
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    submitCount={submitCount}
                    handleUpdateForm={handleUpdateForm}
                    scriptSetting={scriptSetting}
                    orderInfo={orderInfo}
                    onChangeTeam={onChangeTeam}
                  />
                )}
              </Col>
              <Col
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 12,
                  left: 12,
                  backgroundColor: WHITE,
                }}
              >
                <Row>
                  <LoadingButton
                    style={{
                      width: "100%",
                      height: 36,
                      backgroundColor: !_disable() ? PRIMARY : GREY_350,
                      marginBottom: 10,
                    }}
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disableElevation
                    disabled={_disable()}
                    loading={loading}
                  >
                    <Typography
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: WHITE,
                        textTransform: "none",
                      }}
                      variant="subtitle2"
                    >
                      <FormattedMessage id="IDS_CHAT_START" />
                    </Typography>
                  </LoadingButton>
                </Row>
              </Col>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ChatInfo;
