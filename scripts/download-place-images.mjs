import fs from 'node:fs';
import { createHash } from 'node:crypto';

const targets = [
  ['인사동', 'Insa-dong'], ['해운대역', 'Haeundae station'],
  ['호텔 몬테레이 오사카', 'File:Hotel Monterey (2723960153).jpg'],
  ['요도바시 하카타', 'File:Yodobashi-Hakata.jpg'],
  ['다이마루 후쿠오카텐진점', 'File:Daimaru Fukuoka-Tenjin Department Store 20171111.jpg'],
  ['고베산노미야역', 'Kobe-Sannomiya Station'],
  ['규슈국립박물관', 'Kyushu National Museum'],
  ['수도국제공항', 'Beijing Capital International Airport'],
  ['베이신차오역', 'Beixinqiao station'], ['장쯔중루역', 'Zhangzizhonglu station'],
  ['옹화궁', 'Yonghe Temple'], ['국자감·공묘', 'Beijing Temple of Confucius'],
  ['난뤄구샹', 'Nanluoguxiang'], ['스차하이', '什刹海', 'zh'],
  ['천안문광장', 'Tiananmen Square'], ['자금성', 'Forbidden City'],
  ['경산공원', 'Jingshan Park'], ['왕푸징', 'Wangfujing'],
  ['무톈위 만리장성;무톈위', 'Mutianyu'], ['베이징 시내', 'Beijing'],
  ['구이제', '簋街', 'zh'], ['이화원', 'Summer Palace'],
];
const out = 'src/assets/images/sourced';
fs.mkdirSync(out, { recursive: true });
const manifestPath = 'src/data/place-image-sources.json';
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
const dataPath = 'src/data/trip_road.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const json = async url => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.status === 429) { await new Promise(resolve => setTimeout(resolve, 10000)); continue; }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${new URL(url).hostname}`);
    return response.json();
  }
  throw new Error('Source rate limited');
};
for (const [names, title, lang = 'en'] of targets) {
  try {
    if (manifest.some(m => m.title === title)) continue;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' Wikimedia Commons photo')}`;
    const search = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    if (!search.ok) throw new Error(`Google HTTP ${search.status}`);
    await search.text();
    const result = title.startsWith('File:') ? null : await json(`https://${lang}.wikipedia.org/w/api.php?action=query&redirects=1&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=640`);
    const page = result ? Object.values(result.query.pages)[0] : { pageimage: title.slice(5) };
    if (!page.pageimage) throw new Error('No place photo');
    const info = await json(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + page.pageimage)}&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=640&format=json`);
    const file = Object.values(info.query.pages)[0].imageinfo?.[0];
    const meta = file?.extmetadata;
    if (!meta?.LicenseShortName?.value) throw new Error('Missing license');
    page.thumbnail ||= { source: file.thumburl };
    const response = await fetch(page.thumbnail.source, { signal: AbortSignal.timeout(25000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Image download failed');
    const ext = page.pageimage.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
    if (!ext) throw new Error('Unsupported image format');
    const filename = createHash('sha256').update(title).digest('hex').slice(0, 16) + '.' + ext;
    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(`${out}/${filename}`, bytes);
    const entry = { names: names.split(';'), title, image: `img/sourced/${filename}`, searchUrl,
      sourceUrl: file.descriptionurl, downloadUrl: page.thumbnail.source,
      author: meta.Artist?.value || '', license: meta.LicenseShortName.value,
      licenseUrl: meta.LicenseUrl?.value || '', attribution: meta.Attribution?.value || '', modifications: '640px thumbnail supplied by Wikimedia' };
    manifest.push(entry);
    for (const trip of data.trips) for (const place of trip.days.flatMap(d => d.items)) {
      if (place.type === 'place' && entry.names.includes(place.place)) {
        place.image = entry.image; place.imageSource = entry.sourceUrl; place.imageStatus = '장소 사진';
      }
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
    console.log('Saved', names, bytes.length, entry.license);
    await new Promise(resolve => setTimeout(resolve, 1500));
  } catch (error) { console.log('Unresolved', names, error.message); }
}
