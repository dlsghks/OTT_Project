import { useCallback, useRef, useState } from "react";
import { useRetrovTmdbStore } from "../store/useRetrovTmdbStore";

// 레트로브 영상 재생 (YoutubePlayerModal 과 함께 사용)
// - video.videoId 가 있으면 바로 재생 (무한도전: 엑셀의 유튜브 id)
// - 없으면 video.source(TMDB 고유 id·회차·검색어)로 영상을 찾은 뒤 재생
//   찾는 동안 status: "loading", 못 찾으면 status: "notFound"
export function useRetrovPlayer() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const onResolveVideo = useRetrovTmdbStore((state) => state.onResolveVideo);
  const requestRef = useRef(0); // 빠르게 다른 영상을 누르면 이전 결과는 버림

  const play = useCallback(
    async (video) => {
      const request = ++requestRef.current;

      if (video.videoId) {
        setPlayingVideo(video);
        return;
      }

      setPlayingVideo({ ...video, status: "loading" });
      const videoId = await onResolveVideo(video.source);
      if (request !== requestRef.current) return;

      setPlayingVideo(videoId ? { ...video, videoId, status: "ready" } : { ...video, status: "notFound" });
    },
    [onResolveVideo]
  );

  const close = useCallback(() => {
    requestRef.current++;
    setPlayingVideo(null);
  }, []);

  return { playingVideo, play, close };
}
