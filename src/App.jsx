import { Link, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetailPage";
import TravelPlanner from "./pages/TravelPlanner";
import Plans from "./pages/Plans";
import Event from "./pages/Event";
import Contact from "./pages/Contact";
import MyPage from "./pages/MyPage";
import MyPageMain from "./pages/MyPageMain";
import ProfileEdit from "./pages/ProfileEdit";
import Itinerary from "./pages/Itinerary";
import Wishlist from "./pages/Wishlist";
import Mystories from "./pages/Mystories";
import Coupon from "./pages/Coupon";
import Alarm from "./pages/Alarm";
import Notice from "./pages/Notice";
import OpenGuide from "./pages/OpenGuide";
import MypageUser from "./pages/MypageUser";
import NotFound from "./pages/NotFound";
import styles from "./App.module.scss";
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const enlargedPagePaths = new Set([
  "/login",
  "/my",
  "/profile/edit",
  "/itinerary",
  "/wishlist",
  "/mystories",
  "/coupon",
  "/alarm",
  "/notice",
  "/open-guide",
  "/mypage-user",
]);

function PageSize() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("enlarged-page", enlargedPagePaths.has(pathname));
    return () => root.classList.remove("enlarged-page");
  }, [pathname]);

  return null;
}

function MyPageUserLink() {
  const { pathname } = useLocation();

  if (pathname === "/mypage-user") return null;

  return (
    <Link className={styles.mypageUserLink} to="/mypage-user" aria-label="마이페이지로 돌아가기">
      ←
    </Link>
  );
}

export default function App() {
  return (
    <div className={styles.app}>
      <ScrollTop />
      <PageSize />
      <Header />
      <MyPageUserLink />
      <div className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/travel-planner" element={<TravelPlanner />} />
          <Route path="/login" element={<MyPage />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/mystories" element={<Mystories />} />
          <Route path="/coupon" element={<Coupon />} />
          <Route path="/alarm" element={<Alarm />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/open-guide" element={<OpenGuide />} />
          <Route
            path="/mypage-user"
            element={
              <ProtectedRoute>
                <MypageUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my"
            element={
              <ProtectedRoute>
                <MyPageMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
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
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
