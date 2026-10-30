import { ContentSection } from './ContentSection';
import { Link } from 'react-router-dom';
import { hopeItems } from '../../data/homeData';
import { getImagePath } from '../../utils/imagePath';

export const HopeSection = () => (
  <section
    className="home-hope"
    aria-labelledby="home-hope-title"
    style={{ '--hope-background': `url("${getImagePath('/images/home/section/Timothée.jpg')}")` }}
  >
    <div className="home-hope__intro">
      <h2 id="home-hope-title" className="home-hope__title">
        <img src={getImagePath('/images/home/section/Timothée_name.png')} alt="티모시 샬라메" />
      </h2>
      <p className="home-hope__description">
        〈마티 슈프림〉의 주역<br />
        그의 필모그래피
      </p>
      <Link to="/movie" className="home-hope__more">자세히 보기</Link>
    </div>
    <div className="home-hope__contents">
      <ContentSection items={hopeItems} cardType="default" showHeader={false} />
    </div>
  </section>
);
