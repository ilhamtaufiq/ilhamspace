import type Hls from "hls.js";

export type MatchAudioPlayer = {
  play: () => Promise<void>;
  pause: () => void;
  destroy: () => void;
  isPlaying: () => boolean;
};

export const attachMatchAudioStream = async (
  audio: HTMLAudioElement,
  streamUrl: string,
): Promise<MatchAudioPlayer> => {
  if (audio.canPlayType("application/vnd.apple.mpegurl")) {
    audio.src = streamUrl;
    return createNativePlayer(audio);
  }

  const { default: HlsConstructor } = await import("hls.js");
  if (!HlsConstructor.isSupported()) {
    throw new Error("HLS playback is not supported in this browser");
  }

  const hls = new HlsConstructor({
    enableWorker: true,
    lowLatencyMode: true,
  });

  return new Promise((resolve, reject) => {
    hls.on(HlsConstructor.Events.MANIFEST_PARSED, () => {
      resolve(createHlsPlayer(audio, hls));
    });

    hls.on(HlsConstructor.Events.ERROR, (_event, data) => {
      if (!data.fatal) {
        return;
      }
      hls.destroy();
      reject(new Error(data.type));
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(audio);
  });
};

const createNativePlayer = (audio: HTMLAudioElement): MatchAudioPlayer => ({
  play: async () => {
    await audio.play();
  },
  pause: () => {
    audio.pause();
  },
  destroy: () => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  },
  isPlaying: () => !audio.paused && !audio.ended,
});

const createHlsPlayer = (audio: HTMLAudioElement, hls: Hls): MatchAudioPlayer => ({
  play: async () => {
    await audio.play();
  },
  pause: () => {
    audio.pause();
  },
  destroy: () => {
    audio.pause();
    hls.destroy();
    audio.removeAttribute("src");
    audio.load();
  },
  isPlaying: () => !audio.paused && !audio.ended,
});