import { RankRow } from './RankRow';
import { WeekdayRow } from './WeekdayRow';
import { PosterRow } from './PosterRow';
import { CollectionRow } from './CollectionRow';
import { LandscapeRow } from './LandscapeRow';
import { ChannelRow } from './ChannelRow';
import { VideoRow } from './VideoRow';
import { TalkRow } from './TalkRow';

const LandscapeRankRow = (props) => <LandscapeRow {...props} ranked />;
const VideoRankRow = (props) => <VideoRow {...props} ranked />;

const sectionTypes = {
  rank: RankRow,
  weekday: WeekdayRow,
  poster: PosterRow,
  collection: CollectionRow,
  landscape: LandscapeRow,
  landscapeRank: LandscapeRankRow,
  channel: ChannelRow,
  video: VideoRow,
  videoRank: VideoRankRow,
  talk: TalkRow,
};

// 섹션 type 에 맞는 컴포넌트로 그리기
// anchor 가 있는 섹션만 스크롤 앵커(section-{id})로 감싼다 (기존 카테고리 페이지 레이아웃 유지)
export const SectionRenderer = ({ sections = [] }) => {
  return sections.map((section) => {
    const Section = sectionTypes[section.type];
    if (!Section) return null;

    if (section.anchor) {
      return (
        <div key={section.id} id={`section-${section.id}`} className="section-anchor">
          <Section {...section} />
        </div>
      );
    }

    return <Section key={section.id} {...section} />;
  });
};
