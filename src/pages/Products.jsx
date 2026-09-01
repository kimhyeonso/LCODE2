import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import products from "../data/products.json";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";

import thumbnail01 from "../assets/images/detail/1_1.png";
import thumbnail02 from "../assets/images/detail/2_1.png";
import thumbnail03 from "../assets/images/detail/3_1.png";
import thumbnail04 from "../assets/images/detail/4_1.png";
import thumbnail05 from "../assets/images/detail/5_1.png";
import thumbnail06 from "../assets/images/detail/6_1.png";
import thumbnail07 from "../assets/images/detail/7_1.png";
import thumbnail08 from "../assets/images/detail/8_1.png";
import thumbnail09 from "../assets/images/detail/9_1.png";
import thumbnail10 from "../assets/images/detail/10_1.png";
import thumbnail11 from "../assets/images/detail/11_1.png";
import thumbnail12 from "../assets/images/detail/12_1.png";
import thumbnail13 from "../assets/images/detail/13_1.png";
import thumbnail14 from "../assets/images/detail/14_1.png";
import thumbnail15 from "../assets/images/detail/15_1.png";
import thumbnail16 from "../assets/images/detail/16_1.png";
import thumbnail17 from "../assets/images/detail/17_1.png";
import thumbnail18 from "../assets/images/detail/18_1.png";
import thumbnail19 from "../assets/images/detail/19_1.png";
import thumbnail20 from "../assets/images/detail/20_1.png";
import thumbnail21 from "../assets/images/detail/21_1.png";
import thumbnail22 from "../assets/images/detail/22_1.png";
import thumbnail23 from "../assets/images/detail/23_1.png";

const STANDARD_OPTION = {
  id: "standard",
  label: "기본 / Standard",
  extraPrice: 0,
};

const productThumbnailMap = {
  P001: thumbnail01,
  P002: thumbnail02,
  P003: thumbnail03,
  P004: thumbnail04,
  P005: thumbnail05,
  P006: thumbnail06,
  P009: thumbnail07,
  P010: thumbnail08,
  P011: thumbnail09,
  P012: thumbnail10,
  P014: thumbnail11,
  P015: thumbnail12,
  P016: thumbnail13,
  P018: thumbnail14,
  P019: thumbnail15,
  P020: thumbnail16,
  P021: thumbnail17,
  P022: thumbnail18,
  P023: thumbnail19,
  P024: thumbnail20,
  P025: thumbnail21,
  P026: thumbnail22,
  P028: thumbnail23,
};

export default function Products() {
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
     PRODUCTS WITH THUMBNAIL

     P028 휴대폰 방수팩까지는 번호_1.png 사용
     이후 상품은 기존 fallback 유지
  ========================================================= */

  const displayProducts =
    useMemo(
      () =>
        products.map(
          (product) => ({
            ...product,
            thumbnail:
              productThumbnailMap[
                product.id
              ] ||
              product.image ||
              "",
          })
        ),
      []
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
            L:CODE TRAVEL
            SELECTION
          </span>


          <h1>
            FLIGHT
            <br />
            KIT
          </h1>


          <div
            className={
              styles.heroBottom
            }
          >
            <p>
              여행을 더 가볍게 만드는

              <br />

              TRAVEL ESSENTIALS
            </p>


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
          01 / TAIPEI
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
                key={
                  item
                }
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
                      styles[product.tone] || "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className={[
                        styles.heart,
                        liked
                          ? styles.liked
                          : "",
                      ].join(" ")}
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


                    <Link
                      to={"/shop/" + product.id}
                      aria-label={product.name + " 상세 보기"}
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
                      onClick={() =>
                        handleQuickAdd(
                          product
                        )
                      }
                      aria-label={product.name + " 장바구니 담기"}
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
                      to={"/shop/" + product.id}
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
