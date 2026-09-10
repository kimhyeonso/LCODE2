import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import savedPlanStyles from "./SavedPlan.module.scss";
import MypageBackLink from "../components/MypageBackLink";

import { useShop } from "../hooks/useShop";
import { enrichShopProduct } from "../utils/shopProductResolver";
import products from "../data/products.json";


/* =========================================================
   PRODUCT OPTIONS
========================================================= */

const PRODUCT_OPTIONS = [
  {
    id: "standard",
    label: "기본 / Standard",
    extraPrice: 0,
  },

  {
    id: "gift",
    label: "선물 포장 / Gift Wrap",
    extraPrice: 2500,
  },
];


/* =========================================================
   PRODUCT IMAGE AUTO LOAD

   src/assets/images/detail/

   일반 상품 예시
   P001
   ├─ 1_1.png
   ├─ 1_2.png
   └─ 1.png

   P002
   ├─ 2_1.png
   ├─ 2_2.png
   └─ 2.png

   세트 상품 예시
   S001
   ├─ S1_1.png
   ├─ S1_2.png
   └─ S1.png

   또는
   S001_1.png
   S001_2.png
   S001.png

   둘 다 인식
========================================================= */

const PRODUCT_IMAGE_MODULES =
  import.meta.glob(
    "../assets/images/detail/*.{png,jpg,jpeg,webp}",
    {
      eager: true,
      import: "default",
    }
  );


/* =========================================================
   IMAGE FILE MAP
========================================================= */

