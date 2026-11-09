// PNG 원본은 변경하지 않습니다. 바깥 배경과 글자 구멍의 같은 회색 배경을 함께 분리합니다.
export function createCategoryLogoCanvas(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !width || !height) throw new Error('로고를 표시할 수 없습니다.');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, width, height);
  const data = pixels.data;
  const original = new Uint8ClampedArray(data);
  const rowEdges = new Float32Array(height * 6);
  for (let y = 0; y < height; y++) {
    for (let channel = 0; channel < 3; channel++) {
      rowEdges[y * 6 + channel] = data[(y * width) * 4 + channel];
      rowEdges[y * 6 + channel + 3] = data[(y * width + width - 1) * 4 + channel];
    }
  }
  const backgroundAt = (x, y, channel) => {
    const t = x / Math.max(1, width - 1);
    return rowEdges[y * 6 + channel] * (1 - t) + rowEdges[y * 6 + channel + 3] * t;
  };
  const background = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let head = 0;
  let tail = 0;
  const visit = (index) => {
    if (background[index]) return;
    const x = index % width;
    const y = Math.floor(index / width);
    const p = index * 4;
    if (data[p + 3] !== 0 && [0, 1, 2].some(channel =>
      Math.abs(data[p + channel] - backgroundAt(x, y, channel)) > 8)) return;
    background[index] = 1;
    queue[tail++] = index;
  };
  // 닫힌 글자의 내부도 같은 배경색이면 투명하게 처리합니다.
  // 테두리에서만 탐색하면 ㅇ·O·숫자의 구멍이 회색으로 남습니다.
  for (let index = 0; index < width * height; index++) visit(index);
  // 회색 배경 위에 합성된 가장자리의 안티앨리어싱만 보정합니다.
  for (let index = 0; index < background.length; index++) {
    const p = index * 4;
    if (background[index]) { data[p + 3] = 0; continue; }
    const x = index % width;
    const y = Math.floor(index / width);
    const touchesBackground = (x > 0 && background[index - 1]) ||
      (x < width - 1 && background[index + 1]) ||
      (y > 0 && background[index - width]) ||
      (y < height - 1 && background[index + width]);
    if (!touchesBackground) continue;
    let alpha = 0;
    for (let channel = 0; channel < 3; channel++) {
      const value = data[p + channel];
      const base = backgroundAt(x, y, channel);
      alpha = Math.max(alpha, value >= base ? (value - base) / Math.max(1, 255 - base) : (base - value) / Math.max(1, base));
    }
    alpha = Math.min(1, Math.max(0, alpha));
    if (alpha < 0.06) { data[p + 3] = 0; continue; }
    for (let channel = 0; channel < 3; channel++) {
      data[p + channel] = Math.max(0, Math.min(255,
        (data[p + channel] - backgroundAt(x, y, channel) * (1 - alpha)) / alpha));
    }
    data[p + 3] = Math.round(data[p + 3] * alpha);
  }
  // 압축/안티앨리어싱 잔여물이 만든 작은 회색·색점만 제거합니다.
  // 밝은 글씨·색 로고·큰 연결 영역은 유지합니다.
  const visited = new Uint8Array(width * height);
  for (let seed = 0; seed < visited.length; seed++) {
    if (visited[seed] || data[seed * 4 + 3] === 0) continue;
    head = 0;
    tail = 1;
    queue[0] = seed;
    visited[seed] = 1;
    let strongest = 0;
    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      for (let channel = 0; channel < 3; channel++) {
        strongest = Math.max(strongest, Math.abs(original[index * 4 + channel] - backgroundAt(x, y, channel)));
      }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (!visited[next] && data[next * 4 + 3] > 0) {
          visited[next] = 1;
          queue[tail++] = next;
        }
      }
    }
    if (tail <= 12 && strongest < 48) {
      for (let index = 0; index < tail; index++) data[queue[index] * 4 + 3] = 0;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

const cache = new Map();
export function loadCategoryLogo(source) {
  if (!cache.has(source)) {
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try { resolve(createCategoryLogoCanvas(image)); }
        catch (error) { reject(error); }
      };
      image.onerror = reject;
      image.src = source;
    });
    cache.set(source, promise);
    promise.catch(() => { if (cache.get(source) === promise) cache.delete(source); });
  }
  return cache.get(source);
}
