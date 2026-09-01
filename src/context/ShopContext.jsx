import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ShopContext } from "./shop-context";


/* =========================================================
   OPTIONS
========================================================= */

const STANDARD_OPTION = {
  id: "standard",
  label: "기본 / Standard",
  extraPrice: 0,
};

const GIFT_OPTION = {
  id: "gift",
  label: "선물 포장 / Gift Wrap",
  extraPrice: 2500,
};


/* =========================================================
   INITIAL
========================================================= */

const initial = {
  cart: [],
  saved: [],
};


/* =========================================================
   OPTION NORMALIZE
========================================================= */

function normalizeOption(option) {
  if (!option) {
    return STANDARD_OPTION;
  }

  if (typeof option === "string") {
    if (
      option === "gift" ||
      option === "선물 포장 / Gift Wrap"
    ) {
      return GIFT_OPTION;
    }

    return STANDARD_OPTION;
  }

  if (option.id === "gift") {
    return GIFT_OPTION;
  }

  return STANDARD_OPTION;
}


/* =========================================================
   SHOP NORMALIZE
========================================================= */

function normalizeShop(savedShop) {
  if (!savedShop) {
    return initial;
  }

  const cart = Array.isArray(savedShop.cart)
    ? savedShop.cart.map((item) => {
        const option = normalizeOption(
          item.option
        );

        return {
          ...item,

          quantity: Number(
            item.quantity || 1
          ),

          option,

          lineId:
            item.lineId ||
            `${item.id}__${option.id}`,
        };
      })
    : [];

  const saved = Array.isArray(
    savedShop.saved
  )
    ? savedShop.saved
    : [];

  return {
    cart,
    saved,
  };
}


/* =========================================================
   MOTION CSS

   ★ 중요

   1. 처음 숨길 때는 transition 없음
   2. ready가 붙은 뒤에만 transition 활성화
   3. translateY 완전 제거
   4. 오직 opacity만 변화
========================================================= */

const SHOP_MOTION_STYLE = `
  /*
    처음 준비 상태.

    ★ transition 없음
    ★ 위치 이동 없음
  */
  .shop-motion-item {
    opacity: 0 !important;

    transition: none !important;

    transform: none !important;

    will-change: opacity;
  }


  /*
    숨기는 작업이 끝난 뒤에
    애니메이션 준비 완료
  */
  .shop-motion-item.shop-motion-ready {
    transition:
      opacity
      0.72s
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      ) !important;
  }


  /*
    실제 등장
  */
  .shop-motion-item.shop-motion-ready.shop-motion-visible {
    opacity: 1 !important;
  }


  @media (
    prefers-reduced-motion:
    reduce
  ) {
    .shop-motion-item,
    .shop-motion-item.shop-motion-ready,
    .shop-motion-item.shop-motion-visible {
      opacity: 1 !important;

      transition: none !important;

      transform: none !important;
    }
  }
`;


/* =========================================================
   PATH
========================================================= */

function getPath() {
  const pathname =
    window.location.pathname.replace(
      /\/+$/,
      ""
    );

  return pathname || "/";
}


/* =========================================================
   REVEAL SELECTOR
========================================================= */

