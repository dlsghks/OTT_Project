import { useEffect, useRef, useState } from 'react';
import { loadCategoryLogo } from '../../utils/categoryLogoCanvas';

export const CategoryLogo = ({ src, alt }) => {
  const ref = useRef(null);
  const [failedSource, setFailedSource] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const target = ref.current;
    if (target) target.getContext('2d')?.clearRect(0, 0, target.width, target.height);
    if (!src) return;
    loadCategoryLogo(src).then(canvas => {
      if (cancelled || !target) return;
      target.width = canvas.width;
      target.height = canvas.height;
      target.getContext('2d')?.drawImage(canvas, 0, 0);
      target.dataset.ready = 'true';
    }).catch(() => { if (!cancelled) setFailedSource(src); });
    return () => { cancelled = true; };
  }, [src]);
  return failedSource === src ? <img src={src} alt={alt} draggable={false} />
    : <canvas ref={ref} className="category-logo" role="img" aria-label={alt} />;
};
