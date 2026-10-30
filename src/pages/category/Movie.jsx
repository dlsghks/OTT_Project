import { CategoryPage } from '../../components/wavve/CategoryPage';
import { categoryPages } from '../../data/categoryData';

export const Movie = () => {
  return <CategoryPage key="movie" page={categoryPages.movie} />;
};
