import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../hooks/useAuth";
import products from "../data/products.json";
import tripRoad from "../data/trip_road.json";
import { getExchangeRates } from "../services/exchangeRateApi";
import {
  deleteAdminManagementItem,
  ensureUsersDataStructures,
  getAdminDashboardData,
  getAdminManagementData,
  getFirebaseAuthUsers,
  saveAdminManagementItem,
} from "../services/firestoreService";
import styles from "./AdminDashboard.module.scss";

const detailImageModules = import.meta.glob("../assets/images/detail/*_1.png", {
  eager: true,
  import: "default",
});

const getProductImage = (index) => (
  detailImageModules[`../assets/images/detail/${index + 1}_1.png`] || ""
);

const productImages = Object.fromEntries(
  products.map((product, index) => [product.id, getProductImage(index)]),
);

const tabs = [
  ["products", "상품 관리"],
  ["packages", "패키지 여행"],
  ["notices", "공지사항"],
  ["coupons", "쿠폰 관리"],
  ["members", "회원 관리"],
];

const exchangeCurrencies = [["USD", "미국 달러"], ["JPY", "일본 엔"], ["EUR", "유로"], ["CNY", "중국 위안"]];
const formatExchangeDate = (value) => {
  const text = String(value || "");
  return text.length === 8 ? `${text.slice(4, 6)}.${text.slice(6, 8)}` : text;
};

const uniqueTrips = Array.from(
  tripRoad.trips.reduce((map, trip) => map.has(trip.id) ? map : map.set(trip.id, trip), new Map()).values(),
);

const fallbackData = {
  products: products.map((product, index) => ({
    ...product,
    image: product.image || getProductImage(index),
    stock: Number(product.stock || 0),
  })),
  packages: uniqueTrips.map((trip) => ({
    id: trip.id,
    name: trip.title,
    content: trip.days.map((day) => `${day.label}: ${day.items.filter((item) => item.type === "place").map((item) => item.place).join(" · ")}`).join("\n"),
  })),
  notices: [
    { id: "notice-1", title: "L:CODE 서비스 이용 안내", content: "서비스 이용에 필요한 주요 내용을 안내합니다." },
    { id: "notice-2", title: "시스템 정기 점검 안내", content: "안정적인 서비스 제공을 위한 점검 안내입니다." },
  ],
  coupons: [
    { id: "coupon-welcome", name: "신규 회원 쿠폰", code: "TC-0012", discount: "3,000원", active: true },
    { id: "coupon-pack-win", name: "PACK & WIN", code: "TC-0056", discount: "이벤트 쿠폰", active: false },
    { id: "coupon-flight-kit", name: "FLIGHT KIT", code: "TC-0034", discount: "5%", active: true },
  ],
  members: [],
};

const emptyItem = {
  products: { name: "새 상품", image: "", stock: 0, price: 0, category: "기타" },
  packages: { name: "새 패키지", content: "" },
  notices: { title: "새 공지사항", content: "" },
  coupons: { name: "새 쿠폰", code: "", discount: "", active: true },
  members: { nickname: "", email: "", role: "user" },
};