function getRevealSelector(pathname) {
  /* =======================================================
     CHECKOUT

     ★ 결제 페이지 완전히 제외
  ======================================================= */

  if (
    pathname === "/checkout"
  ) {
    return null;
  }


  /* =======================================================
     SHOP MAIN
  ======================================================= */

  if (
    pathname === "/shop"
  ) {
    return [
      /*
        HERO TOP
        TAIWAN / SAVED / CART
      */
      "main > header > div:nth-of-type(2)",


      /*
        L:CODE TRAVEL SELECTION
      */
      "main > header > div:nth-of-type(3) > span",


      /*
        FLIGHT KIT
      */
      "main > header > div:nth-of-type(3) > h1",


      /*
        설명 + VIEW ALL
      */
      "main > header > div:nth-of-type(3) > div",


      /*
        01 / TAIPEI
      */
      "main > header > span",


      /*
        CATEGORY BAR
      */
      "main > section#items > div:first-child",


      /*
        ESSENTIALS / ITEMS
      */
      "main > section#items > div:nth-child(2)",


      /*
        SEARCH
      */
      "main > section#items > label",


      /*
        PRODUCT CARDS
      */
      "main > section#items article",


      /*
        EMPTY
      */
      "main > section#items > p",
    ].join(",");
  }


  /* =======================================================
     PRODUCT DETAIL
  ======================================================= */

  if (
    pathname.startsWith(
      "/shop/"
    )
  ) {
    return [
      /*
        상품 이미지
      */
      "main > section:first-of-type > div:first-child",


      /*
        상품 정보
      */
      "main > section:first-of-type > section",


      /*
        STORY / DETAIL / DELIVERY
      */
      "main > section:nth-of-type(2) > details",


      /*
        PRODUCT DETAIL HEADER
      */
      "main > section:nth-of-type(n+3) > div:first-child",


      /*
        상세 이미지
      */
      "main > section:nth-of-type(n+3) > div:nth-child(2) > div",
    ].join(",");
  }


  /* =======================================================
     CART
  ======================================================= */

  if (
    pathname === "/cart"
  ) {
    return (
      "main > div:first-child > *"
    );
  }


  /* =======================================================
     ORDER COMPLETE
  ======================================================= */

  if (
    pathname ===
    "/order-complete"
  ) {
    return "main > *";
  }


  /* =======================================================
     SAVED
  ======================================================= */

  if (
    pathname === "/saved"
  ) {
    return [
      "main > span",
      "main > h1",
      "main > section",
      "main article",
      "main > div",
    ].join(",");
  }


  return null;
}


/* =========================================================
   SORT

   위 → 아래
   같은 줄이면 왼쪽 → 오른쪽
========================================================= */

function sortElements(elements) {
  return [...elements].sort(
    (a, b) => {
      const rectA =
        a.getBoundingClientRect();

      const rectB =
        b.getBoundingClientRect();


      const topDifference =
        rectA.top -
        rectB.top;


      if (
        Math.abs(
          topDifference
        ) < 35
      ) {
        return (
          rectA.left -
          rectB.left
        );
      }


      return topDifference;
    }
  );
}


/* =========================================================
   PROVIDER
========================================================= */

