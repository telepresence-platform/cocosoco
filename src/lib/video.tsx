let currentIndex = -1;
let currentStream: any = null;
async function getDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === "videoinput");
}
export async function nextVideoStream() {
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
    audio: true,
    video: { deviceId },
  });
  return currentStream;
}
