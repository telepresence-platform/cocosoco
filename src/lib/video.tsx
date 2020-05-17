let currentIndex = -1;

async function getDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === "videoinput");
}

export async function nextVideoStream() {
  const devices = await getDevices();

  const nextIndex = currentIndex === devices.length -1 ? 0 : currentIndex + 1;
  const nextDevice = devices[nextIndex];

  const deviceId = nextDevice.deviceId;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { deviceId },
  });

  currentIndex = nextIndex;

  return stream;
}
