import { CategoryPage } from '../../components/wavve/CategoryPage';
import { categoryPages } from '../../data/categoryData';

export const Global = () => {
  return <CategoryPage key="global" page={categoryPages.global} />;
};
