import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

const modules = new Map();
const moduleURL = async (url) => {
  if (modules.has(url.href)) return modules.get(url.href);
  let source = (await readFile(url, 'utf8'))
    .replaceAll('import.meta.env.BASE_URL', JSON.stringify('/OTT_Project/'));
  for (const match of [...source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)]) {
    const path = match[1] + (match[1].endsWith('.js') ? '' : '.js');
    source = source.replace(match[0], 'from ' + JSON.stringify(await moduleURL(new URL(path, url))));
  }
  const result = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
  modules.set(url.href, result);
  return result;
};

// 실제 환경 변수/API를 사용하지 않고 순수 데이터 모듈만 읽는다.
export const loadData = async (name) =>
  import(await moduleURL(new URL('../src/data/' + name + '.js', import.meta.url)));
