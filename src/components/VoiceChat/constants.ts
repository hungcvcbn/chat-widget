import { some } from "../../utils/constants";
export enum Signal {
    REQUEST_JOIN = "REQUEST_JOIN",
    JOIN = "JOINED",
    ADD_PEER_RETURN = "ADD_PEER_RETURN",
  
    ACCEPT = "ACCEPT",
    REJECT = "REJECT",
    RING = "RING",
    END_CALL = "END_CALL",
    IN_CALL= "INCALL"
  }
  
  export interface SignalTarget {
    userToSignal?: string;
    callerID: string;
    signal?: string;
    ticket?:some
  }
  
  export interface SignalJoinRoom {
    roomId: string;
    userId: string;
  }
  
  export interface SignalAnswerCall {
    sigName?: Signal.ACCEPT | Signal.REJECT | Signal.RING;
    signal: string;
    userId: string;
  }
  
  export enum CallStatus {
    DEFAULT = "IDS_START_CALL",
    INCOMING_CALL = "IDS_INCOMING_CALL",
    CONNECTING = "IDS_CONNECT_CALL",
    RINGING = "IDS_RINGING_CALL",
    REJECTED_CALL = "IDS_REJECTED_CALL",
    SUCCESS = "IDS_SUCCESS_CALL",
    END_CALL = "IDS_END_CALL",
    IN_CALL ="IDS_IN_CALL",
  }
  