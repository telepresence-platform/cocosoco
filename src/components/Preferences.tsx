import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { setPreferencesVisibility, updatePreferences } from "../actions";
import { getCurrentAudioSettings } from "../lib/video";

import logo from "./PreferencesClose.svg";
import "./Preferences.css";

interface IProps {
  closePreferences: any;
}

class Preferences extends React.PureComponent<IProps> {
  private _echoCancellationRef = React.createRef<HTMLInputElement | any>();
  private _noiseSuppressionRef = React.createRef<HTMLInputElement | any>();
  private _autoGainControlRef = React.createRef<HTMLInputElement | any>();

  render() {
    const {
      autoGainControl,
      echoCancellation,
      noiseSuppression,
    } = getCurrentAudioSettings();

    return (
      <section className="preferences">
        <div className="preferences-content">
          <fieldset className="preferences-fieldset">
            <legend>Audio settings</legend>
            <ul>
              <li className="preferences-li">
                <input
                  type="checkbox"
                  id="preferences-checkbox--echo-cancelling"
                  ref={this._echoCancellationRef}
                  defaultChecked={echoCancellation}
                  className="preferences-checkbox"
                />
                <label htmlFor="preferences-checkbox--echo-cancelling">
                  Echo cancellation
                </label>
              </li>
              <li className="preferences-li">
                <input
                  type="checkbox"
                  id="preferences-checkbox--noise-suppression"
                  ref={this._noiseSuppressionRef}
                  defaultChecked={noiseSuppression}
                  className="preferences-checkbox"
                />
                <label htmlFor="preferences-checkbox--noise-suppression">
                  Noise suppression
                </label>
              </li>
              <li className="preferences-li">
                <input
                  type="checkbox"
                  id="preferences-checkbox--auto-gain-control"
                  ref={this._autoGainControlRef}
                  defaultChecked={autoGainControl}
                  className="preferences-checkbox"
                />
                <label htmlFor="preferences-checkbox--auto-gain-control">
                  Auto gain control
                </label>
              </li>
            </ul>
            <button
              onClick={() => this.props.closePreferences(this)}
              className="preferences-close"
            >
              <img
                src={logo}
                alt="close preferences"
                className="preferences-close__image"
              />
            </button>
          </fieldset>
        </div>
      </section>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  closePreferences: async (target: any) => {
    const audioSettings = {
      echoCancellation: target._echoCancellationRef.current.checked,
      noiseSuppression: target._noiseSuppressionRef.current.checked,
      autoGainControl: target._autoGainControlRef.current.checked,
    };
    dispatch(updatePreferences(audioSettings));
    await dispatch(setPreferencesVisibility(false));
  },
});

export default connect(null, mapDispatchToProps)(Preferences);
