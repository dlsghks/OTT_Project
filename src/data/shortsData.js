// 상세 주소가 있는 60개 영상. 레트로브 데이터와는 분리합니다.
export const SHORTS_FILTERS = [
  {
    "id": "all",
    "label": "전체"
  },
  {
    "id": "entertainment",
    "label": "예능"
  },
  {
    "id": "drama",
    "label": "드라마"
  },
  {
    "id": "sports",
    "label": "스포츠"
  },
  {
    "id": "golf",
    "label": "골프"
  },
  {
    "id": "music",
    "label": "뮤직"
  },
  {
    "id": "survival",
    "label": "서바이벌"
  },
  {
    "id": "currentaffairs",
    "label": "시사교양"
  }
];

// [프로그램명, 상세 경로, 필터 태그, 기존 프로그램 이미지, 기존 마이페이지 이미지]
// 빈 상세 경로는 확인 후 입력하세요.
const programs = {
  "infinite": [
    "무한도전",
    "/entertainmentdetail/5092",
    [
      "entertainment"
    ],
    "infinite-challenge.jpg",
    "infinite-challenge.jpg"
  ],
  "hangout": [
    "놀면 뭐하니?",
    "/entertainmentdetail/ent-03",
    [
      "entertainment"
    ],
    "hangout-with-yoo.jpg",
    "hangout-with-yoo.jpg"
  ],
  "siblings": [
    "연애남매2",
    "/entertainmentdetail/247085",
    [
      "entertainment"
    ],
    "my-siblings-romance-2.jpg",
    "my-siblings-romance-2.jpg"
  ],
  "summer": [
    "여름방학",
    "/dramadetail/335951",
    [
      "drama"
    ],
    "s_summer.png",
    "summer.png"
  ],
  "manager": [
    "전지적 참견 시점",
    "/entertainmentdetail/ent-04",
    [
      "entertainment"
    ],
    "s_manager.png",
    "manager.png"
  ],
  "kim": [
    "신인감독 김연경2",
    "/entertainmentdetail/301798",
    [
      "entertainment",
      "sports"
    ],
    "s_kim.png",
    "kim.png"
  ],
  "uquiz": [
    "유 퀴즈 온 더 블럭",
    "/entertainmentdetail/ent-23",
    [
      "entertainment"
    ],
    "s_uquiz.png",
    "uquiz.png"
  ],
  "radio": [
    "라디오스타",
    "/entertainmentdetail/ent-07",
    [
      "entertainment"
    ],
    "s_radiostar.png",
    "radiostar.png"
  ],
  "alone": [
    "나 혼자 산다",
    "/entertainmentdetail/ent-02",
    [
      "entertainment"
    ],
    "i-live-alone.jpg",
    "i-live-alone.jpg"
  ],
  "college": [
    "대학체전: 소년선수촌",
    "/entertainmentdetail/246682",
    [
      "sports"
    ]
  ],
  "shoot": [
    "날아라 슛돌이 3기",
    "/dramadetail/216824",
    [
      "sports"
    ],
    "shoot-dori.jpg",
    "shoot-dori.jpg"
  ],
  "neighborhood": [
    "우리동네 예체능",
    "/entertainmentdetail/53097",
    [
      "sports"
    ],
    "cool-kiz.jpg",
    "cool-kiz.jpg"
  ],
  "field": [
    "웨이브 필드캠",
    "/golf/program/C3541_WAVVE_FC",
    [
      "sports",
      "golf"
    ],
    "wavve-fieldcam.jpg",
    "wavve-fieldcam.jpg"
  ],
  "kpga": [
    "2026 KPGA",
    "/golf/program/S31_20261105_TOURCHAMP",
    [
      "sports",
      "golf"
    ],
    "kpga-2026.jpg",
    "kpga-2026.jpg"
  ],
  "seasons": [
    "더 시즌즈 - 성시경의 고막남친",
    "/entertainmentdetail/ent-20",
    [
      "music"
    ],
    "the-seasons.jpg",
    "the-seasons.jpg"
  ],
  "musiccore": [
    "쇼! 음악중심",
    "/entertainmentdetail/35024",
    [
      "music"
    ]
  ],
  "happy": [
    "해피투게더 - 혼자가 아니어서 좋아",
    "/entertainmentdetail/5709",
    [
      "music"
    ]
  ],
  "blood": [
    "피의 게임 X",
    "/entertainmentdetail/327298",
    [
      "survival"
    ],
    "bloody-game.jpg",
    "bloody-game.jpg"
  ],
  "community": [
    "사상검증구역: 더 커뮤니티",
    "/entertainmentdetail/244601",
    [
      "survival"
    ],
    "the-community.jpg",
    "the-community.jpg"
  ],
  "predators": [
    "포식자들",
    "/entertainmentdetail/338734",
    [
      "currentaffairs"
    ],
    "predators.jpg",
    "predators.jpg"
  ],
  "morning": [
    "아침마당",
    "/entertainmentdetail/134822",
    [
      "currentaffairs"
    ],
    "morning-forum.jpg",
    "morning-forum.jpg"
  ],
  "evil": [
    "악인 취재기",
    "/currentaffairsdetail/236047",
    [
      "currentaffairs"
    ],
    "wicked-report.jpg",
    "wicked-report.jpg"
  ]
};

