// 사용자가 제공한 원본 로고를 채널 이름으로 연결합니다.
import ytn from '../../assets/live/channels/YTN_L.png';
import mbn from '../../assets/live/channels/MBN_L.png';
import kbs1 from '../../assets/live/channels/KBS1_L.png';
import yonhap from '../../assets/live/channels/YONHAP_L.png';
import tasty from '../../assets/live/channels/TASTY_L.png';
import lovewar from '../../assets/live/channels/LOVEWAR_L.png';
import infinite from '../../assets/live/channels/INFINITE_L.png';
import oneNight from '../../assets/live/channels/1B2D_L.png';
import mbc from '../../assets/live/channels/MBC_L.png';
import tvchosun from '../../assets/live/channels/TVCHOSUN_L.png';

export const liveChannelAssets = {
  YTN: { logo: ytn, bounds: [230, 44, 0, 0, 230, 44] },
  MBN: { logo: mbn, bounds: [141, 44, 16, 7, 109, 34] },
  KBS1: { logo: kbs1, bounds: [358, 140, 23, 32, 305, 85] },
  '연합뉴스TV': { logo: yonhap, bounds: [500, 84, 0, 0, 500, 84] },
  '맛있는 녀석들': { logo: tasty, bounds: [220, 251, 0, 0, 220, 251] },
  '사랑과 전쟁 시즌1': { logo: lovewar, bounds: [220, 105, 0, 0, 220, 105] },
  '무한도전': { logo: infinite, bounds: [220, 160, 0, 0, 220, 160] },
  '1박 2일': { logo: oneNight, bounds: [220, 133, 0, 14, 220, 104] },
  MBC: { logo: mbc, bounds: [646, 186, 0, 0, 646, 186] },
  'TV CHOSUN': { logo: tvchosun, bounds: [812, 206, 0, 0, 812, 206] },
};

// PNG를 수정하지 않고 알파 영역의 좌표로 화면 배치를 보정합니다.
// bounds: [원본 너비, 원본 높이, 그림 시작 x/y, 그림 너비/높이]
export const getLiveLogoStyle = (logo) => {
  const asset = Object.values(liveChannelAssets).find((item) => item.logo === logo);
  if (!asset?.bounds) return undefined;
  const [width, height, left, top, visibleWidth, visibleHeight] = asset.bounds;
  return {
    '--logo-visible-ratio': visibleWidth / visibleHeight,
    '--logo-image-width': width / visibleHeight,
    '--logo-image-height': height / visibleHeight,
    '--logo-offset-x': -left / visibleHeight,
    '--logo-offset-y': -top / visibleHeight,
  };
};
