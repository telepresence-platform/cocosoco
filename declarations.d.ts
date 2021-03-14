interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface Document {
  webkitFullscreenElement;
  webkitExitFullscreen();
}

interface HTMLElement {
  webkitRequestFullscreen();
}
