import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useCurrentWeather } from "../hooks/useCurrentWeather";
import { useAuth } from "../hooks/useAuth";
import { deleteFavoritePlace, getFavoritePlaces, saveFavoritePlace } from "../services/firestoreService";
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
import { resolveImageUrl as getImageUrl, useImageFallback } from "../utils/imageUtils";

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

const toDateInputValue = (date) => {
  if (!date) return "";
  const matched = String(date).match(/\d{4}-\d{2}-\d{2}/);
  return matched?.[0] || "";
};

const addDays = (date, amount) => {
  if (!date) return "";
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + amount);
  return value.toLocaleDateString("sv-SE");
};

const getAirportCode = (airport = "") => {
  const codes = {
    나리타: "NRT", 인천: "ICN", 김포: "GMP", 후쿠오카: "FUK", 하네다: "HND",
    간사이: "KIX", 제주: "CJU", 김해: "PUS", 신치토세: "CTS",
  };
  const matched = Object.entries(codes).find(([name]) => airport.includes(name));
  return matched?.[1] || airport.match(/\b[A-Z]{3}\b/)?.[0] || "AIR";
};

const airportTimeZones = {
  ICN: "Asia/Seoul", GMP: "Asia/Seoul", PUS: "Asia/Seoul", CJU: "Asia/Seoul",
  NRT: "Asia/Tokyo", HND: "Asia/Tokyo", KIX: "Asia/Tokyo", FUK: "Asia/Tokyo", CTS: "Asia/Tokyo",
  PVG: "Asia/Shanghai", SHA: "Asia/Shanghai", PEK: "Asia/Shanghai", PKX: "Asia/Shanghai",
  HKG: "Asia/Hong_Kong", TPE: "Asia/Taipei", SIN: "Asia/Singapore", BKK: "Asia/Bangkok",
  LAX: "America/Los_Angeles", SFO: "America/Los_Angeles", JFK: "America/New_York", EWR: "America/New_York",
  LHR: "Europe/London", CDG: "Europe/Paris", FCO: "Europe/Rome", SYD: "Australia/Sydney", HNL: "Pacific/Honolulu",
};

const timeZoneOptions = [
  "Asia/Seoul", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei",
  "Asia/Singapore", "Asia/Bangkok", "America/Los_Angeles", "America/New_York",
  "Europe/London", "Europe/Paris", "Europe/Rome", "Australia/Sydney", "Pacific/Honolulu",
];

const getAirportTimeZone = (airport = "") => airportTimeZones[getAirportCode(airport)] || "Asia/Seoul";

const zonedDateTimeToUtc = (date, hour, minute, timeZone) => {
  if (!date || hour === undefined || minute === undefined || !timeZone) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (![year, month, day, Number(hour), Number(minute)].every(Number.isFinite)) return null;
  const target = Date.UTC(year, month - 1, day, Number(hour), Number(minute));
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const values = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    );
    const represented = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
    guess += target - represented;
  }
  return new Date(guess);
};

const getFlightDurationMinutes = (flight) => {
  const departureAt = zonedDateTimeToUtc(
    flight.departureDate, flight.departureHour, flight.departureMinute, flight.departureTimeZone,
  );
  const arrivalAt = zonedDateTimeToUtc(
    flight.arrivalDate, flight.arrivalHour, flight.arrivalMinute, flight.arrivalTimeZone,
  );
  if (!departureAt || !arrivalAt) return null;
  return Math.round((arrivalAt.getTime() - departureAt.getTime()) / 60000);
};

const formatFlightDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "계산 불가";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours}시간 ` : ""}${remainder ? `${remainder}분` : ""}`.trim();
};

const getDateDifference = (start, end) => {
  if (!start || !end) return null;
  const startAt = new Date(`${start}T00:00:00`);
  const endAt = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return null;
  return Math.round((endAt.getTime() - startAt.getTime()) / 86400000);
};

