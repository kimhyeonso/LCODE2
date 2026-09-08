import fs from 'node:fs';
const root = 'src/assets/images/';
const assets = fs.readdirSync(root, { recursive: true }).map(p => p.replaceAll('\\', '/')).filter(p => /\.(jpg|jpeg|png|webp)$/i.test(p));
const dataPath = 'src/data/trip_road.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const normalize = name => name.normalize('NFKC').replace(/\([^)]*\)/g, '').replace(/--.*$/, '').replace(/^\[?\d\d:\d\d\]?\s*/, '').replace(/[\s·&-]/g, '').trim();
const mapping = new Map();
const lines = `
강릉짬뽕순두부 동화가든 본점|GangneungJjamppongSundubuDonghwa Garden
여수낭만포차거리|다운로드
간사이국제공항|KansaiInternationalAirport
난바역|NambaStation
크로스 호텔 오사카|CrossHotelOsaka
글리코상;글리코사인|GlicoSign
에비스바시 다리 - 관광지|EbisuBridge
킨류라멘 도톤보리점|KinryuRamenDotonboriBranch
도톤보리 대관람차 에비스 타워|DotonboriFerrisWheelEbisuTower
돈키호테 도톤보리점|DonQuijoteDotonboriStore
호젠지|hozenji
구로몬 시장|KuromonMarket
애월 한담해변|HandamBeach
미포집 제주 애월점|MipojipJejuAewol
제주당|Jejudang
세도나 중문 풀빌라|SedonaJungmunPoolVilla
천지연폭포|CheonjiyeonFalls
서귀포매일올레시장|SeogwipoMaeilOlleMarket
순대이야기|Sundae
요리바카 제주|YolibakaJeju
난바 오리엔탈 호텔|NambaOrientalHotel
아지노야 오코노미야끼|AjinoyaOkonomiyaki
신사이바시스지 상점가|ShinsaibashisujiShoppingStreet
도톤보리강 크루즈|TomboriRiverCruise
오사카성|OsakaCastle
니시노마루 정원|NishinomaruGarden
츠텐카쿠 전망대 & 신세카이;신세카이 & 츠텐카쿠;츠텐카쿠|TsutenkakuTower
쿠시카츠 다루마 신세카이 총본점|DarumaShinsekaiSohonten
하루카스 300|Harukas300
카니도라쿠 도톤보리 본점|KaniDorakuDotonbori
우메다 스카이빌딩 공중정원 전망대|UmedaSkyBuildingFloatingGardenObservatory
헵파이브;헵파이브 관람차|HEPFIVEFerrisWheel
야마모토 네기야키|NegiyakiYamamoto
스위소텔 난카이 오사카|SwissôtelNankaiOsaka
이치란 라멘 도톤보리점 별관|IchiranDotonboriAnnex
gashacoco 난바 에비스바시스지|gashacocoNambaEbisuBashiSuji
돈키호테 난바센니치마에점|DonQuijoteNambaSennichimaeStore
유니버설 스튜디오 재팬|UniversalStudiosJapan
그랜드 프론트 오사카|GrandFrontOsaka
잇토쿠 총본점|Ittoku
호텔 몬토레 그라스미아 오사카|HotelMontereyGrasmereOsaka
＃C-pla+ 大阪心斎橋筋店|C-pla
교토역|KyotoStation
기요미즈데라|Kiyomizudera
산넨자카 & 니넨자카;산넨자카·니넨자카|Sannenzaka
스타벅스 니넨자카 야사카차야점|StarbucksCoffeeKyotoNinenzakaYasakaChaya
후시미이나리 신사|FushimiInariTaisha
규카츠 교토가츠규 후시미이나리 신|GyukatsuKyotoKatsugyuFushimiInari
신세카이 츠텐카쿠 & 잔잔요코초|JanjanYokocho
쓰케카모우동 가모킨 에비스점|TsukeKamoUdonKamoKinEbisuten
오사카역;JR 오사카역|OsakaStation
호텔 그랑비아 오사카|HotelGranviaOsaka
와규 이다텐|WagyuIdaten
유니버설시티역;유니버셜시티역|UniversalCityStation
나라역|NaraStation
나라공원|NaraPark
도다이지|TodaijiTemple
나카타니도우|Nakatanidou
와카쿠사 카레 본점|WakakusaCurry Honpo
기타노이진칸|KitanoIjinkangai
고베 하버랜드|KobeHarborland
고베 크루즈 콘체르토|THEKOBECRUISEConcerto
고베역|KobeStation
야키니쿠 고리짱 우메다 본점|YakinikuGorichanUmedaHonten
니혼바시 마루에이|NihonbashiMaruEi
호텔 한큐 레스파이어 오사카|HotelHankyuRespireOsaka
홋쿄쿠세이 신사이바시 본점|HokkyokuseiShinsaibashi
신세카이|Shinsekai
로쿠센 스시|RokusenSushi
메가돈키호테 신세카이점|MEGADonQuijoteShinseka
니시키 시장|NishikiMarket
이나리역|InariStation
이즈모 루쿠아|UnagiKushiyoriIzumo
신오사카역|ShinOsakaStation
도쿄역|TokyoStation
도쿄 스테이션 호텔|TheTokyoStationHotel
시부야 스카이;시부야스카이|SHIBUYASKY
규카츠 모토무라 시부야점|GyukatsuMotomuraShibuya
마이하마역|MaihamaStation
아사쿠사 센소지 & 나카미세도리;센소지 & 나카미세도리|SensojiTemple
다이코쿠야 텐푸라 아사쿠사 본점|Daikokuya
도쿄타워;도쿄 타워|TokyoTower
킷테 마루노우치|KITTEMarunouchi
나리타공항;나리타공항 - 도착;나리타국제공항|NaritaInternationalAirport
미야코 호텔 하카타|MiyakoHotelHakata
AMU 플라자 하카타 시티;아뮤플라자 하카타|AmuPlazaHakata
모츠나베 이치후지 텐진 니시도리점|MOTSUNABEICHIFUJI
돈키호테 후쿠오카 텐진 본점|DonQuijoteFukuokaTenjinHonten
오호리공원|OhoriPark
후쿠오카성터|FukuokaCastleRuins
시나리|SanukiUdonShinari
후쿠오카타워|FukuokaTower
모모치 시사이드 파크;모모치 시사이드파크;모모치해변|MomochiSeasidePark
후지우나ㅡ장어덮밥|Unadon
후글렌 후쿠오카|FuglenFukuoka
하카타 라멘 신신 하카타 데이토스점|ShinShin akata eitos
나카스 포장마차거리;나카스 포장마차 거리|NakasuYataiStreet
다자이후텐만구|DazaifuTenmanguShrine
하카타;하카타 도착|HakataStation
유후인역|YufuinStation
유후인노쇼 사이가쿠칸|YufunogoSaigakukan
긴린코 호수|KinrinkoLake
유노타케안|Yunotakean
유노츠보 거리|YunotsuboKaidoStreet
벳푸 지옥순례|TheHellsofBeppu
벳푸 스기노이 호텔|BeppuSuginoiHotel
Shunkoen|Shunkoen
다카사키야마 자연동물원|TakasakiyamaMonkeyPark
벳푸 카이힌 스나유|BeppuBeachSandBath
토요츠네 본점|ToyotsuneHonten
스시사카바 사시스 킷테하카타점|SushiSakabaSashisuKITTEHakata
하카타 엑셀 호텔 도큐|HakataExcelHotelTokyu
오호리공원 & 후쿠오카성터|FukuokaCastleRuins
츠키시마 몬자 타마토야 텐진|TsukishimaMonjaTamatoyaTenjin
야나가와 도항 뱃놀이 유람|YanagawaRiverCruise
모토요시야 우나기 본점|GansoMotoyoshiya
바이엔 가든 리조트;유후인 바이엔;유후인 바이엔 조식 후 출발|YufuinBaienGardenResort
유후인 플로럴 빌리지|YufuinFloralVillage
벳푸 로프웨이 & 쓰루미다케 전망대|BeppuRopeway
신하카타|ShinHakata
하카타 나카스 워싱턴 호텔 플라자|HakataNakasuWashingtonHotelPlaza
츠지한 아크 힐즈점|TsujihanArkHills
렘 롯폰기;렘 롯폰기 숙소 복귀|remmRoppongi
벌브 커피 로스터즈 롯폰기|VERVECOFFEEROASTERSRoppongi
시바 공원|ShibaPark
Sanshuu-ya|Sanshuuya
Tempura Asakusa SAKURA;텐푸라 아사쿠사 SAKURA|TempuraAsakusaSAKURA
도쿄 스카이트리|TokyoSkytree
스시노미도리 긴자점|UmegaokaSushinoMidoriSohontenGinza
goodNess渋谷 - 브런치/카페|goodNessShibuya
오모이데요코초|OmoideYokocho
아사쿠사역|AsakusaStation
아사쿠사 몬자 카노야 하나레|AsakusaMonjaKanoyaHanare
신주쿠 워싱턴 호텔|ShinjukuWashingtonHotel
신주쿠 골든가이|ShinjukuGoldenGai
도쿄 디즈니씨|Tokyo DisneySea
메이지 신궁 신사|Meiji Jingu 
하라주쿠 다케시타도리|TakeshitaSt
시부야 스크램블 교차로 & 시부야 스카이;시부야 스크램블 교차로|ShibuyaCrossing
신지다이 시부야도겐자카점|ShinjidaiShibuyaDogenzaka
메가 돈키호테 시부야 본점|MEGADon QuijoteShibuyaHonten
신주쿠 교엔|ShinjukuGyoen
신주쿠 다카시마야|ShinjukuTakashimaya
신주쿠역|ShinjukuStation
아사쿠사 실크푸딩 본점|AsakusaSilkPudding
하얏트 리젠시 도쿄|HyattRegencyTokyo
아키하바라역|AkihabaraStation
만다라케 콤플렉스|MandarakeComplex
아키하바라 라디오회관|AkihabaraRadioKaikan
규카츠 모토무라 아키하바라점|GyukatsuMotomuraAkihabara
우에노 공원|UenoPark
우에노 아메요코 상점가|UenoAmeyokoShoppingStreet
버스타 신주쿠 버스 정류장;버스타 신주쿠|ShinjukuExpresswayBusTerminal
카와구치코역|KawaguchikoStation
오이시공원|OishiPark
오이시 공원 카페|OishiParkCafé
호토우 후도|HoutouFudou
C-pla Harajuku Takeshita Street|C-plaHarajukuTakeshitaStreet
로스트 비프 오노 하라주쿠점|RoastBeefOhnoHarajuku
도쿄도청 북쪽 전망대|NorthObservationDeck
아부라소바 니시신주쿠구미|TokyoAburagumiSohontenNishiShinjukugumi
신바시역|ShimbashiStation
호텔빌라퐁텐도쿄-시오도메;호텔 빌라 폰테인 그랜드 도쿄-시오도메|HotelVillaFontaineGrandTokyoShiodome
반테츠|banquette
하마리큐 은사정원|HamarikyuGardens
Nakajima Tea House|NakajimaTeaHouse
롯폰기역|RoppongiStation
모리타워 전망대 &모리미술관|MoriTower
아후리 롯폰기힐즈|AFURIRoppongiHills
도쿄 미드타운|TokyoMidtown
곤파치 니시아자부|GonpachiNishiazabu
오다이바카이힌코엔역|OdaibakaihinkōenStation
오다이바 해변공원|OdaibaMarinePark
다이버시티 도쿄 플라자|DiverCityTokyoPlaza
규카츠 교토가츠규 오다이바 DiverCity Tokyo Plaza점|GyukatsuKyotoKatsugyuDiverCityTokyoPlaza
아쿠아시티 오다이바|AquaCityOdaiba
구체전망실 하치타마|HACHITAMA
가마쿠라코코마에 역|KamakuraKokoMaeStation
고토쿠인|KotokuinTemple
에노시마|Enoshima
시라스야|Shirasuya
코마치도리 거리|KomachiStreet
헤케룬|Heckeln
우동 오니얀마 신바시점|OniyanmaShinbashi
인천국제공항|incheon
JR 큐슈 호텔 블라섬 하카타 센트럴|JRKyushuHotelBlossomHakataCentral
멘야 타이손|MenyaTaison
이치란 라멘 하카타 본점|ICHIRANSouhonten
코게츠|Kogetsu
카메노이 호텔 벳푸|KAMENOIHOTELBEPPU
효탄온천|HyotanOnsen
키스이마루 하카타점|KisuimaruHakata
`;
for (const line of lines.trim().split('\n')) {
  const [names, file] = line.split('|');
  const path = assets.find(p => p.split('/').at(-1).replace(/\.[^.]+$/, '').toLowerCase() === file.toLowerCase());
  if (!path) { console.log('Missing asset:', file); continue; }
  for (const name of names.split(';')) mapping.set(normalize(name), 'img/' + path);
}
const valid = p => p && assets.some(a => ('img/' + a).toLowerCase() === p.toLowerCase());
let updated = 0;
const unresolved = new Map();
for (const trip of data.trips) for (const place of trip.days.flatMap(d => d.items)) {
  if (place.type !== 'place' || valid(place.image)) continue;
  const path = mapping.get(normalize(place.place));
  if (path) { place.image = path; updated++; }
  else if (!place.isFreeMeal && !place.place.startsWith('-')) unresolved.set(place.place, trip.city);
}
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log('Updated:', updated);
console.log([...unresolved].map(([name, city]) => city + '|' + name).join('\n'));