const PRODUCT_IMAGE_FILES =
  Object.entries(
    PRODUCT_IMAGE_MODULES
  ).reduce(
    (
      result,
      [
        path,
        src,
      ]
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


/* =========================================================
   PRODUCT CATALOG / IMAGE NUMBER

   중요:
   상세페이지(ProductDetailPage.jsx)와 똑같이
   products.json의 "배열 순서"를 이미지 번호로 사용합니다.

   예)
   products[0] → 1_1.png
   products[1] → 2_1.png
   ...

   상품 ID는 P006 다음 P009처럼 중간 번호가 비어 있기 때문에
   P009 → 9_1.png 식으로 찾으면 이미지가 다른 상품과 엇갈립니다.
========================================================= */

const PRODUCT_CATALOG =
  new Map(
    products.map(
      (
        product,
        index
      ) => [
        product.id,
        {
          ...product,
          imageNumber:
            index + 1,
        },
      ]
    )
  );


/* =========================================================
   IMAGE FILE FIND
========================================================= */

function findImageFileByNumber(
  imageNumber
) {
  if (!imageNumber) {
    return "";
  }


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
    const candidates = [
      `${imageNumber}_1.${extension}`,
      `${imageNumber}_2.${extension}`,
      `${imageNumber}.${extension}`,
    ];


    for (
      const fileName
      of candidates
    ) {
      if (
        PRODUCT_IMAGE_FILES[
          fileName
        ]
      ) {
        return (
          PRODUCT_IMAGE_FILES[
            fileName
          ]
        );
      }
    }
  }


  return "";
}


function findProductImage(
  productId
) {
  const catalogProduct =
    PRODUCT_CATALOG.get(
      productId
    );


  if (!catalogProduct) {
    return "";
  }


  return findImageFileByNumber(
    catalogProduct.imageNumber
  );
}


/* =========================================================
   CART ITEM NORMALIZE

   장바구니가 localStorage 등에 오래 남아 있어도
   현재 products.json의 상품명/카테고리/이미지를 다시 연결합니다.

   단, 수량 / 선택 옵션 / 옵션별 가격 / 커스텀 정보처럼
   실제 장바구니에서 선택한 값은 기존 item 값을 유지합니다.
========================================================= */

function normalizeCartItem(
  item
) {
  const enriched =
    enrichShopProduct(item);

  const catalogProduct =
    PRODUCT_CATALOG.get(
      enriched?.id
    ) || null;

  const currentImage =
    enriched?.thumbnail ||
    enriched?.image ||
    findProductImage(
      enriched?.id
    ) ||
    item?.thumbnail ||
    item?.image ||
    catalogProduct?.image ||
    "";

  const currentPrice =
    Number.isFinite(
      Number(item?.price)
    )
      ? Number(item.price)
      : Number(
          enriched?.price ||
          catalogProduct?.price ||
          0
        );

  return {
    ...(catalogProduct || {}),
    ...enriched,
    ...(item || {}),

    id:
      enriched?.id ||
      item?.id ||
      item?.productId ||
      catalogProduct?.id ||
      "",

    productId:
      enriched?.id ||
      item?.productId ||
      item?.id ||
      catalogProduct?.id ||
      "",

    name:
      enriched?.name ||
      item?.name ||
      item?.productName ||
      item?.title ||
      catalogProduct?.name ||
      "상품",

    category:
      enriched?.category ||
      item?.category ||
      item?.productCategory ||
      catalogProduct?.category ||
      "",

    price:
      currentPrice,

    image:
      currentImage,

    thumbnail:
      currentImage,
  };
}


/* =========================================================
   DELIVERY
========================================================= */

function isSetProduct(
  item
) {
  return (
    item?.category ===
      "세트 상품" ||
    item?.id?.startsWith(
      "S"
    )
  );
}


function getDeliveryInfo(
  item
) {
  if (
    isSetProduct(item)
  ) {
    return {
      type: "PRE-ORDER",

      text:
        "9월 11일 출고 시작",

      detail:
        "세트 상품은 준비되는 순서대로 순차 출고됩니다.",
    };
  }


  return {
    type: "DELIVERY",

    text:
      "결제 완료 후 평균 2–3일 이내 출고됩니다.",

    detail:
      "지역 및 배송 상황에 따라 일정이 달라질 수 있습니다.",
  };
}


/* =========================================================
   CART
========================================================= */

export default function Cart() {
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useShop();


  /* =======================================================
     NORMALIZED CART

     현재 상품 데이터와 장바구니 저장 데이터를 매번 다시 연결해서
     상품명 / 카테고리 / 이미지 누락을 막습니다.
  ======================================================= */

  const normalizedCart =
    useMemo(
      () =>
        cart.map(
          normalizeCartItem
        ),
      [cart]
    );


  /* =======================================================
     RIGHT SUMMARY FOLLOW
  ======================================================= */

  const cartListRef = useRef(null);

  const summaryRailRef =
    useRef(null);

  const summaryBoxRef =
    useRef(null);

  const scrollFrameRef =
    useRef(null);


  /* =======================================================
     SELECTED

     Cart 처음 진입 시
     전체 상품 선택
  ======================================================= */

  const [
    selected,
    setSelected,
  ] = useState(
    () =>
      cart.map(
        (item) =>
          item.lineId
      )
  );


  /* =======================================================
     OPTION
  ======================================================= */

  const [
    editingLineId,
    setEditingLineId,
  ] = useState(null);

  const [draftOptionId, setDraftOptionId] = useState("standard");
  const optionDialogRef = useRef(null);
  const editingItem = normalizedCart.find((item) => item.lineId === editingLineId);

  const isOptionModalOpen = Boolean(editingItem);

  useEffect(() => {
    const dialog = optionDialogRef.current;
    if (!dialog || !isOptionModalOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOptionModalOpen]);


  /* =======================================================
     CART CHANGE
  ======================================================= */

  useEffect(() => {
    setSelected(
      (previous) =>
        previous.filter(
          (lineId) =>
            cart.some(
              (item) =>
                item.lineId ===
                lineId
            )
        )
    );
  }, [cart]);


  /* =======================================================
     CHOSEN
  ======================================================= */

  const chosen =
    useMemo(
      () =>
        normalizedCart.filter(
          (item) =>
            selected.includes(
              item.lineId
            )
        ),
      [
        normalizedCart,
        selected,
      ]
    );


  const allSelected =
    cart.length > 0 &&
    chosen.length ===
      cart.length;


  /* =======================================================
     PRICE
  ======================================================= */

  const subtotal =
    useMemo(
      () =>
        chosen.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.price
            ) *
              Number(
                item.quantity
              ),
          0
        ),
      [chosen]
    );


  /*
    선물 포장 상품이
    하나라도 선택되어 있으면

    수량 / 상품 종류와 관계없이
    주문 전체 +2,500원 딱 한 번
  */

  const hasGiftWrap =
    useMemo(
      () =>
        chosen.some(
          (item) =>
            item.option?.id ===
            "gift"
        ),
      [chosen]
    );


  const giftWrapFee =
    hasGiftWrap
      ? 2500
      : 0;


  const shipping =
    chosen.length > 0
      ? 3000
      : 0;


  const total =
    subtotal +
    giftWrapFee +
    shipping;


  /* =======================================================
     RIGHT SUMMARY SCROLL

     Checkout 결제금액과 동일한 방식

     1. 처음에는 원래 위치
     2. 스크롤하면 우측 고정
     3. Cart 왼쪽 내용 끝에 닿으면 멈춤
     4. Footer 침범 안 함
  ======================================================= */

  useEffect(() => {
    const rail =
      summaryRailRef.current;

    const box =
      summaryBoxRef.current;
    const list = cartListRef.current;


    if (
      !rail ||
      !box
    ) {
      return;
    }


    const TOP_GAP = 24;


    const resetBox =
      () => {
        box.style.position =
          "absolute";

        box.style.top =
          "0px";

        box.style.bottom =
          "auto";

        box.style.left =
          "0px";

        box.style.width =
          "100%";

        box.style.zIndex =
          "20";
      };


    const updatePosition =
      () => {
        /*
          모바일에서는 고정 X
        */

        if (
          window.innerWidth <=
          850
        ) {
          rail.style.minHeight = "";
          resetBox();

          return;
        }


        /*
          Summary가 rail보다
          높을 때도 레이아웃 유지
        */

        rail.style.minHeight =
          `${box.offsetHeight}px`;


        const railRect =
          rail.getBoundingClientRect();


        const boxHeight =
          box.offsetHeight;


        /*
          아직 Summary 원래 위치가
          화면 위에 닿지 않았음
        */

        if (
          railRect.top >
          TOP_GAP
        ) {
          resetBox();

          return;
        }


        // Stop at the product list's bottom border, not the stretched grid rail.
        const listBottom = list?.getBoundingClientRect().bottom ?? railRect.bottom;
        const stopTop = Math.max(0, listBottom - railRect.top - boxHeight);
        const shouldStop = railRect.top + stopTop <= TOP_GAP;

        if (shouldStop) {
          box.style.position = "absolute";
          box.style.top = `${stopTop}px`;
          box.style.bottom = "auto";
          box.style.left = "0px";
          box.style.width = "100%";
          box.style.zIndex = "20";
          return;
        }


        /*
          스크롤 따라오기
        */

        box.style.position =
          "fixed";

        box.style.top =
          `${TOP_GAP}px`;

        box.style.bottom =
          "auto";

        box.style.left =
          `${railRect.left}px`;

        box.style.width =
          `${railRect.width}px`;

        box.style.zIndex =
          "30";
      };


    const handleScroll =
      () => {
        if (
          scrollFrameRef.current
        ) {
          cancelAnimationFrame(
            scrollFrameRef.current
          );
        }


        scrollFrameRef.current =
          requestAnimationFrame(
            updatePosition
          );
      };


    updatePosition();


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    window.addEventListener(
      "resize",
      handleScroll
    );


    /*
      Summary 높이가
      옵션/포장비 등에 따라 바뀌어도
      위치 다시 계산
    */

    let resizeObserver =
      null;


    if (
      typeof ResizeObserver !==
      "undefined"
    ) {
      resizeObserver =
        new ResizeObserver(
          () => {
            handleScroll();
          }
        );


      resizeObserver.observe(box);
      if (list) resizeObserver.observe(list);
    }


    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );


      window.removeEventListener(
        "resize",
        handleScroll
      );


      resizeObserver?.disconnect();


      if (
        scrollFrameRef.current
      ) {
        cancelAnimationFrame(
          scrollFrameRef.current
        );
      }
    };
  }, []);


  /*
    상품 선택 / 금액 변경 시
    오른쪽 박스 위치 재계산
  */

  useEffect(() => {
    window.dispatchEvent(
      new Event(
        "resize"
      )
    );
  }, [
    chosen.length,
    giftWrapFee,
    total,
  ]);


  /* =======================================================
     SELECT ALL
  ======================================================= */

  const handleSelectAll =
    () => {
      if (allSelected) {
        setSelected([]);

        return;
      }


      setSelected(
        cart.map(
          (item) =>
            item.lineId
        )
      );
    };


  /* =======================================================
     SELECT ONE
  ======================================================= */

  const handleSelectOne = (
    lineId
  ) => {
    setSelected(
      (previous) =>
        previous.includes(
          lineId
        )
          ? previous.filter(
              (id) =>
                id !==
                lineId
            )
          : [
              ...previous,
              lineId,
            ]
    );
  };


  /* =======================================================
     DELETE SELECTED
  ======================================================= */

  const handleDeleteSelected =
    () => {
      if (
        chosen.length ===
        0
      ) {
        window.alert(
          "삭제할 상품을 선택해주세요."
        );

        return;
      }


      chosen.forEach(
        (item) =>
          removeFromCart(
            item.lineId
          )
      );


      setSelected([]);

      setEditingLineId(
        null
      );
    };


  /* =======================================================
     DELETE ALL
  ======================================================= */

  const handleDeleteAll =
    () => {
      if (
        cart.length ===
        0
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "장바구니 상품을 모두 삭제하시겠습니까?"
        );


      if (!confirmed) {
        return;
      }


      cart.forEach(
        (item) =>
          removeFromCart(
            item.lineId
          )
      );


      setSelected([]);

      setEditingLineId(
        null
      );
    };


  /* =======================================================
     OPTION CHANGE
  ======================================================= */

  const handleOptionChange = (
    item,
    nextOption
  ) => {
    const currentOptionId =
      item.option?.id ||
      "standard";


    if (
      currentOptionId ===
      nextOption.id
    ) {
      setEditingLineId(
        null
      );

      return;
    }


    const oldLineId =
      item.lineId;


    const newLineId =
      `${item.id}__${nextOption.id}`;


    const wasSelected =
      selected.includes(
        oldLineId
      );


    /*
      기존 줄 삭제
    */

    removeFromCart(
      oldLineId
    );


    /*
      새로운 옵션으로
      같은 수량 다시 추가
    */

    addToCart(
      item,
      item.quantity,
      nextOption
    );


    /*
      선택 상태도 새 lineId로 이동
    */

    setSelected(
      (previous) => {
        const withoutOld =
          previous.filter(
            (id) =>
              id !==
              oldLineId
          );


        if (!wasSelected) {
          return withoutOld;
        }


        return Array.from(
          new Set([
            ...withoutOld,
            newLineId,
          ])
        );
      }
    );


    setEditingLineId(
      null
    );
  };


  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout = (
    event
  ) => {
    if (
      chosen.length ===
      0
    ) {
      event.preventDefault();


      window.alert(
        "구매할 상품을 선택해주세요."
      );


      return;
    }


    sessionStorage.removeItem(
      "directPurchase"
    );


    sessionStorage.setItem(
      "checkoutSelection",
      JSON.stringify(
        chosen
      )
    );
  };


  /* =======================================================
     CART CSS
  ======================================================= */

  const cartStyle = `
    /* =====================================================
       CART PAGE
    ===================================================== */

    .lcode-cart {
      --cart-min-font-size: 14px;
      --cart-divider-spacing: 18px;
      font-family: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      width:
        calc(
          100% - 220px
        );

      max-width:
        calc(
          100% - 220px
        );

      min-height:
        100vh;

      margin-left:
        220px;

      color:
        #11110f;

      background:
        #f8f5ef;

      box-sizing:
        border-box;
    }


    /* =====================================================
       FRAME

       Checkout과 같은 여백
       오른쪽 구매금액 330px 유지
    ===================================================== */

    .lcode-cartFrame {
      width:
        min(
          1320px,
          calc(
            100% - 112px
          )
        );

      min-height:
        100vh;

      margin-inline:
        auto;

      padding:
        52px
        0
        0;

      display:
        grid;

      grid-template-columns:
        minmax(
          0,
          1fr
        )
        330px;

      align-items:
        stretch;

      gap:
        56px;

      box-sizing:
        border-box;

      overflow:
        visible;
    }


    /* =====================================================
       LEFT
    ===================================================== */

    .lcode-cartHeader {
      grid-column: 1 / -1;
      min-width: 0;
      padding-bottom: 28px;
    }

    .lcode-cartHeader [data-mypage-back] {
      font-size: max(13px, var(--cart-min-font-size)) !important;
    }

    .lcode-cartMain {
      min-width:
        0;
    }


    .lcode-cartEyebrow {
      display: block;
      margin: 0 0 25px;
      padding: 0;
      color: #aaa;
      font-size: max(13px, var(--cart-min-font-size));
      font-weight: 400;
      line-height: normal;
      letter-spacing: 0.16em;
    }

    .lcode-cartTitle {
      display: block;
      width: 100%;
      margin: 0 0 18px;
      padding: 0 0 var(--cart-divider-spacing);
      border-bottom: 1px solid #cec7bb;
      color: #171714;
      font-family: "DM Serif Display", "Noto Sans KR", serif;
      font-size: 54px;
      font-weight: 400;
      line-height: 1.08;
      letter-spacing: -0.05em;
    }


    /* =====================================================
       BENEFIT
    ===================================================== */

    .lcode-cartBenefit {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        24px;

      min-height:
        58px;

      margin-bottom:
        16px;

      padding:
        12px
        18px;

      border:
        1px solid
        #d8d3ca;

      background:
        rgba(
          255,
          255,
          255,
          0.25
        );

      box-sizing:
        border-box;
    }


    .lcode-cartBenefit > div {
      display:
        flex;

      align-items:
        center;

      gap:
        12px;
    }


    .lcode-cartBenefitMark {
      display:
        grid;

      place-items:
        center;

      width:
        40px;

      height:
        40px;

      flex:
        0 0 auto;

      border:
        1px solid
        #11110f;

      font-family:
        "DM Serif Display",
        "Noto Sans KR",
        serif;

      font-size:
        22px;
    }


    .lcode-cartBenefit b {
      display:
        block;

      margin-bottom:
        4px;

      font-size:
        16px;
    }


    .lcode-cartBenefit small {
      color:
        #77736c;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartBenefit > span {
      flex-shrink: 0;
      white-space: nowrap;
      line-height: 1;
      color:
        #77736c;

      font-size:
        12px;

      letter-spacing:
        0.04em;
    }


    @media (max-width: 640px) {
      .lcode-cartBenefit b { font-size: 14px; }
      .lcode-cartBenefitMark {
        width: 36px;
        height: 36px;
        font-size: 20px;
      }
      .lcode-cartBenefit > span { font-size: 11px; }
    }

    /* =====================================================
       TOOLS
    ===================================================== */

    .lcode-cartTools {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      min-height:
        58px;

      padding:
        0
        2px;

      border-top:
        1px solid
        #d8d3ca;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-cartSelectAll {
      display:
        flex;

      align-items:
        center;

      gap:
        9px;

      cursor:
        pointer;

      font-size:
        max(12px, var(--cart-min-font-size));
    }


    .lcode-cartSelectAll input,
    .lcode-cartItemCheck {
      width:
        15px;

      height:
        15px;

      margin:
        0;

      accent-color:
        #11110f;

      cursor:
        pointer;
    }


    .lcode-cartSelectAll small {
      color:
        #858078;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartToolActions {
      display:
        flex;

      align-items:
        center;

      gap:
        16px;
    }


    .lcode-cartToolActions button {
      padding:
        0;

      border:
        0;

      color:
        #77736c;

      background:
        transparent;

      cursor:
        pointer;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartToolActions button:hover {
      color:
        #11110f;
    }


    /* =====================================================
       ITEM
    ===================================================== */

    .lcode-cartItem {
      position:
        relative;

      padding:
        26px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-cartItemMain {
      display:
        grid;

      grid-template-columns:
        18px
        116px
        minmax(
          0,
          1fr
        )
        auto
        26px;

      align-items:
        center;

      gap:
        18px;
    }


    /* =====================================================
       IMAGE
    ===================================================== */

    .lcode-cartVisual {
      width:
        116px;

      height:
        116px;

      display:
        grid;

      place-items:
        center;

      overflow:
        hidden;

      background:
        #cccccc;

      text-decoration:
        none;
    }


    .lcode-cartVisual img {
      display:
        block;

      width:
        100%;

      height:
        100%;

      object-fit:
        cover;

      transition:
        transform
        0.45s
        ease;
    }


    .lcode-cartVisual:hover img {
      transform:
        scale(
          1.035
        );
    }


    .lcode-cartVisual span {
      color:
        rgba(
          255,
          255,
          255,
          0.5
        );

      font-family:
        "DM Serif Display",
        "Noto Sans KR",
        serif;

      font-size:
        44px;
    }


    /* =====================================================
       INFO
    ===================================================== */

    .lcode-cartInfo {
      min-width:
        0;
    }


    .lcode-cartCategory {
      display:
        block;

      margin-bottom:
        8px;

      color:
        #858078;

      font-size:
        max(10px, var(--cart-min-font-size));

      letter-spacing:
        0.14em;
    }


    .lcode-cartInfo h3 {
      margin:
        0
        0
        8px;

      font-family:
        "DM Serif Display",
        "Noto Sans KR",
        serif;

      font-size:
        19px;

      font-weight:
        500;
    }


    .lcode-cartInfo h3 a {
      color:
        #11110f;

      text-decoration:
        none;
    }


    .lcode-cartOptionText {
      margin:
        0;

      color:
        #77736c;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartGift {
      margin-left:
        7px;

      color:
        #11110f;

      font-weight:
        600;
    }


    /* =====================================================
       CONTROLS
    ===================================================== */

    .lcode-cartItemControls {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;

      margin-top:
        16px;
    }


    .lcode-cartQuantity {
      display:
        inline-grid;

      grid-template-columns:
        34px
        42px
        34px;

      height:
        36px;

      border:
        1px solid
        #d8d3ca;
    }


    .lcode-cartQuantity button {
      border:
        0;

      color:
        #11110f;

      background:
        transparent;

      cursor:
        pointer;

      font-size:
        max(13px, var(--cart-min-font-size));
    }


    .lcode-cartQuantity button:hover {
      background:
        rgba(
          17,
          17,
          15,
          0.06
        );
    }


    .lcode-cartQuantity b {
      display:
        grid;

      place-items:
        center;

      font-size:
        max(11px, var(--cart-min-font-size));

      font-weight:
        500;
    }


    .lcode-cartOptionChange {
      min-height:
        36px;

      padding:
        0
        14px;

      border:
        1px solid
        #d8d3ca;

      color:
        #11110f;

      background:
        transparent;

      cursor:
        pointer;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartOptionChange:hover {
      border-color:
        #11110f;
    }


    /* =====================================================
       PRICE
    ===================================================== */

    .lcode-cartPrice {
      min-width:
        138px;

      text-align:
        right;

      white-space:
        nowrap;

      font-family:
        "DM Serif Display",
        "Noto Sans KR",
        serif;

      font-size:
        18px;

      font-weight:
        500;
    }


    /* =====================================================
       REMOVE
    ===================================================== */

    .lcode-cartRemove {
      width:
        26px;

      height:
        34px;

      padding:
        0;

      border:
        0;

      color:
        #8b867e;

      background:
        transparent;

      cursor:
        pointer;

      font-size:
        25px;
    }


    .lcode-cartRemove:hover {
      color:
        #11110f;
    }


    /* =====================================================
       DELIVERY

       일반 / KIT 구분
    ===================================================== */

    .lcode-cartDelivery {
      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        8px;

      margin:
        16px
        44px
        0
        152px;

      min-height:
        34px;

      padding:
        7px
        12px;

      color:
        #77736c;

      background:
        rgba(
          17,
          17,
          15,
          0.035
        );

      font-size:
        var(--cart-min-font-size);

      text-align:
        center;
    }


    .lcode-cartDelivery b {
      color:
        #11110f;

      font-size:
        var(--cart-min-font-size);

      font-weight:
        600;

      letter-spacing:
        0.1em;
    }


    .lcode-cartDelivery span,
    .lcode-cartDelivery small {
      font-size: var(--cart-min-font-size);
    }

    @media (max-width: 640px) {
      .lcode-cartDelivery {
        row-gap: 3px;
        line-height: 1.35;
      }
    }

    .lcode-cartDelivery.preorder {
      background:
        rgba(
          17,
          17,
          15,
          0.075
        );
    }


    .lcode-cartDelivery.preorder span {
      color:
        #11110f;

      font-weight:
        600;
    }


    /* =====================================================
       OPTION PANEL
    ===================================================== */

    .lcode-cartOptionChoices {
      display:
        grid;

      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );

      gap:
        8px;
    }


    .lcode-cartOptionChoices button {
      min-height:
        46px;

      padding:
        10px
        13px;

      border:
        1px solid
        #d8d3ca;

      color:
        #11110f;

      background:
        transparent;

      cursor:
        pointer;

      text-align:
        left;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    .lcode-cartOptionChoices button:hover {
      border-color:
        #11110f;
    }


    .lcode-cartOptionChoices button.is-active {
      border-color:
        #11110f;

      color:
        #fff;

      background:
        #11110f;
    }


    .lcode-cartOptionChoices button small {
      display:
        block;

      margin-top:
        4px;

      color:
        inherit;

      opacity:
        0.65;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    /* =====================================================
       EMPTY
    ===================================================== */

    .lcode-cartEmpty {
      display:
        grid;

      place-items:
        center;

      min-height:
        340px;

      border-bottom:
        1px solid
        #d8d3ca;

      text-align:
        center;
    }


    .lcode-cartEmpty b {
      display:
        block;

      margin-bottom:
        9px;

      font-family:
        "DM Serif Display",
        "Noto Sans KR",
        serif;

      font-size:
        25px;

      font-weight:
        500;
    }


    .lcode-cartEmpty p {
      margin:
        0
        0
        22px;

      color:
        #77736c;

      font-size:
        max(11px, var(--cart-min-font-size));
    }


    .lcode-cartEmpty a {
      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      min-width:
        150px;

      min-height:
        44px;

      color:
        #fff;

      background:
        #11110f;

      text-decoration:
        none;

      font-size:
        max(10px, var(--cart-min-font-size));
    }


    /* =====================================================
       RIGHT RAIL

       ★ Checkout처럼
       JS가 fixed / absolute를 제어
    ===================================================== */

    .lcode-cartSummaryRail {
      position:
        relative;

      width:
        330px;

      min-width:
        330px;

      align-self:
        stretch;

      box-sizing:
        border-box;
    }


    .lcode-cartSummary {
      position:
        absolute;

      top:
        0;

      left:
        0;

      width:
        330px;

      padding: 0 32px 40px;

      border-top: 0;

      border-bottom: 0;

      background: #fbf9f4;

      backdrop-filter: none;

      box-sizing:
        border-box;
      border-right: 1px solid #e5e5e5;
      color: #222;
    }


    .lcode-cartSummary h2 {
      margin: 0;

      font-family: inherit;

      font-size: 21px;

      font-weight: 700;
      padding: 20px 0;
      min-height: 74px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #d9d9d9;
      line-height: 1.5;
    }


    /* =====================================================
       SUMMARY COUNT
    ===================================================== */

    .lcode-cartSummaryCount {
      display:
        flex;

      justify-content:
        space-between;

      gap:
        15px;

      padding-bottom:
        21px;

      border-bottom: 0;

      color: #888;

      font-size:
        max(10px, var(--cart-min-font-size));
      padding: 26px 0 18px;
    }


    .lcode-cartSummaryCount b {
      color:
        #11110f;

      font-size:
        max(11px, var(--cart-min-font-size));

      font-weight:
        500;
    }


    /* =====================================================
       SUMMARY ROWS
    ===================================================== */

    .lcode-cartSummaryRows {
      padding: 0 0 20px;

      border-bottom: 1px solid #e2e2e2;
    }


    .lcode-cartSummaryRow {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      padding: 9px 0;

      color: #888;

      font-size:
        max(11px, var(--cart-min-font-size));
    }


    .lcode-cartSummaryRow b {
      color: #222;

      font-size:
        max(12px, var(--cart-min-font-size));

      font-weight: 600;
    }


    /* =====================================================
       TOTAL
    ===================================================== */

    .lcode-cartTotal {
      display:
        flex;

      align-items: center;

      justify-content:
        space-between;

      gap:
        18px;

      padding: 26px 0 20px;

      border-bottom: 1px solid #e2e2e2;
      flex-wrap: wrap;
    }


    .lcode-cartTotal > span {
      font-size:
        max(13px, var(--cart-min-font-size));

      font-weight:
        700;
    }


    .lcode-cartTotal strong {
      text-align:
        right;

      white-space:
        nowrap;

      font-family: inherit;

      font-size: 21px;

      font-weight: 600;
      color: #222;
    }


    .lcode-cartTotal strong small {
      margin-left:
        5px;

      font-family:
        inherit;

      font-size:
        max(10px, var(--cart-min-font-size));

      font-weight:
        400;
    }


    /* =====================================================
       COUPON
    ===================================================== */

    .lcode-cartExpectedBenefit {
      padding: 26px 0 20px;

      border-bottom: 1px solid #e2e2e2;
    }


    .lcode-cartExpectedBenefit > span {
      display:
        block;

      margin-bottom: 18px;

      color: #aaa;

      font-size:
        max(10px, var(--cart-min-font-size));

      letter-spacing: 2px;
    }


    .lcode-cartExpectedBenefit p {
      display:
        flex;

      justify-content:
        space-between;

      gap:
        15px;

      margin:
        0;

      color: #888;

      font-size:
        max(10px, var(--cart-min-font-size));
      flex-wrap: wrap;
      row-gap: 8px;
    }


    .lcode-cartExpectedBenefit p b {
      color:
        #11110f;

      font-size:
        max(10px, var(--cart-min-font-size));

      font-weight:
        500;
    }


    /* =====================================================
       BUY
    ===================================================== */

    .lcode-cartBuy {
      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      width:
        100%;

      min-height:
        56px;

      margin-top:
        26px;

      color:
        #fff;

      background:
        #11110f;

      text-decoration:
        none;

      font-size:
        max(11px, var(--cart-min-font-size));

      font-weight:
        700;

      transition:
        opacity
        0.2s
        ease;
    }


    .lcode-cartBuy:hover {
      opacity:
        0.82;
    }


    .lcode-cartBuy.is-disabled {
      opacity:
        0.35;
    }


    .lcode-cartSummaryNotice {
      margin: 18px 0 0;

      color: #aaa;

      text-align:
        center;

      font-size:
        max(10px, var(--cart-min-font-size));

      line-height: 1.6;
    }


    /* =====================================================
       TABLET
    ===================================================== */

    @media (
      max-width:
        1100px
    ) {
      .lcode-cart {
        width:
          100%;

        max-width:
          100%;

        margin-left:
          0;
      }


      .lcode-cartFrame {
        width:
          calc(
            100% - 72px
          );

        grid-template-columns:
          minmax(
            0,
            1fr
          )
          300px;

        gap:
          30px;

        padding:
          46px
          0
          0;
      }


      .lcode-cartSummaryRail,
      .lcode-cartSummary {
        width:
          300px;

        min-width:
          300px;
      }


      .lcode-cartItemMain {
        grid-template-columns:
          18px
          96px
          minmax(
            0,
            1fr
          )
          auto
          24px;

        gap:
          12px;
      }


      .lcode-cartVisual {
        width:
          96px;

        height:
          96px;
      }


      .lcode-cartDelivery,
      .lcode-cartOptionPanel {
        margin-left:
          126px;
      }
    }


    /* =====================================================
       FOOTER GAP (601px - 640px)
    ===================================================== */

    @media (
      min-width:
        601px
    ) and (
      max-width:
        640px
    ) {
      .lcode-cartFrame {
        padding-bottom:
          72px;
      }
    }


    /* =====================================================
       SMALL TABLET
    ===================================================== */

    @media (
      max-width:
        850px
    ) {
      .lcode-cartFrame {
        width:
          calc(
            100% - 56px
          );

        grid-template-columns:
          1fr;

        gap:
          40px;
      }


      .lcode-cartSummaryRail {
        width:
          100%;

        min-width:
          0;

        min-height:
          580px;
      }


      .lcode-cartSummary {
        width:
          100%;
      }
    }


    @media (max-width: 640px) {
      .lcode-cart {
        --cart-min-font-size: 11px;
      }
    }

    @media (max-width: 640px) {
      .lcode-cartTitle {
        font-size: 38px;
        width: calc(100vw - 32px);
        max-width: none;
      }
    }

    /* =====================================================
       MOBILE
    ===================================================== */

    @media (
      max-width:
        600px
    ) {
      .lcode-cartFrame {
        width:
          calc(
            100% - 32px
          );

        padding:
          32px
          0
          72px;
      }




      .lcode-cartBenefit {
        align-items:
          flex-start;

        flex-direction:
          column;

        padding:
          15px;
      }


      .lcode-cartTools {
        align-items:
          flex-start;

        flex-direction:
          column;

        justify-content:
          center;

        gap:
          10px;

        padding:
          14px
          0;
      }


      .lcode-cartItemMain {
        grid-template-columns:
          18px
          78px
          minmax(
            0,
            1fr
          )
          24px;

        align-items:
          start;

        gap:
          10px;
      }


      .lcode-cartVisual {
        width:
          78px;

        height:
          78px;
      }


      .lcode-cartPrice {
        grid-column:
          3;

        min-width:
          0;

        margin-top:
          10px;

        text-align:
          left;
      }


      .lcode-cartRemove {
        grid-column:
          4;

        grid-row:
          1;
      }


      .lcode-cartItemControls {
        flex-wrap:
          wrap;
      }


      .lcode-cartDelivery,
      .lcode-cartOptionPanel {
        margin:
          14px
          0
          0
          106px;
      }


      .lcode-cartDelivery {
        align-items:
          flex-start;

        flex-direction:
          column;

        text-align:
          left;
      }


      .lcode-cartOptionChoices {
        grid-template-columns:
          1fr;
      }


      .lcode-cartTotal {
        align-items:
          flex-start;

        flex-direction:
          column;
      }
    }
    .lcode-cartFrame {
      grid-template-rows: auto 1fr;
      row-gap: 0;
    }

    .lcode-cartHeader .lcode-cartTitle {
      margin-bottom: var(--cart-divider-spacing);
    }

    .lcode-cartDescription {
      display: block;
      margin: 0;
      padding: 0;
      color: #8c857b;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.7;
      letter-spacing: normal;
    }

    @media (max-width: 850px) {
      .lcode-cartSummaryRail {
        margin-top: var(--cart-divider-spacing);
      }
    }
    @media (max-width: 640px) {
      .lcode-cartSummary {
        padding: 0 16px 28px;
      }
    }

    .lcode-cartOptionModal {
      border: 0;
      margin: auto;
      max-height: calc(100dvh - 40px);
      width: min(calc(100% - 40px), 390px);
      overflow-y: auto;
    }

    .lcode-cartOptionModal::backdrop {
      background: rgba(0, 0, 0, 0.72);
    }

    .lcode-cartOptionModal > p,
    .lcode-cartOptionModal > span {
      font-size: max(13px, var(--cart-min-font-size));
    }

    .lcode-cartModalOptions {
      border: 0;
      padding: 0;
      margin: 24px 0;
      text-align: left;
    }

    .lcode-cartModalOptions legend {
      margin-bottom: 10px;
      font-size: 14px;
    }

    .lcode-cartModalOptions label {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 12px;
      border: 1px solid #ddd;
      cursor: pointer;
      font-size: 14px;
    }

    .lcode-cartModalOptions label + label { margin-top: 8px; }
    .lcode-cartModalOptions label:has(input:checked) { border-color: #171714; }
    .lcode-cartModalOptions input { accent-color: #171714; }
    .lcode-cartModalOptions small {
      display: block;
      margin-top: 6px;
      color: #888;
      font-size: max(11px, var(--cart-min-font-size));
    }
  `;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>
        {cartStyle}
      </style>


      <main className="lcode-cart">
        <div className="lcode-cartFrame">
          {/* =================================================
              LEFT
          ================================================= */}

          <header className="lcode-cartHeader">
            <MypageBackLink />
            <span className="lcode-cartEyebrow">
              SHOP / CART
            </span>


            <h1 className="lcode-cartTitle">
              CART
            </h1>
            <p className="lcode-cartDescription">
              여행에 필요한 준비물을 확인하고 주문해보세요.
            </p>
          </header>

          <section className="lcode-cartMain">
            {/* ===============================================
                BENEFIT
            =============================================== */}

            {cart.length > 0 && (
              <div className="lcode-cartBenefit">
                <div>
                  <span className="lcode-cartBenefitMark">
                    %
                  </span>


                  <span>
                    <b>
                      장바구니 쿠폰이 준비되어 있습니다.
                    </b>

                    <small>
                      TC-0012 · 결제 단계에서 3,000 KRW 할인 가능
                    </small>
                  </span>
                </div>


                <span>
                  CHECKOUT →
                </span>
              </div>
            )}


            {/* ===============================================
                SELECT
            =============================================== */}

            <div className="lcode-cartTools">
              <label className="lcode-cartSelectAll">
                <input
                  type="checkbox"
                  checked={
                    allSelected
                  }
                  onChange={
                    handleSelectAll
                  }
                />

                전체 선택

                <small>
                  {chosen.length} / {cart.length}
                </small>
              </label>


              <div className="lcode-cartToolActions">
                <button
                  type="button"
                  onClick={
                    handleDeleteSelected
                  }
                >
                  선택 삭제
                </button>


                <button
                  type="button"
                  onClick={
                    handleDeleteAll
                  }
                >
                  전체 삭제
                </button>
              </div>
            </div>


            {/* ===============================================
                ITEMS
            =============================================== */}

            <div ref={cartListRef} className="lcode-cartList">
              {normalizedCart.map(
                (item) => {
                  const isSelected =
                    selected.includes(
                      item.lineId
                    );


                  const currentOptionId = item.option?.id || "standard";

                  const productImage =
                    item.thumbnail ||
                    item.image ||
                    findProductImage(
                      item.id
                    ) ||
                    "";


                  const delivery =
                    getDeliveryInfo(
                      item
                    );


                  const setProduct =
                    isSetProduct(
                      item
                    );


                  return (
                    <article
                      className="lcode-cartItem"
                      key={
                        item.lineId
                      }
                    >
                      <div className="lcode-cartItemMain">
                        {/* CHECK */}

                        <input
                          className="lcode-cartItemCheck"
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            handleSelectOne(
                              item.lineId
                            )
                          }
                          aria-label={`${item.name} 선택`}
                        />


                        {/* IMAGE */}

                        <Link
                          className="lcode-cartVisual"
                          to={`/shop/${item.id}`}
                        >
                          {productImage ? (
                            <img loading="lazy"
                              src={
                                productImage
                              }
                              alt={
                                item.name
                              }
                            />
                          ) : (
                            <span>
                              {item.name?.slice(
                                0,
                                1
                              )}
                            </span>
                          )}
                        </Link>


                        {/* INFO */}

                        <div className="lcode-cartInfo">
                          <small className="lcode-cartCategory">
                            {
                              item.category
                            }
                          </small>


                          <h3>
                            <Link
                              to={`/shop/${item.id}`}
                            >
                              {
                                item.name
                              }
                            </Link>
                          </h3>


                          <p className="lcode-cartOptionText">
                            {item.option?.label ||
                              "기본 / Standard"}


                            {currentOptionId ===
                              "gift" && (
                              <span className="lcode-cartGift">
                                주문 전체 +2,500 KRW
                              </span>
                            )}
                          </p>


                          <div className="lcode-cartItemControls">
                            {/* QUANTITY */}

                            <div className="lcode-cartQuantity">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.lineId,
                                    item.quantity -
                                      1
                                  )
                                }
                              >
                                −
                              </button>


                              <b>
                                {
                                  item.quantity
                                }
                              </b>


                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.lineId,
                                    item.quantity +
                                      1
                                  )
                                }
                              >
                                +
                              </button>
                            </div>


                            {/* OPTION */}

                            <button
                              type="button"
                              className="lcode-cartOptionChange"
                              aria-haspopup="dialog"
                              onClick={() => {
                                setDraftOptionId(item.option?.id || "standard");
                                setEditingLineId(item.lineId);
                              }}
                            >
                              옵션 변경
                            </button>
                          </div>
                        </div>


                        {/* PRICE */}

                        <strong className="lcode-cartPrice">
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toLocaleString()}{" "}
                          KRW
                        </strong>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="lcode-cartRemove"
                          onClick={() => {
                            removeFromCart(
                              item.lineId
                            );


                            setSelected(
                              (previous) =>
                                previous.filter(
                                  (id) =>
                                    id !==
                                    item.lineId
                                )
                            );
                          }}
                        >
                          ×
                        </button>
                      </div>


                      {/* =====================================
                          DELIVERY
                      ===================================== */}

                      <div
                        className={`lcode-cartDelivery ${
                          setProduct
                            ? "preorder"
                            : ""
                        }`}
                      >
                        <b>
                          {
                            delivery.type
                          }
                        </b>


                        <span>
                          {
                            delivery.text
                          }
                        </span>


                        {!setProduct && (
                          <small>
                            {
                              delivery.detail
                            }
                          </small>
                        )}
                      </div>


                    </article>
                  );
                }
              )}


              {/* EMPTY */}

              {cart.length === 0 && (
                <div className="lcode-cartEmpty">
                  <div>
                    <b>
                      Your cart is empty.
                    </b>


                    <p>
                      여행을 위한 아이템을 담아보세요.
                    </p>


                    <Link to="/shop">
                      SHOP 계속하기 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* =================================================
              RIGHT
          ================================================= */}

          <aside
            ref={
              summaryRailRef
            }
            className="lcode-cartSummaryRail"
          >
            <div
              ref={
                summaryBoxRef
              }
              className="lcode-cartSummary"
            >
              <h2>
                구매 금액
              </h2>


              <div className="lcode-cartSummaryCount">
                <span>
                  선택 상품
                </span>


                <b>
                  {chosen.length} ITEM
                </b>
              </div>


              <div className="lcode-cartSummaryRows">
                <div className="lcode-cartSummaryRow">
                  <span>
                    상품 금액
                  </span>


                  <b>
                    {subtotal.toLocaleString()}원
                  </b>
                </div>


                {giftWrapFee >
                  0 && (
                  <div className="lcode-cartSummaryRow">
                    <span>
                      선물 포장
                    </span>


                    <b>
                      +{giftWrapFee.toLocaleString()}원
                    </b>
                  </div>
                )}


                <div className="lcode-cartSummaryRow">
                  <span>
                    배송비
                  </span>


                  <b>
                    {shipping.toLocaleString()}원
                  </b>
                </div>
              </div>


              <div className="lcode-cartTotal">
                <span>
                  총 구매 금액
                </span>


                <strong>
                  {total.toLocaleString()}

                  <small>
                    KRW
                  </small>
                </strong>
              </div>


              <div className="lcode-cartExpectedBenefit">
                <span>
                  CHECKOUT BENEFIT
                </span>


                <p>
                  <span>
                    TC-0012 쿠폰
                  </span>


                  <b>
                    결제에서 -3,000원
                  </b>
                </p>
              </div>


              <Link
                className={`lcode-cartBuy ${
                  chosen.length ===
                  0
                    ? "is-disabled"
                    : ""
                }`}
                to="/checkout"
                onClick={
                  handleCheckout
                }
              >
                {chosen.length >
                0
                  ? `${total.toLocaleString()}원 구매하기 (${chosen.length})`
                  : "구매할 상품을 선택해주세요"}
              </Link>


              <p className="lcode-cartSummaryNotice">
                선택한 상품만 결제 단계로 이동합니다.
                <br />
                쿠폰 할인은 결제 페이지에서 적용할 수 있습니다.
              </p>
            </div>
          </aside>
        </div>
        {editingItem && (
          <dialog
            ref={optionDialogRef}
            className={`${savedPlanStyles.deleteModal} lcode-cartOptionModal`}
            aria-labelledby="cart-option-title"
            onCancel={() => setEditingLineId(null)}
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              const rect = event.currentTarget.getBoundingClientRect();
              if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                setEditingLineId(null);
              }
            }}
          >
            <p>OPTION CHANGE</p>
            <h2 id="cart-option-title">옵션 변경</h2>
            <span>{editingItem.name}</span>
            <fieldset className="lcode-cartModalOptions">
              <legend>상품 옵션 선택</legend>
              {PRODUCT_OPTIONS.map((option) => (
                <label key={option.id}>
                  <input type="radio" name="cart-option" value={option.id} checked={draftOptionId === option.id} onChange={() => setDraftOptionId(option.id)} />
                  <span>{option.label}{option.extraPrice > 0 && <small>주문 전체 +{option.extraPrice.toLocaleString()} KRW</small>}</span>
                </label>
              ))}
            </fieldset>
            <span>선물 포장은 주문 단위로 한 번만 적용됩니다.</span>
            <div>
              <button type="button" onClick={() => setEditingLineId(null)}>취소</button>
              <button type="button" onClick={() => handleOptionChange(editingItem, PRODUCT_OPTIONS.find((option) => option.id === draftOptionId))}>변경하기</button>
            </div>
          </dialog>
        )}
      </main>
    </>
  );
}
