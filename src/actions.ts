import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import Peer from "skyway-js";
import { actionCreatorFactory } from "../node_modules/typescript-fsa";

import { nextVideoStream, updateAudioSettings } from "./lib/video";
import { IState } from "./reducer";
import { store, TStore } from "./store";

const actionCreator = actionCreatorFactory();

export const AddAudience = actionCreator<{
  peerId: string;
  stream: any;
  dataURL: string;
}>("ADD_AUDIENCE");
export const AddAudienceInPreparation = actionCreator<{
  peerId: string;
  stream?: any;
  dataURL?: string;
}>("ADD_AUDIENCE_IN_PREPARATION");
export const AddLikeAction = actionCreator.async<
  { id: number; x: number; y: number },
  { id: number; x: number; y: number },
  { error: any }
>("ADD_LIKE");
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
    dataURL: string;
    mapkey: string;
  },
  { error: any }
>("PARTICIPATE");
export const RemoveLikeAction = actionCreator<{ id: number }>("REMOVE_LIKE");
export const RemovePeerAction = actionCreator<{ peerId: string }>(
  "REMOVE_PEER"
);
export const RemovePointingAction = actionCreator<{ peerId: string }>(
  "REMOVE_POINTING"
);
export const SelectPeerAction = actionCreator.async<{}, {}, { error: any }>(
  "SELECT_PEER"
);
export const SetLikeAcrion = actionCreator.async<{}, {}, { error: any }>(
  "SET_Like"
);
export const SetPointintAcrion = actionCreator.async<{}, {}, { error: any }>(
  "SET_POINTING"
);
export const SetPreferencesVisibility = actionCreator<{
  isVisible: boolean;
}>("SET_PREFERENCES_VISIBILITY");
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
export const ToggleFullscreenModeAction = actionCreator.async<
  {},
  {},
  { error: any }
>("TOGGLE_FULLSCREEN_MODE");
export const ToggleMapMutingAction = actionCreator.async<
  {},
  { isEnabled: boolean },
  { error: any }
>("TOGGLE_MAP_MUTING");
export const OnFullscreenModeChangedAction = actionCreator<{
  isActive: boolean;
}>("ON_FULLSCREEN_MODE_CHANGED");
export const OnMapLocationChangedAction = actionCreator<{
  lat: number;
  lng: number;
}>("ON_MAP_LOCATION_CHANGED");
export const OnMapLocationWatchedAction = actionCreator<{
  watchId: number | null;
}>("ON_MAP_LOCATION_WATCHID");
export const OnMapLocationMutedAction = actionCreator<{
  isMapEnabled: boolean;
}>("ON_MAP_MUTED_UPDATED");
export const OnPeerSelectedAction = actionCreator<{
  peerId: string;
}>("ON_PEER_SELECTED");
export const OnTransformChangedAction = actionCreator<{
  x: number;
  y: number;
  scale: number;
}>("ON_TRANSFORM_CHANGED");
export const UpdateAudience = actionCreator<{
  peerId: string;
  isSpeaking?: boolean;
  stream?: any;
  dataURL?: string;
}>("UPDATE_AUDIENCE");
export const UpdatePreferencesAction = actionCreator.async<
  {},
  { localStream: MediaStream },
  { error: any }
>("UPDATE_PREFERENCES");

const pointingTimerMap = new Map();
let audioStatusTimeout: number;

export function participate(
  key: string,
  mapkey: string,
  network: "mesh" | "sfu",
  roomId: string,
  dataURL: string,
  localStream: MediaStream
) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = { key, mapkey, network, roomId, dataURL, localStream };
    try {
      dispatch(ParticipateAction.started(params));
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
        dataURL,
        mapkey,
      };

      dispatch(ParticipateAction.done({ result, params }));
      startUpdatingAudioStatus(dispatch, getState, localPeer.id, localStream);
      startObservationFullscreen(dispatch);
    } catch (error) {
      dispatch(ParticipateAction.failed({ error, params }));
    }
  };
}

function addLike(x: number, y: number) {
  return async (dispatch: ThunkDispatch<TStore, void, AnyAction>) => {
    const id = Date.now();
    const params = { id, x, y };

    try {
      dispatch(AddLikeAction.started(params));

      setTimeout(() => dispatch(RemoveLikeAction({ id })), 2000);

      dispatch(AddLikeAction.done({ result: params, params }));
    } catch (error) {
      dispatch(AddLikeAction.failed({ error, params }));
    }
  };
}

