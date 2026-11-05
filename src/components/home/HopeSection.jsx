import { SectionTitle } from '../common/SectionTitle';
import { ContentSection } from './ContentSection';
import { Link } from 'react-router-dom';
import { hopeItems } from '../../data/home/homeData';
import { getImagePath } from '../../utils/imagePath';

export const HopeSection = ({ appResponsive = false }) => (
  <section
    className="home-hope"
    aria-labelledby="home-hope-title"
    style={{ '--hope-background': `url("${getImagePath('/images/home/section/Timothée.jpg')}")` }}
  >
    <div className="home-hope__intro">
      <SectionTitle id="home-hope-title" className="home-hope__title">
        <img src={getImagePath('/images/home/section/Timothée_name.png')} alt="티모시 샬라메" />
      </SectionTitle>
      <p className="home-hope__description">
        〈마티 슈프림〉의 주역<br />
        그의 필모그래피
      </p>
      <Link to="/movie" className="home-hope__more">자세히 보기</Link>
    </div>
    <div className="home-hope__contents">
      <ContentSection appResponsive={appResponsive} items={hopeItems} cardType="default" showHeader={false} />
    </div>
  </section>
);
