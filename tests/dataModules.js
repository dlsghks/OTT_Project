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

const DATA_PATHS = {
  homeData: 'home/homeData',
  requestedHomeSections: 'home/requestedHomeSections',
  weeklyContentData: 'home/weeklyContentData',
};

export const loadData = async (name) => {
  const path = DATA_PATHS[name] ?? name;

  return import(
    await moduleURL(
      new URL('../src/data/' + path + '.js', import.meta.url)
    )
  );
};