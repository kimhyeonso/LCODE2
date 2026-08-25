import { useEffect, useState } from "react";
import { ShopContext } from "./shop-context";

const initial = { cart: [], saved: [] };

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lcode-shop")) || initial; }
    catch { return initial; }
  });
  useEffect(() => localStorage.setItem("lcode-shop", JSON.stringify(shop)), [shop]);
  const toggleSaved = (id) => setShop((state) => ({ ...state, saved: state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id] }));
  const addToCart = (product, quantity = 1) => setShop((state) => {
    const exists = state.cart.find((item) => item.id === product.id);
    return { ...state, cart: exists ? state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...state.cart, { ...product, quantity }] };
  });
  const updateQuantity = (id, quantity) => setShop((state) => ({ ...state, cart: quantity < 1 ? state.cart.filter((item) => item.id !== id) : state.cart.map((item) => item.id === id ? { ...item, quantity } : item) }));
  const removeFromCart = (id) => updateQuantity(id, 0);
  return <ShopContext.Provider value={{ ...shop, toggleSaved, addToCart, updateQuantity, removeFromCart }}>{children}</ShopContext.Provider>;
}
