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

import productMain01 from "../assets/images/detail/1_1.png";
import productSub01 from "../assets/images/detail/1_2.png";
import productDetail01 from "../assets/images/detail/1.png";

import styles from "./Shop.module.scss";


/* =========================================================
   PRODUCT IMAGE MAP
========================================================= */

const productImageMap = {
  P001: {
    gallery: [
      productMain01,
      productSub01,
    ],

    detail: [
      productDetail01,
    ],
  },
};


/* =========================================================
   OPTIONS
========================================================= */

const PRODUCT_OPTIONS = [
  {
    id: "standard",
    label: "기본 / Standard",
    extraPrice: 0,
  },

  {
    id: "gift",
    label:
      "선물 포장 / Gift Wrap",
    extraPrice: 2500,
  },
];


export default function ProductDetailPage() {
  const { productId } =
    useParams();

  const navigate =
    useNavigate();

  const product =
    products.find(
      (item) =>
        item.id === productId
    );

  const {
    addToCart,
  } = useShop();


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


  /*
    ★ Gift Wrap 비용은
    수량과 관계없이 딱 한 번
  */
  const giftWrapFee =
    selectedOption?.id ===
    "gift"
      ? 2500
      : 0;


  const productTotal =
    product.price *
    quantity;


  const total =
    productTotal +
    giftWrapFee;


  const hasGallery =
    galleryImages.length > 0;


  const currentImage =
    hasGallery
      ? galleryImages[
          activeImage
        ]
      : null;


  const goPrevious =
    () => {
      if (!hasGallery) {
        return;
      }

      setActiveImage(
        (prev) =>
          prev === 0
            ? galleryImages.length -
              1
            : prev - 1
      );
    };


  const goNext =
    () => {
      if (!hasGallery) {
        return;
      }

      setActiveImage(
        (prev) =>
          prev ===
          galleryImages.length -
            1
            ? 0
            : prev + 1
      );
    };


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


  const handleAddToCart =
    () => {
      if (!checkOption()) {
        return;
      }


      /*
        ★ 옵션까지 같이 저장
      */
      addToCart(
        product,
        quantity,
        selectedOption
      );


      setAdded(true);
    };


  const handleBuyNow =
    () => {
      if (!checkOption()) {
        return;
      }

      setPurchaseConfirmOpen(
        true
      );
    };


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
        장바구니 선택구매 데이터가
        남아있지 않게 제거
      */
      sessionStorage.removeItem(
        "checkoutSelection"
      );


      /*
        바로구매는 장바구니에
        억지로 추가하지 않고
        directPurchase만 저장
      */
      sessionStorage.setItem(
        "directPurchase",
        JSON.stringify({
          productId:
            product.id,

          name:
            product.name,

          category:
            product.category,

          image:
            galleryImages[0] ||
            product.image ||
            "",

          price:
            product.price,

          quantity,

          option:
            selectedOption,

          giftWrapFee,

          total,
        })
      );


      setPurchaseConfirmOpen(
        false
      );


      navigate(
        "/checkout"
      );
    };


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
        {/* GALLERY */}

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


                {galleryImages.length >
                  1 && (
                  <>
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
                            aria-label={`${
                              index + 1
                            }번 상품 이미지 보기`}
                          />
                        )
                      )}
                    </div>


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


        {/* PRODUCT INFO */}

        <section
          className={
            styles.detailInfo
          }
        >
          <small>
            {product.category}
            {" · "}
            TRAVEL ESSENTIALS
          </small>


          <h1>
            {product.name}
          </h1>


          <strong>
            {product.price.toLocaleString()}{" "}

            <em>
              KRW
            </em>
          </strong>


          <p>
            {product.desc}

            <br />

            {product.merit}
          </p>


          <hr />


          {/* OPTION */}

          <label>
            OPTION
          </label>


          <div
            className={
              styles.options
            }
          >
            {PRODUCT_OPTIONS.map(
              (option) => {
                const isSelected =
                  selectedOption
                    ?.id ===
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
                      setSelectedOption(
                        option
                      )
                    }
                  >
                    {
                      option.label
                    }

                    {option.extraPrice >
                      0 &&
                      ` · +${option.extraPrice.toLocaleString()} KRW`}
                  </button>
                );
              }
            )}
          </div>


          {/* QUANTITY */}

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
                  (prev) =>
                    Math.max(
                      1,
                      prev - 1
                    )
                )
              }
              aria-label="수량 줄이기"
            >
              -
            </button>


            <b>
              {quantity}
            </b>


            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (prev) =>
                    prev + 1
                )
              }
              aria-label="수량 늘리기"
            >
              +
            </button>
          </div>


          <hr />


          {/* TOTAL */}

          <label>
            TOTAL
          </label>


          <strong>
            {total.toLocaleString()}{" "}

            <em>
              KRW
            </em>
          </strong>


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
          PRODUCT DETAIL IMAGES
          ★ 이걸 먼저 보여줌
      =================================================== */}

      {detailImages.length > 0 && (
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
                    alt={`${product.name} 상세 이미지 ${
                      index + 1
                    }`}
                    loading="lazy"
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}


      {/* ===================================================
          PRODUCT INFORMATION
          ★ PRODUCT DETAIL 다음에
          01 → 02 → 03 순서로 표시
      =================================================== */}

      <section
        className={
          styles.productAccordion
        }
      >
        {/* =================================================
            01 PRODUCT STORY
        ================================================= */}

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
              {product.desc}
            </p>
          </div>
        </details>


        {/* =================================================
            02 DETAIL
        ================================================= */}

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
              {product.merit}
            </p>
          </div>
        </details>


        {/* =================================================
            03 DELIVERY
        ================================================= */}

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
              {product.category === "세트 상품" ||
              product.id?.startsWith("S") ? (
                <>
                  9월 11일 출고 시작
                  <br />
                  세트 상품은 준비되는 순서대로
                  순차 출고됩니다.
                </>
              ) : (
                <>
                  결제 완료 후 평균 2-3일
                  이내 출고됩니다.
                  <br />
                  지역 및 배송 상황에 따라
                  배송 일정이 달라질 수 있습니다.
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
                {product.name}
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
                    "gift" &&
                    " · +2,500 KRW"}
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
          ADDED TO CART
      =================================================== */}

      {added &&
        selectedOption && (
          <div
            className={
              styles.modalBackdrop
            }
            onClick={() =>
              setAdded(false)
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
                  setAdded(false)
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
                {product.name}
                {" · "}
                {
                  selectedOption.label
                }

                {selectedOption.id ===
                  "gift" &&
                  " (+2,500 KRW)"}

                {" · "}
                {quantity}개
              </p>


              <hr />


              <b>
                함께 준비하면 좋은
                상품
              </b>


              <div
                className={
                  styles.miniProducts
                }
              >
                {products
                  .filter(
                    (item) =>
                      item.id !==
                      product.id
                  )
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (item) => (
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