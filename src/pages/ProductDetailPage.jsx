import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import products from "../data/products.json";
import { useShop } from "../hooks/useShop";

import styles from "./Shop.module.scss";

export default function ProductDetailPage() {
  const { productId } = useParams();

  const product = products.find(
    (item) => item.id === productId
  );

  const { addToCart } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className={styles.empty}>
        <h1>상품을 찾을 수 없어요.</h1>

        <Link to="/shop">
          SHOP으로 돌아가기 →
        </Link>
      </main>
    );
  }

  const total = product.price * quantity;

  return (
    <main className={styles.detailPage}>
      {/* =====================================
          PRODUCT MAIN
      ===================================== */}

      <section className={styles.detailSpread}>
        <div className={styles.detailVisual}>
          <span>{product.category}</span>

          <b>
            {product.name.slice(0, 1)}
          </b>
        </div>

        <section className={styles.detailInfo}>
          <small>
            {product.category} · TRAVEL ESSENTIALS
          </small>

          <h1>{product.name}</h1>

          <strong>
            {product.price.toLocaleString()}{" "}
            <em>KRW</em>
          </strong>

          <p>
            {product.desc}
            <br />
            {product.merit}
          </p>

          <hr />

          <label>OPTION</label>

          <div className={styles.options}>
            <button className={styles.selected}>
              기본 / Standard
            </button>

            <button>
              선물 포장 / Gift Wrap
            </button>
          </div>

          <label>QUANTITY</label>

          <div className={styles.quantity}>
            <button
              onClick={() =>
                setQuantity(
                  Math.max(1, quantity - 1)
                )
              }
            >
              -
            </button>

            <b>{quantity}</b>

            <button
              onClick={() =>
                setQuantity(quantity + 1)
              }
            >
              +
            </button>
          </div>

          <hr />

          <label>TOTAL</label>

          <strong>
            {total.toLocaleString()}{" "}
            <em>KRW</em>
          </strong>

          <div className={styles.detailActions}>
            <button
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
              }}
            >
              장바구니 담기
            </button>

            <Link
              to="/checkout"
              onClick={() =>
                addToCart(product, quantity)
              }
            >
              바로 구매
            </Link>
          </div>
        </section>
      </section>

      {/* =====================================
          PRODUCT INFORMATION
          각각 독립적으로 열고 닫힘
      ===================================== */}

      <section className={styles.productAccordion}>
  <details open>
    <summary>
      <span>
        <b>01</b>
        PRODUCT STORY
      </span>

      <i />
    </summary>

    <div className={styles.accordionContent}>
      <p>{product.desc}</p>
    </div>
  </details>

  <details open>
    <summary>
      <span>
        <b>02</b>
        DETAIL
      </span>

      <i />
    </summary>

    <div className={styles.accordionContent}>
      <p>{product.merit}</p>
    </div>
  </details>

  <details open>
    <summary>
      <span>
        <b>03</b>
        DELIVERY
      </span>

      <i />
    </summary>

    <div className={styles.accordionContent}>
      <p>
        결제 완료 후 평균 2-3일 이내 출고됩니다.
        <br />
        지역 및 배송 상황에 따라 배송 일정이 달라질 수 있습니다.
      </p>
    </div>
  </details>
</section>

      {/* =====================================
          LONG DETAIL BANNERS

          나중에 긴 상세 이미지 넣는 영역.
          이미지 파일이 생기면 placeholder 대신
          img 태그로 교체하면 됨.
      ===================================== */}

      <section className={styles.detailContents}>
        <div className={styles.detailContentsHeader}>
          <small>PRODUCT DETAIL</small>
        </div>

        {/* 상세배너 1 */}
        <div className={styles.detailBannerSlot}>
          {/*
          <img
            src={detailBanner01}
            alt={`${product.name} 상세 이미지 1`}
          />
          */}

          <span>
            DETAIL BANNER 01
          </span>
        </div>

        {/* 상세배너 2 */}
        <div className={styles.detailBannerSlot}>
          {/*
          <img
            src={detailBanner02}
            alt={`${product.name} 상세 이미지 2`}
          />
          */}

          <span>
            DETAIL BANNER 02
          </span>
        </div>

        {/* 상세배너 3 */}
        <div className={styles.detailBannerSlot}>
          {/*
          <img
            src={detailBanner03}
            alt={`${product.name} 상세 이미지 3`}
          />
          */}

          <span>
            DETAIL BANNER 03
          </span>
        </div>
      </section>

      {/* =====================================
          ADDED MODAL
      ===================================== */}

      {added && (
        <div className={styles.modalBackdrop}>
          <div className={styles.addedModal}>
            <button
              className={styles.close}
              onClick={() =>
                setAdded(false)
              }
            >
              ×
            </button>

            <h2>
              ✓ 장바구니에 상품을
              담았습니다.
            </h2>

            <p>
              {product.name} · 기본 세트 ·{" "}
              {quantity}개
            </p>

            <hr />

            <b>
              함께 준비하면 좋은 상품
            </b>

            <div className={styles.miniProducts}>
              {products
                .filter(
                  (item) =>
                    item.id !== product.id
                )
                .slice(0, 3)
                .map((item) => (
                  <div key={item.id}>
                    <div
                      className={
                        styles.miniVisual
                      }
                    />

                    <small>
                      {item.category}
                    </small>

                    <span>
                      {item.name}
                    </span>
                  </div>
                ))}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() =>
                  setAdded(false)
                }
              >
                계속 쇼핑
              </button>

              <Link to="/cart">
                장바구니 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}