const addMinutesToTime = (hour, minute, amount) => {
  const total = Number(hour) * 60 + Number(minute) + amount;
  if (!Number.isFinite(total) || total < 0 || total >= 1440) return "";
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const sortStopsByTime = (items) => [...items].sort((left, right) => {
  const leftTime = /^\d{2}:\d{2}$/.test(left.time || "") ? left.time : "99:99";
  const rightTime = /^\d{2}:\d{2}$/.test(right.time || "") ? right.time : "99:99";
  return leftTime.localeCompare(rightTime);
});

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
        imagePath: item.image || "",
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

export default function TravelForm({ onSubmit, onDraftSave, onDirtyChange, loading, draftLoading = false, initialTrip = null, editMode = false }) {
  const [params] = useSearchParams();
  const selectedTrip = useMemo(() => {
    const tripId = params.get("trip");
    return initialTrip || tripRoad.trips.find((trip) => trip.id === tripId)
      || tripRoad.trips.find((trip) => trip.id === "trip-후쿠오카-3박4일")
      || tripRoad.trips[0];
  }, [initialTrip, params]);
  const todayValue = new Date().toLocaleDateString("sv-SE");
  const [tripDateRange, setTripDateRange] = useState(() => {
    const savedStart = toDateInputValue(selectedTrip.dateRange?.start);
    const start = editMode || savedStart >= todayValue ? savedStart : todayValue;
    return {
      start,
      end: start ? addDays(start, Math.max(0, selectedTrip.days.length - 1)) : "",
    };
  });
  const days = selectedTrip.days.map((day, index) => [
    day.label || `DAY ${String(day.day).padStart(2, "0")}`,
    tripDateRange.start
      ? String(new Date(`${addDays(tripDateRange.start, index)}T00:00:00`).getDate()).padStart(2, "0")
      : day.date ? new Date(day.date).getDate() : String(index + 1).padStart(2, "0"),
  ]);
  const heroImage = getImageUrl(
    selectedTrip.days.flatMap((day) => day.items).find((item) => item.image)?.image,
  );
  const weather = useCurrentWeather(selectedTrip.city, selectedTrip.country);
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState(0);
  const [stopsByDay, setStopsByDay] = useState(() => createStops(selectedTrip));
  const [travelTitle, setTravelTitle] = useState(selectedTrip.title);
  const [draftTitle, setDraftTitle] = useState(selectedTrip.title);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [favoriteState, setFavoriteState] = useState({ loading: false, saving: false, error: "" });
  const [memoTarget, setMemoTarget] = useState(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [draggedStopId, setDraggedStopId] = useState(null);
  const [isFlightOpen, setIsFlightOpen] = useState(false);
  const [flightError, setFlightError] = useState("");
  const airportStops = selectedTrip.days.flatMap((day) => day.items).filter((item) => item.type === "place" && item.category === "airport");
  const [flightInfo, setFlightInfo] = useState(() => ({
    departureAirport: airportStops[0]?.place || "출발 공항",
    arrivalAirport: airportStops.at(-1)?.place || selectedTrip.city,
    departureDate: tripDateRange.start || selectedTrip.dateRange.start || "2026-08-17",
    departureHour: "15",
    departureMinute: "30",
    arrivalDate: tripDateRange.start || selectedTrip.dateRange.start || "2026-08-17",
    arrivalHour: "20",
    arrivalMinute: "30",
    airline: "대한항공",
    flightNumber: "KE704",
    departureTerminal: "T1",
    arrivalTerminal: "T2",
    departureTimeZone: getAirportTimeZone(airportStops[0]?.place),
    arrivalTimeZone: getAirportTimeZone(airportStops.at(-1)?.place || selectedTrip.city),
    ...(initialTrip?.flightInfo || {}),
  }));
  const [flightDraft, setFlightDraft] = useState(flightInfo);
  const flightDurationMinutes = getFlightDurationMinutes(flightDraft);
  const flightArrivalDayIndex = getDateDifference(tripDateRange.start, flightDraft.arrivalDate);
  const adjustedArrivalTime = addMinutesToTime(flightDraft.arrivalHour, flightDraft.arrivalMinute, 90);
  const canAdjustArrivalSchedule = flightArrivalDayIndex !== null
    && flightArrivalDayIndex >= 0
    && flightArrivalDayIndex < selectedTrip.days.length
    && Boolean(adjustedArrivalTime);
  const [isPlaceAddOpen, setIsPlaceAddOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeCategory, setPlaceCategory] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedPlaceTime, setSelectedPlaceTime] = useState("10:00");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistCategory, setWishlistCategory] = useState("all");
  const [wishlistSelections, setWishlistSelections] = useState([]);
  const dirtyTrackingStarted = useRef(false);
  const stops = stopsByDay[activeDay] || [];
  const estimatedBudget = 135000 + stopsByDay.flat().length * 32000;
  const exchangeAmount = selectedTrip.country === "일본" ? 35000 : 50000;
  const exchangeCurrency = selectedTrip.country === "일본" ? "JPY" : "LOCAL";
  const recommendationPlaces = selectedTrip.days
    .flatMap((day) => day.items)
    .filter((item) => item.type === "place" && item.image && !stops.some((stop) => stop.name === item.place))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.place === item.place) === index)
    .slice(0, 2);
  const suggestedTitles = [
    `맛집 따라 ${selectedTrip.city}`,
    `카페와 골목을 걷는 ${selectedTrip.city} 여행`,
    `SLOW ${selectedTrip.city.toUpperCase()}`,
  ];

  useEffect(() => {
    if (!user) {
      setSavedPlaces([]);
      return undefined;
    }
    let active = true;
    setFavoriteState((current) => ({ ...current, loading: true, error: "" }));
    getFavoritePlaces(user.uid)
      .then((places) => {
        if (!active) return;
        setSavedPlaces(places);
        setFavoriteState({ loading: false, saving: false, error: "" });
      })
      .catch(() => active && setFavoriteState({ loading: false, saving: false, error: "찜한 장소를 불러오지 못했습니다." }));
    return () => { active = false; };
  }, [user]);

  const favoriteKey = (place) => encodeURIComponent(`${selectedTrip.city}::${place.name || place.place}`);

  const toggleFavorite = async (place) => {
    if (!user || favoriteState.saving) {
      if (!user) setFavoriteState((current) => ({ ...current, error: "로그인 후 장소를 찜할 수 있습니다." }));
      return;
    }
    const key = favoriteKey(place);
    const existing = savedPlaces.find((item) => item.id === key || item.key === key);
    setFavoriteState((current) => ({ ...current, saving: true, error: "" }));
    try {
      if (existing) {
        await deleteFavoritePlace(user.uid, existing.id || key);
        setSavedPlaces((current) => current.filter((item) => item.id !== (existing.id || key)));
      } else {
        const favorite = await saveFavoritePlace(user.uid, {
          key,
          name: place.name || place.place,
          city: selectedTrip.city,
          country: selectedTrip.country,
          category: place.category || "attraction",
          recommendation: place.recommendation || place.note || "",
          image: place.imagePath || place.image || "",
          latitude: place.latitude ?? null,
          longitude: place.longitude ?? null,
        });
        setSavedPlaces((current) => [...current, favorite]);
      }
      window.dispatchEvent(new Event("favorite-places-changed"));
      setFavoriteState({ loading: false, saving: false, error: "" });
    } catch {
      setFavoriteState({ loading: false, saving: false, error: "찜 상태를 변경하지 못했습니다." });
    }
  };

  const removeStop = (id) => setStopsByDay((current) => current.map((dayStops, index) =>
    index === activeDay ? dayStops.filter((stop) => stop.id !== id) : dayStops,
  ));

  const buildPlanPayload = () => {
    const days = selectedTrip.days.map((day, dayIndex) => {
      const dayStops = stopsByDay[dayIndex] || [];
      return {
        ...day,
        date: tripDateRange.start ? addDays(tripDateRange.start, dayIndex) : day.date,
        items: dayStops.flatMap((stop, stopIndex) => {
        const original = day.items.find((item) => item.type === "place" && item.place === stop.name) || {};
        const place = {
          ...original,
          type: "place",
          time: stop.time,
          place: stop.name,
          category: stop.category,
          recommendation: stop.note || stop.recommendation || "",
          image: original.image || stop.imagePath || null,
          latitude: stop.latitude ?? original.latitude ?? null,
          longitude: stop.longitude ?? original.longitude ?? null,
        };
        const transport = stop.travel && stopIndex < dayStops.length - 1
          ? [{ type: "transport", transport: stop.travel }]
          : [];
        return [place, ...transport];
        }),
      };
    });
    return {
      tripId: selectedTrip.tripId || selectedTrip.id,
      title: travelTitle,
      city: selectedTrip.city,
      country: selectedTrip.country,
      duration: selectedTrip.duration,
      dateRange: tripDateRange,
      days,
      flightInfo,
      image: selectedTrip.image || selectedTrip.days.flatMap((day) => day.items).find((item) => item.image)?.image || null,
    };
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = buildPlanPayload();
    onSubmit(editMode
      ? { ...payload, status: "confirmed" }
      : { destination: selectedTrip.city, duration: selectedTrip.duration, people: "2", budget: "800000", interest: "맛집, 관광", stops: stopsByDay, plan: { ...payload, status: "confirmed" } });
  };

  const saveDraft = () => onDraftSave?.({
    ...buildPlanPayload(),
    status: initialTrip?.status === "confirmed" ? "confirmed" : "draft",
  });

  useEffect(() => {
    if (!dirtyTrackingStarted.current) {
      dirtyTrackingStarted.current = true;
      return;
    }
    onDirtyChange?.(true);
  }, [flightInfo, onDirtyChange, stopsByDay, travelTitle, tripDateRange]);

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
    setFlightDraft({
      ...flightInfo,
      departureTimeZone: flightInfo.departureTimeZone || getAirportTimeZone(flightInfo.departureAirport),
      arrivalTimeZone: flightInfo.arrivalTimeZone || getAirportTimeZone(flightInfo.arrivalAirport),
    });
    setFlightError("");
    setIsFlightOpen(true);
  };

  const updateFlightDraft = (field) => (event) => {
    const value = event.target.value;
    setFlightDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "departureAirport") next.departureTimeZone = getAirportTimeZone(value);
      if (field === "arrivalAirport") next.arrivalTimeZone = getAirportTimeZone(value);
      return next;
    });
    setFlightError("");
  };

  const saveFlight = () => {
    if (!flightDraft.departureDate || !flightDraft.arrivalDate || flightDurationMinutes === null) {
      setFlightError("출발일과 도착일을 모두 입력해 주세요.");
      return;
    }
    if (flightDurationMinutes <= 0) {
      setFlightError("도착 일시는 출발 일시보다 이후여야 합니다.");
      return;
    }
    setFlightInfo(flightDraft);
    if (canAdjustArrivalSchedule) {
      setStopsByDay((current) => current.map((dayStops, dayIndex) => {
        if (dayIndex !== flightArrivalDayIndex) return dayStops;
        const firstDestinationIndex = dayStops.findIndex((stop) => stop.category !== "airport");
        if (firstDestinationIndex < 0) return dayStops;
        return sortStopsByTime(dayStops.map((stop, stopIndex) => stopIndex === firstDestinationIndex
          ? { ...stop, time: adjustedArrivalTime }
          : stop));
      }));
    }
    setFlightError("");
    setIsFlightOpen(false);
  };

  const placeCandidates = selectedTrip.days
    .flatMap((day) => day.items)
    .filter((item) => item.type === "place")
    .filter((item, index, items) => items.findIndex((candidate) => candidate.place === item.place) === index)
    .filter((item) => !stops.some((stop) => stop.name === item.place))
    .filter((item) => placeCategory === "all" || item.category === placeCategory)
    .filter((item) => {
      const keyword = placeQuery.trim().toLowerCase();
      return !keyword || `${item.place} ${categoryNames[item.category] || ""}`.toLowerCase().includes(keyword);
    });

  const addSelectedPlace = () => {
    if (!selectedCandidate || !selectedPlaceTime) return;
    setStopsByDay((current) => current.map((dayStops, index) => index === activeDay
      ? sortStopsByTime([...dayStops, {
        id: `added-${Date.now()}`,
        time: selectedPlaceTime,
        icon: categoryIcons[selectedCandidate.category] || pinIcon,
        name: selectedCandidate.place,
        type: categoryNames[selectedCandidate.category] || selectedCandidate.category,
        note: selectedCandidate.recommendation || "",
        travel: "",
        image: getImageUrl(selectedCandidate.image),
        imagePath: selectedCandidate.image || "",
        category: selectedCandidate.category,
        recommendation: selectedCandidate.recommendation || "",
        latitude: selectedCandidate.latitude,
        longitude: selectedCandidate.longitude,
      }])
      : dayStops));
    setIsPlaceAddOpen(false);
    setSelectedCandidate(null);
    setSelectedPlaceTime("10:00");
    setPlaceQuery("");
  };

  const addRecommendedPlace = (place) => {
    setStopsByDay((current) => current.map((dayStops, index) => index === activeDay
      ? sortStopsByTime([...dayStops, {
        id: `recommended-${Date.now()}`,
        time: "시간 미정",
        icon: categoryIcons[place.category] || pinIcon,
        name: place.place,
        type: categoryNames[place.category] || place.category,
        note: place.recommendation || "",
        travel: "",
        image: getImageUrl(place.image),
        imagePath: place.image || "",
        category: place.category,
        recommendation: place.recommendation || "",
        latitude: place.latitude,
        longitude: place.longitude,
      }])
      : dayStops));
  };

  const wishlistPlaces = savedPlaces
    .map((item) => ({ ...item, place: item.name, image: item.image || "" }))
    .filter((item) => !stops.some((stop) => stop.name === item.place))
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
      ? sortStopsByTime([...dayStops, ...selectedItems.map((place, placeIndex) => ({
        id: `wishlist-${Date.now()}-${placeIndex}`,
        time: "시간 미정",
        icon: categoryIcons[place.category] || pinIcon,
        name: place.place,
        type: categoryNames[place.category] || place.category,
        note: place.recommendation || "",
        travel: "",
        image: getImageUrl(place.image),
        imagePath: place.image || "",
        category: place.category,
        recommendation: place.recommendation || "",
        latitude: place.latitude,
        longitude: place.longitude,
      }))])
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
        <section className={styles.tripExpense} aria-labelledby="trip-expense-title">
          <p className={styles.sectionEyebrow}>TRAVEL EXPENSE</p>
          <div className={styles.expenseRow}>
            <span>패키지 예상 경비</span>
            <strong id="trip-expense-title">약 ₩{estimatedBudget.toLocaleString("ko-KR")}</strong>
          </div>
          <div className={styles.expenseMeta}><span>항공권 · 숙박비 제외<br />100 JPY ≈ ₩920</span><button type="button">경비 설정하기 →</button></div>
        </section>
        <section className={styles.exchange} aria-labelledby="exchange-title">
          <div className={styles.exchangeHeading}><p className={styles.sectionEyebrow}>EXCHANGE RATE</p><span>{selectedTrip.country.toUpperCase()} / {exchangeCurrency}</span></div>
          <p className={styles.exchangeLabel}>여행 환율</p>
          <div className={styles.exchangeCard}>
            <span>환전 금액<strong id="exchange-title">¥{exchangeAmount.toLocaleString("ko-KR")}</strong></span>
            <span>최근 업데이트<small>2026.08.31 15:30</small></span>
          </div>
          <button className={styles.exchangeLink} type="button">환율 자세히 보기 →</button>
        </section>
        <section className={styles.tripDateEditor} aria-label="여행 날짜">
          <label>
            <span>여행 시작일</span>
            <input
              type="date"
              required
              value={tripDateRange.start}
              min={editMode ? undefined : todayValue}
              onChange={(event) => {
                const start = event.target.value;
                setTripDateRange({
                  start,
                  end: start ? addDays(start, Math.max(0, selectedTrip.days.length - 1)) : "",
                });
              }}
            />
          </label>
          <b aria-hidden="true">→</b>
          <label>
            <span>여행 종료일 · 자동 계산</span>
            <input type="date" required value={tripDateRange.end} readOnly />
          </label>
        </section>
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
        <header><h2>DAY {String(activeDay + 1).padStart(2, "0")}</h2><span>{tripDateRange.start ? addDays(tripDateRange.start, activeDay) : selectedTrip.days[activeDay]?.date || "DATE TBD"}</span></header>
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
          <button type="button" onClick={() => {
            setSelectedPlaceTime("10:00");
            setIsPlaceAddOpen(true);
          }}>장소 추가</button>
          <button type="button" onClick={() => setIsWishlistOpen(true)}>찜한 장소 추가</button>
        </div>
        {recommendationPlaces.length > 0 && (
          <section className={styles.recommendations} aria-labelledby="recommendation-title">
            <p className={styles.sectionEyebrow}>YOU MAY ALSO LIKE · 함께 둘러보기 좋은 곳</p>
            <h2 id="recommendation-title">이런 곳은 어때요?</h2>
            <p>현재 일정과 동선을 기준으로<br />함께 들르기 좋은 장소를 추천해드려요.</p>
            <div className={styles.recommendationGrid}>
              {recommendationPlaces.map((place) => (
                <article key={place.place}>
                  <span className={styles.recommendationImage}><img src={getImageUrl(place.image)} alt="" onError={useImageFallback} /></span>
                  <small>{categoryNames[place.category] || place.category}</small>
                  <strong>{place.place}</strong>
                  <p>{place.recommendation || `${selectedTrip.city}에서 함께 둘러보기 좋은 장소`}</p>
                  <dl><div><dt>현재 위치에서</dt><dd>약 1 km</dd></div><div><dt>예상 비용</dt><dd>약 ₩7,000</dd></div></dl>
                  <button type="button" onClick={() => addRecommendedPlace(place)}>+ 일정에 추가</button>
                </article>
              ))}
            </div>
          </section>
        )}
        <button className={styles.draft} type="button" disabled={draftLoading || loading} onClick={saveDraft}>{draftLoading ? "임시저장 중…" : "임시저장"}</button>
        <button className={styles.confirm} disabled={loading}>{loading ? "일정 저장 중…" : editMode ? "변경 내용 저장하기 →" : "일정 확정하기 →"}</button>
      </section>
      {isPlaceAddOpen && (
        <div className={styles.placeAdder} role="dialog" aria-modal="true" aria-labelledby="place-adder-title">
          <div className={styles.placeAdderInner}>
            <header><button type="button" aria-label="장소 추가 닫기" onClick={() => setIsPlaceAddOpen(false)}>←</button><div><h2 id="place-adder-title">장소 추가하기</h2><p>일정에 추가할 장소와 방문 시간을 설정하세요 · {selectedTrip.city}</p></div></header>
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
            <label className={styles.placeTime}>
              <span>방문 시간</span>
              <input type="time" value={selectedPlaceTime} onChange={(event) => setSelectedPlaceTime(event.target.value)} required />
            </label>
            <section className={styles.placeResults}>
              <h3>검색 결과</h3>
              <div>
                {placeCandidates.map((place, index) => {
                  const selected = selectedCandidate?.place === place.place;
                  return <button className={selected ? styles.placeSelected : ""} type="button" key={place.place} onClick={() => setSelectedCandidate(place)}>
                    <span className={styles.resultNumber}>{index + 1}</span>
                    <span className={styles.resultImage}>{getImageUrl(place.image) && <img src={getImageUrl(place.image)} alt="" onError={useImageFallback} />}</span>
                    <span className={styles.resultCopy}><strong>{place.place}</strong><small>{categoryNames[place.category] || place.category}</small><b>자세히 보기 &gt;</b><em>{place.recommendation || `${selectedTrip.city} 추천 장소`}</em></span>
                    {selected && <span className={styles.selectedCheck}>✓</span>}
                  </button>;
                })}
                {!placeCandidates.length && <p className={styles.noPlaces}>검색 결과가 없습니다.</p>}
              </div>
            </section>
            <footer className={styles.placeAddFooter}><span>{selectedCandidate ? `${selectedPlaceTime} · 1개 장소` : "선택한 장소 0개"}</span><button type="button" disabled={!selectedCandidate || !selectedPlaceTime} onClick={addSelectedPlace}>선택한 장소 추가</button></footer>
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
                      <span className={styles.resultImage}>{getImageUrl(place.image) && <img src={getImageUrl(place.image)} alt="" onError={useImageFallback} />}</span>
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
              <strong>{getAirportCode(flightInfo.departureAirport)}<b>⟶</b>{getAirportCode(flightInfo.arrivalAirport)}</strong>
              <small>{flightInfo.departureDate} {flightInfo.departureHour}:{flightInfo.departureMinute} — {flightInfo.arrivalDate} {flightInfo.arrivalHour}:{flightInfo.arrivalMinute}<br />{flightInfo.airline} · {flightInfo.flightNumber}</small>
            </section>

            <section className={styles.flightFields}>
              <p>EDIT DETAILS · 변경 정보</p>
              <label className={styles.fieldTitle}>노선 ROUTE</label>
              <div className={styles.routeFields}>
                <label><span>출발 공항</span><input value={flightDraft.departureAirport} onChange={updateFlightDraft("departureAirport")} /><small>{getAirportCode(flightDraft.departureAirport)}</small></label>
                <b>→</b>
                <label><span>도착 공항</span><input value={flightDraft.arrivalAirport} onChange={updateFlightDraft("arrivalAirport")} /><small>{getAirportCode(flightDraft.arrivalAirport)}</small></label>
              </div>
              <div className={styles.timeZoneFields}>
                <label><span>출발지 시간대</span><select value={flightDraft.departureTimeZone} onChange={updateFlightDraft("departureTimeZone")}>{timeZoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
                <label><span>도착지 시간대</span><select value={flightDraft.arrivalTimeZone} onChange={updateFlightDraft("arrivalTimeZone")}>{timeZoneOptions.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
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
            {flightError && <p className={styles.flightValidationError} role="alert">{flightError}</p>}

            <section className={styles.flightPreview}>
              <p>CHANGE PREVIEW · 변경 미리보기</p>
              <div><span>출발　{flightInfo.departureHour}:{flightInfo.departureMinute} → <b>{flightDraft.departureHour}:{flightDraft.departureMinute}</b></span><span>도착　{flightInfo.arrivalHour}:{flightInfo.arrivalMinute} → <b>{flightDraft.arrivalHour}:{flightDraft.arrivalMinute}</b></span></div>
              <p className={styles.flightDuration}>시차 반영 예상 비행시간 <b>{formatFlightDuration(flightDurationMinutes)}</b></p>
              <strong>{canAdjustArrivalSchedule
                ? `DAY ${String(flightArrivalDayIndex + 1).padStart(2, "0")} 첫 장소가 입국·이동 90분을 반영한 ${adjustedArrivalTime}로 조정됩니다.`
                : "도착일이 여행 기간 밖이거나 자정을 넘으면 일정 시간은 자동 조정되지 않습니다."}</strong>
              <small>시차를 반영한 도착 현지 시각을 기준으로 계산합니다.</small>
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
            {selectedStop.image && <img src={selectedStop.image} alt={selectedStop.name} onError={useImageFallback} />}
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
              disabled={favoriteState.saving}
              onClick={() => toggleFavorite(selectedStop)}
            >
              {savedPlaces.some((place) => place.id === favoriteKey(selectedStop) || place.key === favoriteKey(selectedStop)) ? "찜 취소" : "장소 찜하기"}
            </button>
          </div>
          {favoriteState.error && <p className={styles.favoriteError} role="alert">{favoriteState.error}</p>}
        </div>
      )}
    </form>
  );
}
