import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useCurrentWeather } from "../hooks/useCurrentWeather";
import styles from "./TravelForm.module.scss";
import travelIcon from "../assets/icons/transportation/travel.svg";
import walkIcon from "../assets/icons/transportation/directions_walk.svg";
import subwayIcon from "../assets/icons/transportation/directions_subway.svg";
import carIcon from "../assets/icons/transportation/directions_car.svg";
import diningIcon from "../assets/icons/dining.svg";
import pinIcon from "../assets/icons/pin.svg";
import checkIcon from "../assets/icons/check_circle.svg";
import menuIcon from "../assets/icons/ham_menu.svg";
import closeIcon from "../assets/icons/close.svg";
import arrowIcon from "../assets/icons/arrow_forward.svg";
import backIcon from "../assets/icons/arrow_back.svg";
import heartIcon from "../assets/icons/heart.svg";
import addIcon from "../assets/icons/menu_bar/03add.svg";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const categoryNames = {
  airport: "공항",
  station: "역 · 교통",
  hotel: "숙소",
  attraction: "관광지",
  restaurant: "식당",
};

const categoryIcons = {
  airport: travelIcon,
  station: subwayIcon,
  hotel: checkIcon,
  attraction: pinIcon,
  restaurant: diningIcon,
};

const getTransportIcon = (transport = "") => {
  if (/도보/.test(transport)) return walkIcon;
  if (/지하철|전철|열차|신칸센/.test(transport)) return subwayIcon;
  if (/자동차|택시|버스/.test(transport)) return carIcon;
  return travelIcon;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const matchedKey = Object.keys(imageModules).find(
    (key) => key.toLowerCase() === relativePath.toLowerCase(),
  );
  return matchedKey ? imageModules[matchedKey] : "";
};

const createStops = (trip) =>
  trip.days.map((day) =>
    day.items.reduce((stops, item, index, items) => {
      if (item.type !== "place") return stops;
      const nextTransport = items[index + 1]?.type === "transport" ? items[index + 1] : null;
      stops.push({
        id: `${trip.id}-${day.day}-${index}`,
        time: item.time || "시간 미정",
        icon: categoryIcons[item.category] || pinIcon,
        name: item.place,
        type: categoryNames[item.category] || item.category,
        note: item.recommendation || "",
        travel: nextTransport?.transport || "",
        image: getImageUrl(item.image),
        category: item.category,
        dayLabel: day.label || `DAY ${String(day.day).padStart(2, "0")}`,
        recommendation: item.recommendation || "",
        isFreeMeal: Boolean(item.isFreeMeal),
        imageSource: item.imageSource || "",
        imageStatus: item.imageStatus || "",
        imageError: item.imageError || "",
      });
      return stops;
    }, []),
  );

