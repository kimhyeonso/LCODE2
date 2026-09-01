import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import products from "../data/products.json";
import { useShop } from "../hooks/useShop";


/* =========================================================
   PRODUCT IMAGES

   최신 products.json 실제 상품 순서 기준
   P017, P027은 현재 상품 목록에 없어서 번호를 당겨 사용

   각 상품:
   - n_1.png / n_2.png = gallery
   - n.png = PRODUCT DETAIL
========================================================= */

/* 01 P001 여행용 크로스백 */
import productMain01 from "../assets/images/detail/1_1.png";
import productSub01 from "../assets/images/detail/1_2.png";
import productDetail01 from "../assets/images/detail/1.png";

/* 02 P002 여행용 목베개 */
import productMain02 from "../assets/images/detail/2_1.png";
import productSub02 from "../assets/images/detail/2_2.png";
import productDetail02 from "../assets/images/detail/2.png";

/* 03 P003 수면 온열안대 */
import productMain03 from "../assets/images/detail/3_1.png";
import productSub03 from "../assets/images/detail/3_2.png";
import productDetail03 from "../assets/images/detail/3.png";

/* 04 P004 쿨링안대 */
import productMain04 from "../assets/images/detail/4_1.png";
import productSub04 from "../assets/images/detail/4_2.png";
import productDetail04 from "../assets/images/detail/4.png";

/* 05 P005 아이스 넥쿨러 */
import productMain05 from "../assets/images/detail/5_1.png";
import productSub05 from "../assets/images/detail/5_2.png";
import productDetail05 from "../assets/images/detail/5.png";

/* 06 P006 넥밴드 선풍기 */
import productMain06 from "../assets/images/detail/6_1.png";
import productSub06 from "../assets/images/detail/6_2.png";
import productDetail06 from "../assets/images/detail/6.png";

/* 07 P009 여행용 보틀 */
import productMain07 from "../assets/images/detail/7_1.png";
import productSub07 from "../assets/images/detail/7_2.png";
import productDetail07 from "../assets/images/detail/7.png";

/* 08 P010 여행용 귀마개 */
import productMain08 from "../assets/images/detail/8_1.png";
import productSub08 from "../assets/images/detail/8_2.png";
import productDetail08 from "../assets/images/detail/8.png";

/* 09 P011 여행용 키트 set */
import productMain09 from "../assets/images/detail/9_1.png";
import productSub09 from "../assets/images/detail/9_2.png";
import productDetail09 from "../assets/images/detail/9.png";

/* 10 P012 100ml 공병 세트 */
import productMain10 from "../assets/images/detail/10_1.png";
import productSub10 from "../assets/images/detail/10_2.png";
import productDetail10 from "../assets/images/detail/10.png";

/* 11 P014 접이식 보조가방 */
import productMain11 from "../assets/images/detail/11_1.png";
import productSub11 from "../assets/images/detail/11_2.png";
import productDetail11 from "../assets/images/detail/11.png";

/* 12 P015 방수 파우치 */
import productMain12 from "../assets/images/detail/12_1.png";
import productSub12 from "../assets/images/detail/12_2.png";
import productDetail12 from "../assets/images/detail/12.png";

/* 13 P016 압축 지퍼백 */
import productMain13 from "../assets/images/detail/13_1.png";
import productSub13 from "../assets/images/detail/13_2.png";
import productDetail13 from "../assets/images/detail/13.png";

/* 14 P018 캐리어 커버 */
import productMain14 from "../assets/images/detail/14_1.png";
import productSub14 from "../assets/images/detail/14_2.png";
import productDetail14 from "../assets/images/detail/14.png";

/* 15 P019 여행용 약통 */
import productMain15 from "../assets/images/detail/15_1.png";
import productSub15 from "../assets/images/detail/15_2.png";
import productDetail15 from "../assets/images/detail/15.png";

/* 16 P020 멀미 밴드 */
import productMain16 from "../assets/images/detail/16_1.png";
import productSub16 from "../assets/images/detail/16_2.png";
import productDetail16 from "../assets/images/detail/16.png";

/* 17 P021 방수 밴드 */
import productMain17 from "../assets/images/detail/17_1.png";
import productSub17 from "../assets/images/detail/17_2.png";
import productDetail17 from "../assets/images/detail/17.png";

