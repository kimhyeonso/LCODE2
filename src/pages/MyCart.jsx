import Cart from "./Cart";

// My page entry point for the basket. The cart state and UI are intentionally
// shared with /cart so both paths always show the same items.
export default function MyCart() {
  return <Cart />;
}
