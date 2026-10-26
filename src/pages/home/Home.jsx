import React from 'react';

import { HomeHero } from '../../components/home/HomeHero';
import { CategoryMenu } from '../../components/home/CategoryMenu';
import { ContentSection } from '../../components/home/ContentSection';
import { RankingSection } from '../../components/home/RankingSection';
import { EventBanner } from '../../components/home/EventBanner';


import {
  heroItems,
  categories,
  homeSections,
  rankingItems,
  eventBanners
} from '../../data/homeData';

import '../../styles/components/Home.scss';

export const Home = () => {
  return (
    <div className="wavve-home">
      <HomeHero items={heroItems} />

      <div className="wavve-home__inner">
        <EventBanner items={eventBanners.slice(0, 1)} />
        <CategoryMenu items={categories} />

        {homeSections.slice(0, 3).map((section) => (
          <ContentSection key={section.id} {...section} />
        ))}

        <RankingSection items={rankingItems} />

        <EventBanner items={eventBanners.slice(0, 1)} />

        {homeSections.slice(3).map((section) => (
          <ContentSection key={section.id} {...section} />
        ))}

        <EventBanner items={eventBanners.slice(1)} />
      </div>
    </div>
  );
};
