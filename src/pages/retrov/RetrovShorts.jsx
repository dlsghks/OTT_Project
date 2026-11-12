import { Shorts } from "../shorts/Shorts";
import { shorts } from "../../data/retrov/retrovMain";
import { programs } from "../../data/retrov/retrov";
import { getImagePath } from "../../utils/imagePath";

import "../../styles/pages/retrov/RetrovShorts.scss";

// 레트로브 영상만 기존 숏츠 UI의 데이터 형식으로 변환
const retroShortsItems = shorts.map((item) => {
  const program = programs.find(
    (program) => program.id === item.programId
  );

  const programImage = getImagePath(
    program?.thumbnail || item.image
  );

  return {
    id: item.id,
    youtubeUrl: `https://www.youtube.com/shorts/${item.videoId}`,
    title: item.title,
    episode: program?.title || "레트로브",
    programImage,
    mypageImage: programImage,
    // 해당 프로그램 상세페이지
    programTo: `/retrov/${item.programId}`,
  };
});

export const RetrovShorts = () => {
  return (
    <>
      <Shorts items={retroShortsItems} />
    </>
  );
};

export default RetrovShorts;