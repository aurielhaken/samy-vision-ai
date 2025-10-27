import { useEffect, useRef, useState } from "react";

export function useAudioLevel(audioRef: React.RefObject<HTMLAudioElement>) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    const data = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(ctx.destination);

    const update = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128; // -1..1
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length); // 0..1 approx
      const scaled = Math.min(1, Math.max(0, rms * 3));
      setLevel(scaled);
      rafRef.current = requestAnimationFrame(update);
    };

    const onPlay = () => ctx.resume?.();
    audio.addEventListener("play", onPlay);
    update();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.removeEventListener("play", onPlay);
      try {
        source.disconnect();
        analyser.disconnect();
        ctx.close();
      } catch {}
    };
  }, [audioRef]);

  return level;
}
