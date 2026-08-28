import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useCurrentWeather } from "../hooks/useCurrentWeather";
import PlaceMap from "./PlaceMap";
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
  const [draggedStopId, setDraggedStopId] = useState(null);
  const [isFlightOpen, setIsFlightOpen] = useState(false);
  const airportStops = selectedTrip.days.flatMap((day) => day.items).filter((item) => item.type === "place" && item.category === "airport");
  const [flightInfo, setFlightInfo] = useState(() => ({
    departureAirport: airportStops[0]?.place || "출발 공항",
    arrivalAirport: airportStops.at(-1)?.place || selectedTrip.city,
    departureDate: selectedTrip.dateRange.start || "2026-08-17",
    departureHour: "15",
    departureMinute: "30",
    arrivalDate: selectedTrip.dateRange.end || "2026-08-20",
    arrivalHour: "20",
    arrivalMinute: "30",
    airline: "대한항공",
    flightNumber: "KE704",
    departureTerminal: "T1",
    arrivalTerminal: "T2",
  }));
  const [flightDraft, setFlightDraft] = useState(flightInfo);
  const [isPlaceAddOpen, setIsPlaceAddOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeCategory, setPlaceCategory] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistCategory, setWishlistCategory] = useState("all");
  const [wishlistSelections, setWishlistSelections] = useState([]);
  const stops = stopsByDay[activeDay] || [];
  const suggestedTitles = [
    `맛집 따라 ${selectedTrip.city}`,
    `카페와 골목을 걷는 ${selectedTrip.city} 여행`,
    `SLOW ${selectedTrip.city.toUpperCase()}`,
  ];

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

  const moveStop = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setStopsByDay((current) => current.map((dayStops, index) => {
      if (index !== activeDay) return dayStops;
      const sourceIndex = dayStops.findIndex((stop) => String(stop.id) === String(sourceId));
      const targetIndex = dayStops.findIndex((stop) => String(stop.id) === String(targetId));
      if (sourceIndex < 0 || targetIndex < 0) return dayStops;
      const nextStops = [...dayStops];
      const [movedStop] = nextStops.splice(sourceIndex, 1);
      nextStops.splice(targetIndex, 0, movedStop);
      return nextStops;
    }));
  };

  const handleHandleKeyDown = (event, stopId) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const currentIndex = stops.findIndex((stop) => stop.id === stopId);
    const targetIndex = event.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < stops.length) moveStop(stopId, stops[targetIndex].id);
  };

  const openFlightEdit = () => {
    setFlightDraft(flightInfo);
    setIsFlightOpen(true);
  };

  const updateFlightDraft = (field) => (event) => {
    setFlightDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const saveFlight = () => {
    setFlightInfo(flightDraft);
    setIsFlightOpen(false);
  };

  const placeCandidates = selectedTrip.days
    .flatMap((day) => day.items)
    .filter((item) => item.type === "place")
    .filter((item, index, items) => items.findIndex((candidate) => candidate.place === item.place) === index)
    .filter((item) => placeCategory === "all" || item.category === placeCategory)
    .filter((item) => {
      const keyword = placeQuery.trim().toLowerCase();
      return !keyword || `${item.place} ${categoryNames[item.category] || ""}`.toLowerCase().includes(keyword);
    });

  const addSelectedPlace = () => {
    if (!selectedCandidate) return;
    setStopsByDay((current) => current.map((dayStops, index) => index === activeDay
      ? [...dayStops, {
        id: `added-${Date.now()}`,
        time: "시간 미정",
        icon: categoryIcons[selectedCandidate.category] || pinIcon,
        name: selectedCandidate.place,
        type: categoryNames[selectedCandidate.category] || selectedCandidate.category,
        note: selectedCandidate.recommendation || "",
        travel: "",
        image: getImageUrl(selectedCandidate.image),
        category: selectedCandidate.category,
        recommendation: selectedCandidate.recommendation || "",
        latitude: selectedCandidate.latitude,
        longitude: selectedCandidate.longitude,
      }]
      : dayStops));
    setIsPlaceAddOpen(false);
    setSelectedCandidate(null);
    setPlaceQuery("");
  };

  const wishlistPlaces = selectedTrip.days
    .flatMap((day) => day.items)
    .filter((item) => item.type === "place")
    .filter((item, index, items) => items.findIndex((candidate) => candidate.place === item.place) === index)
    .filter((item) => wishlistCategory === "all" || item.category === wishlistCategory)
    .slice(0, 12);

  const toggleWishlistSelection = (place) => {
    setWishlistSelections((current) => current.includes(place.place)
      ? current.filter((name) => name !== place.place)
      : [...current, place.place]);
  };

  const addWishlistPlaces = () => {
    const selectedItems = wishlistPlaces.filter((place) => wishlistSelections.includes(place.place));
    if (!selectedItems.length) return;
    setStopsByDay((current) => current.map((dayStops, index) => index === activeDay
      ? [...dayStops, ...selectedItems.map((place, placeIndex) => ({
        id: `wishlist-${Date.now()}-${placeIndex}`,
        time: "시간 미정",
        icon: categoryIcons[place.category] || pinIcon,
        name: place.place,
        type: categoryNames[place.category] || place.category,
        note: place.recommendation || "",
        travel: "",
        image: getImageUrl(place.image),
        category: place.category,
        recommendation: place.recommendation || "",
        latitude: place.latitude,
        longitude: place.longitude,
      }))]
      : dayStops));
    setWishlistSelections([]);
    setIsWishlistOpen(false);
  };
  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.hero} style={heroImage ? { backgroundImage: `linear-gradient(to bottom, #c7c7c766 0%, #444 100%), url(${heroImage})` } : undefined}>
        <div className={styles.weather} aria-live="polite"><small>LIVE WEATHER</small><strong>{weather.loading ? "--" : weather.temperature ?? "--"}°</strong><span>● {weather.error ? "OFFLINE" : weather.label}</span></div>
        <div className={styles.heroCopy}><p>{selectedTrip.country.toUpperCase()} · {selectedTrip.duration}</p><h1>{selectedTrip.city.toUpperCase()}</h1></div>
      </section>

      <section className={styles.summary}>
        <div className={styles.summaryTitle}><h2>{travelTitle}</h2><button type="button" onClick={openTitleEdit}>EDIT</button></div>
        <div className={styles.flight}><span><img src={travelIcon} alt="" />{flightInfo.departureDate} {flightInfo.departureHour}:{flightInfo.departureMinute} 출발 · {flightInfo.arrivalDate} {flightInfo.arrivalHour}:{flightInfo.arrivalMinute} 도착</span><button type="button" onClick={openFlightEdit}>변경</button></div>
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
            <div
              className={`${styles.stopGroup} ${draggedStopId === stop.id ? styles.dragging : ""}`}
              key={stop.id}
              data-stop-id={stop.id}
              onDragOver={(event) => {
                event.preventDefault();
                moveStop(draggedStopId, stop.id);
              }}
            >
              <article className={styles.stopCard}>
                <time>{stop.time}</time>
                <span className={styles.placeIcon}><img src={stop.icon} alt="" /></span>
                <div className={styles.placeCopy}><strong>{stop.name}</strong><small>{stop.type}</small><button type="button" onClick={() => setSelectedStop(stop)}>자세히 보기 &gt;</button></div>
                <button
                  className={styles.drag}
                  type="button"
                  draggable
                  aria-label={`${stop.name} 순서 변경`}
                  title="드래그하여 일정 순서 변경"
                  onDragStart={(event) => {
                    setDraggedStopId(stop.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(stop.id));
                  }}
                  onDragEnd={() => setDraggedStopId(null)}
                  onKeyDown={(event) => handleHandleKeyDown(event, stop.id)}
                  onPointerDown={(event) => {
                    if (event.pointerType === "mouse") return;
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDraggedStopId(stop.id);
                  }}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse" || draggedStopId === null) return;
                    event.preventDefault();
                    const target = document
                      .elementFromPoint(event.clientX, event.clientY)
                      ?.closest("[data-stop-id]");
                    if (target?.dataset.stopId) moveStop(draggedStopId, target.dataset.stopId);
                  }}
                  onPointerUp={(event) => {
                    if (event.pointerType === "mouse") return;
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                    setDraggedStopId(null);
                  }}
                  onPointerCancel={() => setDraggedStopId(null)}
                >
                  <img src={menuIcon} alt="" />
                </button>
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
          <button type="button" onClick={() => setIsPlaceAddOpen(true)}>장소 추가</button>
          <button type="button" onClick={() => setIsWishlistOpen(true)}>찜한 장소 추가</button>
        </div>
        <button className={styles.draft} type="button">임시저장</button>
        <button className={styles.confirm} disabled={loading}>{loading ? "일정 저장 중…" : "일정 확정하기 →"}</button>
      </section>
      {isPlaceAddOpen && (
        <div className={styles.placeAdder} role="dialog" aria-modal="true" aria-labelledby="place-adder-title">
          <div className={styles.placeAdderInner}>
            <header><button type="button" aria-label="장소 추가 닫기" onClick={() => setIsPlaceAddOpen(false)}>←</button><div><h2 id="place-adder-title">장소 추가하기</h2><p>일정에 추가할 장소를 찾아보세요 · {selectedTrip.city}</p></div></header>
            <section className={styles.placeMapArea}>
              <PlaceMap
                places={placeCandidates}
                fallbackPlaces={selectedTrip.days.flatMap((day) => day.items)}
                selectedPlace={selectedCandidate}
                onSelect={setSelectedCandidate}
              />
              <span className={styles.mapDay}>⌖ DAY {String(activeDay + 1).padStart(2, "0")} 기준 주변</span>
              <div className={styles.mapFilters}>
                {[["all", "전체"], ["attraction", "관광지"], ["restaurant", "맛집"], ["hotel", "숙소"], ["station", "교통"]].map(([value, label]) => (
                  <button className={placeCategory === value ? styles.mapFilterActive : ""} type="button" key={value} onClick={() => setPlaceCategory(value)}>{label}</button>
                ))}
              </div>
            </section>
            <label className={styles.placeSearch}><span>⌕</span><input value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} placeholder="관광지, 맛집, 쇼핑 검색하기" /></label>
            <section className={styles.placeResults}>
              <h3>검색 결과</h3>
              <div>
                {placeCandidates.map((place, index) => {
                  const selected = selectedCandidate?.place === place.place;
                  return <button className={selected ? styles.placeSelected : ""} type="button" key={place.place} onClick={() => setSelectedCandidate(place)}>
                    <span className={styles.resultNumber}>{index + 1}</span>
                    <span className={styles.resultImage}>{getImageUrl(place.image) && <img src={getImageUrl(place.image)} alt="" />}</span>
                    <span className={styles.resultCopy}><strong>{place.place}</strong><small>{categoryNames[place.category] || place.category}</small><b>자세히 보기 &gt;</b><em>{place.recommendation || `${selectedTrip.city} 추천 장소`}</em></span>
                    {selected && <span className={styles.selectedCheck}>✓</span>}
                  </button>;
                })}
                {!placeCandidates.length && <p className={styles.noPlaces}>검색 결과가 없습니다.</p>}
              </div>
            </section>
            <footer className={styles.placeAddFooter}><span>선택한 장소 {selectedCandidate ? 1 : 0}개</span><button type="button" disabled={!selectedCandidate} onClick={addSelectedPlace}>선택한 장소 추가</button></footer>
          </div>
        </div>
      )}
      {isWishlistOpen && (
        <div className={styles.wishlistAdder} role="dialog" aria-modal="true" aria-labelledby="wishlist-adder-title">
          <div className={styles.wishlistAdderInner}>
            <header>
              <button type="button" aria-label="찜한 장소 닫기" onClick={() => setIsWishlistOpen(false)}>←</button>
              <div><h2 id="wishlist-adder-title">찜한 장소 불러오기</h2><p>지도에 저장해둔 장소를 일정에 담아보세요</p></div>
            </header>
            <section className={styles.wishlistMapArea}>
              <PlaceMap
                places={wishlistPlaces}
                fallbackPlaces={selectedTrip.days.flatMap((day) => day.items)}
                selectedPlace={wishlistPlaces.find((place) => wishlistSelections.includes(place.place)) || null}
                onSelect={toggleWishlistSelection}
              />
              <span className={styles.savedCount}>♡ 저장된 장소 {wishlistPlaces.length}곳</span>
            </section>
            <div className={styles.wishlistFilters}>
              {[["all", "전체"], ["attraction", "관광지"], ["restaurant", "맛집"], ["hotel", "숙소"], ["station", "교통"]].map(([value, label]) => (
                <button className={wishlistCategory === value ? styles.wishlistFilterActive : ""} type="button" key={value} onClick={() => setWishlistCategory(value)}>{label}</button>
              ))}
            </div>
            <section className={styles.wishlistResults}>
              <h3>검색 결과</h3>
              <div>
                {wishlistPlaces.map((place, index) => {
                  const selected = wishlistSelections.includes(place.place);
                  return (
                    <article key={place.place}>
                      <span className={styles.resultNumber}>{index + 1}</span>
                      <span className={styles.resultImage}>{getImageUrl(place.image) && <img src={getImageUrl(place.image)} alt="" />}</span>
                      <span className={styles.resultCopy}><strong>{place.place}</strong><small>{categoryNames[place.category] || place.category}</small><b>자세히 보기 &gt;</b><em>{place.recommendation || `${selectedTrip.city} 추천 장소`}</em></span>
                      <button className={selected ? styles.wishlistSelected : ""} type="button" onClick={() => toggleWishlistSelection(place)}>{selected ? "✓ 담김" : "+ 찜"}</button>
                    </article>
                  );
                })}
              </div>
            </section>
            <footer className={styles.wishlistFooter}><span>찜한 장소 {wishlistSelections.length}개</span><button type="button" disabled={!wishlistSelections.length} onClick={addWishlistPlaces}>선택한 장소 추가</button></footer>
          </div>
        </div>
      )}
      {isFlightOpen && (
        <div className={styles.flightEditor} role="dialog" aria-modal="true" aria-labelledby="flight-editor-title">
          <div className={styles.flightEditorInner}>
            <p className={styles.flightEyebrow}>CHANGE YOUR FLIGHT</p>
            <h2 id="flight-editor-title">비행기편 수정</h2>
            <p className={styles.flightDescription}>변경된 항공편을 입력하면 연결된<br />일정의 이동 시간을 다시 계산해요.</p>

            <section className={styles.currentFlight}>
              <p>CURRENT BOOKING · 현재 항공편 <span>변경 전</span></p>
              <strong>{flightInfo.departureAirport}<b>⟶</b>{flightInfo.arrivalAirport}</strong>
              <small>{flightInfo.departureDate} {flightInfo.departureHour}:{flightInfo.departureMinute} — {flightInfo.arrivalDate} {flightInfo.arrivalHour}:{flightInfo.arrivalMinute}<br />{flightInfo.airline} · {flightInfo.flightNumber}</small>
            </section>

            <section className={styles.flightFields}>
              <p>EDIT DETAILS · 변경 정보</p>
              <label className={styles.fieldTitle}>노선 ROUTE</label>
              <div className={styles.routeFields}>
                <label><span>출발 공항</span><input value={flightDraft.departureAirport} onChange={updateFlightDraft("departureAirport")} /></label>
                <b>→</b>
                <label><span>도착 공항</span><input value={flightDraft.arrivalAirport} onChange={updateFlightDraft("arrivalAirport")} /></label>
              </div>
              <label className={styles.fieldTitle}>출발 DEPARTURE</label>
              <div className={styles.dateFields}>
                <input type="date" value={flightDraft.departureDate} onChange={updateFlightDraft("departureDate")} />
                <select value={flightDraft.departureHour} onChange={updateFlightDraft("departureHour")}>{Array.from({ length: 24 }, (_, hour) => <option key={hour}>{String(hour).padStart(2, "0")}</option>)}</select>
                <select value={flightDraft.departureMinute} onChange={updateFlightDraft("departureMinute")}>{["00", "10", "20", "30", "40", "50"].map((minute) => <option key={minute}>{minute}</option>)}</select>
              </div>
              <label className={styles.fieldTitle}>도착 ARRIVAL</label>
              <div className={styles.dateFields}>
                <input type="date" value={flightDraft.arrivalDate} onChange={updateFlightDraft("arrivalDate")} />
                <select value={flightDraft.arrivalHour} onChange={updateFlightDraft("arrivalHour")}>{Array.from({ length: 24 }, (_, hour) => <option key={hour}>{String(hour).padStart(2, "0")}</option>)}</select>
                <select value={flightDraft.arrivalMinute} onChange={updateFlightDraft("arrivalMinute")}>{["00", "10", "20", "30", "40", "50"].map((minute) => <option key={minute}>{minute}</option>)}</select>
              </div>
              <label className={styles.fieldTitle}>항공사·편명 AIRLINE / FLIGHT</label>
              <div className={styles.airlineFields}><input value={flightDraft.airline} onChange={updateFlightDraft("airline")} /><input value={flightDraft.flightNumber} onChange={updateFlightDraft("flightNumber")} /></div>
              <label className={styles.fieldTitle}>터미널 TERMINAL <small>(선택)</small></label>
              <div className={styles.airlineFields}><label><span>출발</span><input value={flightDraft.departureTerminal} onChange={updateFlightDraft("departureTerminal")} /></label><label><span>도착</span><input value={flightDraft.arrivalTerminal} onChange={updateFlightDraft("arrivalTerminal")} /></label></div>
            </section>

            <section className={styles.flightPreview}>
              <p>CHANGE PREVIEW · 변경 미리보기</p>
              <div><span>출발　{flightInfo.departureHour}:{flightInfo.departureMinute} → <b>{flightDraft.departureHour}:{flightDraft.departureMinute}</b></span><span>도착　{flightInfo.arrivalHour}:{flightInfo.arrivalMinute} → <b>{flightDraft.arrivalHour}:{flightDraft.arrivalMinute}</b></span></div>
            </section>
            <p className={styles.autoNotice}><b>현재 시각 기준 입국 및 수하물 이동 시간 90분 자동 반영</b><small>저장 전 변경 내용을 한 번 더 확인해 주세요.</small></p>
            <div className={styles.flightActions}><button type="button" onClick={() => setIsFlightOpen(false)}>취소</button><button type="button" onClick={saveFlight}>변경 내용 저장하기</button></div>
          </div>
        </div>
      )}
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
