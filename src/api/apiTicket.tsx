import api from '../utils/api';
import { configs } from '../utils/configs';
import { some } from '../utils/constants';

export const apiGetTeams = (params: some) => {
  return api({ method: 'get', url: '/csp/team/list-team', params });
};
export const apiCreateTicket = (data: some) => {
  return api({ method: 'post', url: '/csp/tickets', data });
};
export const apiGetMessages = (params: some) => {
  return api({ method: 'get', url: '/chat/messages/cs', params });
};
export const apiUploadFile = (data: any) => {
  return api({
    method: 'post',
    url: `${configs().UPLOAD_URL}/assets/file/upload`,
    data,
  });
};
export const apiVoteTicket = (data: any) => {
  return api({ method: 'post', url: '/csp/tickets/votes', data });
};
export const apiCloseTicket = (data: any) => {
  return api({ method: 'post', url: '/csp/tickets/close-ticket', data });
};
export const apiGetAccountFree = (params: some) => {
  return api({
    method: 'get',
    url: '/csp/employees/get-free-employee',
    params,
  });
};
export const apiGetAccountDetail = () => {
  return api({ method: 'get', url: '/ams/account/simple-info' });
};
export const apiGetCurrentTicket = (params: some) => {
  return api({ method: 'get', url: '/csp/tickets/current-ticket', params });
};
export const apiGetUserAvatarInfo = (data: any) => {
  return api({
    method: 'post',
    url: '/ams/account/get-user-avatar-info',
    data,
  });
};
export const actionGetStunTurnServer = () => {
  return api({
    method: 'get',
    url: '/chat/vo-ip/servers',
  });
};
export const actionSettingWidget = (params: some) => {
  return api({ method: 'get', url: '/csp/widget/settings', params });
};