/* 18 P022 기내용 담요 / 숄 */
import productMain18 from "../assets/images/detail/18_1.png";
import productSub18 from "../assets/images/detail/18_2.png";
import productDetail18 from "../assets/images/detail/18.png";

/* 19 P023 미니 고데기 */
import productMain19 from "../assets/images/detail/19_1.png";
import productSub19 from "../assets/images/detail/19_2.png";
import productDetail19 from "../assets/images/detail/19.png";

/* 20 P024 멀티 어댑터 */
import productMain20 from "../assets/images/detail/20_1.png";
import productSub20 from "../assets/images/detail/20_2.png";
import productDetail20 from "../assets/images/detail/20.png";

/* 21 P025 멀티탭 / 분배기 */
import productMain21 from "../assets/images/detail/21_1.png";
import productSub21 from "../assets/images/detail/21_2.png";
import productDetail21 from "../assets/images/detail/21.png";

/* 22 P026 보조배터리 */
import productMain22 from "../assets/images/detail/22_1.png";
import productSub22 from "../assets/images/detail/22_2.png";
import productDetail22 from "../assets/images/detail/22.png";

/* 23 P028 휴대폰 방수팩 */
import productMain23 from "../assets/images/detail/23_1.png";
import productSub23 from "../assets/images/detail/23_2.png";
import productDetail23 from "../assets/images/detail/23.png";

import styles from "./Shop.module.scss";


/* =========================================================
   PRODUCT IMAGE MAP
========================================================= */

const productImageMap = {
  /* 01 여행용 크로스백 */
  P001: {
    gallery: [
      productMain01,
      productSub01,
    ],
    detail: [
      productDetail01,
    ],
  },

  /* 02 여행용 목베개 */
  P002: {
    gallery: [
      productMain02,
      productSub02,
    ],
    detail: [
      productDetail02,
    ],
  },

  /* 03 수면 온열안대 */
  P003: {
    gallery: [
      productMain03,
      productSub03,
    ],
    detail: [
      productDetail03,
    ],
  },

  /* 04 쿨링안대 */
  P004: {
    gallery: [
      productMain04,
      productSub04,
    ],
    detail: [
      productDetail04,
    ],
  },

  /* 05 아이스 넥쿨러 */
  P005: {
    gallery: [
      productMain05,
      productSub05,
    ],
    detail: [
      productDetail05,
    ],
  },

  /* 06 넥밴드 선풍기 */
  P006: {
    gallery: [
      productMain06,
      productSub06,
    ],
    detail: [
      productDetail06,
    ],
  },

  /* 07 여행용 보틀 */
  P009: {
    gallery: [
      productMain07,
      productSub07,
    ],
    detail: [
      productDetail07,
    ],
  },

  /* 08 여행용 귀마개 */
  P010: {
    gallery: [
      productMain08,
      productSub08,
    ],
    detail: [
      productDetail08,
    ],
  },

  /* 09 여행용 키트 set */
  P011: {
    gallery: [
      productMain09,
      productSub09,
    ],
    detail: [
      productDetail09,
    ],
  },

  /* 10 100ml 공병 세트 */
  P012: {
    gallery: [
      productMain10,
      productSub10,
    ],
    detail: [
      productDetail10,
    ],
  },

  /* 11 접이식 보조가방 */
  P014: {
    gallery: [
      productMain11,
      productSub11,
    ],
    detail: [
      productDetail11,
    ],
  },

  /* 12 방수 파우치 */
  P015: {
    gallery: [
      productMain12,
      productSub12,
    ],
    detail: [
      productDetail12,
    ],
  },

  /* 13 압축 지퍼백 */
  P016: {
    gallery: [
      productMain13,
      productSub13,
    ],
    detail: [
      productDetail13,
    ],
  },

  /* 14 캐리어 커버 */
  P018: {
    gallery: [
      productMain14,
      productSub14,
    ],
    detail: [
      productDetail14,
    ],
  },

  /* 15 여행용 약통 */
  P019: {
    gallery: [
      productMain15,
      productSub15,
    ],
    detail: [
      productDetail15,
    ],
  },

  /* 16 멀미 밴드 */
  P020: {
    gallery: [
      productMain16,
      productSub16,
    ],
    detail: [
      productDetail16,
    ],
  },

  /* 17 방수 밴드 */
  P021: {
    gallery: [
      productMain17,
      productSub17,
    ],
    detail: [
      productDetail17,
    ],
  },

  /* 18 기내용 담요 / 숄 */
  P022: {
    gallery: [
      productMain18,
      productSub18,
    ],
    detail: [
      productDetail18,
    ],
  },

  /* 19 미니 고데기 */
  P023: {
    gallery: [
      productMain19,
      productSub19,
    ],
    detail: [
      productDetail19,
    ],
  },

  /* 20 멀티 어댑터 */
  P024: {
    gallery: [
      productMain20,
      productSub20,
    ],
    detail: [
      productDetail20,
    ],
  },

  /* 21 멀티탭 / 분배기 */
  P025: {
    gallery: [
      productMain21,
      productSub21,
    ],
    detail: [
      productDetail21,
    ],
  },

  /* 22 보조배터리 */
  P026: {
    gallery: [
      productMain22,
      productSub22,
    ],
    detail: [
      productDetail22,
    ],
  },

  /* 23 휴대폰 방수팩 */
  P028: {
    gallery: [
      productMain23,
      productSub23,
    ],
    detail: [
      productDetail23,
    ],
  },
};


