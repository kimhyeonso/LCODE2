import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { useShop } from "../hooks/useShop";


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
   IMAGE PREFIX
========================================================= */

function getProductImagePrefixes(
  productId
) {
  if (!productId) {
    return [];
  }


  /*
    P001 → 1
    P002 → 2
    P037 → 37
  */

  if (
    productId.startsWith(
      "P"
    )
  ) {
    const number =
      Number(
        productId.slice(1)
      );


    return [
      String(number),

      /*
        혹시 P001_1.png 방식으로
        저장해도 작동
      */
      productId,
    ];
  }


  /*
    S001 → S1

    그리고 혹시
    38_1.png 방식으로 이어서
    저장해도 작동하도록 지원

    P037 다음:
    S001 → 38
    S002 → 39
    ...
  */

  if (
    productId.startsWith(
      "S"
    )
  ) {
    const number =
      Number(
        productId.slice(1)
      );


    return [
      `S${number}`,

      productId,

      String(
        37 +
        number
      ),
    ];
  }


  return [
    productId,
  ];
}


/* =========================================================
   FILE FIND
========================================================= */

function findProductImage(
  productId
) {
  const prefixes =
    getProductImagePrefixes(
      productId
    );


  const extensions = [
    "png",
    "webp",
    "jpg",
    "jpeg",
  ];


  /*
    Cart 썸네일은
    우선 _1 이미지 사용

    없으면
    _2

    그것도 없으면
    상세 이미지 n.png 사용
  */

  for (
    const prefix
    of prefixes
  ) {
    for (
      const extension
      of extensions
    ) {
      const candidates = [
        `${prefix}_1.${extension}`,
        `${prefix}_2.${extension}`,
        `${prefix}.${extension}`,
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
  }


  return "";
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
     RIGHT SUMMARY FOLLOW
  ======================================================= */

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
        cart.filter(
          (item) =>
            selected.includes(
              item.lineId
            )
        ),
      [
        cart,
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


        /*
          Cart 끝에 도착
        */

        const shouldStop =
          railRect.bottom <=
          boxHeight +
            TOP_GAP;


        if (shouldStop) {
          box.style.position =
            "absolute";

          box.style.top =
            "auto";

          box.style.bottom =
            "0px";

          box.style.left =
            "0px";

          box.style.width =
            "100%";

          box.style.zIndex =
            "20";

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


      resizeObserver.observe(
        box
      );
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

    .lcode-cartMain {
      min-width:
        0;
    }


    .lcode-cartEyebrow {
      display:
        block;

      margin-bottom:
        50px;

      color:
        #77736c;

      font-size:
        10px;

      letter-spacing:
        0.23em;
    }


    .lcode-cartTitle {
      margin:
        0
        0
        50px;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
        serif;

      font-size:
        clamp(
          76px,
          7vw,
          108px
        );

      font-weight:
        500;

      line-height:
        0.82;

      letter-spacing:
        -0.065em;
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
        0
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
        30px;

      height:
        30px;

      flex:
        0 0 auto;

      border:
        1px solid
        #11110f;

      font-family:
        "Times New Roman",
        serif;

      font-size:
        16px;
    }


    .lcode-cartBenefit b {
      display:
        block;

      margin-bottom:
        4px;

      font-size:
        12px;
    }


    .lcode-cartBenefit small {
      color:
        #77736c;

      font-size:
        10px;
    }


    .lcode-cartBenefit > span {
      color:
        #77736c;

      font-size:
        10px;

      letter-spacing:
        0.12em;
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
        12px;
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
        10px;
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
        10px;
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
        "Times New Roman",
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
        10px;

      letter-spacing:
        0.14em;
    }


    .lcode-cartInfo h3 {
      margin:
        0
        0
        8px;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
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
        10px;
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
        13px;
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
        11px;

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
        10px;
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
        "Times New Roman",
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
        10px;

      text-align:
        center;
    }


    .lcode-cartDelivery b {
      color:
        #11110f;

      font-size:
        10px;

      font-weight:
        600;

      letter-spacing:
        0.1em;
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

    .lcode-cartOptionPanel {
      margin:
        18px
        44px
        0
        152px;

      padding:
        18px;

      border:
        1px solid
        #d8d3ca;

      background:
        rgba(
          255,
          255,
          255,
          0.22
        );
    }


    .lcode-cartOptionPanelHead {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      margin-bottom:
        13px;
    }


    .lcode-cartOptionPanelHead b {
      font-size:
        10px;

      letter-spacing:
        0.16em;
    }


    .lcode-cartOptionPanelHead small {
      color:
        #858078;

      font-size:
        10px;
    }


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
        10px;
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
        10px;
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
        "Times New Roman",
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
        11px;
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
        10px;
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

      padding:
        32px
        26px
        30px;

      border-top:
        2px solid
        #11110f;

      border-bottom:
        1px solid
        #d8d3ca;

      background:
        rgba(
          248,
          245,
          239,
          0.98
        );

      backdrop-filter:
        blur(
          10px
        );

      box-sizing:
        border-box;
    }


    .lcode-cartSummary h2 {
      margin:
        0
        0
        38px;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
        serif;

      font-size:
        31px;

      font-weight:
        500;
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

      border-bottom:
        1px solid
        #d8d3ca;

      color:
        #77736c;

      font-size:
        10px;
    }


    .lcode-cartSummaryCount b {
      color:
        #11110f;

      font-size:
        11px;

      font-weight:
        500;
    }


    /* =====================================================
       SUMMARY ROWS
    ===================================================== */

    .lcode-cartSummaryRows {
      padding:
        21px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
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

      padding:
        8px
        0;

      color:
        #77736c;

      font-size:
        11px;
    }


    .lcode-cartSummaryRow b {
      color:
        #11110f;

      font-size:
        12px;

      font-weight:
        400;
    }


    /* =====================================================
       TOTAL
    ===================================================== */

    .lcode-cartTotal {
      display:
        flex;

      align-items:
        flex-end;

      justify-content:
        space-between;

      gap:
        18px;

      padding:
        30px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-cartTotal > span {
      font-size:
        13px;

      font-weight:
        700;
    }


    .lcode-cartTotal strong {
      text-align:
        right;

      white-space:
        nowrap;

      font-family:
        "Times New Roman",
        serif;

      font-size:
        30px;

      font-weight:
        500;
    }


    .lcode-cartTotal strong small {
      margin-left:
        5px;

      font-family:
        Arial,
        sans-serif;

      font-size:
        10px;

      font-weight:
        400;
    }


    /* =====================================================
       COUPON
    ===================================================== */

    .lcode-cartExpectedBenefit {
      padding:
        24px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-cartExpectedBenefit > span {
      display:
        block;

      margin-bottom:
        11px;

      color:
        #88837b;

      font-size:
        10px;

      letter-spacing:
        0.13em;
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

      color:
        #77736c;

      font-size:
        10px;
    }


    .lcode-cartExpectedBenefit p b {
      color:
        #11110f;

      font-size:
        10px;

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
        11px;

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
      margin:
        13px
        0
        0;

      color:
        #8b867e;

      text-align:
        center;

      font-size:
        10px;

      line-height:
        1.7;
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


      .lcode-cartTitle {
        font-size:
          clamp(
            58px,
            18vw,
            76px
          );
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

          <section className="lcode-cartMain">
            <span className="lcode-cartEyebrow">
              SHOP / CART
            </span>


            <h1 className="lcode-cartTitle">
              CART
            </h1>


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

            <div className="lcode-cartList">
              {cart.map(
                (item) => {
                  const isSelected =
                    selected.includes(
                      item.lineId
                    );


                  const isEditing =
                    editingLineId ===
                    item.lineId;


                  const currentOptionId =
                    item.option?.id ||
                    "standard";


                  const productImage =
                    findProductImage(
                      item.id
                    ) ||
                    item.image ||
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
                            <img
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
                              onClick={() =>
                                setEditingLineId(
                                  isEditing
                                    ? null
                                    : item.lineId
                                )
                              }
                            >
                              {isEditing
                                ? "옵션 닫기"
                                : "옵션 변경"}
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


                      {/* =====================================
                          OPTION PANEL
                      ===================================== */}

                      {isEditing && (
                        <div className="lcode-cartOptionPanel">
                          <div className="lcode-cartOptionPanelHead">
                            <b>
                              OPTION CHANGE
                            </b>


                            <small>
                              선물 포장은 주문 단위로 한 번만 적용됩니다.
                            </small>
                          </div>


                          <div className="lcode-cartOptionChoices">
                            {PRODUCT_OPTIONS.map(
                              (
                                option
                              ) => (
                                <button
                                  type="button"
                                  key={
                                    option.id
                                  }
                                  className={
                                    currentOptionId ===
                                    option.id
                                      ? "is-active"
                                      : ""
                                  }
                                  onClick={() =>
                                    handleOptionChange(
                                      item,
                                      option
                                    )
                                  }
                                >
                                  {
                                    option.label
                                  }


                                  {option.id ===
                                    "gift" && (
                                    <small>
                                      주문 전체 +2,500 KRW
                                    </small>
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
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
      </main>
    </>
  );
}