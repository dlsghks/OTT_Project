import { addDoc, collection, limitToLast, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const messagesRef = channelId => collection(db, 'liveChats', String(channelId), 'messages');
const getChatName = (user) => {
  try {
    const profile = JSON.parse(
      localStorage.getItem('wavve-active-profile') || 'null'
    );

    const profileName = profile?.name;

    if (typeof profileName === 'string' && profileName.trim()) {
      return profileName.trim().slice(0, 40);
    }
  } catch {
    // 프로필을 읽지 못하면 계정 이름 사용
  }

  return user.displayName?.trim().slice(0, 40) || '사용자';
};
export const liveChatAdapter = {
  subscribe(channelId, onMessages, onError) {
    const recent = query(messagesRef(channelId), orderBy('createdAt', 'asc'), limitToLast(100));
    return onSnapshot(recent, snapshot => {
      onMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, onError);
  },
  async send(channelId, message) {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');
    const text = message.text.trim();
    if (!text || text.length > 300) throw new Error('메시지는 1~300자여야 합니다.');
    await addDoc(messagesRef(channelId), {
      uid: user.uid,
      name: getChatName(user),
      text,
      createdAt: serverTimestamp(),
    });
  },
};
