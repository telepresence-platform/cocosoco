const AUDIO_SETTINGS = [
  {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  {
    echoCancellation: true,
    noiseSuppression: false,
    autoGainControl: false,
  },
  {
    echoCancellation: false,
    noiseSuppression: true,
    autoGainControl: false,
  },
  {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: true,
  },
  {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,
  },
  {
    echoCancellation: true,
    noiseSuppression: false,
    autoGainControl: true,
  },
  {
    echoCancellation: false,
    noiseSuppression: true,
    autoGainControl: true,
  },
  {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
];

let audioSettingIndex = 0;

let currentIndex = -1;
let currentStream: any = null;
async function getDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === "videoinput");
}
export async function nextVideoStream() {
  if (currentIndex === -1) {
    // It seems that there are cases the deviceId might be empty unless we call getUserMedia() once.
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  }

  if (currentStream) {
    currentStream.getTracks().forEach((track: any) => {
      track.stop();
    });
  }
  const devices = await getDevices();
  const nextIndex = currentIndex === devices.length - 1 ? 0 : currentIndex + 1;
  const nextDevice = devices[nextIndex];
  const deviceId = { exact: nextDevice.deviceId };
  currentIndex = nextIndex;
  currentStream = await navigator.mediaDevices.getUserMedia({
    audio: AUDIO_SETTINGS[audioSettingIndex],
    video: { deviceId },
  });

  return currentStream;
}

export async function nextVideoSetting() {
  if (currentStream) {
    currentStream.getTracks().forEach((track: any) => {
      track.stop();
    });
  }

  const nextIndex =
    audioSettingIndex === AUDIO_SETTINGS.length - 1 ? 0 : audioSettingIndex + 1;
  const devices = await getDevices();
  const device = devices[currentIndex];
  const deviceId = { exact: device.deviceId };
  currentStream = await navigator.mediaDevices.getUserMedia({
    audio: AUDIO_SETTINGS[nextIndex],
    video: { deviceId },
  });
  audioSettingIndex = nextIndex;
  alert(JSON.stringify(AUDIO_SETTINGS[audioSettingIndex]));
  return currentStream;
}
