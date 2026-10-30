import { CategoryPage } from '../../components/wavve/CategoryPage';
import { categoryPages } from '../../data/categoryData';

export const Entertainment = () => {
  return <CategoryPage key="entertainment" page={categoryPages.entertainment} />;
};