function addPointing(peerId: string, x: number, y: number) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = { peerId, x, y };

    if (!getState()?.state.audiences.some(a => a.peerId === peerId)) {
      // The audience that set the point is not prepared yet.
      return;
    }

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

      const state = getState()?.state;
      const room = state.room;

      if (room) {
        room.send({ type: "peer-selected", peerId });
        // As the room.send does not send to the local peer, update manually.
        dispatch(OnPeerSelectedAction({ peerId }));
        if (peerId === state.localPeer?.id) {
          updateLocationMuting(dispatch, room, state.isMapEnabled);
        }
      }

      dispatch(SelectPeerAction.done({ result: {}, params }));
    } catch (error) {
      dispatch(SelectPeerAction.failed({ error, params }));
    }
  };
}

export function setLike(x: number, y: number) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = {};

    try {
      dispatch(SetLikeAcrion.started(params));

      const state = getState()?.state;

      state.room?.send({ type: "like-added", x, y });
      dispatch(addLike(x, y));

      dispatch(SetLikeAcrion.done({ result: {}, params }));
    } catch (error) {
      dispatch(SetLikeAcrion.failed({ error, params }));
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

export function setPreferencesVisibility(isVisible: boolean) {
  return async (dispatch: ThunkDispatch<TStore, void, AnyAction>) => {
    dispatch(SetPreferencesVisibility({ isVisible }));
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
      const localStream = await nextVideoStream();
      // parameter of replaceStream is defined as MediaSource, but localStream is MediaStream.
      // I don't know why..
      (state?.room as any)?.replaceStream(localStream);
      const result = { localStream };
      if (state.localPeer) {
        startUpdatingAudioStatus(
          dispatch,
          getState,
          state.localPeer.id,
          localStream
        );
      }

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

      const result = { isEnabled };

      dispatch(ToggleCameraMutingAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleCameraMutingAction.failed({ error, params }));
    }
  };
}

export function toggleFullscreenMode() {
  return async (dispatch: ThunkDispatch<TStore, void, AnyAction>) => {
    const params = {};

    try {
      dispatch(ToggleFullscreenModeAction.started(params));

      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const target = document.documentElement;
        if (target.requestFullscreen) {
          target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen();
        } else {
          throw new Error("No requestFullscreen function found");
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else {
          throw new Error("No exitFullscreen function found");
        }
      }

      const result = {};

      dispatch(ToggleFullscreenModeAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleFullscreenModeAction.failed({ error, params }));
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
      const room = state.room;
      const isEnabled = !state.isMapEnabled;
      const watchId = state.map.watchId;

      if (isEnabled) {
        ActivateMap(dispatch, getState);
      } else if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        OnMapLocationWatchedAction({ watchId: null });
      }

      if (amIPresenter(state) && room) {
        updateLocationMuting(dispatch, room, isEnabled);
      }

      const result = { isEnabled };

      dispatch(ToggleMapMutingAction.done({ result, params }));
    } catch (error) {
      dispatch(ToggleMapMutingAction.failed({ error, params }));
    }
  };
}

export function updatePreferences(audioPreferences: Object) {
  return async (
    dispatch: ThunkDispatch<TStore, void, AnyAction>,
    getState: () => TStore
  ) => {
    const params = { audioPreferences };

    try {
      dispatch(UpdatePreferencesAction.started(params));

      const state = getState()?.state;
      const localStream = await await updateAudioSettings(audioPreferences);
      (state?.room as any)?.replaceStream(localStream);
      const result = { localStream };

      dispatch(UpdatePreferencesAction.done({ result, params }));
    } catch (error) {
      dispatch(UpdatePreferencesAction.failed({ error, params }));
    }
  };
}

async function ActivateMap(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  getState: () => TStore
) {
  const state = getState()?.state;
  const room = state.room;

  const { lat, lng } = await new Promise(resolve =>
    navigator.geolocation.getCurrentPosition(pos => {
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })
  );

  const watchId = navigator.geolocation.watchPosition(pos => {
    const state = getState()?.state;

    if (state && amIPresenter(state) && room) {
      updateLocation(dispatch, room, pos.coords.latitude, pos.coords.longitude);
    }
  });

  dispatch(OnMapLocationWatchedAction({ watchId }));

  if (room) {
    updateLocation(dispatch, room, lat, lng);
  }
}

function startObservationFullscreen(
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) {
  document.addEventListener("fullscreenchange", () => {
    const isActive = !!document.fullscreenElement;
    dispatch(OnFullscreenModeChangedAction({ isActive }));
  });
  document.addEventListener("webkitfullscreenchange", () => {
    const isActive = !!document.webkitFullscreenElement;
    dispatch(OnFullscreenModeChangedAction({ isActive }));
  });
}

