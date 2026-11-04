import { Link } from "react-router-dom";
import logoE from "../../assets/mobile/a752b.svg";
import logoA from "../../assets/mobile/37802.svg";
import logoW from "../../assets/mobile/721ec.svg";
import logoV2 from "../../assets/mobile/33785.svg";
import logoV1 from "../../assets/mobile/2222e.svg";
import castIcon from "../../assets/mobile/e8694.svg";
import "../../styles/components/MobileHeader.scss";

// TV 연결은 프로젝트의 캐스트 기능을 onCastClick으로 전달합니다.
export const MobileHeader = ({ onCastClick } = {}) => (
  <header className="wavve-mobile-header" aria-label="모바일 헤더">
    <Link className="wavve-mobile-header__brand" to="/" aria-label="웨이브 홈">
      <span className="wavve-mobile-header__logo" aria-hidden="true">
        <img className="wavve-mobile-header__letter-w" src={logoW} alt="" width="20.7545" height="16.821" />
        <img className="wavve-mobile-header__letter-a" src={logoA} alt="" width="15.0727" height="13.356" />
        <img className="wavve-mobile-header__letter-v1" src={logoV1} alt="" width="15.0053" height="12.4477" />
        <img className="wavve-mobile-header__letter-v2" src={logoV2} alt="" width="15.0053" height="12.4477" />
        <span className="wavve-mobile-header__letter-e">
          <img src={logoE} alt="" width="13.8253" height="13.356" />
        </span>
      </span>
    </Link>
    <button className="wavve-mobile-header__cast" type="button" aria-label="TV로 연결" onClick={onCastClick}>
      <span aria-hidden="true"><img src={castIcon} alt="" width="18.1668" height="14.8417" /></span>
    </button>
  </header>
);

export default MobileHeader;
