import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import products from "../data/products.json";
import { useManagedCollection } from "../hooks/useManagedCollection";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";

/* =========================================================
   DETAIL IMAGE AUTO LOADER

   products.json 배열 순서 기준

   1번째 상품 → 1_1.png
   2번째 상품 → 2_1.png
   ...
   38번째 상품 → 38_1.png
========================================================= */

const detailImageModules = import.meta.glob(
  "../assets/images/detail/*.png",
  {
    eager: true,
    import: "default",
  }
);

const getDetailImage = (
  number,
  suffix = ""
) => {
  const path = `../assets/images/detail/${number}${suffix}.png`;

  return detailImageModules[path] || "";
};

const STANDARD_OPTION = {
  id: "standard",
  label: "기본 / Standard",
  extraPrice: 0,
};

/* =========================================================
   PRODUCTS
========================================================= */

export default function Products() {
  const managedProducts = useManagedCollection("products", products);
  const [
    category,
    setCategory,
  ] = useState("ALL");

  const [
    query,
    setQuery,
  ] = useState("");

  const {
    cart,
    saved,
    toggleSaved,
    addToCart,
  } = useShop();

  /* =========================================================
     PRODUCTS + THUMBNAIL

     ★ JSON 실제 배열 순서가 곧 이미지 번호

     예)
     products[0] → 1_1.png
     products[1] → 2_1.png
     ...
  ========================================================= */

  const displayProducts = useMemo(
    () =>
      managedProducts.map(
        (product, index) => {
          const imageNumber =
            index + 1;

          return {
            ...product,

            imageNumber,

            thumbnail:
              product.image ||
              getDetailImage(
                imageNumber,
                "_1"
              ) ||
              "",
          };
        }
      ),
    [managedProducts]
  );

  /* =========================================================
     QUICK CART
  ========================================================= */

  const [
    quickProduct,
    setQuickProduct,
  ] = useState(null);

  const [
    quickClosing,
    setQuickClosing,
  ] = useState(false);

  const [
    quickKey,
    setQuickKey,
  ] = useState(0);

  const hideTimerRef =
    useRef(null);

  const removeTimerRef =
    useRef(null);

  const clearQuickTimers = () => {
    if (
      hideTimerRef.current
    ) {
      window.clearTimeout(
        hideTimerRef.current
      );
    }

    if (
      removeTimerRef.current
    ) {
      window.clearTimeout(
        removeTimerRef.current
      );
    }
  };

  const handleQuickAdd = (
    product
  ) => {
    if (Number(product.stock) === 0) {
      window.alert("품절된 상품입니다.");
      return;
    }

    clearQuickTimers();

    addToCart(
      product,
      1,
      STANDARD_OPTION
    );

    setQuickProduct(
      product
    );

    setQuickClosing(
      false
    );

    setQuickKey(
      (prev) =>
        prev + 1
    );

    hideTimerRef.current =
      window.setTimeout(
        () => {
          setQuickClosing(
            true
          );
        },
        4300
      );

    removeTimerRef.current =
      window.setTimeout(
        () => {
          setQuickProduct(
            null
          );

          setQuickClosing(
            false
          );
        },
        5000
      );
  };

  useEffect(() => {
    return () => {
      clearQuickTimers();
    };
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const categories =
    useMemo(
      () => [
        "ALL",

        ...new Set(
          displayProducts.map(
            (product) =>
              product.category
          )
        ),
      ],
      [displayProducts]
    );

  const filtered =
    useMemo(
      () =>
        displayProducts.filter(
          (product) =>
            (
              category ===
                "ALL" ||
              product.category ===
                category
            ) &&
            product.name.includes(
              query
            )
        ),
      [
        category,
        query,
        displayProducts,
      ]
    );

  /* =========================================================
     CART COUNT
  ========================================================= */

  const cartCount =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity ||
            0
        ),
      0
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className={
        styles.shopPage
      }
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <header
        className={
          styles.shopHero
        }
      >
        <div
          className={
            styles.heroOverlay
          }
        />

        <div
          className={
            styles.heroTop
          }
        >
          <span
            className={
              styles.heroLocation
            }
          >
            TAIWAN · JIUFEN
          </span>

          <aside
            className={
              styles.heroMenu
            }
          >
            <Link to="/saved">
              ♡ SAVED
            </Link>

            <Link to="/cart">
              CART
              <b>
                {cartCount}
              </b>
            </Link>
          </aside>
        </div>

        <div
          className={
            styles.heroContent
          }
        >
          <span
            className={
              styles.heroEyebrow
            }
          >
            <p>
              여행을 더 가볍게 만드는
            </p>
          </span>

          <h1>
            FLIGHT KIT
          </h1>

          <div
            className={
              styles.heroBottom
            }
          >
            

            <a
              href="#items"
              className={
                styles.heroButton
              }
            >
              VIEW ALL
              <span>
                ↘
              </span>
            </a>
          </div>
        </div>

        <span
          className={
            styles.heroNumber
          }
        >
           
        </span>
      </header>

      {/* =====================================================
          CATALOG
      ===================================================== */}

      <section
        id="items"
        className={
          styles.catalog
        }
      >
        <div
          className={
            styles.categoryBar
          }
        >
          {categories.map(
            (item) => (
              <button
                type="button"
                key={item}
                className={
                  category ===
                  item
                    ? styles.selected
                    : ""
                }
                onClick={() =>
                  setCategory(
                    item
                  )
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <div
          className={
            styles.sectionLabel
          }
        >
          <span>
            ESSENTIALS
          </span>

          <span>
            {filtered.length} ITEMS
          </span>
        </div>

        <label
          className={
            styles.search
          }
        >
          <span>
            ⌕
          </span>

          <input
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target
                  .value
              )
            }
            placeholder="상품명을 검색해보세요"
          />

          <small>
            SEARCH
          </small>
        </label>

        <div
          className={
            styles.productGrid
          }
        >
          {filtered.map(
            (
              product
            ) => {
              const liked =
                saved.includes(
                  product.id
                );
              const hasStock = product.stock != null && Number.isFinite(Number(product.stock));
              const stock = hasStock ? Number(product.stock) : null;
              const soldOut = stock === 0;
              const lowStock = stock !== null && stock > 0 && stock <= 5;

              return (
                <article
                  className={
                    styles.productCard
                  }
                  key={
                    product.id
                  }
                >
                  <div
                    className={[
                      styles.productVisual,
                      styles[
                        product.tone
                      ] || "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className={[
                        styles.heart,
                        liked
                          ? styles.liked
                          : "",
                      ].join(
                        " "
                      )}
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

                    <Link
                      to={
                        "/shop/" +
                        product.id
                      }
                      aria-label={
                        product.name +
                        " 상세 보기"
                      }
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

                      {product.thumbnail ? (
                        <img
                          className={
                            styles.productThumb
                          }
                          src={
                            product.thumbnail
                          }
                          alt={
                            product.name
                          }
                          loading="lazy"
                          onError={(event) => {
                            const fallback = getDetailImage(product.imageNumber, "_1");
                            if (fallback && event.currentTarget.dataset.fallbackApplied !== "true") {
                              event.currentTarget.dataset.fallbackApplied = "true";
                              event.currentTarget.src = fallback;
                            }
                          }}
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

                    <button
                      type="button"
                      className={
                        styles.cardCart
                      }
                      disabled={soldOut}
                      onClick={() =>
                        handleQuickAdd(
                          product
                        )
                      }
                      aria-label={
                        product.name +
                        " 장바구니 담기"
                      }
                    >
                      {soldOut ? "×" : "+"}
                    </button>
                  </div>

                  <div
                    className={
                      styles.productMeta
                    }
                  >
                    <small>
                      {
                        product.category
                      }
                    </small>

                    <Link
                      to={
                        "/shop/" +
                        product.id
                      }
                    >
                      <h3>
                        {
                          product.name
                        }
                      </h3>
                    </Link>

                    <p>
                      {product.price.toLocaleString()}{" "}
                      KRW
                    </p>

                    {(soldOut || lowStock) && (
                      <span className={soldOut ? styles.soldOut : styles.lowStock}>
                        {soldOut ? "품절" : `재고 부족 · ${stock}개 남음`}
                      </span>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </div>

        {!filtered.length && (
          <p
            className={
              styles.empty
            }
          >
            검색 결과가 없습니다.
          </p>
        )}
      </section>

      {/* =====================================================
          QUICK CART
      ===================================================== */}

      {quickProduct && (
        <aside
          key={
            quickKey
          }
          className={[
            styles.quickCart,
            quickClosing
              ? styles.quickCartClosing
              : "",
          ].join(" ")}
        >
          <small>
            ADDED TO CART
          </small>

          <div>
            <span
              className={
                styles.quickVisual
              }
            >
              {quickProduct.thumbnail ? (
                <img
                  src={
                    quickProduct.thumbnail
                  }
                  alt={
                    quickProduct.name
                  }
                  onError={(event) => {
                    const fallback = getDetailImage(quickProduct.imageNumber, "_1");
                    if (fallback && event.currentTarget.dataset.fallbackApplied !== "true") {
                      event.currentTarget.dataset.fallbackApplied = "true";
                      event.currentTarget.src = fallback;
                    }
                  }}
                />
              ) : (
                quickProduct.name?.slice(
                  0,
                  1
                )
              )}
            </span>

            <b>
              {
                quickProduct.name
              }

              <em>
                {quickProduct.price.toLocaleString()}{" "}
                KRW · 기본 /
                Standard · 1개
              </em>
            </b>

            <Link to="/cart">
              장바구니 보기 →
            </Link>
          </div>
        </aside>
      )}
    </main>
  );
}
