import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useShop } from "../hooks/useShop";
import { decreaseProductStocks } from "../services/firestoreService";
import styles from "./Shop.module.scss";


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


/* =========================================================
   PAYMENT
========================================================= */

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "카드",
  },
  {
    id: "bank",
    label: "계좌이체",
  },
  {
    id: "kakao",
    label: "카카오페이",
  },
  {
    id: "naver",
    label: "네이버페이",
  },
];


const CARD_COMPANIES = [
  "신한카드",
  "KB국민카드",
  "삼성카드",
  "현대카드",
  "롯데카드",
  "우리카드",
  "하나카드",
  "NH농협카드",
  "BC카드",
];


const INSTALLMENTS = [
  "일시불",
  "2개월",
  "3개월",
  "4개월",
  "5개월",
  "6개월",
  "12개월",
];


const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "IBK기업은행",
  "카카오뱅크",
  "토스뱅크",
];


const DELIVERY_REQUESTS = [
  "문 앞에 놓아주세요",
  "경비실에 맡겨주세요",
  "택배함에 넣어주세요",
  "배송 전에 연락주세요",
  "직접 받을게요",
];


/* =========================================================
   STORAGE
========================================================= */

function readDirectPurchase() {
  try {
    const saved =
      sessionStorage.getItem(
        "directPurchase"
      );

    return saved
      ? JSON.parse(saved)
      : null;
  } catch {
    return null;
  }
}