const createShort = (id, title, programKey) => {
  const [programName, programTo, genres, image, mypageImage] = programs[programKey];
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const base = import.meta.env.BASE_URL;
  return {
    id,
    youtubeUrl: `https://www.youtube.com/shorts/${id}`,
    title,
    programName,
    episode: programName,
    genres: [...genres],
    likeCount: 0,
    thumbnail,
    programImage: image ? `${base}images/shorts_programs/${image}` : thumbnail,
    mypageImage: mypageImage ? `${base}images/shorts_programs/${mypageImage}` : thumbnail,
    programTo,
  };
};

export const shortsData = [
  createShort("JPcnrvabsVE", "왜 이름을 박으로 지었어?", "infinite"),
  createShort("8Qa5Po58Pq8", "조혜련의 넘치는 수준 미달 흥", "infinite"),
  createShort("7BRD1TVkuqA", "원색적인 비난으로 깔끔한 마무리!", "hangout"),
  createShort("dq_bX3Kpq9E", "시트콤 같은 유재석의 망한 인터뷰 ㅋㅋㅋ", "hangout"),
  createShort("w9wmt3BdO2Y", "불도저 재형의 레전드 멘트🫢", "siblings"),
  createShort("2fbh6rzZPx0", "케미가 숨긴다고 숨겨지는 것도 아니고😘", "siblings"),
  createShort("-kLQeMvAAys", "전 여친에게는 미련❌ 여지도❌", "summer"),
  createShort("gqucYGJMwJ4", "영감의 샘터 직원 복지 = 전원 스윙 댄스 💃🕺", "manager"),
  createShort("15NE32983EQ", "눈에는 눈, 이에는 이, 욕에는 욕", "manager"),
  createShort("wiVxErbNE0k", "최산 보고 찔린 덕후들 나야 나🙋‍♂️", "manager"),
  createShort("pnbE_QpkjAQ", "바타: 예은이 자랑할게😇 인규: 밥 먹을게🍚", "manager"),
  createShort("D6hdZJGQ0fA", "각성한 인쿠시는 아무도 못 막는다 👏", "kim"),
  createShort("0IgclmsKn7I", "불꽃 튀는 감독들의 작전 싸움🔥", "kim"),
  createShort("GLYmN8KThzE", "세븐틴승관입니다신인감독김연경2잘부탁드립니(｡˟༝˟｡) ༘", "kim"),
  createShort("XdVE-BiJVoE", "오직 사실만 말하는 김우빈식 칭찬🫣💓", "uquiz"),
  createShort("pKuA7tkET9g", "김구라 앞에서 꺼드럭대기", "radio"),
  createShort("okrF8N__MR8", "구성환이 맘모스가 아니고 맘모스 빵!!!", "alone"),
  createShort("xS5kShK0P6E", "김연경의 노빠꾸 화법ㅋㅋㅋ", "alone"),
  createShort("I-e5INhKvTs", "\"애들 좋아 죽네\" 체대생들 홀린 마성의 덱코치", "college"),
  createShort("R69__OXtlqQ", "🐶스무스하게 1등 해버리는 한국체대 조홍조", "college"),
  createShort("obhRmHC_hWA", "15년 전 이강인 슛돌이 시절⚽  | #Shorts", "shoot"),
  createShort("qPIo9U4oUBw", "실력도 귀여움도 완성형이었던 7살 이강인🐥", "shoot"),
  createShort("1H9yFTzfHDk", "강호동도 인정한 갓연경 파워 서브🏐", "neighborhood"),
  createShort("JGPdrs52d9g", "역시 남다른 박성현 출근길은 필드캠에서📸", "field"),
  createShort("OFgvDqkBKV0", "슈퍼 루키 김민솔의 모든 것이 궁금해~", "field"),
  createShort("pVEN14rARe8", "남다른 청력", "field"),
  createShort("Y8xRv-1qUic", "뒤에 카메라 있어요", "kpga"),
  createShort("CVFdRAuJ2vE", "운이 좋았다니까요", "kpga"),
  createShort("dHdq2BkGinQ", "버건디 자켓 입고 힘차게", "kpga"),
  createShort("aeZrIMEz3LQ", "생각보다 무거워요", "kpga"),
  createShort("kZQW5wpVa5g", "생애 첫 우승 달성!", "kpga"),
  createShort("qqtelwBoUUQ", "고막 남친 아니 각막 남친 박진영", "seasons"),
  createShort("a2XilEzeP4A", "못하는 장르가 없는 권진아의 락 스피릿💥", "seasons"),
  createShort("V2LMFEAPD2c", "성시경x박재정 - 헤어지자 말해요🍂", "seasons"),
  createShort("Cl-onBYOjuA", "이윽고 생존자 도경수는 진짜 유명한 도입부 장인임", "seasons"),
  createShort("ynYovT2oJUk", "13년 만의 역주행 끝에 진짜 어른 여자들 등장💓", "musiccore"),
  createShort("HmhMtIMUdEY", "신인인데 헬기 띄우고 엔딩 차지한 효리수", "musiccore"),
  createShort("kQlCb8omGks", "해남 할머니 합창단 - 천 개의 바람이 되어", "happy"),
  createShort("5vRXuizu4Eo", "42월드를 휩쓸었던 썸데이의 알고 있나요", "happy"),
  createShort("AFwjKdotZH8", "너네 습격 외않해..?", "blood"),
  createShort("CbcEtd0ZVT4", "피의 게임에서 처음으로 온기를 느낀 곽범", "blood"),
  createShort("kDC9-Y6iECI", "피지컬 대결 하승진 VS 덱스 | #Shorts", "blood"),
  createShort("RzMk_yguufw", "처음부터 버릴 생각이 없었던 그들", "blood"),
  createShort("pwNZ6bdcytA", "홍진호의 유일한 탈락 변수까지 차단", "blood"),
  createShort("9a_nKrciunM", "페미니스트에게 여성스럽다는 말은? | 웨이브 오리지널 | 사상검증구역: 더 커뮤니티", "community"),
  createShort("xL6MgvFXnlk", "억 소리 나는 연봉 실화", "community"),
  createShort("PJ_gj3c_Wgs", "소설을 위한 잡입 취재가 가짜 뉴스로 퍼지다?!", "predators"),
  createShort("qBJAsylgC2s", "금전을 요구하는 사이버 레커들의 뒷거래 녹취", "predators"),
  createShort("tRl5YM9jIew", "복수를 위해 가세연 주식을 무려 50%나 매입한 은현장", "predators"),
  createShort("8Dz1VQat9Mo", "하다 하다 가족까지 건드리는 사이버 레커들", "predators"),
  createShort("eJZesaZ2TH4", "20년 전 강하늘 아침마당 출연 장면😂", "morning"),
  createShort("NDI5RUwVqTc", "첫째라면 다 공감하는 윌리엄 한마디👏", "morning"),
  createShort("i3i5azUTe7M", "보는 사람만 즐거운 이광수 아침마당 대참사ㅋㅋㅋ", "morning"),
  createShort("ALEFSrq32HE", "게스트 아닌 개스트 등장🐶✨ 사람보다 강아지 쪽에 시선 집중🐾", "morning"),
  createShort("8B-hcb0nggs", "이 무대에서 진짜 중년 찾기 불가👀 아침마당 섭외력 좋🤙다👍", "morning"),
  createShort("HZLlZE8R36o", "아침마당 접수한 다나카와 노민우🌤️", "morning"),
  createShort("ri2I8CwMQkA", "어린 시절부터 이미 완성형 그 자체였던 언차일드 나하은💚", "morning"),
  createShort("yYnlpHDkj6Q", "전청조, 남현희 스토킹 혐의 체포 영상 단독 공개", "evil"),
  createShort("Oqm2l7sWCtM", "퀵 웨이브 | 정유정의 목소리를 녹음한 이유", "evil"),
  createShort("0AWKgOtCdg4", "마약왕 박왕열 근황: 교도소에서 VIP 대접", "evil"),
];
