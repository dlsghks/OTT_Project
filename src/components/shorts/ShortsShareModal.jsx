import { ShareDialog } from '../common/ShareDialog';

export function ShortsShareModal({ item, onClose }) {
  const appUrl = new URL(window.location.href);
  appUrl.searchParams.set('short', item.id);
  return <ShareDialog title={item.title || '웨이브 쇼츠'} url={item.youtubeUrl || appUrl.toString()} kakaoUrl={appUrl.toString()} onClose={onClose} />;
}
