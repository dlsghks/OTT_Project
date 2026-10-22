export const programs = [
  {
    id: "infinite-challenge",
    title: "무한도전",
    image: "/images/retrove/infinite-challenge-logo.png",
  },
  {
    id: "full-house",
    title: "풀하우스",
    image: "/images/retrove/full-house-logo.png",
  },
];

export const programDetails = {
  "infinite-challenge": {
    title: "무한도전",
    hero: "/images/retrove/infinite-challenge-hero.jpg",
    description: "다시 보고 싶은 무한도전의 추억을 만나보세요.",

    characters: [
      {
        id: "myungsoo",
        name: "명수옹",
        image: "/images/retrove/myungsoo.jpg",
        questions: [
          {
            id: "q1",
            text: "‘명수옹’이라는 별명으로 불리는 출연자는?",
            options: ["박명수", "정준하", "유재석", "하하"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "junha",
        name: "주나",
        image: "/images/retrove/junha.jpg",
        questions: [
          {
            id: "q1",
            text: "‘주나’ 캐릭터의 출연자는?",
            options: ["하하", "정준하", "박명수", "유재석"],
            answerIndex: 1,
          },
        ],
      },
    ],

    sections: [
      {
        id: "office",
        title: "[무한상사] 시리즈",
        videos: [
          {
            id: "office-1",
            title: "2011 무한상사 #1",
            image: "/images/retrove/office-1.jpg",
            description: "무한상사 멤버들의 회사 생활",
            date: "2011.05.21",
          },
        ],
      },
      {
        id: "chase",
        title: "[추격전] 꼬리잡기 레전드 시작",
        videos: [
          {
            id: "chase-1",
            title: "꼬리잡기 #1",
            image: "/images/retrove/chase-1.jpg",
            description: "쫓고 쫓기는 추격전",
            date: "2009.09.05",
          },
        ],
      },
    ],
  },
};