import {
  Link,
} from "react-router-dom";

import styles from "../pages/Shop.module.scss";
import { useShop } from "../hooks/useShop";
import { resolveImageUrl } from "../utils/imageUtils";


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

  const imageNumber = Number(String(product.id).replace(/\D/g, ""));
  const thumbnail = resolveImageUrl(product.image, "")
    || (imageNumber ? resolveImageUrl(`detail/${imageNumber}_1.png`, "") : "");


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
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 20.7 10.55 19.38C5.4 14.7 2 11.62 2 7.85 2 4.77 4.42 2.35 7.5 2.35c1.74 0 3.41.81 4.5 2.09a6.03 6.03 0 0 1 4.5-2.09c3.08 0 5.5 2.42 5.5 5.5 0 3.77-3.4 6.85-8.55 11.54Z" />
          </svg>
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

          {thumbnail ? (
            <img
              className={styles.productThumb}
              src={thumbnail}
              alt={product.name}
            />
          ) : (
            <b>
              {product.name.slice(
                0,
                1
              )}
            </b>
          )}
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
