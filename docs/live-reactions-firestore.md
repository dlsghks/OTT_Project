# 라이브 하트 Firebase 권한 적용

하트 공유는 `liveReactions/{channelId}` 문서의 count를 트랜잭션으로 증가시키고 실시간 구독합니다.
기존 채팅·계정·결제 규칙을 유지한 상태에서 Firebase Console > Firestore Database > Rules의
`match /databases/{database}/documents` 안에 아래 블록을 추가하고 게시해야 합니다.
이 파일 자체는 서버 규칙을 배포하지 않습니다.

```javascript
match /liveReactions/{channelId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.keys().hasOnly(['count', 'uid', 'updatedAt'])
    && request.resource.data.count == 1
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.updatedAt == request.time;
  allow update: if request.auth != null
    && request.resource.data.keys().hasOnly(['count', 'uid', 'updatedAt'])
    && request.resource.data.count is int
    && request.resource.data.count == resource.data.count + 1
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.updatedAt == request.time;
  allow delete: if false;
}
```

## 확인
- 로그인한 서로 다른 두 브라우저에서 같은 채널을 열고 하트를 누르면 두 화면의 누적 수가 같아지고 새 하트 애니메이션이 표시됩니다.
- 처음 접속하거나 채널을 바꿀 때 기존 누적 하트를 다시 재생하지 않습니다.
- 다른 채널에는 전파되지 않으며 전송/구독 실패는 화면에 표시합니다.
- 채팅은 서버 작성 시각부터 5분 동안 화면에 표시합니다. 새 메시지가 없어도 만료 시각에 사라지며 탭 복귀 시 다시 검사합니다.
- 채팅 문서는 Firestore에 남습니다. 이 변경은 화면 표시 만료이며 데이터베이스 문서 삭제 정책을 변경하지 않습니다.
