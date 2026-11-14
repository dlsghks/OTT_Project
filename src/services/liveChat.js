import { addDoc, collection, doc, limitToLast, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
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
export const LIVE_CHAT_LIFETIME_MS = 5 * 60 * 1000;
export const getLiveMessageTime = (message) => {
  const value = message.createdAt;
  return typeof value?.toMillis === 'function' ? value.toMillis()
    : typeof value === 'number' ? value : 0;
};
export const getVisibleLiveMessages = (messages, now = Date.now()) =>
  messages.filter(message => getLiveMessageTime(message) > now - LIVE_CHAT_LIFETIME_MS);

export const liveChatAdapter = {
  subscribe(channelId, onMessages, onError) {
    const recent = query(messagesRef(channelId), orderBy('createdAt', 'asc'), limitToLast(100));
    let messages = [];
    let timer;
    let active = true;
    const publish = () => {
      clearTimeout(timer);
      if (!active) return;
      const now = Date.now();
      messages = getVisibleLiveMessages(messages, now);
      onMessages(messages);
      if (messages.length) {
        const nextExpiry = Math.min(...messages.map(getLiveMessageTime)) + LIVE_CHAT_LIFETIME_MS;
        timer = setTimeout(publish, Math.max(1, nextExpiry - now));
      }
    };
    const unsubscribe = onSnapshot(recent, snapshot => {
      messages = snapshot.docs.map(doc => ({ ...doc.data({ serverTimestamps: 'estimate' }), id: doc.id }));
      publish();
    }, onError);
    const onVisibility = () => { if (document.visibilityState === 'visible') publish(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

const reactionRef = channelId => doc(db, 'liveReactions', String(channelId));
export const liveReactionAdapter = {
  subscribe(channelId, onCount, onError) {
    return onSnapshot(reactionRef(channelId), { includeMetadataChanges: true }, snapshot => {
      // 확인된 서버 응답만 사용하여 로컬 쓰기와 서버 응답의 중복 애니메이션을 막습니다.
      if (snapshot.metadata.hasPendingWrites || snapshot.metadata.fromCache) return;
      onCount(snapshot.data()?.count ?? 0);
    }, onError);
  },
  async send(channelId) {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');
    const ref = reactionRef(channelId);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref);
      const count = snapshot.data()?.count ?? 0;
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('하트 정보를 확인해주세요.');
      transaction.set(ref, { count: count + 1, uid: user.uid, updatedAt: serverTimestamp() });
    });
  },
};
