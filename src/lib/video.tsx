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

  // default setting.
  let audioSettings = {
    autoGainControl: false,
    echoCancellation: true,
    noiseSuppression: true,
  };

  if (currentStream) {
    audioSettings = getCurrentAudioSettings();
    currentStream.getTracks().forEach((track: any) => {
      track.enabled = false;
      track.stop();
    });
  }

  const devices = await getDevices();
  const nextIndex = currentIndex === devices.length - 1 ? 0 : currentIndex + 1;
  currentStream = await getStream(devices[nextIndex], audioSettings);
  currentIndex = nextIndex;
  return currentStream;
}

export async function updateAudioSettings(audioSettings: Object) {
  currentStream.getAudioTracks()[0].applyConstraints(audioSettings);
}

export function getCurrentAudioSettings() {
  return currentStream.getAudioTracks()[0].getSettings();
}

async function getStream(device: any, audioSettings: Object) {
  const deviceId = { exact: device.deviceId };

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: audioSettings,
    video: { deviceId },
  });

  return stream;
}
