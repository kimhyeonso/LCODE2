import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import products from "../data/products.json";
import { useShop } from "../hooks/useShop";
import styles from "./Saved.module.scss";


/* =========================================================
   PRODUCT IMAGE AUTO LOAD
========================================================= */

const PRODUCT_IMAGE_MODULES =
  import.meta.glob(
    "../assets/images/detail/*.{png,jpg,jpeg,webp}",
    {
      eager: true,
      import: "default",
    }
  );


const PRODUCT_IMAGE_FILES =
  Object.entries(
    PRODUCT_IMAGE_MODULES
  ).reduce(
    (
      result,
      [path, src]
    ) => {
      const fileName =
        path
          .split("/")
          .pop();

      result[fileName] =
        src;

      return result;
    },
    {}
  );


function getProductImage(
  number
) {
  const extensions = [
    "png",
    "webp",
    "jpg",
    "jpeg",
  ];

  for (
    const extension
    of extensions
  ) {
    const thumbnail =
      `${number}_1.${extension}`;

    if (
      PRODUCT_IMAGE_FILES[
        thumbnail
      ]
    ) {
      return (
        PRODUCT_IMAGE_FILES[
          thumbnail
        ]
      );
    }
  }


  for (
    const extension
    of extensions
  ) {
    const fallback =
      `${number}.${extension}`;

    if (
      PRODUCT_IMAGE_FILES[
        fallback
      ]
    ) {
      return (
        PRODUCT_IMAGE_FILES[
          fallback
        ]
      );
    }
  }


  return "";
}


/* =========================================================
   TRAVEL HERO IMAGE
========================================================= */

const TRAVEL_IMAGE_MODULES =
  import.meta.glob(
    "../assets/images/destinations/pexels/*.{png,jpg,jpeg,webp}",
    {
      eager: true,
      import: "default",
    }
  );


const TRAVEL_IMAGES =
  Object.values(
    TRAVEL_IMAGE_MODULES
  );


function getTravelImage() {
  if (
    TRAVEL_IMAGES.length ===
    0
  ) {
    return "";
  }


  return (
    TRAVEL_IMAGES[3] ||
    TRAVEL_IMAGES[0] ||
    ""
  );
}


/* =========================================================
   DEFAULT OPTION
========================================================= */

const STANDARD_OPTION = {
  id: "standard",
  label: "기본 / Standard",
  extraPrice: 0,
};


/* =========================================================
   SAVED
========================================================= */

