import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getGolfProgram, golfStreamingPosters, golfEverythingPosters } from '../../data/golfData';
import { useDetailActions } from '../../hooks/useDetailActions';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { DetailLayout } from '../../components/detail/DetailLayout';
import { DetailHero } from '../../components/detail/DetailHero';
import { DetailMessage } from '../../components/detail/DetailMessage';
import { DetailSections } from '../../components/detail/DetailSections';
import { VideoRow } from '../../components/wavve/VideoRow';

import '../../styles/pages/special/Special.scss';

// 골프 프로그램 상세 (/golf/program/:programId) — 영화 · 시리즈 상세 페이지와 같은 틀 (DetailLayout · DetailHero)
// - programId: 웨이브 프로그램 id (예: S31_20261029_SOIL)
// - 골프 대회 · 골프 예능은 TMDB 에 없어 웨이브 정보(data/golfData.js)로 구성
// - 회차 · 클립을 누르거나 시청하기 → 골프 클립 재생 화면
export const GolfProgram = () => {
  const { programId } = useParams();
  const program = getGolfProgram(programId);

  if (!program) {
    return <DetailMessage message="프로그램 정보를 찾을 수 없습니다." backLink="/special/golf" backLabel="골프로 돌아가기" />;
  }

  return <GolfProgramBody key={program.id} program={program} />;
};

const GolfProgramBody = ({ program }) => {
  const navigate = useNavigate();
  const actions = useDetailActions({
    id: `golf:${program.id}`, type: "program", title: program.title,
    image: program.poster || program.image || "",
  });
  const player = useVideoPlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const firstEpisode = program.episodes[0];
  const others = (items) => items.filter((item) => !item.link.endsWith(encodeURIComponent(program.id)));

  return (
    <DetailLayout
      player={player}
      actions={actions}
      hero={(
        <DetailHero
          title={program.title}
          backdrop={program.backdrop}
          meta={`${program.tour} · 골프`}
          overview={program.overview}
          info={[
            { label: '개요', value: program.tour },
            { label: '장르', value: '스포츠 · 골프' },
          ]}
          onWatch={() => firstEpisode && navigate(firstEpisode.link)}
          actions={actions}
        />
      )}
    >
      <VideoRow title={`회차 · 클립 (총 ${program.episodes.length}개)`} items={program.episodes} />

      <DetailSections
        sections={[
          { id: 'streaming', title: '골프 스트리밍은 웨이브에서', items: others(golfStreamingPosters) },
          { id: 'everything', title: '웨이브에서 만나는 골프의 모든 것', items: others(golfEverythingPosters) },
        ]}
      />
    </DetailLayout>
  );
};
