import { CategoryPage } from '../../components/wavve/CategoryPage';
import { categoryPages } from '../../data/categoryData';

export const Drama = () => {
  return <CategoryPage key="drama" page={categoryPages.drama} />;
};