function startUpdatingAudioStatus(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  getState: () => TStore,
  peerId: string,
  localStream: MediaStream
) {
  const speakingThreshold = 2.5;
  const updateIntervalTime = 500;
  const inspectionRangeTime = 3000;
  const averages = new Array(inspectionRangeTime / updateIntervalTime);
  averages.fill(0);

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sourceNode = audioContext.createMediaStreamSource(localStream);
  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 32;
  sourceNode.connect(analyserNode);
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  const updateAudioStatus = function () {
    analyserNode.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; ++i) {
      const value = dataArray[i];
      // See the following document to know the reason why this depends on 128.
      // https://www.w3.org/TR/webaudio/#dom-analysernode-getbytetimedomaindata
      sum += Math.abs(value - 128);
    }
    for (let i = 0; i < averages.length - 1; i++) {
      averages[i] = averages[i + 1];
    }
    averages[averages.length - 1] = sum / dataArray.length;

    const averagesSum = averages.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    });
    const isSpeaking = averagesSum / averages.length > speakingThreshold;

    const state = store.getState()?.state;
    const audience = state.audiences.find(a => a.peerId === peerId);

    if (audience?.isSpeaking !== isSpeaking) {
      dispatch(UpdateAudience({ peerId, isSpeaking }));
      state.room?.send({
        type: "audio-status-updated",
        isSpeaking: isSpeaking,
        peerId: peerId,
      });
    }

    audioStatusTimeout = window.setTimeout(
      updateAudioStatus,
      updateIntervalTime
    );
  };

  clearTimeout(audioStatusTimeout);
  updateAudioStatus();
}

function amIPresenter(state: IState) {
  if (!state.presenter?.peerId || !state.localPeer?.id) {
    return false;
  }
  return state.presenter.peerId === state.localPeer.id;
}

function updateLocation(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  room: SFURoom | MeshRoom,
  lat: number,
  lng: number
) {
  room.send({
    type: "location-changed",
    lat,
    lng,
  });
  dispatch(
    OnMapLocationChangedAction({
      lat,
      lng,
    })
  );
}

function updateLocationMuting(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  room: SFURoom | MeshRoom,
  isMapEnabled: boolean
) {
  room.send({
    type: "location-muted",
    isMapEnabled: isMapEnabled,
  });
  dispatch(OnMapLocationMutedAction({ isMapEnabled }));
}

function updateAudienceInPreparation(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  state: IState,
  peerId: string,
  stream?: any,
  dataURL?: string
) {
  const audienceExist = state.audiences.find(a => a.peerId === peerId);

  if (audienceExist) {
    dispatch(UpdateAudience({ peerId, stream, dataURL }));
    return;
  }

  const audienceInPreparation = state.audiencesInPreparation.find(
    a => a.peerId === peerId
  );

  if (audienceInPreparation) {
    stream = stream || audienceInPreparation.stream;
    dataURL = dataURL || audienceInPreparation.dataURL;
  }

  if (stream && dataURL) {
    dispatch(AddAudience({ peerId, stream, dataURL }));
  } else {
    dispatch(AddAudienceInPreparation({ peerId, stream, dataURL }));

    if (!state.room) {
      return;
    }

    const mine = state.audiences.find(a => a.peerId === state.localPeer?.id);
    if (!mine) {
      return;
    }

    state.room.send({
      type: "icon-updated",
      dataURL: mine.dataURL,
      peerId: mine.peerId,
      to: peerId,
    });

    // Tell who is a presenter now, to peer joined newly.
    if (state.presenter?.peerId === mine.peerId) {
      state.room.send({
        type: "peer-selected",
        peerId: state.presenter.peerId,
        to: peerId,
      });
      state.room.send({
        type: "location-muted",
        isMapEnabled: state.isPresenterMapEnabled,
        to: peerId,
      });
      state.room.send({
        type: "location-changed",
        lat: state.map.lat,
        lng: state.map.lng,
        to: peerId,
      });
    }
  }
}

function onStream(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  store: TStore,
  stream: any
) {
  updateAudienceInPreparation(
    dispatch,
    store.state,
    stream.peerId,
    stream,
    undefined
  );
}

function onData(dispatch: ThunkDispatch<TStore, void, AnyAction>, data: any) {
  const state = store.getState()?.state;

  if (data.to && data.to !== state?.localPeer?.id) {
    return;
  }

  switch (data.type) {
    case "like-added": {
      dispatch(addLike(data.x, data.y));
      break;
    }
    case "location-changed": {
      dispatch(OnMapLocationChangedAction({ lat: data.lat, lng: data.lng }));
      break;
    }
    case "location-muted": {
      dispatch(OnMapLocationMutedAction({ isMapEnabled: data.isMapEnabled }));
      break;
    }
    case "icon-updated": {
      updateAudienceInPreparation(
        dispatch,
        state,
        data.peerId,
        undefined,
        data.dataURL
      );
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
    case "audio-status-updated": {
      dispatch(
        UpdateAudience({
          peerId: data.peerId,
          isSpeaking: data.isSpeaking,
        })
      );
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
