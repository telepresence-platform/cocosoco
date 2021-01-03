import { reducerWithInitialState } from "typescript-fsa-reducers";

import {
  AddLikeAction,
  AddPeerAction,
  AddPointingAction,
  ParticipateAction,
  RemoveLikeAction,
  RemovePeerAction,
  RemovePointingAction,
  SwitchCameraAction,
  ToggleAudioMutingAction,
  ToggleCameraMutingAction,
  ToggleMapMutingAction,
  OnMapLocationChangedAction,
  OnMapLocationMutedAction,
  OnMapLocationWatchedAction,
  OnIconUpdatedAction,
  OnPeerSelectedAction,
  OnTransformChangedAction,
} from "./actions";
import { Like, Map, Member, Pointing, Transform } from "./types";

export interface IState {
  audiences: Member[];
  isAudioEnabled: boolean;
  isCameraEnabled: boolean;
  isMapEnabled: boolean;
  isPresenterMapEnabled: boolean;
  likes: Like[];
  localPeer?: Peer;
  localStream?: MediaStream;
  room?: SFURoom | MeshRoom;
  pointings: Pointing[];
  map: Map;
  presenter?: Member;
  transform: Transform;
  // Don't use this. The reason why we need this variable is because the `peer-selected`
  // event and AddPeerAction timing after joining the room is racing.
  _selectedPeerId?: string;
}

const initialState: IState = {
  audiences: [],
  isAudioEnabled: true,
  isCameraEnabled: true,
  isMapEnabled: false,
  isPresenterMapEnabled: false,
  likes: [],
  pointings: [],
  map: { lat: 0, lng: 0, defaultZoom: 12, watchId: null },
  transform: { x: 0, y: 0, scale: 1 },
};

export const reducer = reducerWithInitialState(initialState)
  .case(AddLikeAction.done, (state, { result }) => {
    const { id, x, y } = result;

    return Object.assign({}, state, {
      likes: [...state.likes, { id, x, y }],
    });
  })
  .case(AddPeerAction, (state, { peerId, stream }) => {
    const index = state.audiences.findIndex(a => a.peerId === peerId);
    let audience;
    let audiences = state.audiences;
    if (index !== -1) {
      audience = audiences[index];
      audiences[index] = Object.assign({}, audience, { stream: stream });
      audiences = [...state.audiences];
    } else {
      audiences = [...state.audiences, { peerId, stream }];
    }

    // As the presenter peer joined after firing `peer-selected` event, set as a presenter.
    const presenter =
      state._selectedPeerId === peerId ? audience : state.presenter;
    const transform =
      presenter === state.presenter ? state.transform : initialState.transform;

    return Object.assign({}, state, { audiences, presenter, transform });
  })
  .case(AddPointingAction.done, (state, { result }) => {
    const { peerId, x, y } = result;
    const pointings = state.pointings.filter(p => p.audience.peerId !== peerId);
    const audience = state.audiences.find(a => a.peerId === peerId);

    return Object.assign({}, state, {
      pointings: [...pointings, { audience, x, y }],
    });
  })
  .case(ParticipateAction.done, (state, { result }) => {
    const { localPeer, localStream, room, dataURL, mapkey } = result;

    for (const track of localStream.getVideoTracks() || []) {
      track.enabled = false;
    }

    const audience = {
      peerId: localPeer.id,
      stream: localStream,
      dataURL: dataURL,
    };
    const audiences = [audience];
    const map = Object.assign({}, state.map, { key: mapkey });

    return Object.assign({}, state, {
      audiences,
      localPeer,
      localStream,
      map,
      room,
    });
  })
  .case(RemoveLikeAction, (state, { id }) => {
    const likes = state.likes.filter(p => p.id !== id);

    return Object.assign({}, state, { likes });
  })
  .case(RemovePeerAction, (state, { peerId }) => {
    const audiences = state.audiences.filter(a => a.peerId !== peerId);
    const presenter =
      state.presenter?.peerId === peerId ? null : state.presenter;

    return Object.assign({}, state, { audiences, presenter });
  })
  .case(RemovePointingAction, (state, { peerId }) => {
    const pointings = state.pointings.filter(p => p.audience.peerId !== peerId);

    return Object.assign({}, state, { pointings });
  })
  .case(SwitchCameraAction.done, (state, { result }) => {
    const { localStream } = result;
    const peerId = state.localPeer?.id;

    const audiences = state.audiences.map(a =>
      a.peerId === peerId ? Object.assign({}, a, { stream: localStream }) : a
    );
    const presenter = audiences.find(a => a.peerId === state.presenter?.peerId);

    updateVideoStreamEnabled(
      localStream,
      state.localPeer,
      state.isCameraEnabled,
      presenter
    );

    return Object.assign({}, state, { audiences, localStream, presenter });
  })
  .case(ToggleAudioMutingAction.done, (state, { result }) => {
    const { isEnabled } = result;

    return Object.assign({}, state, { isAudioEnabled: isEnabled });
  })
  .case(ToggleCameraMutingAction.done, (state, { result }) => {
    const { isEnabled } = result;

    updateVideoStreamEnabled(
      state.localStream,
      state.localPeer,
      isEnabled,
      state.presenter
    );

    return Object.assign({}, state, { isCameraEnabled: isEnabled });
  })
  .case(ToggleMapMutingAction.done, (state, { result }) => {
    const { isEnabled } = result;

    return Object.assign({}, state, { isMapEnabled: isEnabled });
  })
  .case(OnMapLocationChangedAction, (state, { lat, lng }) => {
    return Object.assign({}, state, {
      map: Object.assign({}, state.map, { lat, lng }),
    });
  })
  .case(OnMapLocationWatchedAction, (state, { watchId }) => {
    return Object.assign({}, state, {
      map: Object.assign({}, state.map, { watchId }),
    });
  })
  .case(OnMapLocationMutedAction, (state, { isMapEnabled }) => {
    return Object.assign({}, state, { isPresenterMapEnabled: isMapEnabled });
  })
  .case(OnIconUpdatedAction, (state, { dataURL, peerId }) => {
    const index = state.audiences.findIndex(a => a.peerId === peerId);
    let audience;
    let audiences = state.audiences;
    if (index !== -1) {
      audience = audiences[index];
      audiences[index] = Object.assign({}, audience, { dataURL: dataURL });
      audiences = [...state.audiences];
    } else {
      audiences = [...state.audiences, { peerId, dataURL }];
    }

    return Object.assign({}, state, { audiences });
  })
  .case(OnPeerSelectedAction, (state, { peerId }) => {
    const presenter = state.audiences.find(a => a.peerId === peerId);

    updateVideoStreamEnabled(
      state.localStream,
      state.localPeer,
      state.isCameraEnabled,
      presenter
    );

    return Object.assign({}, state, {
      presenter,
      transform: initialState.transform,
      _selectedPeerId: peerId,
    });
  })
  .case(OnTransformChangedAction, (state, { x, y, scale }) => {
    return Object.assign({}, state, { transform: { x, y, scale } });
  });

function updateVideoStreamEnabled(
  localStream?: MediaStream,
  localPeer?: Peer,
  isCameraEnabled?: boolean,
  presenter?: Member
) {
  if (!localStream) {
    return;
  }

  const isEnabled: boolean = !!(
    isCameraEnabled && localPeer?.id === presenter?.peerId
  );
  for (const track of localStream.getVideoTracks() || []) {
    track.enabled = isEnabled;
  }
}
