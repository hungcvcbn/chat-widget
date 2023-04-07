import axios from "axios";
import { Buffer } from "buffer";
import Cookies from "js-cookie";
import { sha256 } from "js-sha256";
import JSONbig from "json-bigint";
import { isEmpty } from "lodash";
import { configs } from "./configs";
import { ACCESS_TOKEN, some, TOKEN, UUID } from "./constants";
import { getConfig } from "./helpers";

const timeStamp = new Date().getTime();

const configureVnt = getConfig();
const caId = configureVnt?.caId || 9999;
const defaultLang = Cookies.get("lang_code") || "vi";

const AppHash = Buffer.from(
  sha256(
    `${timeStamp / 1000 - ((timeStamp / 1000) % 300)}:${configs().APP_KEY}`
  ),
  "hex"
).toString("base64");

const request = axios.create({
  baseURL: configs().BASE_URL,
  headers: {
    "accept-language": `${defaultLang}`,
    "Content-Type": "application/json",
    "login-token": `${
      Cookies.get(ACCESS_TOKEN) ||
      localStorage.getItem(ACCESS_TOKEN) ||
      Cookies.get(TOKEN) ||
      ""
    }`,
    "device-id": `${localStorage.getItem(UUID) || ""}`,
    version: configs().VERSION,
    appHash: AppHash,
    appId: configs().APP_ID,
    "ca-id": caId,
  },
});

request.interceptors.request.use(
  (config: some) => {
    const tempConfig: some = {
      ...config,
      headers: {
        ...config.headers,
        "login-token": `${
          Cookies.get(ACCESS_TOKEN) ||
          localStorage.getItem(ACCESS_TOKEN) ||
          Cookies.get(TOKEN) ||
          ""
        }`,
        "device-id": `${localStorage.getItem(UUID) || ""}`,
      },
    };
    if (tempConfig?.url.includes("/account/login")) {
      delete tempConfig?.headers["device-id"];
      delete tempConfig?.headers["login-token"];
    }
    if (
      isEmpty(localStorage.getItem(ACCESS_TOKEN)) &&
      isEmpty(Cookies.get(ACCESS_TOKEN)) &&
      isEmpty(Cookies.get(TOKEN))
    ) {
      delete tempConfig?.headers["login-token"];
    } else {
      delete tempConfig?.headers["device-id"];
    }
    const currentTime = new Date().getTime();
    const appHash = Buffer.from(
      sha256(
        `${currentTime / 1000 - ((currentTime / 1000) % 300)}:${
          configs().APP_KEY
        }`
      ),
      "hex"
    ).toString("base64");
    return {
      ...tempConfig,
      headers: {
        ...tempConfig?.headers,
        version: configs().VERSION,
        appHash,
        appId: configs().APP_ID,
      },
    };
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const res = JSONbig.parse(response?.request?.response);
    // if (res.code === 3003) {
    //   window.alert(
    //     'Hệ thống yêu cầu cài đặt thời gian chính xác để thực hiện tính năng chat hỗ trợ. Quý khách vui lòng mở phần Cài đặt của thiết bị này và chuyển Ngày Giờ sang chế độ Tự động'
    //   );
    // }
    return res;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

const api = (options: some) => {
  return request({
    baseURL: configs().BASE_URL,
    ...options,
    headers: { ...options.headers },
  });
};

export default api;
