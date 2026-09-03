import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetailPage";
import Plan from "./pages/Plan";
import TravelPlanner from "./pages/TravelPlanner";
import Plans from "./pages/Plans";
import Event from "./pages/Event";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Search from "./pages/Search";
import MypageUser from "./pages/MypageUser";
import ProfileEdit from "./pages/ProfileEdit";
import Itinerary from "./pages/Itinerary";
import Wishlist from "./pages/Wishlist";
import Mystories from "./pages/Mystories";
import Coupon from "./pages/Coupon";
import CouponUp from "./pages/CouponUp";
import Alarm from "./pages/Alarm";
import Notice from "./pages/Notice";
import OpenGuide from "./pages/OpenGuide";
import Review from "./pages/Review";
import Buy from "./pages/Buy";
import Paking from "./pages/Paking";
import NotFound from "./pages/NotFound";
import Saved from "./pages/Saved";
import SavedPlan from "./pages/SavedPlan";
import JournalDetail from "./pages/JournalDetail";
import Destinations from "./pages/Destinations";
import FavoritePlaces from "./pages/FavoritePlaces";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderComplete from "./pages/OrderComplete";
import MyPageMain from "./pages/MyPageMain";
import ExchangeRate from "./pages/ExchangeRate";
import Balance from "./pages/Balance";
import AIRemix from "./pages/AIRemix/AIRemix";
import DesrinationAll from "./pages/DesrinationAll";
import styles from "./App.module.scss";
function ScrollTop() {
  const { pathname, state } = useLocation();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const savedScrollY = Number(state?.restoreScrollY);
    const scrollY = Number.isFinite(savedScrollY) ? savedScrollY : 0;

    root.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollY);
    root.style.scrollBehavior = previousScrollBehavior;
  }, [pathname, state]);
  return null;
}

const enlargedPagePaths = new Set([
  "/login",
  "/profile/edit",
  "/itinerary",
  "/buy",
  "/wishlist",
  "/mystories",
  "/review",
  "/coupon",
  "/coupon/register",
  "/alarm",
  "/notice",
  "/open-guide",
  "/paking",
]);

const immersivePagePaths = new Set([]);

function PageSize() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("enlarged-page", enlargedPagePaths.has(pathname));
    return () => root.classList.remove("enlarged-page");
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isImmersivePage = immersivePagePaths.has(pathname);
  const isBalancePage = pathname === "/balance";

  return (
    <div className={`${styles.app} ${isBalancePage ? styles.balanceApp : ""}`}>
      <ScrollTop />
      <PageSize />
      {!isImmersivePage && <Header />}
      <div className={`${styles.main} ${isImmersivePage ? styles.immersiveMain : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/search" element={<Search />} />
          <Route path="/destination" element={<ExchangeRate />} />
          <Route path="/desrination" element={<DesrinationAll />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/desrinationAll" element={<DesrinationAll />} />
          <Route path="/shop" element={<Products />} />
          <Route path="/shop/:productId" element={<ProductDetailPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/plan/saved" element={<ProtectedRoute><SavedPlan /></ProtectedRoute>} />
          <Route path="/journal/tokyo" element={<JournalDetail />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/favorite-places" element={<ProtectedRoute><FavoritePlaces /></ProtectedRoute>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/travel-planner" element={<TravelPlanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/paking" element={<Paking />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/mystories" element={<Mystories />} />
          <Route path="/mypagemain" element={<MyPageMain />} />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            }
          />
          <Route path="/coupon" element={<ProtectedRoute><Coupon /></ProtectedRoute>} />
          <Route path="/coupon/register" element={<ProtectedRoute><CouponUp /></ProtectedRoute>} />
          <Route path="/alarm" element={<Alarm />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/open-guide" element={<OpenGuide />} />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my"
            element={
              <ProtectedRoute>
                <MypageUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage-user"
            element={
              <ProtectedRoute>
                <MypageUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            }
          />
          <Route path="/event" element={<Event />} />
          <Route path="/ai-remix" element={<AIRemix />} />
          <Route path="/remix" element={<AIRemix />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isImmersivePage && <Footer />}
      <BottomNav />
    </div>
  );
}