export default function TravelForm({ onSubmit, loading }) {
  const [params] = useSearchParams();
  const selectedTrip = useMemo(() => {
    const tripId = params.get("trip");
    return tripRoad.trips.find((trip) => trip.id === tripId)
      || tripRoad.trips.find((trip) => trip.id === "trip-후쿠오카-3박4일")
      || tripRoad.trips[0];
  }, [params]);
  const days = selectedTrip.days.map((day, index) => [
    day.label || `DAY ${String(day.day).padStart(2, "0")}`,
    day.date ? new Date(day.date).getDate() : String(index + 1).padStart(2, "0"),
  ]);
  const heroImage = getImageUrl(
    selectedTrip.days.flatMap((day) => day.items).find((item) => item.image)?.image,
  );
  const weather = useCurrentWeather(selectedTrip.city, selectedTrip.country);
  const [activeDay, setActiveDay] = useState(0);
  const [stopsByDay, setStopsByDay] = useState(() => createStops(selectedTrip));
  const [travelTitle, setTravelTitle] = useState(selectedTrip.title);
  const [draftTitle, setDraftTitle] = useState(selectedTrip.title);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [memoTarget, setMemoTarget] = useState(null);
  const [memoDraft, setMemoDraft] = useState("");
  const stops = stopsByDay[activeDay] || [];
  const suggestedTitles = [
    `맛집 따라 ${selectedTrip.city}`,
    `카페와 골목을 걷는 ${selectedTrip.city} 여행`,
    `SLOW ${selectedTrip.city.toUpperCase()}`,
  ];

  const addStop = () => {
    setStopsByDay((current) => current.map((dayStops, index) =>
      index === activeDay
        ? [...dayStops, { id: Date.now(), time: "시간 미정", icon: pinIcon, name: "새로운 장소", type: "장소", note: "", travel: "" }]
        : dayStops,
    ));
  };

  const removeStop = (id) => setStopsByDay((current) => current.map((dayStops, index) =>
    index === activeDay ? dayStops.filter((stop) => stop.id !== id) : dayStops,
  ));

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ destination: selectedTrip.city, duration: selectedTrip.duration, people: "2", budget: "800000", interest: "맛집, 관광", stops: stopsByDay });
  };

  const openTitleEdit = () => {
    setDraftTitle(travelTitle);
    setIsEditOpen(true);
  };

  const saveTitle = () => {
    const nextTitle = draftTitle.trim();
    if (nextTitle) setTravelTitle(nextTitle);
    setIsEditOpen(false);
  };

  const openMemo = (stop) => {
    setMemoTarget(stop);
    setMemoDraft(stop.note || "");
  };

  const closeMemo = () => {
    setMemoTarget(null);
    setMemoDraft("");
  };

  const saveMemo = () => {
    if (!memoTarget) return;
    setStopsByDay((current) => current.map((dayStops, index) =>
      index === activeDay
        ? dayStops.map((stop) => stop.id === memoTarget.id ? { ...stop, note: memoDraft.trim() } : stop)
        : dayStops,
    ));
    closeMemo();
  };

  const removeMemo = (id) => {
    setStopsByDay((current) => current.map((dayStops, index) =>
      index === activeDay
        ? dayStops.map((stop) => stop.id === id ? { ...stop, note: "" } : stop)
        : dayStops,
    ));
  };
  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.hero} style={heroImage ? { backgroundImage: `linear-gradient(to bottom, #c7c7c766 0%, #444 100%), url(${heroImage})` } : undefined}>
        <div className={styles.weather} aria-live="polite"><small>LIVE WEATHER</small><strong>{weather.loading ? "--" : weather.temperature ?? "--"}°</strong><span>● {weather.error ? "OFFLINE" : weather.label}</span></div>
        <div className={styles.heroCopy}><p>{selectedTrip.country.toUpperCase()} · {selectedTrip.duration}</p><h1>{selectedTrip.city.toUpperCase()}</h1></div>
      </section>

      <section className={styles.summary}>
        <div className={styles.summaryTitle}><h2>{travelTitle}</h2><button type="button" onClick={openTitleEdit}>EDIT</button></div>
        <div className={styles.flight}><span><img src={travelIcon} alt="" />{selectedTrip.dateRange.start || "출발일 미정"} · {selectedTrip.dateRange.end || "도착일 미정"}</span><button type="button">변경</button></div>
        <div className={styles.dayTabs}>
          {days.map(([day, date], index) => (
            <button className={activeDay === index ? styles.selected : ""} key={day} type="button" onClick={() => setActiveDay(index)}>
              <b>{day}</b><span>{date}</span>
            </button>
          ))}
        </div>
        <div className={styles.mapPlaceholder}><span>{selectedTrip.city.toUpperCase()} · DAY {activeDay + 1}</span></div>
      </section>

      <section className={styles.schedule}>
        <header><h2>DAY {String(activeDay + 1).padStart(2, "0")}</h2><span>{selectedTrip.days[activeDay]?.date || "DATE TBD"}</span></header>
        <p className={styles.guide}>✶ {selectedTrip.city} 여행 {activeDay + 1}일차 일정이에요</p>
        <p className={styles.arrival}>총 {stops.length}개의 장소</p>

        <div className={styles.stopList}>
          {stops.map((stop) => (
            <div className={styles.stopGroup} key={stop.id}>
              <article className={styles.stopCard}>
                <time>{stop.time}</time>
                <span className={styles.placeIcon}><img src={stop.icon} alt="" /></span>
                <div className={styles.placeCopy}><strong>{stop.name}</strong><small>{stop.type}</small><button type="button" onClick={() => setSelectedStop(stop)}>자세히 보기 &gt;</button></div>
                <span className={styles.drag}><img src={menuIcon} alt="순서 변경" /></span>
                <button className={styles.remove} type="button" aria-label={`${stop.name} 삭제`} onClick={() => removeStop(stop.id)}><img src={closeIcon} alt="" /></button>
              </article>
              {stop.note && (
                <div className={styles.note}>
                  <button type="button" onClick={() => openMemo(stop)}>{stop.note}</button>
                  <span>
                    <button type="button" onClick={() => openMemo(stop)}>수정</button>
                    <button type="button" aria-label="메모 삭제" onClick={() => removeMemo(stop.id)}>×</button>
                  </span>
                </div>
              )}
              <button className={styles.addMemo} type="button" onClick={() => openMemo(stop)}><img src={addIcon} alt="" />{stop.note ? "메모 수정" : "메모 추가"}</button>
              {stop.travel && <div className={styles.travel}><span><img src={getTransportIcon(stop.travel)} alt="" />{stop.travel}</span><b><img src={arrowIcon} alt="" /></b></div>}
            </div>
          ))}
        </div>

        <div className={styles.addActions}>
          <button type="button" onClick={addStop}>장소 추가</button>
          <button type="button" onClick={addStop}>찜한 장소 추가</button>
        </div>
        <button className={styles.draft} type="button">임시저장</button>
        <button className={styles.confirm} disabled={loading}>{loading ? "일정 저장 중…" : "일정 확정하기 →"}</button>
      </section>
      {isEditOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsEditOpen(false)}>
          <div
            className={styles.titleModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-title-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsEditOpen(false);
            }}
          >
            <p className={styles.modalLabel} id="trip-title-modal">TRIP TITLE</p>
            <label className={styles.titleField}>
              <span>현재 제목</span>
              <input
                autoFocus
                value={draftTitle}
                maxLength={40}
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveTitle();
                  }
                }}
              />
            </label>
            <strong className={styles.titlePreview}>{draftTitle || travelTitle}</strong>
            <div className={styles.suggestions}>
              <p>SUGGESTED TITLES</p>
              {suggestedTitles.map((title) => (
                <button type="button" key={title} onClick={() => setDraftTitle(title)}>
                  <span>{title}</span><b>→</b>
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsEditOpen(false)}>취소</button>
              <button type="button" onClick={saveTitle} disabled={!draftTitle.trim()}>저장</button>
            </div>
          </div>
        </div>
      )}
      {memoTarget && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={closeMemo}>
          <div
            className={styles.memoModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="memo-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeMemo();
            }}
          >
            <p className={styles.modalLabel} id="memo-modal-title">MEMO</p>
            <small className={styles.memoPlace}>{memoTarget.name}</small>
            <textarea
              autoFocus
              value={memoDraft}
              maxLength={200}
              placeholder="일정에 필요한 메모를 입력하세요."
              onChange={(event) => setMemoDraft(event.target.value)}
            />
            <div className={styles.memoActions}>
              <button type="button" onClick={closeMemo}>취소</button>
              <button type="button" onClick={saveMemo} disabled={!memoDraft.trim()}>저장</button>
            </div>
          </div>
        </div>
      )}
      {selectedStop && (
        <div className={styles.placeDetail} role="dialog" aria-modal="true" aria-labelledby="place-detail-title">
          <header className={styles.detailHeader}>
            <button type="button" aria-label="뒤로 가기" onClick={() => setSelectedStop(null)}><img src={backIcon} alt="" /></button>
            <button type="button" aria-label="닫기" onClick={() => setSelectedStop(null)}><img src={closeIcon} alt="" /></button>
          </header>
          <a className={styles.mapLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedStop.name} ${selectedTrip.city}`)}`} target="_blank" rel="noreferrer">구글 지도 앱으로 보기 &gt;</a>
          <div className={styles.detailImage}>
            {selectedStop.image && <img src={selectedStop.image} alt={selectedStop.name} />}
          </div>
          <section className={styles.detailContent}>
            <h2 id="place-detail-title">{selectedStop.name}</h2>
            <p className={styles.placeMeta}>{selectedTrip.city} · {selectedStop.type}</p>
            <p className={styles.rating}>{selectedStop.dayLabel} · {selectedStop.time}</p>
            <p className={styles.placeDescription}>{selectedStop.recommendation || `${selectedTrip.city} ${selectedStop.type} 추천 장소`}</p>
            <div className={styles.features}><span>✓ {selectedStop.isFreeMeal ? "자유 식사" : "일정 포함"}</span><span>{selectedStop.type}</span><span>{selectedStop.imageStatus || "장소 정보"}</span><b>›</b></div>
            <dl className={styles.detailList}>
              <div><dt><img src={pinIcon} alt="위치" /></dt><dd>{selectedTrip.country.toUpperCase()} · {selectedTrip.city}</dd></div>
              <div><dt><img src={checkIcon} alt="일정" /></dt><dd>{selectedStop.dayLabel} 일정에 등록된 장소</dd></div>
              <div><dt><img src={travelIcon} alt="방문 시간" /></dt><dd>방문 예정 시간 · {selectedStop.time}</dd><b>⌄</b></div>
              <div><dt><img src={heartIcon} alt="추천 정보" /></dt><dd>{selectedStop.recommendation || "추가 추천 정보가 없습니다."}<small>{selectedStop.imageSource ? `이미지 출처: ${selectedStop.imageSource}` : "trip_road.json 제공 정보"}</small></dd><b>⌄</b></div>
            </dl>
          </section>
          <div className={styles.detailActions}>
            <button type="button" onClick={() => setSelectedStop(null)}>일정 추가</button>
            <button
              type="button"
              onClick={() => setSavedPlaces((current) => current.includes(selectedStop.id) ? current.filter((id) => id !== selectedStop.id) : [...current, selectedStop.id])}
            >
              {savedPlaces.includes(selectedStop.id) ? "찜 취소" : "장소 찜하기"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
