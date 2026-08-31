import {
  Link,
} from "react-router-dom";

import styles from "../pages/Shop.module.scss";
import { useShop } from "../hooks/useShop";


const STANDARD_OPTION = {
  id: "standard",
  label: "기본 / Standard",
  extraPrice: 0,
};


export default function ProductCard({
  product,
  onQuickAdd,
}) {
  const {
    saved,
    toggleSaved,
    addToCart,
  } = useShop();


  const liked =
    saved.includes(
      product.id
    );


  const handleAdd =
    () => {
      /*
        SHOP 메인의 + 버튼은
        기본 옵션으로 담기
      */
      addToCart(
        product,
        1,
        STANDARD_OPTION
      );


      /*
        아래 QUICK CART 애니메이션 실행
      */
      if (onQuickAdd) {
        onQuickAdd(
          product
        );
      }
    };


  return (
    <article
      className={
        styles.productCard
      }
    >
      <div
        className={`${styles.productVisual} ${styles[product.tone]}`}
      >
        {/* HEART */}

        <button
          type="button"
          className={`${styles.heart} ${
            liked
              ? styles.liked
              : ""
          }`}
          onClick={() =>
            toggleSaved(
              product.id
            )
          }
          aria-label={
            liked
              ? "찜 해제"
              : "찜하기"
          }
        >
          {liked
            ? "♥"
            : "♡"}
        </button>


        {/* PRODUCT */}

        <Link
          to={`/shop/${product.id}`}
          aria-label={`${product.name} 상세 보기`}
        >
          <span
            className={
              styles.cardCategory
            }
          >
            {
              product.category
            }
          </span>

          <b>
            {product.name.slice(
              0,
              1
            )}
          </b>
        </Link>


        {/* ADD CART */}

        <button
          type="button"
          className={
            styles.cardCart
          }
          onClick={
            handleAdd
          }
          aria-label={`${product.name} 장바구니 담기`}
        >
          +
        </button>
      </div>


      <div
        className={
          styles.productMeta
        }
      >
        <small>
          {product.category}
        </small>


        <Link
          to={`/shop/${product.id}`}
        >
          <h3>
            {product.name}
          </h3>
        </Link>


        <p>
          {product.price.toLocaleString()}{" "}
          KRW
        </p>
      </div>
    </article>
  );
}