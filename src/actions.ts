import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import Peer from "skyway-js";
import { actionCreatorFactory } from "../node_modules/typescript-fsa";

import { nextVideoStream } from "./lib/video";
import { TStore } from "./store";

const actionCreator = actionCreatorFactory();

export const AddPeerAction = actionCreator<{
  peerId: string;
  stream: any;
}>("ADD_PEER");
export const AddPointingAction = actionCreator.async<
  { peerId: string; x: number; y: number },
  { peerId: string; x: number; y: number },
  { error: any }
>("ADD_POINTING");
export const ParticipateAction = actionCreator.async<
  {},
  {
    localPeer: Peer;
    localStream: MediaStream;
    room: any;
  },
  { error: any }
>("PARTICIPATE");
export const RemovePeerAction = actionCreator<{ peerId: string }>(
  "REMOVE_PEER"
);
export const RemovePointingAction = actionCreator<{ peerId: string }>(
  "REMOVE_POINTING"
);
export const SelectPeerAction = actionCreator.async<{}, {}, { error: any }>(
  "SELECT_PEER"
);
export const SetPointintAcrion = actionCreator.async<{}, {}, { error: any }>(
  "SET_POINTING"
);
export const SetTransformAcrion = actionCreator.async<{}, {}, { error: any }>(
  "SET_TRANSFORM"
);
export const SwitchCameraAction = actionCreator.async<
  {},
  { localStream: MediaStream },
  { error: any }
>("SWITCH_CAMERA");
export const ToggleAudioMutingAction = actionCreator.async<
  {},
  { isEnabled: boolean },
  { error: any }
>("TOGGLE_AUDIO_MUTING");
export const ToggleCameraMutingAction = actionCreator.async<
  {},
  { isEnabled: boolean },
  { error: any }
>("TOGGLE_CAMERA_MUTING");
export const ToggleMapMutingAction = actionCreator.async<
  {},
  { isEnabled: boolean },
  { error: any }
>("TOGGLE_MAP_MUTING");
export const InitializeMapAction = actionCreator.async<
  {},
  {
    key: string;
    lat: number;
    lng: number;
    defaultZoom: number;
  },
  { error: any }
>("INITIALIZE_MAP");
export const OnMapLocationChangedAction = actionCreator<{
  lat: number;
  lng: number;
}>("ON_MAP_LOCATION_CHANGED");
export const OnPeerSelectedAction = actionCreator<{
  peerId: string;
}>("ON_PEER_SELECTED");
export const OnTransformChangedAction = actionCreator<{
  x: number;
  y: number;
  scale: number;
}>("ON_TRANSFORM_CHANGED");

const pointingTimerMap = new Map();

export function participate(
  key: string,
  network: "mesh" | "sfu",
  roomId: string
) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = { key, network, roomId };
    try {
      dispatch(ParticipateAction.started(params));

      const localStream = await nextVideoStream();
      const localPeer: Peer = await new Promise(r => {
        const peer = new Peer({ key: key });
        peer.on("open", () => r(peer));
      });

      const room = localPeer.joinRoom(roomId, {
        mode: network,
        stream: localStream,
      });

      room.on("peerLeave", peerId => dispatch(RemovePeerAction({ peerId })));
      room.on("stream", stream => onStream(dispatch, getState(), stream));
      room.on("data", ({ data }) => onData(dispatch, data));

      const result = {
        localPeer,
        localStream,
        room,
      };

      dispatch(ParticipateAction.done({ result, params }));
    } catch (error) {
      dispatch(ParticipateAction.failed({ error, params }));
    }
  };
}

function addPointing(peerId: string, x: number, y: number) {
  return async (dispatch: ThunkDispatch<TStore, void, AnyAction>) => {
    const params = { peerId, x, y };

    try {
      dispatch(AddPointingAction.started(params));

      clearTimeout(pointingTimerMap.get(peerId));
      const timerId = setTimeout(
        () => dispatch(RemovePointingAction({ peerId })),
        4000
      );
      pointingTimerMap.set(peerId, timerId);

      dispatch(AddPointingAction.done({ result: params, params }));
    } catch (error) {
      dispatch(AddPointingAction.failed({ error, params }));
    }
  };
}

export function selectPeer(peerId: string) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(SelectPeerAction.started(params));

      const room = getState()?.state.room;
      if (room) {
        room.send({ type: "peer-selected", peerId });
        // As the room.send does not send to the local peer, update manually.
        dispatch(OnPeerSelectedAction({ peerId }));
      }

      dispatch(SelectPeerAction.done({ result: {}, params }));
    } catch (error) {
      dispatch(SelectPeerAction.failed({ error, params }));
    }
  };
}

