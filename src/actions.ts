import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import Peer from "skyway-js";
import { actionCreatorFactory } from "../node_modules/typescript-fsa";

import { nextVideoStream } from "./lib/video";
import { IState } from "./reducer";
import { TStore } from "./store";

const actionCreator = actionCreatorFactory();

export const AddLikeAction = actionCreator.async<
  { id: number; x: number; y: number },
  { id: number; x: number; y: number },
  { error: any }
>("ADD_LIKE");
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
export const OnIconUpdatedAction = actionCreator<{
  dataURL: string;
  peerId: string;
}>("ON_ICON_UPDATED");
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

function onStream(
  dispatch: ThunkDispatch<TStore, void, AnyAction>,
  store: TStore,
  stream: any
) {
  dispatch(AddPeerAction({ peerId: stream.peerId, stream }));
  const audience = store.state.audiences.find(
    a => a.peerId === store.state.localPeer?.id
  );
  if (audience) {
    store.state.room?.send({
      type: "icon-updated",
      dataURL: audience.dataURL,
      peerId: store.state.localPeer?.id,
    });
  }
  // Tell who is a presenter now, to peer joined newly.
  if (store.state.presenter) {
    store.state.room?.send({
      type: "peer-selected",
      peerId: store.state.presenter.peerId,
    });
    store.state.room?.send({
      type: "location-muted",
      isMapEnabled: store.state.isPresenterMapEnabled,
    });
    store.state.room?.send({
      type: "location-changed",
      lat: store.state.map.lat,
      lng: store.state.map.lng,
    });
  }
}

function onData(dispatch: ThunkDispatch<TStore, void, AnyAction>, data: any) {
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
      dispatch(
        OnIconUpdatedAction({
          dataURL: data.dataURL,
          peerId: data.peerId,
        })
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
    case "transform-changed": {
      dispatch(
        OnTransformChangedAction({ x: data.x, y: data.y, scale: data.scale })
      );
      break;
    }
  }
}
