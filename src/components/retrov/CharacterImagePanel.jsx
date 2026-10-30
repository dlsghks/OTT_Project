
import { getImagePath } from "../../utils/imagePath";
import "../../styles/components/CharacterImagePanel.scss";

// 캐릭터 아이콘 클릭 시 아래에 나오는 이미지 카드 (1420 x 780)
// 우결: 청첩장 / 하이킥: 명대사 카드 / 꽃남: 캐릭터 프로필 / 풀하우스: 미니홈피
export default function CharacterImagePanel({ character, label = "소개" }) {
  return (
    <figure id="character-panel" className="character-image-panel">
      <img
        src={getImagePath(character.panelImage)}
        alt={`${character.name} ${label}`}
      />
    </figure>
  );
}
