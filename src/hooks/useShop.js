import { useContext } from "react";
import { ShopContext } from "../context/shop-context";

export const useShop = () => useContext(ShopContext);
