import { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { programs } from "../data/retrov/retrov";
import { rankings, watching, recommendations } from "../data/retrov/retrovMain";
import { getImagePath } from "../utils/imagePath";
import { useRetrovTmdbStore } from "../store/useRetrovTmdbStore";

// 레트로브 영상 재생 (YoutubePlayerModal 과 함께 사용)
// - video.videoId 가 있으면 바로 재생 (무한도전: 엑셀의 유튜브 id)
// - 없으면 video.source(TMDB 고유 id·회차·검색어)로 영상을 찾은 뒤 재생
//   찾는 동안 status: "loading", 못 찾으면 status: "notFound"
export function useRetrovPlayer() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const { pathname } = useLocation();
  const onResolveVideo = useRetrovTmdbStore((state) => state.onResolveVideo);
  const requestRef = useRef(0); // 빠르게 다른 영상을 누르면 이전 결과는 버림

  const play = useCallback(
    async (input) => {
      const card = [...watching, ...recommendations].find((item) => item.id === input.id);
      const routeId = pathname.match(/^\/retrov\/([^/]+)\/?$/)?.[1];
      const programId = input.programId || card?.programId || routeId;
      const program = programs.find((item) => item.id === programId);
      const poster = rankings.find((item) => item.id === programId);
      const video = { ...input, historyItem: input.historyItem ?? (program ? {
        id: `retrov:${programId}`, type: "program", title: program.title,
        image: getImagePath(poster?.poster || program.thumbnail || program.image),
        to: `/retrov/${programId}`,
      } : null) };
      const request = ++requestRef.current;

      if (video.videoId || video.mbcUrl) {
        setPlayingVideo(video);
        return;
      }

      setPlayingVideo({ ...video, status: "loading" });
      let videoId;
      try { videoId = await onResolveVideo(video.source); }
      catch { videoId = null; }
      if (request !== requestRef.current) return;

      setPlayingVideo(videoId ? { ...video, videoId, status: "ready" } : { ...video, status: "notFound" });
    },
    [onResolveVideo, pathname]
  );

  const close = useCallback(() => {
    requestRef.current++;
    setPlayingVideo(null);
  }, []);

  return { playingVideo, play, close };
}
