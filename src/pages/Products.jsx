import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import products from "../data/products.json";
import ProductCard from "../components/ProductCard";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";


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
  } = useShop();


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

  /*
    같은 상품을 연속으로 눌러도
    등장 애니메이션을 다시 시작하기 위한 key
  */
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
    /*
      기존 타이머 제거
      → 연속 클릭하면 5초 다시 시작
    */
    clearQuickTimers();


    /*
      마지막으로 담은 상품으로 교체
    */
    setQuickProduct(
      product
    );

    setQuickClosing(
      false
    );


    /*
      같은 상품을 다시 눌러도
      페이드인 애니메이션 재실행
    */
    setQuickKey(
      (prev) =>
        prev + 1
    );


    /*
      4.3초 후 사라지기 시작
    */
    hideTimerRef.current =
      window.setTimeout(
        () => {
          setQuickClosing(
            true
          );
        },
        4300
      );


    /*
      총 5초 후 DOM에서 제거
    */
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
          products.map(
            (product) =>
              product.category
          )
        ),
      ],
      []
    );


  const filtered =
    useMemo(
      () =>
        products.filter(
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
        {/* CATEGORY */}

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


        {/* LABEL */}

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


        {/* SEARCH */}

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


        {/* PRODUCT GRID */}

        <div
          className={
            styles.productGrid
          }
        >
          {filtered.map(
            (
              product
            ) => (
              <ProductCard
                product={
                  product
                }
                key={
                  product.id
                }
                onQuickAdd={
                  handleQuickAdd
                }
              />
            )
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
          QUICK CART TOAST

          장바구니에 뭐가 있느냐가 아니라
          + 버튼을 눌렀을 때만 잠깐 등장
      ===================================================== */}

      {quickProduct && (
        <aside
          key={
            quickKey
          }
          className={`${styles.quickCart} ${
            quickClosing
              ? styles.quickCartClosing
              : ""
          }`}
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
              {quickProduct.name?.slice(
                0,
                1
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