function readCheckoutSelection() {
  try {
    const saved =
      sessionStorage.getItem(
        "checkoutSelection"
      );

    if (!saved) {
      return null;
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}


function normalizeOption(option) {
  if (!option) {
    return PRODUCT_OPTIONS[0];
  }


  if (
    typeof option === "string"
  ) {
    return (
      PRODUCT_OPTIONS.find(
        (item) =>
          item.id === option ||
          item.label === option
      ) ||
      PRODUCT_OPTIONS[0]
    );
  }


  return (
    PRODUCT_OPTIONS.find(
      (item) =>
        item.id ===
        option.id
    ) ||
    PRODUCT_OPTIONS[0]
  );
}


function normalizeCartItem(
  item,
  index
) {
  const option =
    normalizeOption(
      item.option ||
        item.optionLabel
    );

  return {
    ...item,

    quantity:
      Number(
        item.quantity || 1
      ),

    option,

    lineId:
      item.lineId ||
      `${item.id}__${option.id}__${index}`,
  };
}


function buildCheckoutItems(
  directPurchase,
  checkoutSelection,
  cart
) {
  if (directPurchase) {
    const option =
      normalizeOption(
        directPurchase.option
      );

    return [
      {
        lineId:
          `direct-${directPurchase.productId}`,

        id:
          directPurchase.productId,

        name:
          directPurchase.name,

        category:
          directPurchase.category ||
          "TRAVEL ESSENTIALS",

        image:
          directPurchase.image ||
          "",

        price:
          Number(
            directPurchase.price ||
              0
          ),

        quantity:
          Number(
            directPurchase.quantity ||
              1
          ),

        stock:
          directPurchase.stock,

        option,
      },
    ];
  }


  if (
    checkoutSelection &&
    checkoutSelection.length >
      0
  ) {
    return checkoutSelection.map(
      normalizeCartItem
    );
  }


  return cart.map(
    normalizeCartItem
  );
}


/* =========================================================
   CHECKOUT
========================================================= */

export default function Checkout() {
  const {
    cart,
    removePurchasedItems,
  } = useShop();

  const navigate =
    useNavigate();


  const paymentTimer =
    useRef(null);

  const paymentRailRef =
    useRef(null);

  const paymentBoxRef =
    useRef(null);

  const scrollFrameRef =
    useRef(null);


  const [
    directPurchase,
  ] = useState(() =>
    readDirectPurchase()
  );


  const [
    checkoutSelection,
  ] = useState(() =>
    readCheckoutSelection()
  );


  const [
    checkoutItems,
    setCheckoutItems,
  ] = useState(() =>
    buildCheckoutItems(
      directPurchase,
      checkoutSelection,
      cart
    )
  );


  useEffect(() => {
    if (
      directPurchase ||
      (
        checkoutSelection &&
        checkoutSelection.length >
          0
      )
    ) {
      return;
    }

    setCheckoutItems(
      cart.map(
        normalizeCartItem
      )
    );
  }, [
    cart,
    directPurchase,
    checkoutSelection,
  ]);


  /* =======================================================
     SHIPPING
  ======================================================= */

  const [
    receiver,
    setReceiver,
  ] = useState("전승근");


  const [
    phone,
    setPhone,
  ] = useState(
    "010-1234-5678"
  );


  const [
    address,
    setAddress,
  ] = useState(
    "서울시 마포구 상수동 123-4"
  );


  const [
    detailAddress,
    setDetailAddress,
  ] = useState("101호");


  const [
    deliveryRequest,
    setDeliveryRequest,
  ] = useState(
    "문 앞에 놓아주세요"
  );


  /* =======================================================
     PAYMENT
  ======================================================= */

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("card");


  const [
    cardCompany,
    setCardCompany,
  ] = useState("신한카드");


  const [
    installment,
    setInstallment,
  ] = useState("일시불");


  const [
    bank,
    setBank,
  ] = useState(
    "KB국민은행"
  );


  const [
    depositor,
    setDepositor,
  ] = useState("");


  const [
    couponApplied,
    setCouponApplied,
  ] = useState(false);


  const [
    agreed,
    setAgreed,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =======================================================
     PRICE
  ======================================================= */

  const subtotal =
    useMemo(() => {
      return checkoutItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.price
          ) *
            Number(
              item.quantity
            ),
        0
      );
    }, [checkoutItems]);


  /*
    ★ 주문 전체에서
    Gift Wrap 하나라도 있으면
    딱 한 번 +2,500
  */
  const hasGiftWrap =
    useMemo(
      () =>
        checkoutItems.some(
          (item) =>
            item.option?.id ===
            "gift"
        ),
      [checkoutItems]
    );


  const giftWrapFee =
    hasGiftWrap
      ? 2500
      : 0;


  const shipping =
    checkoutItems.length > 0
      ? 3000
      : 0;


  const couponDiscount =
    couponApplied
      ? 3000
      : 0;


  const total =
    Math.max(
      0,
      subtotal +
        giftWrapFee +
        shipping -
        couponDiscount
    );


  const selectedPaymentLabel =
    PAYMENT_METHODS.find(
      (item) =>
        item.id ===
        paymentMethod
    )?.label || "카드";


  /* =======================================================
     OPTION CHANGE
  ======================================================= */

  const changeOption = (
    lineId,
    option
  ) => {
    setCheckoutItems(
      (current) =>
        current.map(
          (item) =>
            item.lineId ===
            lineId
              ? {
                  ...item,
                  option,
                }
              : item
        )
    );
  };


  /* =======================================================
     RIGHT PAYMENT FOLLOW
  ======================================================= */

  useEffect(() => {
    const rail =
      paymentRailRef.current;

    const box =
      paymentBoxRef.current;


    if (!rail || !box) {
      return;
    }


    const TOP_GAP = 24;


    const resetBox = () => {
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


    const updatePaymentPosition =
      () => {
        if (
          window.innerWidth <=
          850
        ) {
          resetBox();
          return;
        }


        const railRect =
          rail.getBoundingClientRect();

        const boxHeight =
          box.offsetHeight;


        if (
          railRect.top >
          TOP_GAP
        ) {
          resetBox();
          return;
        }


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
            updatePaymentPosition
          );
      };


    updatePaymentPosition();


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


    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );

      if (
        scrollFrameRef.current
      ) {
        cancelAnimationFrame(
          scrollFrameRef.current
        );
      }
    };
  }, []);


  useEffect(() => {
    window.dispatchEvent(
      new Event("resize")
    );
  }, [
    couponApplied,
    paymentMethod,
    cardCompany,
    bank,
    total,
  ]);


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validatePayment =
    () => {
      if (
        checkoutItems.length ===
        0
      ) {
        window.alert(
          "주문할 상품이 없습니다."
        );

        return false;
      }


      if (
        !receiver.trim()
      ) {
        window.alert(
          "수령인을 입력해주세요."
        );

        return false;
      }


      if (!phone.trim()) {
        window.alert(
          "연락처를 입력해주세요."
        );

        return false;
      }


      if (
        !address.trim()
      ) {
        window.alert(
          "주소를 입력해주세요."
        );

        return false;
      }


      if (
        paymentMethod ===
          "bank" &&
        !depositor.trim()
      ) {
        window.alert(
          "입금자명을 입력해주세요."
        );

        return false;
      }


      if (!agreed) {
        window.alert(
          "주문 내용 확인 및 결제에 동의해주세요."
        );

        return false;
      }


      return true;
    };


  /* =======================================================
     PAYMENT
  ======================================================= */

  const handlePayment =
    async () => {
      if (loading) {
        return;
      }


      if (
        !validatePayment()
      ) {
        return;
      }


      setLoading(true);

      try {
        await decreaseProductStocks(checkoutItems);
      } catch (error) {
        console.error("상품 재고 차감 실패", error);
        window.alert(error?.message || "재고를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
        return;
      }

      const orderData = {
        orderNumber:
          `LCODE-${Date.now()}`,

        items:
          checkoutItems,

        shipping: {
          receiver,
          phone,

          address:
            `${address} ${detailAddress}`.trim(),

          deliveryRequest,
        },

        payment: {
          method:
            paymentMethod,

          methodLabel:
            selectedPaymentLabel,

          cardCompany:
            paymentMethod ===
            "card"
              ? cardCompany
              : null,

          installment:
            paymentMethod ===
            "card"
              ? installment
              : null,

          bank:
            paymentMethod ===
            "bank"
              ? bank
              : null,

          depositor:
            paymentMethod ===
            "bank"
              ? depositor
              : null,
        },

        price: {
          subtotal,

          giftWrapFee,

          shipping,

          couponDiscount,

          total,
        },

        orderedAt:
          new Date().toISOString(),
      };


      sessionStorage.setItem(
        "lastOrder",
        JSON.stringify(
          orderData
        )
      );


      paymentTimer.current =
        window.setTimeout(
          () => {
            sessionStorage.removeItem(
              "directPurchase"
            );

            sessionStorage.removeItem(
              "checkoutSelection"
            );

            removePurchasedItems(
              checkoutItems
            );

            navigate(
              "/order-complete"
            );
          },
          1800
        );
    };


  useEffect(() => {
    return () => {
      if (
        paymentTimer.current
      ) {
        window.clearTimeout(
          paymentTimer.current
        );
      }
    };
  }, []);


  /* =======================================================
     STYLE
  ======================================================= */

  const checkoutStyle = `
    .lcode-checkout {
      width: calc(100% - 220px);
      max-width: calc(100% - 220px);
      min-height: 100vh;
      margin-left: 220px;
      padding: 0;
      box-sizing: border-box;
      overflow: visible;
    }


    .lcode-checkoutFrame {
      width: min(
        1320px,
        calc(100% - 112px)
      );

      min-height: 100vh;

      margin-inline: auto;

      padding:
        52px
        0
        130px;

      display: grid;

      grid-template-columns:
        minmax(0, 1fr)
        330px;

      align-items: stretch;

      gap: 56px;

      box-sizing: border-box;

      overflow: visible;
    }


    .lcode-checkoutMain {
      width: 100%;
      min-width: 0;
    }


    .lcode-checkoutEyebrow {
      display: block;

      margin-bottom: 54px;

      color: #77736c;

      font-size: 11px;

      letter-spacing: 0.23em;
    }


    .lcode-checkoutTitle {
      margin: 0 0 42px;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
        serif;

      font-size:
        clamp(
          72px,
          7vw,
          112px
        );

      font-weight: 500;

      line-height: 0.8;

      letter-spacing:
        -0.065em;
    }


    .lcode-checkoutSteps {
      width: 100%;

      display: flex;

      align-items: center;

      gap: 15px;

      margin-bottom: 80px;

      padding:
        20px
        0;

      border-top:
        1px solid
        #d8d3ca;

      border-bottom:
        1px solid
        #d8d3ca;

      color: #8b867e;

      font-size: 10px;

      letter-spacing:
        0.16em;

      box-sizing:
        border-box;
    }


    .lcode-checkoutSteps strong {
      color: #11110f;
      font-weight: 700;
    }


    .lcode-checkoutSteps i {
      width: 29px;
      height: 1px;

      flex: 0 0 auto;

      background:
        #d8d3ca;
    }


    .lcode-checkoutContent {
      width: 100%;
      min-width: 0;
    }


    .lcode-orderBlock {
      width: 100%;

      margin-bottom:
        72px;

      padding-top:
        22px;

      border-top:
        1px solid
        #d8d3ca;

      box-sizing:
        border-box;
    }


    .lcode-orderBlock:last-child {
      margin-bottom: 0;
    }


    .lcode-blockTitle {
      display: flex;

      align-items: center;

      justify-content:
        space-between;

      gap: 20px;

      margin: 0 0 26px;

      color: #69655f;

      font-size: 11px;

      font-weight: 400;

      letter-spacing:
        0.2em;
    }


    .lcode-blockTitle small {
      color: #98938b;

      font-size: 10px;

      letter-spacing:
        0.07em;
    }


    .lcode-orderProducts {
      width: 100%;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-orderProduct {
      width: 100%;

      display: grid;

      grid-template-columns:
        100px
        minmax(0, 1fr);

      gap: 21px;

      padding:
        22px
        0;

      border-top:
        1px solid
        #ece8e1;

      box-sizing:
        border-box;
    }


    .lcode-orderProduct:first-child {
      border-top: 0;
    }


    .lcode-orderThumb {
      width: 100px;

      aspect-ratio: 1;

      display: grid;

      place-items: center;

      overflow: hidden;

      background: #cccccc;
    }


    .lcode-orderThumb img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
    }


    .lcode-orderThumb span {
      color:
        rgba(
          255,
          255,
          255,
          0.42
        );

      font-family:
        "Times New Roman",
        serif;

      font-size: 38px;
    }


    .lcode-orderProductInfo {
      min-width: 0;
    }


    .lcode-orderProductHead {
      display: flex;

      align-items:
        flex-start;

      justify-content:
        space-between;

      gap: 25px;
    }


    .lcode-orderProductHead b {
      display: block;

      margin-bottom: 8px;

      font-size: 15px;
    }


    .lcode-orderProductHead small {
      font-size: 12px;
    }


    .lcode-orderProductHead strong {
      white-space: nowrap;

      font-family:
        "Times New Roman",
        serif;

      font-size: 17px;

      font-weight: 500;
    }


    .lcode-optionArea {
      margin-top: 20px;
    }


    .lcode-optionArea > span {
      display: block;

      margin-bottom: 10px;

      color: #8e8981;

      font-size: 10px;

      letter-spacing:
        0.13em;
    }


    .lcode-optionButtons {
      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      gap: 8px;
    }


    .lcode-optionButtons button {
      min-height: 44px;

      padding:
        11px
        14px;

      border:
        1px solid
        #d8d3ca;

      color: #5c5852;

      background:
        transparent;

      cursor: pointer;

      font-size: 11px;

      text-align: left;
    }


    .lcode-optionButtons button:hover {
      border-color:
        #11110f;
    }


    .lcode-optionButtons button.is-active {
      border-color:
        #11110f;

      color: #fff;

      background:
        #11110f;
    }


    .lcode-shippingRows {
      width: 100%;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-shippingRow {
      min-height: 62px;

      display: grid;

      grid-template-columns:
        120px
        minmax(0, 1fr);

      align-items: center;

      gap: 25px;

      border-top:
        1px solid
        #e4e0d9;
    }


    .lcode-shippingRow:first-child {
      border-top: 0;
    }


    /*
      수령인 / 연락처 / 주소 등
      왼쪽 글자만 3px 아래
    */
    .lcode-shippingRow > span {
      font-size: 13px;

      transform:
        translateY(3px);
    }


   .lcode-shippingRow {
  position: relative;

  min-height: 62px;

  display: grid;

  grid-template-columns:
    120px
    minmax(0, 1fr);

  align-items: center;

  gap: 25px;

  border-top:
    1px solid
    #e4e0d9;
}


.lcode-shippingRow:first-child {
  border-top: 0;
}


/* 왼쪽 라벨 */
.lcode-shippingRow > span {
  font-size: 13px;

  transform:
    translateY(3px);
}


/* 수령인 / 연락처 / 주소 / 상세주소 */
.lcode-shippingRow input {
  grid-column: 2;

  width: 100%;

  padding:
    17px
    0;

  border: 0;

  outline: 0;

  color: #11110f;

  background:
    transparent;

  text-align: right;

  font: inherit;

  font-size: 12px;

  box-sizing:
    border-box;
}


/*
  배송 요청

  ★ 현재 오른쪽 끝 위치 그대로
  ★ 셀렉트 자체 너비만 내용만큼
*/
.lcode-shippingRow select {
  position: absolute;

  top: 50%;
  right: 0;

  transform:
    translateY(-50%);

  width: auto;

  field-sizing: content;

  padding:
    17px
    0;

  border: 0;

  outline: 0;

  color: #11110f;

  background:
    transparent;

  text-align: right;
  text-align-last: right;

  font: inherit;

  font-size: 12px;

  cursor: pointer;
}


    .lcode-paymentGrid {
      display: grid;

      grid-template-columns:
        repeat(
          4,
          minmax(0, 1fr)
        );

      gap: 8px;
    }


    .lcode-paymentButton {
      min-height: 52px;

      padding:
        13px
        14px;

      border:
        1px solid
        #d8d3ca;

      color: #11110f;

      background:
        transparent;

      cursor: pointer;

      font-size: 12px;
    }


    .lcode-paymentButton:hover {
      border-color:
        #11110f;
    }


    .lcode-paymentButton.is-selected {
      border-color:
        #11110f;

      color: #fff;

      background:
        #11110f;
    }


    .lcode-paymentDetail {
      margin-top: 10px;

      padding:
        22px
        24px;

      border:
        1px solid
        #d8d3ca;
    }


    .lcode-paymentDetailHead {
      display: flex;

      justify-content:
        space-between;

      gap: 20px;

      padding-bottom: 16px;

      border-bottom:
        1px solid
        #dedad3;
    }


    .lcode-paymentDetailHead b {
      font-size: 11px;

      letter-spacing:
        0.14em;
    }


    .lcode-paymentDetailHead span {
      color: #8f8a82;

      font-size: 10px;
    }


    .lcode-paymentSetting {
      min-height: 58px;

      display: grid;

      grid-template-columns:
        110px
        minmax(0, 1fr);

      align-items: center;

      border-bottom:
        1px solid
        #dedad3;
    }


    .lcode-paymentSetting:last-child {
      border-bottom: 0;
    }


    .lcode-paymentSetting > span {
      font-size: 12px;
    }


   .lcode-paymentSetting {
  position: relative;

  min-height: 58px;

  display: grid;

  grid-template-columns:
    110px
    minmax(0, 1fr);

  align-items: center;

  border-bottom:
    1px solid
    #dedad3;
}


.lcode-paymentSetting:last-child {
  border-bottom: 0;
}


.lcode-paymentSetting > span {
  font-size: 12px;
}


/*
  카드사 / 할부

  ★ 오른쪽 끝 위치는 그대로 고정
  ★ 셀렉트 너비만 글자 크기만큼
*/
.lcode-paymentSetting select {
  position: absolute;

  top: 50%;
  right: 0;

  transform:
    translateY(-50%);

  width: auto;

  field-sizing: content;

  padding:
    15px
    0;

  border: 0;

  outline: 0;

  background:
    transparent;

  text-align: right;

  text-align-last: right;

  font: inherit;

  font-size: 12px;

  cursor: pointer;
}


/*
  계좌이체의 입금자명 input은
  기존처럼 오른쪽 영역 전체 사용
*/
.lcode-paymentSetting input {
  grid-column: 2;

  width: 100%;

  padding:
    15px
    0;

  border: 0;

  outline: 0;

  background:
    transparent;

  text-align: right;

  font: inherit;

  font-size: 12px;

  box-sizing:
    border-box;
}


    .lcode-easyPay {
      margin-top: 10px;

      padding: 24px;

      border:
        1px solid
        #d8d3ca;
    }


    .lcode-easyPay b {
      display: block;

      margin-bottom: 10px;

      font-size: 12px;

      letter-spacing:
        0.12em;
    }


    .lcode-easyPay p {
      margin: 0;

      color: #77736c;

      font-size: 12px;

      line-height: 1.8;
    }


    .lcode-coupon {
      min-height: 76px;

      display: flex;

      align-items: center;

      justify-content:
        space-between;

      gap: 30px;

      padding:
        12px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-couponText b {
      display: block;

      margin-bottom: 8px;

      font-size: 13px;
    }


    .lcode-couponText small {
      color: #77736c;

      font-size: 11px;
    }


    .lcode-switch {
      position: relative;

      width: 44px;
      height: 24px;

      flex: 0 0 auto;
    }


    .lcode-switch input {
      position: absolute;

      opacity: 0;

      pointer-events: none;
    }


    .lcode-switch span {
      position: absolute;

      inset: 0;

      border:
        1px solid
        #bcb7af;

      background:
        transparent;

      cursor: pointer;
    }


    .lcode-switch span::after {
      content: "";

      position: absolute;

      top: 3px;
      left: 3px;

      width: 16px;
      height: 16px;

      background:
        #bbb6ae;

      transition:
        0.2s ease;
    }


    .lcode-switch input:checked + span {
      border-color:
        #11110f;

      background:
        #11110f;
    }


    .lcode-switch input:checked + span::after {
      left: 23px;

      background: #fff;
    }


    .lcode-agreement {
      display: flex;

      align-items:
        flex-start;

      gap: 12px;

      padding:
        18px
        0
        28px;

      border-bottom:
        1px solid
        #d8d3ca;

      cursor: pointer;
    }


    .lcode-agreement input {
      margin-top: 3px;

      accent-color:
        #11110f;
    }


    /*
      ★ 요청사항
      가로선은 그대로 두고
      문구 두 줄만 2px 아래
    */
    .lcode-agreement > span {
      transform:
        translateY(2px);
    }


    .lcode-agreement b {
      display: block;

      margin-bottom: 4px;

      font-size: 13px;
    }


    .lcode-agreement small {
      display: block;

      color: #858078;

      font-size: 11px;

      line-height: 1.8;
    }


    /*
      RIGHT PAYMENT
      가로폭 절대 유지
    */

    .lcode-paymentRail {
      position: relative;

      width: 330px;

      min-width: 330px;

      align-self: stretch;

      box-sizing:
        border-box;
    }


    .lcode-paymentSticky {
      position: absolute;

      top: 0;
      left: 0;

      width: 330px;

      box-sizing:
        border-box;

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
        blur(10px);
    }


    .lcode-paymentSticky h2 {
      margin:
        0
        0
        40px;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
        serif;

      font-size: 31px;

      font-weight: 500;
    }


    .lcode-summaryRows {
      padding-bottom: 27px;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-summaryRow {
      display: flex;

      align-items: center;

      justify-content:
        space-between;

      gap: 22px;

      margin: 0;

      padding:
        11px
        0;

      color: #69655f;

      font-size: 12px;
    }


    .lcode-summaryRow b {
      color: #11110f;

      font-size: 13px;

      font-weight: 400;
    }


    .lcode-summaryRow.discount b {
      color: #5954cc;
    }


    .lcode-summaryTotal {
      display: flex;

      align-items:
        flex-end;

      justify-content:
        space-between;

      gap: 20px;

      padding:
        32px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-summaryTotal > span {
      font-size: 13px;

      font-weight: 700;
    }


    .lcode-summaryTotal strong {
      text-align: right;

      white-space: nowrap;

      font-family:
        "Times New Roman",
        serif;

      font-size: 31px;

      font-weight: 500;
    }


    .lcode-summaryTotal strong small {
      margin-left: 6px;

      font-family:
        Arial,
        sans-serif;

      font-size: 10px;

      font-weight: 400;
    }


    .lcode-summaryBenefit {
      padding:
        27px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-summaryBenefit p {
      display: flex;

      justify-content:
        space-between;

      gap: 18px;

      margin: 0;

      padding:
        8px
        0;

      color: #77736c;

      font-size: 11px;
    }


    .lcode-summaryBenefit p b {
      color: #11110f;

      font-size: 12px;

      font-weight: 400;
    }


    .lcode-summaryBenefit p:last-child b {
      color: #5954cc;
    }


    .lcode-summaryMethod {
      padding:
        27px
        0;

      border-bottom:
        1px solid
        #d8d3ca;
    }


    .lcode-summaryMethod span {
      display: block;

      margin-bottom: 11px;

      color: #88837b;

      font-size: 10px;

      letter-spacing:
        0.13em;
    }


    .lcode-summaryMethod b {
      font-size: 13px;
    }


    .lcode-payButton {
      width: 100%;

      margin-top: 27px;

      padding:
        19px
        12px;

      border: 0;

      color: #fff;

      background:
        #11110f;

      cursor: pointer;

      font-size: 12px;

      font-weight: 700;
    }


    .lcode-payButton:hover {
      opacity: 0.83;
    }


    .lcode-payButton:disabled {
      opacity: 0.45;

      cursor:
        not-allowed;
    }


    .lcode-payNotice {
      margin:
        14px
        0
        0;

      color: #8b867e;

      text-align: center;

      font-size: 10px;

      line-height: 1.7;
    }


    .lcode-paymentLoading {
      position: fixed;

      inset: 0;

      z-index: 99999;

      display: grid;

      place-items: center;

      padding: 30px;

      background:
        rgba(
          16,
          16,
          14,
          0.96
        );

      backdrop-filter:
        blur(7px);
    }


    .lcode-loadingInner {
      display: flex;

      flex-direction: column;

      align-items: center;

      color: #fff;

      text-align: center;
    }


    .lcode-spinner {
      width: 54px;
      height: 54px;

      margin-bottom: 27px;

      border:
        1px solid
        rgba(
          255,
          255,
          255,
          0.22
        );

      border-top-color:
        #fff;

      border-radius:
        50%;

      animation:
        lcodeSpin
        0.82s
        linear
        infinite;
    }


    .lcode-loadingInner small {
      margin-bottom: 15px;

      color:
        rgba(
          255,
          255,
          255,
          0.48
        );

      font-size: 10px;

      letter-spacing:
        0.26em;
    }


    .lcode-loadingInner h2 {
      margin: 0;

      font-family:
        "Times New Roman",
        "Noto Serif KR",
        serif;

      font-size: 32px;

      font-weight: 400;
    }


    .lcode-loadingInner p {
      margin:
        11px
        0
        0;

      color:
        rgba(
          255,
          255,
          255,
          0.52
        );

      font-size: 11px;
    }


    @keyframes lcodeSpin {
      from {
        transform:
          rotate(0deg);
      }

      to {
        transform:
          rotate(360deg);
      }
    }


    @media (
      max-width: 1100px
    ) {
      .lcode-checkout {
        width: 100%;
        max-width: 100%;
        margin-left: 0;
      }


      .lcode-checkoutFrame {
        width:
          calc(
            100% - 72px
          );

        grid-template-columns:
          minmax(0, 1fr)
          330px;

        gap: 30px;

        padding:
          46px
          0
          100px;
      }


      .lcode-checkoutTitle {
        font-size:
          clamp(
            64px,
            8vw,
            90px
          );
      }


      .lcode-paymentGrid {
        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );
      }
    }


    @media (
      max-width: 850px
    ) {
      .lcode-checkoutFrame {
        width:
          calc(
            100% - 56px
          );

        grid-template-columns:
          1fr;

        gap: 35px;
      }


      .lcode-checkoutTitle {
        font-size:
          clamp(
            62px,
            12vw,
            86px
          );
      }


      .lcode-paymentRail {
        width: 100%;
        min-width: 0;
        min-height: 620px;
      }


      .lcode-paymentSticky {
        width: 100%;
      }
    }


    @media (
      max-width: 600px
    ) {
      .lcode-checkoutFrame {
        width:
          calc(
            100% - 32px
          );

        padding:
          30px
          0
          70px;
      }


      .lcode-checkoutTitle {
        font-size:
          clamp(
            54px,
            17vw,
            72px
          );
      }


      .lcode-checkoutSteps {
        gap: 7px;

        overflow-x: auto;

        font-size: 9px;
      }


      .lcode-orderBlock {
        margin-bottom:
          52px;
      }


      .lcode-orderProduct {
        grid-template-columns:
          76px
          minmax(0, 1fr);

        gap: 12px;
      }


      .lcode-orderThumb {
        width: 76px;
      }


      .lcode-orderProductHead {
        flex-direction:
          column;

        gap: 7px;
      }


      .lcode-optionButtons {
        grid-template-columns:
          1fr;
      }


      .lcode-shippingRow {
        grid-template-columns:
          85px
          minmax(0, 1fr);
      }


      .lcode-paymentSticky {
        padding:
          27px
          0;
      }
    }
  `;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>
        {checkoutStyle}
      </style>


      <main
        className={`${styles.checkoutPage} lcode-checkout`}
      >
        <div
          className="lcode-checkoutFrame"
        >
          {/* LEFT */}

          <div
            className="lcode-checkoutMain"
          >
            <span
              className="lcode-checkoutEyebrow"
            >
              SHOP / PAYMENT
            </span>


            <h1
              className="lcode-checkoutTitle"
            >
              ORDER
              <br />
              & PAYMENT
            </h1>


            <div
              className="lcode-checkoutSteps"
            >
              <span>
                01 CART
              </span>

              <i />

              <strong>
                02 PAYMENT
              </strong>

              <i />

              <span>
                03 COMPLETE
              </span>
            </div>


            <div
              className="lcode-checkoutContent"
            >
              {/* ORDER PRODUCT */}

              <section
                className="lcode-orderBlock"
              >
                <h2
                  className="lcode-blockTitle"
                >
                  <span>
                    ORDER PRODUCT
                  </span>

                  <small>
                    {
                      checkoutItems.length
                    }{" "}
                    ITEM
                  </small>
                </h2>


                <div
                  className="lcode-orderProducts"
                >
                  {checkoutItems.map(
                    (item) => (
                      <article
                        className="lcode-orderProduct"
                        key={
                          item.lineId
                        }
                      >
                        <div
                          className="lcode-orderThumb"
                        >
                          {item.image ? (
                            <img
                              src={
                                item.image
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
                        </div>


                        <div
                          className="lcode-orderProductInfo"
                        >
                          <div
                            className="lcode-orderProductHead"
                          >
                            <div>
                              <b>
                                {
                                  item.name
                                }
                              </b>

                              <small>
                                {
                                  item.quantity
                                }
                                개
                              </small>
                            </div>


                            <strong>
                              {(
                                item.price *
                                item.quantity
                              ).toLocaleString()}{" "}
                              KRW
                            </strong>
                          </div>


                          <div
                            className="lcode-optionArea"
                          >
                            <span>
                              OPTION
                            </span>


                            <div
                              className="lcode-optionButtons"
                            >
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
                                      item.option
                                        ?.id ===
                                      option.id
                                        ? "is-active"
                                        : ""
                                    }
                                    onClick={() =>
                                      changeOption(
                                        item.lineId,
                                        option
                                      )
                                    }
                                  >
                                    {
                                      option.label
                                    }

                                    {option.extraPrice >
                                      0 &&
                                      " · +2,500 KRW"}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>


              {/* SHIPPING */}

              <section
                className="lcode-orderBlock"
              >
                <h2
                  className="lcode-blockTitle"
                >
                  <span>
                    SHIPPING INFORMATION
                  </span>

                  <small>
                    DELIVERY
                  </small>
                </h2>


                <div
                  className="lcode-shippingRows"
                >
                  <label
                    className="lcode-shippingRow"
                  >
                    <span>
                      수령인
                    </span>

                    <input
                      type="text"
                      value={
                        receiver
                      }
                      onChange={(
                        event
                      ) =>
                        setReceiver(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>


                  <label
                    className="lcode-shippingRow"
                  >
                    <span>
                      연락처
                    </span>

                    <input
                      type="tel"
                      value={
                        phone
                      }
                      onChange={(
                        event
                      ) =>
                        setPhone(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>


                  <label
                    className="lcode-shippingRow"
                  >
                    <span>
                      주소
                    </span>

                    <input
                      type="text"
                      value={
                        address
                      }
                      onChange={(
                        event
                      ) =>
                        setAddress(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>


                  <label
                    className="lcode-shippingRow"
                  >
                    <span>
                      상세 주소
                    </span>

                    <input
                      type="text"
                      value={
                        detailAddress
                      }
                      onChange={(
                        event
                      ) =>
                        setDetailAddress(
                          event.target
                            .value
                        )
                      }
                    />
                  </label>


                  <label
                    className="lcode-shippingRow"
                  >
                    <span>
                      배송 요청
                    </span>

                    <select
                      value={
                        deliveryRequest
                      }
                      onChange={(
                        event
                      ) =>
                        setDeliveryRequest(
                          event.target
                            .value
                        )
                      }
                    >
                      {DELIVERY_REQUESTS.map(
                        (
                          request
                        ) => (
                          <option
                            key={
                              request
                            }
                            value={
                              request
                            }
                          >
                            {
                              request
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>
              </section>


              {/* PAYMENT METHOD */}

              <section
                className="lcode-orderBlock"
              >
                <h2
                  className="lcode-blockTitle"
                >
                  <span>
                    PAYMENT METHOD
                  </span>

                  <small>
                    {
                      selectedPaymentLabel
                    }
                  </small>
                </h2>


                <div
                  className="lcode-paymentGrid"
                >
                  {PAYMENT_METHODS.map(
                    (
                      method
                    ) => (
                      <button
                        type="button"
                        key={
                          method.id
                        }
                        className={`lcode-paymentButton ${
                          paymentMethod ===
                          method.id
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() =>
                          setPaymentMethod(
                            method.id
                          )
                        }
                      >
                        {
                          method.label
                        }
                      </button>
                    )
                  )}
                </div>


                {paymentMethod ===
                  "card" && (
                  <div
                    className="lcode-paymentDetail"
                  >
                    <div
                      className="lcode-paymentDetailHead"
                    >
                      <b>
                        CARD PAYMENT
                      </b>

                      <span>
                        카드 결제 설정
                      </span>
                    </div>


                    <label
                      className="lcode-paymentSetting"
                    >
                      <span>
                        카드사
                      </span>

                      <select
                        value={
                          cardCompany
                        }
                        onChange={(
                          event
                        ) =>
                          setCardCompany(
                            event.target
                              .value
                          )
                        }
                      >
                        {CARD_COMPANIES.map(
                          (
                            company
                          ) => (
                            <option
                              key={
                                company
                              }
                              value={
                                company
                              }
                            >
                              {
                                company
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>


                    <label
                      className="lcode-paymentSetting"
                    >
                      <span>
                        할부
                      </span>

                      <select
                        value={
                          installment
                        }
                        onChange={(
                          event
                        ) =>
                          setInstallment(
                            event.target
                              .value
                          )
                        }
                      >
                        {INSTALLMENTS.map(
                          (
                            item
                          ) => (
                            <option
                              key={
                                item
                              }
                              value={
                                item
                              }
                            >
                              {
                                item
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>
                )}


                {paymentMethod ===
                  "bank" && (
                  <div
                    className="lcode-paymentDetail"
                  >
                    <div
                      className="lcode-paymentDetailHead"
                    >
                      <b>
                        BANK TRANSFER
                      </b>

                      <span>
                        계좌이체 설정
                      </span>
                    </div>


                    <label
                      className="lcode-paymentSetting"
                    >
                      <span>
                        은행
                      </span>

                      <select
                        value={
                          bank
                        }
                        onChange={(
                          event
                        ) =>
                          setBank(
                            event.target
                              .value
                          )
                        }
                      >
                        {BANKS.map(
                          (
                            bankName
                          ) => (
                            <option
                              key={
                                bankName
                              }
                              value={
                                bankName
                              }
                            >
                              {
                                bankName
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>


                    <label
                      className="lcode-paymentSetting"
                    >
                      <span>
                        입금자명
                      </span>

                      <input
                        type="text"
                        value={
                          depositor
                        }
                        placeholder="입금자명"
                        onChange={(
                          event
                        ) =>
                          setDepositor(
                            event.target
                              .value
                          )
                        }
                      />
                    </label>
                  </div>
                )}


                {paymentMethod ===
                  "kakao" && (
                  <div
                    className="lcode-easyPay"
                  >
                    <b>
                      KAKAO PAY
                    </b>

                    <p>
                      결제하기를 누르면
                      카카오페이 결제
                      단계로 진행됩니다.
                    </p>
                  </div>
                )}


                {paymentMethod ===
                  "naver" && (
                  <div
                    className="lcode-easyPay"
                  >
                    <b>
                      NAVER PAY
                    </b>

                    <p>
                      결제하기를 누르면
                      네이버페이 결제
                      단계로 진행됩니다.
                    </p>
                  </div>
                )}
              </section>


              {/* COUPON */}

              <section
                className="lcode-orderBlock"
              >
                <h2
                  className="lcode-blockTitle"
                >
                  <span>
                    COUPON / POINT
                  </span>

                  <small>
                    1 AVAILABLE
                  </small>
                </h2>


                <div
                  className="lcode-coupon"
                >
                  <div
                    className="lcode-couponText"
                  >
                    <b>
                      장바구니 쿠폰
                    </b>

                    <small>
                      TC-0012 ·
                      3,000 KRW 할인
                    </small>
                  </div>


                  <label
                    className="lcode-switch"
                  >
                    <input
                      type="checkbox"
                      checked={
                        couponApplied
                      }
                      onChange={(
                        event
                      ) =>
                        setCouponApplied(
                          event.target
                            .checked
                        )
                      }
                    />

                    <span />
                  </label>
                </div>
              </section>


              {/* AGREEMENT */}

              <section
                className="lcode-orderBlock"
              >
                <h2
                  className="lcode-blockTitle"
                >
                  <span>
                    ORDER AGREEMENT
                  </span>
                </h2>


                <label
                  className="lcode-agreement"
                >
                  <input
                    type="checkbox"
                    checked={
                      agreed
                    }
                    onChange={(
                      event
                    ) =>
                      setAgreed(
                        event.target
                          .checked
                      )
                    }
                  />


                  <span>
                    <b>
                      주문 내용을 확인했으며
                      결제에 동의합니다.
                    </b>

                    <small>
                      상품, 옵션, 배송지,
                      할인 및 최종 결제
                      금액을 확인해주세요.
                    </small>
                  </span>
                </label>
              </section>
            </div>
          </div>


          {/* RIGHT PAYMENT */}

          <div
            ref={
              paymentRailRef
            }
            className="lcode-paymentRail"
          >
            <aside
              ref={
                paymentBoxRef
              }
              className="lcode-paymentSticky"
            >
              <h2>
                결제 금액
              </h2>


              <div
                className="lcode-summaryRows"
              >
                <div
                  className="lcode-summaryRow"
                >
                  <span>
                    상품 금액
                  </span>

                  <b>
                    {subtotal.toLocaleString()}
                    원
                  </b>
                </div>


                {giftWrapFee >
                  0 && (
                  <div
                    className="lcode-summaryRow"
                  >
                    <span>
                      선물 포장
                    </span>

                    <b>
                      +
                      {giftWrapFee.toLocaleString()}
                      원
                    </b>
                  </div>
                )}


                <div
                  className="lcode-summaryRow"
                >
                  <span>
                    배송비
                  </span>

                  <b>
                    {shipping.toLocaleString()}
                    원
                  </b>
                </div>


                <div
                  className="lcode-summaryRow discount"
                >
                  <span>
                    할인 금액
                  </span>

                  <b>
                    -
                    {couponDiscount.toLocaleString()}
                    원
                  </b>
                </div>
              </div>


              <div
                className="lcode-summaryTotal"
              >
                <span>
                  총 결제 금액
                </span>

                <strong>
                  {total.toLocaleString()}

                  <small>
                    KRW
                  </small>
                </strong>
              </div>


              <div
                className="lcode-summaryBenefit"
              >
                <p>
                  <span>
                    적용 쿠폰
                  </span>

                  <b>
                    {couponApplied
                      ? "TC-0012"
                      : "미적용"}
                  </b>
                </p>


                <p>
                  <span>
                    이번 주문 혜택
                  </span>

                  <b>
                    {couponApplied
                      ? "3,000원 할인"
                      : "0원"}
                  </b>
                </p>
              </div>


              <div
                className="lcode-summaryMethod"
              >
                <span>
                  PAYMENT METHOD
                </span>

                <b>
                  {
                    selectedPaymentLabel
                  }

                  {paymentMethod ===
                    "card" &&
                    ` · ${cardCompany}`}

                  {paymentMethod ===
                    "bank" &&
                    ` · ${bank}`}
                </b>
              </div>


              <button
                type="button"
                className="lcode-payButton"
                disabled={
                  loading ||
                  checkoutItems.length ===
                    0
                }
                onClick={
                  handlePayment
                }
              >
                {total.toLocaleString()}
                원 결제하기
              </button>


              <p
                className="lcode-payNotice"
              >
                주문 내용을 확인한 후
                결제를 진행해주세요.
              </p>
            </aside>
          </div>
        </div>
      </main>


      {loading && (
        <div
          className="lcode-paymentLoading"
          role="status"
          aria-live="polite"
        >
          <div
            className="lcode-loadingInner"
          >
            <div
              className="lcode-spinner"
            />

            <small>
              PAYMENT PROCESSING
            </small>

            <h2>
              결제를 처리하고
              있습니다.
            </h2>

            <p>
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
