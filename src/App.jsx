import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetailPage";
import Plan from "./pages/Plan";
import TravelPlanner from "./pages/TravelPlanner";
import Plans from "./pages/Plans";
import Event from "./pages/Event";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import MypageUser from "./pages/MypageUser";
import ProfileEdit from "./pages/ProfileEdit";
import Itinerary from "./pages/Itinerary";
import Wishlist from "./pages/Wishlist";
import Mystories from "./pages/Mystories";
import Coupon from "./pages/Coupon";
import Alarm from "./pages/Alarm";
import Notice from "./pages/Notice";
import OpenGuide from "./pages/OpenGuide";
import NotFound from "./pages/NotFound";
import Saved from "./pages/Saved";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderComplete from "./pages/OrderComplete";
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
  "/mypage-user",
  "/profile/edit",
  "/itinerary",
  "/wishlist",
  "/mystories",
  "/coupon",
  "/alarm",
  "/open-guide",
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

export default function App() {
  return (
    <div className={styles.app}>
      <ScrollTop />
      <PageSize />
      <Header />
      <div className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/search" element={<Plan />} />
          <Route path="/shop" element={<Products />} />
          <Route path="/shop/:productId" element={<ProductDetailPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/travel-planner" element={<TravelPlanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/mystories" element={<Mystories />} />
          <Route path="/coupon" element={<Coupon />} />
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
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