/* =========================================================
   PRODUCT OPTIONS
========================================================= */

const PRODUCT_OPTIONS = [
  {
    id: "standard",

    label:
      "기본 / Standard",

    extraPrice: 0,
  },

  {
    id: "gift",

    label:
      "선물 포장 / Gift Wrap",

    extraPrice: 2500,
  },
];


/* =========================================================
   PRODUCT DETAIL PAGE
========================================================= */

export default function ProductDetailPage() {
  /* =======================================================
     ROUTER
  ======================================================= */

  const {
    productId,
  } = useParams();


  const navigate =
    useNavigate();


  /* =======================================================
     PRODUCT
  ======================================================= */

  const product =
    products.find(
      (item) =>
        item.id ===
        productId
    );


  /* =======================================================
     SHOP
  ======================================================= */

  const {
    addToCart,
  } = useShop();


  /* =======================================================
     STATE
  ======================================================= */

  const [
    quantity,
    setQuantity,
  ] = useState(1);


  const [
    selectedOption,
    setSelectedOption,
  ] = useState(null);


  const [
    added,
    setAdded,
  ] = useState(false);


  const [
    purchaseConfirmOpen,
    setPurchaseConfirmOpen,
  ] = useState(false);


  const [
    activeImage,
    setActiveImage,
  ] = useState(0);


  /* =======================================================
     IMAGE SET

     아직 이미지 안 넣은 상품은
     gallery/detail이 빈 배열이 됨

     → import 오류 없이
     → 기존 플레이스홀더 표시
  ======================================================= */

  const imageSet =
    productImageMap[
      productId
    ] || {
      gallery: [],
      detail: [],
    };


  const galleryImages =
    imageSet.gallery;


  const detailImages =
    imageSet.detail;


  /* =======================================================
     RESET
  ======================================================= */

  useEffect(() => {
    setActiveImage(0);

    setQuantity(1);

    setSelectedOption(
      null
    );

    setAdded(false);

    setPurchaseConfirmOpen(
      false
    );
  }, [productId]);


  /* =======================================================
     PRODUCT NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <main
        className={
          styles.empty
        }
      >
        <h1>
          상품을 찾을 수 없어요.
        </h1>


        <Link to="/shop">
          SHOP으로 돌아가기 →
        </Link>
      </main>
    );
  }


  /* =======================================================
     SET PRODUCT
  ======================================================= */

  const isSetProduct =
    product.category ===
      "세트 상품" ||
    product.id?.startsWith(
      "S"
    );


  /* =======================================================
     PRICE
  ======================================================= */

  const productTotal =
    Number(
      product.price
    ) *
    Number(
      quantity
    );


  /*
    Gift Wrap은
    수량과 관계없이
    주문 단위 +2,500원
  */

  const giftWrapFee =
    selectedOption?.id ===
    "gift"
      ? 2500
      : 0;


  const total =
    productTotal +
    giftWrapFee;


  /* =======================================================
     GALLERY
  ======================================================= */

  const hasGallery =
    galleryImages.length >
    0;


  const currentImage =
    hasGallery
      ? galleryImages[
          activeImage
        ]
      : null;


  /* =======================================================
     PREVIOUS IMAGE
  ======================================================= */

  const goPrevious =
    () => {
      if (!hasGallery) {
        return;
      }


      setActiveImage(
        (previous) =>
          previous === 0
            ? galleryImages.length -
              1
            : previous -
              1
      );
    };


  /* =======================================================
     NEXT IMAGE
  ======================================================= */

  const goNext =
    () => {
      if (!hasGallery) {
        return;
      }


      setActiveImage(
        (previous) =>
          previous ===
          galleryImages.length -
            1
            ? 0
            : previous +
              1
      );
    };


  /* =======================================================
     OPTION
  ======================================================= */

  const handleOptionSelect =
    (
      option
    ) => {
      setSelectedOption(
        option
      );
    };


  /* =======================================================
     OPTION CHECK
  ======================================================= */

  const checkOption =
    () => {
      if (
        !selectedOption
      ) {
        window.alert(
          "옵션을 선택해주세요."
        );


        return false;
      }


      return true;
    };


  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart =
    () => {
      if (
        !checkOption()
      ) {
        return;
      }


      addToCart(
        product,
        quantity,
        selectedOption
      );


      setAdded(true);
    };


  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow =
    () => {
      if (
        !checkOption()
      ) {
        return;
      }


      setPurchaseConfirmOpen(
        true
      );
    };


  /* =======================================================
     CONFIRM PURCHASE
  ======================================================= */

  const handleConfirmPurchase =
    () => {
      if (
        !selectedOption
      ) {
        window.alert(
          "옵션을 선택해주세요."
        );


        setPurchaseConfirmOpen(
          false
        );


        return;
      }


      /*
        장바구니 선택 결제 정보 제거
      */

      sessionStorage.removeItem(
        "checkoutSelection"
      );


      /*
        상세페이지 바로구매 데이터
      */

      sessionStorage.setItem(
        "directPurchase",

        JSON.stringify({
          productId:
            product.id,

          id:
            product.id,

          name:
            product.name,

          category:
            product.category,

          price:
            product.price,

          quantity,

          option:
            selectedOption,

          giftWrapFee,

          total,

          /*
            Checkout에서도
            썸네일 사용 가능
          */

          image:
            galleryImages[
              0
            ] || "",
        })
      );


      setPurchaseConfirmOpen(
        false
      );


      navigate(
        "/checkout"
      );
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className={
        styles.detailPage
      }
    >
      {/* ===================================================
          PRODUCT TOP
      =================================================== */}

      <section
        className={
          styles.detailSpread
        }
      >
        {/* ===============================================
            GALLERY
        =============================================== */}

        <div
          className={
            styles.productGallery
          }
        >
          <div
            className={
              styles.detailVisual
            }
          >
            {hasGallery ? (
              <>
                {/* MAIN IMAGE */}

                <img
                  key={
                    currentImage
                  }
                  className={
                    styles.galleryMainImage
                  }
                  src={
                    currentImage
                  }
                  alt={`${product.name} 상품 이미지 ${
                    activeImage +
                    1
                  }`}
                />


                {/* GALLERY CONTROL */}

                {galleryImages.length >
                  1 && (
                  <>
                    {/* PREV */}

                    <button
                      type="button"
                      className={`${styles.galleryArrow} ${styles.galleryPrev}`}
                      onClick={
                        goPrevious
                      }
                      aria-label="이전 상품 이미지"
                    >
                      ←
                    </button>


                    {/* NEXT */}

                    <button
                      type="button"
                      className={`${styles.galleryArrow} ${styles.galleryNext}`}
                      onClick={
                        goNext
                      }
                      aria-label="다음 상품 이미지"
                    >
                      →
                    </button>


                    {/* DOTS */}

                    <div
                      className={
                        styles.galleryPagination
                      }
                    >
                      {galleryImages.map(
                        (
                          _,
                          index
                        ) => (
                          <button
                            type="button"
                            key={
                              index
                            }
                            className={
                              index ===
                              activeImage
                                ? styles.galleryDotActive
                                : ""
                            }
                            onClick={() =>
                              setActiveImage(
                                index
                              )
                            }
                            aria-label={`${index + 1}번 상품 이미지 보기`}
                          />
                        )
                      )}
                    </div>


                    {/* COUNT */}

                    <div
                      className={
                        styles.galleryCount
                      }
                    >
                      {String(
                        activeImage +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}


                      <span>
                        {" "}
                        /{" "}
                      </span>


                      {String(
                        galleryImages.length
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              /*
                아직 이미지 없는 상품

                기존 디자인 유지
              */
              <>
                <span>
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
              </>
            )}
          </div>
        </div>


        {/* ===============================================
            PRODUCT INFO
        =============================================== */}

        <section
          className={
            styles.detailInfo
          }
        >
          <small>
            {
              product.category
            }

            {" · "}

            TRAVEL ESSENTIALS
          </small>


          <h1>
            {
              product.name
            }
          </h1>


          {/* PRICE */}

          <strong>
            {product.price.toLocaleString()}

            {" "}

            <em>
              KRW
            </em>
          </strong>


          {/* DESCRIPTION */}

          <p>
            {
              product.desc
            }

            <br />

            {
              product.merit
            }
          </p>


          <hr />


          {/* ===========================================
              OPTION
          =========================================== */}

          <label>
            OPTION
          </label>


          <div
            className={
              styles.options
            }
          >
            {PRODUCT_OPTIONS.map(
              (
                option
              ) => {
                const isSelected =
                  selectedOption?.id ===
                  option.id;


                return (
                  <button
                    type="button"
                    key={
                      option.id
                    }
                    className={
                      isSelected
                        ? styles.selected
                        : ""
                    }
                    onClick={() =>
                      handleOptionSelect(
                        option
                      )
                    }
                  >
                    {
                      option.label
                    }


                    {option.extraPrice >
                      0 && (
                      <>
                        {" · +"}
                        {option.extraPrice.toLocaleString()}
                        {" KRW"}
                      </>
                    )}
                  </button>
                );
              }
            )}
          </div>


          {/* ===========================================
              QUANTITY
          =========================================== */}

          <label>
            QUANTITY
          </label>


          <div
            className={
              styles.quantity
            }
          >
            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (
                    previous
                  ) =>
                    Math.max(
                      1,
                      previous -
                        1
                    )
                )
              }
              aria-label="수량 줄이기"
            >
              -
            </button>


            <b>
              {
                quantity
              }
            </b>


            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (
                    previous
                  ) =>
                    previous +
                    1
                )
              }
              aria-label="수량 늘리기"
            >
              +
            </button>
          </div>


          <hr />


          {/* ===========================================
              TOTAL
          =========================================== */}

          <label>
            TOTAL
          </label>


          <strong>
            {total.toLocaleString()}

            {" "}

            <em>
              KRW
            </em>
          </strong>


          {/* ===========================================
              ACTIONS
          =========================================== */}

          <div
            className={
              styles.detailActions
            }
          >
            <button
              type="button"
              onClick={
                handleAddToCart
              }
            >
              장바구니 담기
            </button>


            <button
              type="button"
              onClick={
                handleBuyNow
              }
            >
              바로 구매
            </button>
          </div>
        </section>
      </section>


      {/* ===================================================
          PRODUCT DETAIL

          ★ 먼저 표시
      =================================================== */}

      {detailImages.length >
        0 && (
        <section
          className={
            styles.detailContents
          }
        >
          <div
            className={
              styles.detailContentsHeader
            }
          >
            <small>
              PRODUCT DETAIL
            </small>
          </div>


          <div
            className={
              styles.detailBannerList
            }
          >
            {detailImages.map(
              (
                image,
                index
              ) => (
                <div
                  className={
                    styles.detailBannerSlot
                  }
                  key={`${product.id}-detail-${index}`}
                >
                  <img
                    src={
                      image
                    }
                    alt={`${product.name} 상세 이미지 ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}


      {/* ===================================================
          PRODUCT TEXT INFORMATION

          PRODUCT DETAIL 뒤에 표시
      =================================================== */}

      <section
        className={
          styles.productAccordion
        }
      >
        {/* ===============================================
            01 PRODUCT STORY
        =============================================== */}

        <details open>
          <summary>
            <span>
              <b>
                01
              </b>

              PRODUCT STORY
            </span>


            <i />
          </summary>


          <div
            className={
              styles.accordionContent
            }
          >
            <p>
              {
                product.desc
              }
            </p>
          </div>
        </details>


        {/* ===============================================
            02 DETAIL
        =============================================== */}

        <details open>
          <summary>
            <span>
              <b>
                02
              </b>

              DETAIL
            </span>


            <i />
          </summary>


          <div
            className={
              styles.accordionContent
            }
          >
            <p>
              {
                product.merit
              }
            </p>
          </div>
        </details>


        {/* ===============================================
            03 DELIVERY
        =============================================== */}

        <details open>
          <summary>
            <span>
              <b>
                03
              </b>

              DELIVERY
            </span>


            <i />
          </summary>


          <div
            className={
              styles.accordionContent
            }
          >
            <p>
              {isSetProduct ? (
                <>
                  9월 11일 출고 시작

                  <br />

                  세트 상품은 준비되는
                  순서대로 순차 출고됩니다.
                </>
              ) : (
                <>
                  결제 완료 후 평균
                  2-3일 이내 출고됩니다.

                  <br />

                  지역 및 배송 상황에 따라
                  배송 일정이 달라질 수
                  있습니다.
                </>
              )}
            </p>
          </div>
        </details>
      </section>


      {/* ===================================================
          BUY CONFIRM MODAL
      =================================================== */}

      {purchaseConfirmOpen &&
        selectedOption && (
          <div
            className={
              styles.modalBackdrop
            }
            onClick={() =>
              setPurchaseConfirmOpen(
                false
              )
            }
          >
            <div
              className={
                styles.addedModal
              }
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className={
                  styles.close
                }
                onClick={() =>
                  setPurchaseConfirmOpen(
                    false
                  )
                }
                aria-label="닫기"
              >
                ×
              </button>


              <h2>
                구매하시겠습니까?
              </h2>


              <p>
                {
                  product.name
                }
              </p>


              <hr />


              <p>
                선택 옵션

                <br />

                <b>
                  {
                    selectedOption.label
                  }


                  {selectedOption.id ===
                    "gift" && (
                    <>
                      {" · "}
                      +2,500 KRW
                    </>
                  )}
                </b>
              </p>


              <p>
                수량

                <br />

                <b>
                  {quantity}개
                </b>
              </p>


              <p>
                총 결제 금액

                <br />

                <b>
                  {total.toLocaleString()}{" "}
                  KRW
                </b>
              </p>


              <div
                className={
                  styles.modalActions
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setPurchaseConfirmOpen(
                      false
                    )
                  }
                >
                  아니오
                </button>


                <button
                  type="button"
                  className={
                    styles.selected
                  }
                  onClick={
                    handleConfirmPurchase
                  }
                >
                  예
                </button>
              </div>
            </div>
          </div>
        )}


      {/* ===================================================
          ADDED TO CART MODAL
      =================================================== */}

      {added &&
        selectedOption && (
          <div
            className={
              styles.modalBackdrop
            }
            onClick={() =>
              setAdded(
                false
              )
            }
          >
            <div
              className={
                styles.addedModal
              }
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className={
                  styles.close
                }
                onClick={() =>
                  setAdded(
                    false
                  )
                }
                aria-label="닫기"
              >
                ×
              </button>


              <h2>
                ✓ 장바구니에 상품을
                담았습니다.
              </h2>


              <p>
                {
                  product.name
                }

                {" · "}

                {
                  selectedOption.label
                }

                {" · "}

                {quantity}개
              </p>


              <hr />


              <b>
                함께 준비하면 좋은 상품
              </b>


              <div
                className={
                  styles.miniProducts
                }
              >
                {products
                  .filter(
                    (
                      item
                    ) =>
                      item.id !==
                      product.id
                  )
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.id
                        }
                      >
                        <div
                          className={
                            styles.miniVisual
                          }
                        />


                        <small>
                          {
                            item.category
                          }
                        </small>


                        <span>
                          {
                            item.name
                          }
                        </span>
                      </div>
                    )
                  )}
              </div>


              <div
                className={
                  styles.modalActions
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setAdded(
                      false
                    )
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