export function ShopProvider({
  children,
}) {
  /* =======================================================
     SHOP STATE
  ======================================================= */

  const [
    shop,
    setShop,
  ] = useState(() => {
    try {
      const savedShop =
        JSON.parse(
          localStorage.getItem(
            "lcode-shop"
          )
        );

      return normalizeShop(
        savedShop
      );
    } catch {
      return initial;
    }
  });


  /* =======================================================
     MOTION REFS
  ======================================================= */

  const intersectionRef =
    useRef(null);

  const mutationRef =
    useRef(null);

  const frameRef =
    useRef(null);

  const timersRef =
    useRef(
      new Set()
    );

  const pathRef =
    useRef("");


  /* =======================================================
     STORAGE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "lcode-shop",
      JSON.stringify(shop)
    );
  }, [shop]);


  /* =======================================================
     SAVED
  ======================================================= */

  const toggleSaved = (
    id
  ) => {
    setShop(
      (state) => ({
        ...state,

        saved:
          state.saved.includes(
            id
          )
            ? state.saved.filter(
                (item) =>
                  item !== id
              )
            : [
                ...state.saved,
                id,
              ],
      })
    );
  };


  /* =======================================================
     ADD CART
  ======================================================= */

  const addToCart = (
    product,
    quantity = 1,
    option = STANDARD_OPTION
  ) => {
    const normalizedOption =
      normalizeOption(
        option
      );


    const lineId =
      `${product.id}__${normalizedOption.id}`;


    setShop(
      (state) => {
        const exists =
          state.cart.find(
            (item) =>
              item.lineId ===
              lineId
          );


        if (exists) {
          return {
            ...state,

            cart:
              state.cart.map(
                (item) =>
                  item.lineId ===
                  lineId
                    ? {
                        ...item,

                        quantity:
                          Number(
                            item.quantity
                          ) +
                          Number(
                            quantity
                          ),
                      }
                    : item
              ),
          };
        }


        return {
          ...state,

          cart: [
            ...state.cart,

            {
              ...product,

              quantity:
                Number(
                  quantity || 1
                ),

              option:
                normalizedOption,

              lineId,
            },
          ],
        };
      }
    );
  };


  /* =======================================================
     QUANTITY
  ======================================================= */

  const updateQuantity = (
    lineId,
    quantity
  ) => {
    setShop(
      (state) => {
        if (
          quantity < 1
        ) {
          return {
            ...state,

            cart:
              state.cart.filter(
                (item) =>
                  item.lineId !==
                  lineId
              ),
          };
        }


        return {
          ...state,

          cart:
            state.cart.map(
              (item) =>
                item.lineId ===
                lineId
                  ? {
                      ...item,

                      quantity:
                        Number(
                          quantity
                        ),
                    }
                  : item
            ),
        };
      }
    );
  };


  /* =======================================================
     REMOVE
  ======================================================= */

  const removeFromCart = (
    lineId
  ) => {
    updateQuantity(
      lineId,
      0
    );
  };


  /* =======================================================
     COMMON REVEAL MOTION
  ======================================================= */

  useLayoutEffect(() => {
    /* -----------------------------------------------------
       STYLE
    ----------------------------------------------------- */

    let style =
      document.querySelector(
        "style[data-lcode-shop-motion]"
      );


    if (!style) {
      style =
        document.createElement(
          "style"
        );


      style.setAttribute(
        "data-lcode-shop-motion",
        "true"
      );


      style.textContent =
        SHOP_MOTION_STYLE;


      document.head.appendChild(
        style
      );
    } else {
      /*
        이전 스타일 코드가 남아있더라도
        최신 버전으로 강제 교체
      */

      style.textContent =
        SHOP_MOTION_STYLE;
    }


    /* -----------------------------------------------------
       TIMER
    ----------------------------------------------------- */

    const clearTimers =
      () => {
        timersRef.current.forEach(
          (timer) => {
            window.clearTimeout(
              timer
            );
          }
        );


        timersRef.current.clear();
      };


    const addTimer = (
      callback,
      delay
    ) => {
      const timer =
        window.setTimeout(
          () => {
            timersRef.current.delete(
              timer
            );

            callback();
          },
          delay
        );


      timersRef.current.add(
        timer
      );
    };


    /* -----------------------------------------------------
       RESET
    ----------------------------------------------------- */

    const resetMotion =
      () => {
        document
          .querySelectorAll(
            ".shop-motion-item"
          )
          .forEach(
            (element) => {
              element.classList.remove(
                "shop-motion-item",
                "shop-motion-ready",
                "shop-motion-visible"
              );


              delete element.dataset
                .shopRevealPrepared;


              delete element.dataset
                .shopRevealDone;
            }
          );
      };


    /* -----------------------------------------------------
       PREPARE

       ★ 가장 중요한 부분

       일단 transition 없이 즉시 숨기고
       강제 reflow 후
       transition을 활성화합니다.

       그래서 절대
       보임 → 서서히 숨음
       현상이 발생하지 않습니다.
    ----------------------------------------------------- */

    const prepareElement =
      (element) => {
        if (!element) {
          return;
        }


        element.dataset.shopRevealPrepared =
          "true";


        /*
          1.
          transition 없는 상태로 즉시 숨김
        */

        element.classList.add(
          "shop-motion-item"
        );


        /*
          2.
          브라우저에게
          opacity:0 상태를 확정시킴
        */

        void element.offsetHeight;


        /*
          3.
          이제부터 transition 허용
        */

        element.classList.add(
          "shop-motion-ready"
        );
      };


    /* -----------------------------------------------------
       REVEAL
    ----------------------------------------------------- */

    const reveal =
      (element) => {
        if (!element) {
          return;
        }


        if (
          element.dataset
            .shopRevealDone ===
          "true"
        ) {
          return;
        }


        element.classList.add(
          "shop-motion-visible"
        );


        element.dataset.shopRevealDone =
          "true";


        intersectionRef.current?.unobserve(
          element
        );
      };


    /* -----------------------------------------------------
       INTERSECTION
    ----------------------------------------------------- */

    intersectionRef.current =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .map(
                (entry) =>
                  entry.target
              );


          if (
            visible.length ===
            0
          ) {
            return;
          }


          const ordered =
            sortElements(
              visible
            );


          ordered.forEach(
            (
              element,
              index
            ) => {
              addTimer(
                () => {
                  reveal(
                    element
                  );
                },

                index * 90
              );
            }
          );
        },

        {
          threshold: 0.06,

          rootMargin:
            "0px 0px -7% 0px",
        }
      );


    /* -----------------------------------------------------
       SCAN
    ----------------------------------------------------- */

    const scan =
      () => {
        const pathname =
          getPath();


        /*
          페이지가 바뀌었을 때
        */

        if (
          pathRef.current !==
          pathname
        ) {
          clearTimers();

          resetMotion();

          pathRef.current =
            pathname;
        }


        const selector =
          getRevealSelector(
            pathname
          );


        /*
          Checkout
        */

        if (!selector) {
          return;
        }


        const main =
          document.querySelector(
            "main"
          );


        if (!main) {
          return;
        }


        const elements =
          Array.from(
            main.querySelectorAll(
              selector
            )
          );


        const fresh =
          elements.filter(
            (element) => {
              if (
                element.dataset
                  .shopRevealPrepared ===
                "true"
              ) {
                return false;
              }


              const rect =
                element.getBoundingClientRect();


              if (
                rect.width <= 0 ||
                rect.height <= 0
              ) {
                return false;
              }


              /*
                이미 자체 animation이 있는 요소 제외
              */

              const computed =
                window.getComputedStyle(
                  element
                );


              if (
                computed.animationName &&
                computed.animationName !==
                  "none"
              ) {
                return false;
              }


              return true;
            }
          );


        if (
          fresh.length ===
          0
        ) {
          return;
        }


        /*
          ★ 먼저 전부 즉시 숨김 준비

          transition이 아직 없기 때문에
          아래로 내려가거나
          서서히 사라지지 않습니다.
        */

        fresh.forEach(
          (element) => {
            prepareElement(
              element
            );
          }
        );


        /* -----------------------------------------------
           FIRST VIEW
        ----------------------------------------------- */

        const firstView =
          fresh.filter(
            (element) => {
              const rect =
                element.getBoundingClientRect();


              return (
                rect.bottom >
                  0 &&
                rect.top <
                  window.innerHeight *
                    0.94
              );
            }
          );


        /* -----------------------------------------------
           BELOW
        ----------------------------------------------- */

        const below =
          fresh.filter(
            (element) =>
              !firstView.includes(
                element
              )
          );


        /* -----------------------------------------------
           처음 보이는 화면

           위 → 아래 순차
        ----------------------------------------------- */

        const orderedFirst =
          sortElements(
            firstView
          );


        orderedFirst.forEach(
          (
            element,
            index
          ) => {
            addTimer(
              () => {
                reveal(
                  element
                );
              },

              /*
                첫 요소 80ms 후
                이후 100ms 간격
              */

              80 +
                index *
                  100
            );
          }
        );


        /* -----------------------------------------------
           스크롤 아래쪽
        ----------------------------------------------- */

        below.forEach(
          (element) => {
            intersectionRef.current.observe(
              element
            );
          }
        );
      };


    /* -----------------------------------------------------
       SCHEDULE

       Mutation이 여러 번 발생하면
       한 프레임에 한 번만 실행
    ----------------------------------------------------- */

    const schedule =
      () => {
        if (
          frameRef.current
        ) {
          cancelAnimationFrame(
            frameRef.current
          );
        }


        frameRef.current =
          requestAnimationFrame(
            () => {
              scan();
            }
          );
      };


    /* -----------------------------------------------------
       INITIAL

       useLayoutEffect 안이므로
       실제 화면 paint 전에 실행
    ----------------------------------------------------- */

    resetMotion();

    pathRef.current = "";

    scan();


    /* -----------------------------------------------------
       DOM CHANGE
    ----------------------------------------------------- */

    mutationRef.current =
      new MutationObserver(
        () => {
          schedule();
        }
      );


    mutationRef.current.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );


    /* -----------------------------------------------------
       RESIZE
    ----------------------------------------------------- */

    window.addEventListener(
      "resize",
      schedule
    );


    /* -----------------------------------------------------
       CLEANUP
    ----------------------------------------------------- */

    return () => {
      clearTimers();


      if (
        frameRef.current
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }


      intersectionRef.current?.disconnect();

      mutationRef.current?.disconnect();


      window.removeEventListener(
        "resize",
        schedule
      );


      /*
        개발모드 StrictMode 대응
      */

      resetMotion();

      pathRef.current = "";
    };
  }, []);


  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <ShopContext.Provider
      value={{
        ...shop,

        toggleSaved,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}