export function setPointing(x: number, y: number) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(SetPointintAcrion.started(params));

      const state = getState()?.state;

      const peerId = state.localPeer?.id;

      if (peerId) {
        state.room?.send({ type: "pointing-added", peerId, x, y });
        // As the room.send does not send to the local peer, update manually.
        dispatch(addPointing(peerId, x, y));
      }

      dispatch(SetPointintAcrion.done({ result: {}, params }));
    } catch (error) {
      dispatch(SetPointintAcrion.failed({ error, params }));
    }
  };
}

export function setTransform(x: number, y: number, scale: number) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(SetTransformAcrion.started(params));

      const state = getState()?.state;
      state.room?.send({ type: "transform-changed", x, y, scale });

      dispatch(SetTransformAcrion.done({ result: {}, params }));
    } catch (error) {
      dispatch(SetTransformAcrion.failed({ error, params }));
    }
  };
}

export function switchCamera() {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(SwitchCameraAction.started(params));

      const state = getState()?.state;

      // Close previouse stream.
      for (const track of state?.localStream?.getTracks() || []) {
        track.enabled = false;
      }

      const localStream = await nextVideoStream();

      // parameter of replaceStream is defined as MediaSource, but localStream is MediaStream.
      // I don't know why..
      (state?.room as any)?.replaceStream(localStream);

      const result = { localStream };

      dispatch(SwitchCameraAction.done({ result, params }));
    } catch (error) {
      dispatch(SwitchCameraAction.failed({ error, params }));
    }
  };
}

export function toggleAudioMuting() {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(ToggleAudioMutingAction.started(params));

      const state = getState()?.state;
      const isEnabled = !state?.isAudioEnabled;
      const localStream = state?.localStream;

      for (const track of localStream?.getAudioTracks() || []) {
        track.enabled = isEnabled;
      }

      const result = { isEnabled };

      dispatch(ToggleAudioMutingAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleAudioMutingAction.failed({ error, params }));
    }
  };
}

export function toggleCameraMuting() {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(ToggleCameraMutingAction.started(params));

      const state = getState()?.state;
      const isEnabled = !state?.isCameraEnabled;
      const localStream = state?.localStream;

      for (const track of localStream?.getVideoTracks() || []) {
        track.enabled = isEnabled;
      }

      const result = { isEnabled };

      dispatch(ToggleCameraMutingAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleCameraMutingAction.failed({ error, params }));
    }
  };
}
export function toggleMapMuting() {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(ToggleMapMutingAction.started(params));

      const state = getState()?.state;
      const isEnabled = !state?.isMapEnabled;

      const result = { isEnabled };

      dispatch(ToggleMapMutingAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleMapMutingAction.failed({ error, params }));
    }
  };
}

export function InitializeMap(key: string) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(InitializeMapAction.started(params));
      const defaultZoom = 12;
      const { lat, lng } = await new Promise(resolve =>
        navigator.geolocation.getCurrentPosition(pos => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        })
      );
      navigator.geolocation.watchPosition(pos => {
        const state = getState()?.state;

        if (!state) {
          return;
        }

        const presenter = state.presenter?.peerId;
        const localpeer = state.localPeer?.id;
        if (presenter === localpeer) {
          state.room?.send({
            type: "location-changed",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          dispatch(
            OnMapLocationChangedAction({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            })
          );
        }
      });
      const result = { key, lat, lng, defaultZoom };
      dispatch(InitializeMapAction.done({ result, params }));
    } catch (error) {
      dispatch(InitializeMapAction.failed({ error, params }));
    }
  };
}

function onStream(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  store: TStore,
  stream: any
) {
  dispatch(AddPeerAction({ peerId: stream.peerId, stream }));
  // Tell who is a presenter now, to peer joined newly.
  if (store.state.presenter) {
    store.state.room?.send({
      type: "peer-selected",
      peerId: store.state.presenter.peerId,
    });
  }
}

function onData(dispatch: ThunkDispatch<TStore, void, AnyAction>, data: any) {
  switch (data.type) {
    case "location-changed": {
      dispatch(OnMapLocationChangedAction({ lat: data.lat, lng: data.lng }));
      break;
    }
    case "peer-selected": {
      dispatch(OnPeerSelectedAction({ peerId: data.peerId }));
      break;
    }
    case "pointing-added": {
      dispatch(addPointing(data.peerId, data.x, data.y));
      break;
    }
    case "transform-changed": {
      dispatch(
        OnTransformChangedAction({ x: data.x, y: data.y, scale: data.scale })
      );
      break;
    }
  }
}
