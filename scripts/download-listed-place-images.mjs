import fs from 'node:fs';
import { createHash } from 'node:crypto';

// Exact-place images selected from search results; no generic city/brand substitutes.
const targets = [
  ['그랜드 하얏트 후쿠오카', 'https://www.hyatt.com/grand-hyatt/ko-KR/fukgh-grand-hyatt-fukuoka', 'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2017/11/04/0940/Grand-Hyatt-Fukuoka-P230-Exterior.jpg/Grand-Hyatt-Fukuoka-P230-Exterior.4x3.jpg', 'Hyatt'],
  ['야나기바시 렌고 시장', 'https://showcase.city.fukuoka.lg.jp/photo/img0524.html', 'https://showcase.city.fukuoka.lg.jp/admn/mrgt/images/2014/03/img0524.jpg', '福岡市'],
  ['신지다이 텐진점(이자카야)', 'https://ameblo.jp/phadsblog/entry-12718911859.html', 'https://stat.ameba.jp/user_images/20221012/15/phadsblog/da/cc/j/o1107082915187402746.jpg', 'PHAD’S'],
  ['카사노야 다자이후 본점', 'https://mifurusato.jp/item/ITM40221400137.html', 'https://mifurusato.jp/client_info/MIFURUSATO/itemimage/ITM40221400022/4.jpg', '三越伊勢丹ふるさと納税 / かさの家'],
  ['다자이후 참도 상점가', 'https://dazaifu.org/modelcourse/', 'https://dazaifu.org/wp-content/uploads/2022/03/crs01_03.jpg', '太宰府観光協会'],
  ['여수낭만포차거리', 'https://en.trippose.com/tour/nangmanpocha', 'https://img.trippose.com/thum/1092797/600/450', 'Trippose'],
  ['Qingdao Kaiyue Hotel Zhongshan Road', 'https://www.booking.com/hotel/cn/kaiyue-international-youth.en-gb.html', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/79580392.jpg?hp=1&k=65201bb5c79628121ab8bc368ca4d800e750522e19e2075aa69a6cdace0979f1&o=', 'Booking.com 숙소 사진'],
  ['Happy Dragon Alley Hotel Beijing', 'https://www.agoda.com/happy-dragon-alley-hotel/hotel/beijing-cn.html', 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/515819817.jpg?k=b187dd927eac95dae32495708fc22495faf08b942fa844985180ff1ac531957b&o=', 'Agoda / Booking.com 숙소 사진'],
  ['Campanile Hotel Chongqing Jiefangbei Pedestrian Street', 'https://www.klook.com/hotels/detail/1737312-campanile-hotel-chongqing-jiefangbei-pedstrian-street-and-hongya--cave-branch/', 'https://res.klook.com/klook-hotel/image/upload/w_750%2Cc_fill%2Cq_85/s10akd/0204712000a2vhtak6D71.jpg', 'Klook 숙소 사진'],
  ['Mercure Guangzhou Beijing Road Pedestrian Street', 'https://www.klook.com/zh-HK/hotels/detail/1972438-mercure-hotel-beijing-road-pedestrian-street-guangzhou/', 'https://img.huazhu.com/hdata_hcube/ac5b8d014d72cec4a75984da1b75b769.jpg', 'Huazhu'],
  ['Ibis Harbin Central Avenue Airport Bus Station', 'https://www.airpaz.com/en/hotel/ibis-harbin-central-street-airpoer-bus-station-hotel.5960134', 'https://lbcdn.airpaz.com/hotelimages/5960134/ibis-harbin-central-street-airpoer-bus-station-hotel-c84a877d3b665714f8ab12f0cbc63dcc.jpg', 'Airpaz 숙소 사진'],
];
const manifestPath = 'src/data/place-image-sources.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const dataPath = 'src/data/trip_road.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
for (const [name, sourceUrl, downloadUrl, publisher] of targets) {
  if (manifest.some(entry => entry.names.includes(name))) continue;
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' photo')}`;
    const search = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    await search.text();
    const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(20000) });
    const mime = response.headers.get('content-type')?.split(';')[0];
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
    if (!response.ok || !ext) throw new Error(`Invalid image response: ${response.status} ${mime}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const filename = createHash('sha256').update(name).digest('hex').slice(0, 16) + '.' + ext;
    fs.writeFileSync('src/assets/images/sourced/' + filename, bytes);
    const entry = { names: [name], title: name, image: 'img/sourced/' + filename, searchUrl, sourceUrl, downloadUrl,
      author: '', publisher, license: '원본 사이트 이용 조건 적용', licenseUrl: '',
      reusePermissionVerified: false, modifications: 'Original downloaded image' };
    manifest.push(entry);
    for (const trip of data.trips) for (const place of trip.days.flatMap(day => day.items)) {
      if (place.type === 'place' && place.place === name) {
        place.image = entry.image; place.imageSource = sourceUrl; place.imageStatus = '장소 사진';
      }
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
    console.log('Saved', name, bytes.length);
  } catch (error) { console.log('Unresolved', name, error.message); }
}