const mergeManagementItems = (defaults, loaded) => {
  const loadedMap = new Map((loaded || []).map((item) => [String(item.id), item]));
  const merged = defaults
    .map((item) => ({ ...item, ...(loadedMap.get(String(item.id)) || {}) }))
    .filter((item) => !item._deleted);
  const defaultIds = new Set(defaults.map((item) => String(item.id)));
  return [...merged, ...(loaded || []).filter((item) => !defaultIds.has(String(item.id)) && !item._deleted)];
};

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState({ users: 0, plans: 0, reviews: 0, admins: 0 });
  const [management, setManagement] = useState(fallbackData);
  const [activeTab, setActiveTab] = useState("products");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [exchangeRates, setExchangeRates] = useState([]);
  const [exchangeCode, setExchangeCode] = useState("USD");
  const [exchangePeriod, setExchangePeriod] = useState(30);
  const [exchangeStatus, setExchangeStatus] = useState("loading");
  const [exchangeUpdatedAt, setExchangeUpdatedAt] = useState(null);
  const [exchangeRefreshKey, setExchangeRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      getAdminDashboardData(),
      getAdminManagementData(),
      getFirebaseAuthUsers().catch((error) => {
        console.error("Authentication 회원 목록 조회 실패", error);
        return [];
      }),
    ])
      .then(([dashboardData, managementData, authUsers]) => {
        if (!active) return;
        const profileById = new Map(
          dashboardData.users.map((member) => [String(member.id), member]),
        );
        const authIds = new Set(authUsers.map((member) => String(member.id)));
        const allUsers = [
          ...authUsers.map((member) => ({
            ...member,
            ...(profileById.get(String(member.id)) || {}),
          })),
          ...dashboardData.users.filter((member) => !authIds.has(String(member.id))),
        ];

        ensureUsersDataStructures(allUsers).catch((error) => {
          console.error("사용자 기본 데이터 초기화 실패", error);
        });
        setMetrics({
          users: allUsers.length,
          plans: dashboardData.plans.length,
          reviews: dashboardData.reviews.length,
          admins: allUsers.filter((member) => member.role === "admin").length,
        });
        setManagement(Object.fromEntries(
          Object.keys(fallbackData).map((type) => {
            const defaults = type === "members" ? allUsers : fallbackData[type];
            const loadedItems = mergeManagementItems(defaults, managementData[type]);
            return [
              type,
              type === "products"
                ? loadedItems.map((item) => ({ ...item, image: item.image || productImages[item.id] || "" }))
                : loadedItems,
            ];
          }),
        ));
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setExchangeStatus("loading");
      try {
        const rates = await getExchangeRates();
        if (!active) return;
        setExchangeRates(rates);
        setExchangeUpdatedAt(new Date());
        setExchangeStatus("ready");
      } catch (error) {
        console.error("환율 정보 조회 실패", error);
        if (active) setExchangeStatus("error");
      }
    };
    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, [exchangeRefreshKey]);

  const selectedExchange = useMemo(() => exchangeRates.find((item) => item.code === exchangeCode), [exchangeCode, exchangeRates]);
  const exchangeHistory = useMemo(() => (selectedExchange?.history || []).slice(-exchangePeriod), [exchangePeriod, selectedExchange]);

  const items = management[activeTab] || [];
  const updateItem = (id, field, value) => {
    setManagement((current) => ({
      ...current,
      [activeTab]: current[activeTab].map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const addItem = () => {
    const id = `${activeTab}-${Date.now()}`;
    setManagement((current) => ({
      ...current,
      [activeTab]: [{ id, ...emptyItem[activeTab] }, ...current[activeTab]],
    }));
    setMessage("새 항목을 추가했습니다. 내용을 입력한 뒤 저장해 주세요.");
  };

  const saveItem = async (item) => {
    setBusyId(item.id);
    setMessage("");
    try {
      const saved = await saveAdminManagementItem(activeTab, item);
      setManagement((current) => ({
        ...current,
        [activeTab]: current[activeTab].map((entry) => entry.id === item.id ? saved : entry),
      }));
      setMessage("변경 내용을 저장했습니다.");
    } catch {
      setMessage("저장하지 못했습니다. Firebase 권한과 연결 상태를 확인해 주세요.");
    } finally {
      setBusyId("");
    }
  };

  const deleteItem = async (item) => {
    if (activeTab === "members" && item.id === user?.uid) {
      setMessage("현재 로그인한 관리자 계정은 대시보드에서 삭제할 수 없습니다.");
      return;
    }
    const itemLabel = item.name || item.nickname || item.title || item.code || item.email || "선택한";
    const deleteLabel = activeTab === "members" ? "회원 프로필" : "항목";
    if (!window.confirm(`「${itemLabel}」 ${deleteLabel}을 삭제할까요?`)) return;
    setBusyId(item.id);
    try {
      await deleteAdminManagementItem(activeTab, item.id);
      setManagement((current) => ({
        ...current,
        [activeTab]: current[activeTab].filter((entry) => entry.id !== item.id),
      }));
      setMessage("항목을 삭제했습니다.");
    } catch {
      setMessage("삭제하지 못했습니다. Firebase 권한을 확인해 주세요.");
    } finally {
      setBusyId("");
    }
  };

  const adjustStock = (item, amount) => {
    const stock = Math.max(0, Number(item.stock || 0) + amount);
    const changed = { ...item, stock };
    updateItem(item.id, "stock", stock);
    saveAdminManagementItem("products", changed).catch(() => {
      setMessage("재고를 저장하지 못했습니다.");
    });
  };

  return (
    <main className={styles.dashboard}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>L:CODE · ADMIN</p>
        <h1>운영 대시보드</h1>
        <p>{profile?.nickname || "관리자"}님, 서비스 콘텐츠를 관리하세요.</p>
      </header>

      {status === "error" && <p className={styles.error} role="alert">일부 Firebase 데이터를 불러오지 못해 기본 데이터를 표시합니다.</p>}

      <section className={styles.metrics} aria-label="서비스 현황">
        <article><span>전체 회원</span><strong>{status === "loading" ? "—" : management.members.length}</strong><small>명</small></article>
        <article><span>저장된 여행</span><strong>{status === "loading" ? "—" : metrics.plans}</strong><small>개</small></article>
        <article><span>작성된 리뷰</span><strong>{status === "loading" ? "—" : metrics.reviews}</strong><small>개</small></article>
        <article><span>관리자</span><strong>{status === "loading" ? "—" : management.members.filter((member) => member.role === "admin").length}</strong><small>명</small></article>
      </section>

      <section className={styles.exchangePanel} aria-label="실시간 환율 추이">
        <div className={styles.exchangeHeader}>
          <div><p>LIVE EXCHANGE</p><h2>환율 추이</h2></div>
          <div className={styles.exchangeControls}>
            <div>{exchangeCurrencies.map(([code]) => <button className={exchangeCode === code ? styles.activeExchange : ""} type="button" key={code} onClick={() => setExchangeCode(code)}>{code}</button>)}</div>
            <select aria-label="조회 기간" value={exchangePeriod} onChange={(event) => setExchangePeriod(Number(event.target.value))}><option value={7}>최근 7일</option><option value={30}>최근 30일</option></select>
            <button type="button" onClick={() => setExchangeRefreshKey((key) => key + 1)}>새로고침</button>
          </div>
        </div>
        {exchangeStatus === "ready" && selectedExchange ? <>
          <div className={styles.exchangeSummary}>
            <div><span>{exchangeCurrencies.find(([code]) => code === exchangeCode)?.[1]}</span><strong>{selectedExchange.rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원</strong><small>{selectedExchange.baseUnit === 100 ? "100 단위 기준" : "1 단위 기준"}</small></div>
            <div><span>전일 대비</span><strong className={selectedExchange.change?.startsWith("-") ? styles.exchangeDown : styles.exchangeUp}>{selectedExchange.change}</strong><small>{exchangeUpdatedAt?.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 갱신</small></div>
          </div>
          <div className={styles.exchangeChart}><ResponsiveContainer width="100%" height="100%"><LineChart data={exchangeHistory} margin={{ top: 12, right: 14, bottom: 0, left: 0 }}><CartesianGrid stroke="#e8ecef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tickFormatter={formatExchangeDate} tickLine={false} axisLine={false} /><YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} width={62} /><Tooltip labelFormatter={formatExchangeDate} formatter={(value) => [`${Number(value).toLocaleString("ko-KR")}원`, exchangeCode]} /><Line type="monotone" dataKey="rate" stroke="#182d24" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div>
        </> : <div className={styles.exchangeEmpty} role={exchangeStatus === "error" ? "alert" : "status"}><strong>{exchangeStatus === "error" ? "환율 정보를 불러오지 못했습니다." : "환율 정보를 불러오는 중입니다."}</strong><span>{exchangeStatus === "error" ? "ECOS API 연결 상태를 확인해 주세요." : "잠시만 기다려 주세요."}</span></div>}
      </section>

      <section className={styles.manager} aria-label="콘텐츠 관리">
        <nav className={styles.tabs} aria-label="관리 항목 선택">
          {tabs.map(([value, label]) => (
            <button className={activeTab === value ? styles.activeTab : ""} type="button" onClick={() => { setActiveTab(value); setMessage(""); }} key={value}>{label}</button>
          ))}
        </nav>

        <div className={styles.managerHead}>
          <div><h2>{tabs.find(([value]) => value === activeTab)?.[1]}</h2><span>총 {items.length}개</span></div>
          {activeTab !== "members" && <button type="button" onClick={addItem}>+ 항목 추가</button>}
        </div>
        {message && <p className={styles.message} role="status">{message}</p>}

        <div className={styles.itemList}>
          {items.map((item) => (
            <article className={`${styles.manageCard} ${activeTab !== "products" ? styles.wideCard : ""}`} key={item.id}>
              {activeTab === "products" && (
                <>
                  <div className={styles.preview}>{item.image ? <img src={item.image} alt="" /> : <span>NO IMAGE</span>}</div>
                  <div className={styles.fields}>
                    <label>상품 이름<input value={item.name || ""} onChange={(event) => updateItem(item.id, "name", event.target.value)} /></label>
                    <label>상품 이미지 URL<input value={item.image || ""} onChange={(event) => updateItem(item.id, "image", event.target.value)} /></label>
                    <div className={styles.fieldRow}>
                      <label>가격<input type="number" min="0" value={item.price || 0} onChange={(event) => updateItem(item.id, "price", Number(event.target.value))} /></label>
                      <label>카테고리<input value={item.category || ""} onChange={(event) => updateItem(item.id, "category", event.target.value)} /></label>
                    </div>
                  </div>
                  <div className={styles.stock}>
                    <span>재고</span>
                    <div><button type="button" onClick={() => adjustStock(item, -1)}>−</button><strong>{Number(item.stock || 0)}</strong><button type="button" onClick={() => adjustStock(item, 1)}>+</button></div>
                    <em className={Number(item.stock || 0) === 0 ? styles.soldOut : Number(item.stock || 0) <= 5 ? styles.lowStock : styles.inStock}>
                      {Number(item.stock || 0) === 0 ? "품절" : Number(item.stock || 0) <= 5 ? "재고 부족" : "판매 가능"}
                    </em>
                  </div>
                </>
              )}

              {activeTab === "packages" && <div className={styles.fields}><label>패키지 이름<input value={item.name || ""} onChange={(event) => updateItem(item.id, "name", event.target.value)} /></label><label>패키지 내용<textarea rows="4" value={item.content || ""} onChange={(event) => updateItem(item.id, "content", event.target.value)} /></label></div>}
              {activeTab === "notices" && <div className={styles.fields}><label>공지 제목<input value={item.title || ""} onChange={(event) => updateItem(item.id, "title", event.target.value)} /></label><label>공지 내용<textarea rows="4" value={item.content || ""} onChange={(event) => updateItem(item.id, "content", event.target.value)} /></label></div>}
              {activeTab === "coupons" && <div className={styles.fields}><label>쿠폰 이름<input value={item.name || ""} onChange={(event) => updateItem(item.id, "name", event.target.value)} /></label><div className={styles.fieldRow}><label>쿠폰 코드<input value={item.code || ""} onChange={(event) => updateItem(item.id, "code", event.target.value.toUpperCase())} /></label><label>할인 내용<input value={item.discount || ""} onChange={(event) => updateItem(item.id, "discount", event.target.value)} /></label></div><label className={styles.checkField}><input type="checkbox" checked={item.active !== false} onChange={(event) => updateItem(item.id, "active", event.target.checked)} /> 사용 가능</label></div>}
              {activeTab === "members" && <div className={styles.fields}><div className={styles.fieldRow}><label>회원 이름<input value={item.nickname || ""} onChange={(event) => updateItem(item.id, "nickname", event.target.value)} /></label><label>이메일<input type="email" value={item.email || ""} onChange={(event) => updateItem(item.id, "email", event.target.value)} /></label></div><label>회원 권한<select value={item.role || "user"} onChange={(event) => updateItem(item.id, "role", event.target.value)}><option value="user">일반 회원</option><option value="admin">관리자</option></select></label></div>}

              <footer className={styles.actions}><button type="button" disabled={busyId === item.id} onClick={() => saveItem(item)}>저장</button><button type="button" disabled={busyId === item.id || (activeTab === "members" && item.id === user?.uid)} onClick={() => deleteItem(item)}>{activeTab === "members" ? "프로필 삭제" : "삭제"}</button></footer>
            </article>
          ))}
          {!items.length && <p className={styles.empty}>등록된 항목이 없습니다.</p>}
        </div>
      </section>
    </main>
  );
}
