// 예시 편성 데이터입니다. 실제 방송 편성/시청 가능 여부를 나타내지 않습니다.
export const channels = [
  { id: 'ebs1', name: 'EBS1' },
  { id: 'ebs2', name: 'EBS2' },
  { id: 'mbn', name: 'MBN' },
  { id: 'tvchosun', name: 'TV CHOSUN' },
  { id: 'channela', name: 'Channel A' },
  { id: 'ytn', name: 'YTN' },
];

const templates = {
  ebs1: [
    ['교육 프로그램', 0, 420], ['아침 교양', 420, 840], ['어린이 탐험', 840, 895],
    ['세계 이야기', 895, 940], ['과학 탐구', 940, 980], ['자연 다큐멘터리', 980, 1050], ['밤의 클래식', 1050, 1440],
  ],
  ebs2: [
    ['교육 방송', 0, 780], ['문화 탐방', 780, 870], ['지식 플러스', 870, 930],
    ['여행 이야기', 930, 990], ['음악 산책', 990, 1080], ['심야 특집', 1080, 1440],
  ],
  mbn: [
    ['뉴스 및 교양', 0, 780], ['뉴스특보', 780, 880], ['생활 이야기', 880, 960],
    ['뉴스와이드', 960, 1070], ['저녁 시사', 1070, 1200], ['심야 프로그램', 1200, 1440],
  ],
  tvchosun: [
    ['종합 편성', 0, 780], ['뉴스특보', 780, 900], ['금요일 이야기', 900, 960],
    ['미스터 음악쇼', 960, 1040], ['오늘의 토크', 1040, 1200], ['심야 재방송', 1200, 1440],
  ],
  channela: [
    ['채널A 방송', 0, 800], ['뉴스 브리핑', 800, 870], ['건강 이야기', 870, 950],
    ['도시 탐방', 950, 1030], ['저녁 뉴스', 1030, 1140], ['특집 방송', 1140, 1440],
  ],
  ytn: [
    ['뉴스', 0, 840], ['뉴스 2PM', 840, 900], ['뉴스 3PM', 900, 960],
    ['뉴스 4PM', 960, 1020], ['뉴스 5PM', 1020, 1080], ['뉴스', 1080, 1440],
  ],
};

const localDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export { localDateKey };

export function getScheduleForDate(date) {
  const dayKey = localDateKey(date);
  return channels.map(channel => ({
    ...channel,
    programs: templates[channel.id].map(([title, start, end], index) => ({
      id: `${dayKey}-${channel.id}-${index}`,
      title,
      start,
      end,
      channelId: channel.id,
      channelName: channel.name,
      dateKey: dayKey,
      // true인 프로그램만 다시보기 상세 페이지로 이동할 수 있습니다.
      replayAvailable: channel.id === 'ebs1' && index === 2,
      detailPath: '/programdetail',
    })),
  }));
}
