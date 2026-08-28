import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import products from "../data/products.json";
import { useShop } from "../hooks/useShop";

import productMain01 from "../assets/images/detail/1_1.png";
import productSub01 from "../assets/images/detail/1_2.png";
import productDetail01 from "../assets/images/detail/1.png";

import styles from "./Shop.module.scss";

const productImageMap = {
  P001: {
    gallery: [productMain01, productSub01],
    detail: [productDetail01],
  },
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);
  const { addToCart } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const imageSet = productImageMap[productId] || { gallery: [], detail: [] };
  const galleryImages = imageSet.gallery;
  const detailImages = imageSet.detail;

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
  }, [productId]);

  if (!product) {
    return (
      <main className={styles.empty}>
        <h1>상품을 찾을 수 없어요.</h1>
        <Link to="/shop">SHOP으로 돌아가기 →</Link>
      </main>
    );
  }

  const total = product.price * quantity;
  const hasGallery = galleryImages.length > 0;
  const currentImage = hasGallery ? galleryImages[activeImage] : null;

  const goPrevious = () => {
    if (!hasGallery) return;
    setActiveImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (!hasGallery) return;
    setActiveImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <main className={styles.detailPage}>
      <section className={styles.detailSpread}>
        <div className={styles.productGallery}>
          <div className={styles.detailVisual}>
            {hasGallery ? (
              <>
                <img
                  key={currentImage}
                  className={styles.galleryMainImage}
                  src={currentImage}
                  alt={`${product.name} 상품 이미지 ${activeImage + 1}`}
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.galleryArrow} ${styles.galleryPrev}`}
                      onClick={goPrevious}
                      aria-label="이전 상품 이미지"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      className={`${styles.galleryArrow} ${styles.galleryNext}`}
                      onClick={goNext}
                      aria-label="다음 상품 이미지"
                    >
                      →
                    </button>

                    <div className={styles.galleryPagination}>
                      {galleryImages.map((_, index) => (
                        <button
                          type="button"
                          key={index}
                          className={
                            index === activeImage ? styles.galleryDotActive : ""
                          }
                          onClick={() => setActiveImage(index)}
                          aria-label={`${index + 1}번 상품 이미지 보기`}
                        />
                      ))}
                    </div>

                    <div className={styles.galleryCount}>
                      {String(activeImage + 1).padStart(2, "0")}
                      <span> / </span>
                      {String(galleryImages.length).padStart(2, "0")}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <span>{product.category}</span>
                <b>{product.name.slice(0, 1)}</b>
              </>
            )}
          </div>
        </div>

        <section className={styles.detailInfo}>
          <small>{product.category} · TRAVEL ESSENTIALS</small>
          <h1>{product.name}</h1>

          <strong>
            {product.price.toLocaleString()} <em>KRW</em>
          </strong>

          <p>
            {product.desc}
            <br />
            {product.merit}
          </p>

          <hr />

          <label>OPTION</label>
          <div className={styles.options}>
            <button type="button" className={styles.selected}>
              기본 / Standard
            </button>
            <button type="button">선물 포장 / Gift Wrap</button>
          </div>

          <label>QUANTITY</label>
          <div className={styles.quantity}>
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <b>{quantity}</b>
            <button type="button" onClick={() => setQuantity((prev) => prev + 1)}>
              +
            </button>
          </div>

          <hr />

          <label>TOTAL</label>
          <strong>
            {total.toLocaleString()} <em>KRW</em>
          </strong>

          <div className={styles.detailActions}>
            <button
              type="button"
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
              }}
            >
              장바구니 담기
            </button>

            <Link to="/checkout" onClick={() => addToCart(product, quantity)}>
              바로 구매
            </Link>
          </div>
        </section>
      </section>

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

      {detailImages.length > 0 && (
        <section className={styles.detailContents}>
          <div className={styles.detailContentsHeader}>
            <small>PRODUCT DETAIL</small>
          </div>

          <div className={styles.detailBannerList}>
            {detailImages.map((image, index) => (
              <div
                className={styles.detailBannerSlot}
                key={`${product.id}-detail-${index}`}
              >
                <img
                  src={image}
                  alt={`${product.name} 상세 이미지 ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {added && (
        <div className={styles.modalBackdrop}>
          <div className={styles.addedModal}>
            <button
              type="button"
              className={styles.close}
              onClick={() => setAdded(false)}
            >
              ×
            </button>

            <h2>✓ 장바구니에 상품을 담았습니다.</h2>
            <p>
              {product.name} · 기본 세트 · {quantity}개
            </p>

            <hr />
            <b>함께 준비하면 좋은 상품</b>

            <div className={styles.miniProducts}>
              {products
                .filter((item) => item.id !== product.id)
                .slice(0, 3)
                .map((item) => (
                  <div key={item.id}>
                    <div className={styles.miniVisual} />
                    <small>{item.category}</small>
                    <span>{item.name}</span>
                  </div>
                ))}
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={() => setAdded(false)}>
                계속 쇼핑
              </button>
              <Link to="/cart">장바구니 보기 →</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