export default function Saved() {
  const {
    saved = [],
    toggleSaved,
    addToCart,
    cart = [],
  } = useShop();


  /* =======================================================
     STATE
  ======================================================= */

  const [
    category,
    setCategory,
  ] = useState(
    "ALL"
  );


  const [
    sortMode,
    setSortMode,
  ] = useState(
    "saved"
  );


  const [
    toastProduct,
    setToastProduct,
  ] = useState(
    null
  );


  const toastTimerRef =
    useRef(null);


  /* =======================================================
     SAVED IDS
  ======================================================= */

  const savedIds =
    useMemo(
      () =>
        saved
          .map(
            (item) =>
              typeof item ===
              "string"
                ? item
                : item?.id
          )
          .filter(
            Boolean
          ),
      [saved]
    );


  /* =======================================================
     PRODUCTS
  ======================================================= */

  const productList =
    useMemo(
      () =>
        products.map(
          (
            product,
            index
          ) => ({
            ...product,

            imageNumber:
              index + 1,

            thumbnail:
              getProductImage(
                index + 1
              ) ||
              product.image ||
              "",
          })
        ),
      []
    );


  /* =======================================================
     SAVED ORDER
  ======================================================= */

  const savedOrderMap =
    useMemo(() => {
      const map =
        new Map();


      savedIds.forEach(
        (
          id,
          index
        ) => {
          map.set(
            id,
            index
          );
        }
      );


      return map;
    }, [savedIds]);


  /* =======================================================
     SAVED ITEMS
  ======================================================= */

  const savedItems =
    useMemo(
      () =>
        productList
          .filter(
            (product) =>
              savedIds.includes(
                product.id
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              (
                savedOrderMap.get(
                  a.id
                ) ??
                9999
              ) -
              (
                savedOrderMap.get(
                  b.id
                ) ??
                9999
              )
          ),
      [
        productList,
        savedIds,
        savedOrderMap,
      ]
    );


  /* =======================================================
     CATEGORY
  ======================================================= */

  const categories =
    useMemo(
      () => [
        "ALL",

        ...new Set(
          savedItems.map(
            (product) =>
              product.category
          )
        ),
      ],
      [savedItems]
    );


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const visibleItems =
    useMemo(() => {
      let result =
        savedItems.filter(
          (product) =>
            category ===
              "ALL" ||
            product.category ===
              category
        );


      result = [
        ...result,
      ];


      if (
        sortMode ===
        "price-low"
      ) {
        result.sort(
          (
            a,
            b
          ) =>
            Number(
              a.price
            ) -
            Number(
              b.price
            )
        );
      }


      if (
        sortMode ===
        "price-high"
      ) {
        result.sort(
          (
            a,
            b
          ) =>
            Number(
              b.price
            ) -
            Number(
              a.price
            )
        );
      }


      if (
        sortMode ===
        "name"
      ) {
        result.sort(
          (
            a,
            b
          ) =>
            a.name.localeCompare(
              b.name,
              "ko"
            )
        );
      }


      if (
        sortMode ===
        "saved"
      ) {
        result.sort(
          (
            a,
            b
          ) =>
            (
              savedOrderMap.get(
                a.id
              ) ??
              9999
            ) -
            (
              savedOrderMap.get(
                b.id
              ) ??
              9999
            )
        );
      }


      return result;
    }, [
      savedItems,
      category,
      sortMode,
      savedOrderMap,
    ]);


  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity ||
                1
            ),
          0
        ),
      [cart]
    );


  /* =======================================================
     HERO
  ======================================================= */

  const heroBackground =
    getTravelImage() ||
    productList[0]
      ?.thumbnail ||
    "";


  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart =
    (
      event,
      product
    ) => {
      event?.preventDefault();
      event?.stopPropagation();


      addToCart(
        {
          ...product,

          image:
            product.thumbnail ||
            product.image ||
            "",

          thumbnail:
            product.thumbnail ||
            product.image ||
            "",
        },

        1,

        STANDARD_OPTION
      );


      setToastProduct(
        product
      );


      if (
        toastTimerRef.current
      ) {
        window.clearTimeout(
          toastTimerRef.current
        );
      }


      toastTimerRef.current =
        window.setTimeout(
          () => {
            setToastProduct(
              null
            );
          },
          2500
        );
    };


  /* =======================================================
     REMOVE SAVED
  ======================================================= */

  const handleRemoveSaved =
    (
      event,
      productId
    ) => {
      event.preventDefault();
      event.stopPropagation();


      toggleSaved(
        productId
      );
    };


  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const handleClearAll =
    () => {
      if (
        savedIds.length ===
        0
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "저장한 상품을 모두 삭제하시겠습니까?"
        );


      if (
        !confirmed
      ) {
        return;
      }


      savedIds.forEach(
        (id) => {
          toggleSaved(id);
        }
      );


      setCategory(
        "ALL"
      );
    };


  /* =======================================================
     TIMER CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        toastTimerRef.current
      ) {
        window.clearTimeout(
          toastTimerRef.current
        );
      }
    };
  }, []);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className={
        styles.savedPage
      }
    >
      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className={
          styles.hero
        }
        style={{
          backgroundImage:
            heroBackground
              ? `url(${heroBackground})`
              : "none",
        }}
      >
        <div
          className={
            styles.heroOverlay
          }
        />


        <div
          className={
            styles.heroInner
          }
        >
          <div
            className={
              styles.heroUtility
            }
          >
            <span>
              SHOP / SAVED
            </span>


            <Link to="/cart">
              CART

              <b>
                {cartCount}
              </b>
            </Link>
          </div>


          <div
            className={
              styles.heroContent
            }
          >
            <small>
              MY SHOP
            </small>


            <h1>
              SAVED
            </h1>


            <p>
              마음에 담아둔 여행 준비물을
              한곳에서 다시 확인해보세요.
            </p>
          </div>


          <div
            className={
              styles.heroBottom
            }
          >
            <span>
              {String(
                savedItems.length
              ).padStart(
                2,
                "0"
              )}{" "}
              ITEMS
            </span>


            <a href="#saved-items">
              VIEW SAVED

              <b>
                ↓
              </b>
            </a>
          </div>
        </div>
      </section>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <section
        id="saved-items"
        className={
          styles.savedFrame
        }
      >
        <header
          className={
            styles.contentHead
          }
        >
          <div>
            <span>
              SAVED ITEMS
            </span>

            <strong>
              {
                savedItems.length
              }
            </strong>
          </div>


          <p>
            저장한 상품을 다시 확인하거나
            바로 장바구니에 담을 수 있습니다.
          </p>
        </header>


        {/* =================================================
            EMPTY
        ================================================= */}

        {savedItems.length ===
        0 ? (
          <div
            className={
              styles.emptyState
            }
          >
            <div>
              <small>
                YOUR SAVED LIST
              </small>

              <h2>
                아직 저장한 상품이
                없습니다.
              </h2>

              <p>
                SHOP에서 마음에 드는 상품의
                하트를 눌러 저장해보세요.
              </p>
            </div>


            <Link
              to="/shop"
              className={
                styles.shopButton
              }
            >
              SHOP 둘러보기

              <span>
                →
              </span>
            </Link>
          </div>
        ) : (
          <>
            {/* =============================================
                TOOLBAR
            ============================================= */}

            <div
              className={
                styles.toolbar
              }
            >
              <div
                className={
                  styles.categoryTabs
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
                          ? styles.activeTab
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
                  styles.toolbarTools
                }
              >
                <span>
                  {visibleItems.length}{" "}
                  ITEMS
                </span>


                <select
                  value={
                    sortMode
                  }
                  onChange={(
                    event
                  ) =>
                    setSortMode(
                      event.target
                        .value
                    )
                  }
                  aria-label="정렬"
                >
                  <option value="saved">
                    저장순
                  </option>

                  <option value="price-low">
                    낮은 가격순
                  </option>

                  <option value="price-high">
                    높은 가격순
                  </option>

                  <option value="name">
                    상품명순
                  </option>
                </select>


                <button
                  type="button"
                  className={
                    styles.clearButton
                  }
                  onClick={
                    handleClearAll
                  }
                >
                  전체 삭제
                </button>
              </div>
            </div>


            {/* =============================================
                PRODUCT GRID
            ============================================= */}

            {visibleItems.length >
              0 ? (
              <div
                className={
                  styles.productGrid
                }
              >
                {visibleItems.map(
                  (product) => (
                    <article
                      key={
                        product.id
                      }
                      className={
                        styles.productCard
                      }
                    >
                      {/* ================================
                          VISUAL
                      ================================ */}

                      <div
                        className={
                          styles.productVisual
                        }
                      >
                        <Link
                          to={
                            `/shop/${product.id}`
                          }
                          className={
                            styles.productImageLink
                          }
                        >
                          {product.thumbnail ? (
                            <img
                              src={
                                product.thumbnail
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className={
                                styles.productFallback
                              }
                            >
                              {product.name.slice(
                                0,
                                1
                              )}
                            </div>
                          )}
                        </Link>


                        {/* SHOP과 동일:
                            좌측 상단 카테고리 */}

                        <span
                          className={
                            styles.cardCategory
                          }
                        >
                          {
                            product.category
                          }
                        </span>


                        {/* SHOP과 동일:
                            우측 상단 HEART */}

                        <button
                          type="button"
                          className={
                            styles.heartButton
                          }
                          onClick={(
                            event
                          ) =>
                            handleRemoveSaved(
                              event,
                              product.id
                            )
                          }
                          aria-label={`${product.name} 저장 해제`}
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12 20.7 10.55 19.38C5.4 14.7 2 11.62 2 7.85 2 4.77 4.42 2.35 7.5 2.35c1.74 0 3.41.81 4.5 2.09a6.03 6.03 0 0 1 4.5-2.09c3.08 0 5.5 2.42 5.5 5.5 0 3.77-3.4 6.85-8.55 11.54Z" />
                          </svg>
                        </button>


                        {/* SHOP과 동일:
                            우측 하단 + */}

                        <button
                          type="button"
                          className={
                            styles.cartButton
                          }
                          onClick={(
                            event
                          ) =>
                            handleAddToCart(
                              event,
                              product
                            )
                          }
                          aria-label={`${product.name} 장바구니 담기`}
                        >
                          +
                        </button>
                      </div>


                      {/* ================================
                          META
                      ================================ */}

                      <div
                        className={
                          styles.productInfo
                        }
                      >
                        <small>
                          {
                            product.category
                          }
                        </small>


                        <Link
                          to={
                            `/shop/${product.id}`
                          }
                        >
                          <h2>
                            {
                              product.name
                            }
                          </h2>
                        </Link>


                        <p
                          className={
                            styles.price
                          }
                        >
                          {Number(
                            product.price
                          ).toLocaleString()}{" "}
                          KRW
                        </p>
                      </div>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div
                className={
                  styles.categoryEmpty
                }
              >
                <p>
                  선택한 카테고리에 저장한
                  상품이 없습니다.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setCategory(
                      "ALL"
                    )
                  }
                >
                  전체 저장 상품 보기 →
                </button>
              </div>
            )}
          </>
        )}


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div
          className={
            styles.bottomLink
          }
        >
          <span>
            L:CODE TRAVEL SHOP
          </span>

          <Link to="/shop">
            CONTINUE SHOPPING

            <b>
              →
            </b>
          </Link>
        </div>
      </section>


      {/* ===================================================
          TOAST
      =================================================== */}

      {toastProduct && (
        <aside
          className={
            styles.cartToast
          }
        >
          <div
            className={
              styles.toastThumb
            }
          >
            {toastProduct.thumbnail ? (
              <img
                src={
                  toastProduct.thumbnail
                }
                alt={
                  toastProduct.name
                }
              />
            ) : (
              <span>
                {toastProduct.name.slice(
                  0,
                  1
                )}
              </span>
            )}
          </div>


          <div
            className={
              styles.toastCopy
            }
          >
            <small>
              ADDED TO CART
            </small>

            <b>
              {
                toastProduct.name
              }
            </b>
          </div>


          <Link to="/cart">
            CART →
          </Link>
        </aside>
      )}
    </main>
  );
}
