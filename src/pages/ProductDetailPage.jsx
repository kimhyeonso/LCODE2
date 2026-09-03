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
import { useManagedCollection } from "../hooks/useManagedCollection";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";
import customStyles from "./ProductCustom.module.scss";

/* =========================================================
   PRODUCT IMAGE AUTO LOADER

   products.json 실제 배열 순서 기준

   n_1.png / n_2.png
   → 상품 상세 상단 갤러리

   n.png
   → PRODUCT DETAIL

   n_1.png
   → 다른 상품 미니 썸네일
========================================================= */

const detailImageModules =
  import.meta.glob(
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
  const path =
    `../assets/images/detail/${number}${suffix}.png`;

  return (
    detailImageModules[
      path
    ] || ""
  );
};

/* =========================================================
   PRODUCT IMAGE MAP

   ★ 상품 ID 숫자가 아니라
   ★ products.json 배열 순서로 자동 생성
========================================================= */

const productImageMap =
  Object.fromEntries(
    products.map(
      (
        product,
        index
      ) => {
        const imageNumber =
          index + 1;

        const main =
          getDetailImage(
            imageNumber,
            "_1"
          );

        const sub =
          getDetailImage(
            imageNumber,
            "_2"
          );

        const detail =
          getDetailImage(
            imageNumber
          );

        return [
          product.id,
          {
            imageNumber,

            thumbnail:
              main,

            gallery: [
              main,
              sub,
            ].filter(
              Boolean
            ),

            detail: [
              detail,
            ].filter(
              Boolean
            ),
          },
        ];
      }
    )
  );

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
   CUSTOM PREVIEW HELPERS
========================================================= */

const createCustomSide = () => ({
  image: "",
  fileName: "",
  scale: 100,
  x: 50,
  y: 50,
});

const createCustomDesign = () => ({
  front: createCustomSide(),
  back: createCustomSide(),
});

const serializeCustomDesign = (design) => ({
  front: {
    hasImage: Boolean(design.front.image),
    fileName: design.front.fileName,
    scale: design.front.scale,
    x: design.front.x,
    y: design.front.y,
  },
  back: {
    hasImage: Boolean(design.back.image),
    fileName: design.back.fileName,
    scale: design.back.scale,
    x: design.back.x,
    y: design.back.y,
  },
});

/* =========================================================
   RELATED PRODUCTS

   1. 세트 상품
      → 세트 구성품을 가장 먼저 노출
      → 4개 미만이면 구성품과 같은 카테고리 상품으로 보충

   2. 일반 상품
      → 이 상품이 들어있는 세트의 다른 구성품을 우선 노출
      → 부족하면 같은 카테고리 상품으로 보충
      → 그래도 부족하면 다른 일반 상품으로 4개 채움
========================================================= */

const isSetItem = (
  item
) =>
  item?.category ===
    "세트 상품" ||
  item?.id?.startsWith(
    "S"
  );

const singleProducts =
  products.filter(
    (item) =>
      !isSetItem(item)
  );

const setProducts =
  products.filter(
    (item) =>
      isSetItem(item)
  );

const getRelatedProducts = (
  currentProduct
) => {
  if (
    !currentProduct
  ) {
    return [];
  }

  const result = [];
  const usedIds =
    new Set([
      currentProduct.id,
    ]);

  const addProduct = (
    candidate
  ) => {
    if (
      !candidate ||
      isSetItem(
        candidate
      ) ||
      usedIds.has(
        candidate.id
      ) ||
      result.length >= 4
    ) {
      return;
    }

    usedIds.add(
      candidate.id
    );

    result.push(
      candidate
    );
  };

  /* =======================================================
     SET PRODUCT
  ======================================================= */

  if (
    isSetItem(
      currentProduct
    )
  ) {
    const componentNames =
      Array.isArray(
        currentProduct.items
      )
        ? currentProduct.items
        : [];

    /*
      세트 구성품 자체를
      가장 먼저 그대로 노출
    */
    componentNames.forEach(
      (name) => {
        const component =
          singleProducts.find(
            (item) =>
              item.name ===
              name
          );

        addProduct(
          component
        );
      }
    );

    /*
      구성품이 3개 등으로
      4개를 못 채운 경우:

      현재 세트 구성품과 다른 세트에서
      같이 묶였던 상품을 먼저 찾아 보충.
      겹치는 구성품 수가 많을수록 우선.
    */
    if (
      result.length < 4
    ) {
      const currentNames =
        new Set(
          componentNames
        );

      const relatedScores =
        new Map();

      setProducts
        .filter(
          (setItem) =>
            setItem.id !==
            currentProduct.id &&
            Array.isArray(
              setItem.items
            )
        )
        .forEach(
          (setItem) => {
            const overlapCount =
              setItem.items.filter(
                (name) =>
                  currentNames.has(
                    name
                  )
              ).length;

            if (
              overlapCount === 0
            ) {
              return;
            }

            setItem.items
              .filter(
                (name) =>
                  !currentNames.has(
                    name
                  )
              )
              .forEach(
                (name) => {
                  relatedScores.set(
                    name,
                    (
                      relatedScores.get(
                        name
                      ) || 0
                    ) +
                    overlapCount
                  );
                }
              );
          }
        );

      [...relatedScores.entries()]
        .sort(
          (
            a,
            b
          ) =>
            b[1] -
            a[1]
        )
        .forEach(
          ([name]) => {
            const candidate =
              singleProducts.find(
                (item) =>
                  item.name ===
                  name
              );

            addProduct(
              candidate
            );
          }
        );
    }

    /*
      그래도 부족하면
      구성품 카테고리와 같은
      일반 상품으로 채움
    */
    if (
      result.length < 4
    ) {
      const componentCategories =
        new Set(
          result.map(
            (item) =>
              item.category
          )
        );

      singleProducts
        .filter(
          (item) =>
            componentCategories.has(
              item.category
            )
        )
        .forEach(
          addProduct
        );
    }
  }

  /* =======================================================
     SINGLE PRODUCT
  ======================================================= */

  if (
    !isSetItem(
      currentProduct
    )
  ) {
    /*
      현재 상품이 들어간 세트를 찾아서
      함께 묶였던 다른 구성품을 점수화.
      여러 세트에서 같이 등장할수록 우선.
    */
    const companionScores =
      new Map();

    setProducts
      .filter(
        (setItem) =>
          Array.isArray(
            setItem.items
          ) &&
          setItem.items.includes(
            currentProduct.name
          )
      )
      .forEach(
        (setItem) => {
          setItem.items
            .filter(
              (name) =>
                name !==
                currentProduct.name
            )
            .forEach(
              (name) => {
                companionScores.set(
                  name,
                  (
                    companionScores.get(
                      name
                    ) || 0
                  ) + 1
                );
              }
            );
        }
      );

    [...companionScores.entries()]
      .sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      )
      .forEach(
        ([name]) => {
          const companion =
            singleProducts.find(
              (item) =>
                item.name ===
                name
            );

          addProduct(
            companion
          );
        }
      );

    /*
      세트 동반 상품만으로
      4개가 안 채워지면
      같은 카테고리 우선
    */
    if (
      result.length < 4
    ) {
      singleProducts
        .filter(
          (item) =>
            item.category ===
            currentProduct.category
        )
        .forEach(
          addProduct
        );
    }
  }

  /*
    마지막 안전장치:
    같은 카테고리/세트 연관성이 부족한
    단독 상품은 대표 여행 필수품으로 보충.
  */
  if (
    result.length < 4
  ) {
    const fallbackIds = [
      "P001",
      "P024",
      "P026",
      "P002",
      "P012",
      "P014",
    ];

    fallbackIds
      .map(
        (id) =>
          singleProducts.find(
            (item) =>
              item.id === id
          )
      )
      .forEach(
        addProduct
      );
  }

  /*
    데이터가 바뀌어도 4개를
    가능한 한 유지하는 최종 안전장치
  */
  if (
    result.length < 4
  ) {
    singleProducts.forEach(
      addProduct
    );
  }

  return result.slice(
    0,
    4
  );
};

/* =========================================================
   PRODUCT DETAIL PAGE
========================================================= */

export default function ProductDetailPage() {
  const managedProducts = useManagedCollection("products", products);
  const {
    productId,
  } = useParams();

  const navigate =
    useNavigate();

  const product =
    managedProducts.find(
      (item) =>
        item.id ===
        productId
    );

  const {
    addToCart,
    saved,
    toggleSaved,
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
    selectedVariants,
    setSelectedVariants,
  ] = useState({});

  const [
    customTargetKey,
    setCustomTargetKey,
  ] = useState(null);

  const [
    customOpen,
    setCustomOpen,
  ] = useState(false);

  const [
    customSide,
    setCustomSide,
  ] = useState("front");

  const [
    customConfirmed,
    setCustomConfirmed,
  ] = useState(false);

  const [
    customVersion,
    setCustomVersion,
  ] = useState(0);

  const [
    customDesign,
    setCustomDesign,
  ] = useState(() =>
    createCustomDesign()
  );

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

  const [
    relatedToastProduct,
    setRelatedToastProduct,
  ] = useState(null);

  /* =======================================================
     IMAGE SET
  ======================================================= */

  const defaultImageSet = productImageMap[productId] || {
      gallery: [],
      detail: [],
      thumbnail: "",
    };

  const imageSet = product?.image
    ? { ...defaultImageSet, gallery: [product.image], thumbnail: product.image }
    : defaultImageSet;

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
    setSelectedVariants({});
    setCustomTargetKey(null);
    setCustomOpen(false);
    setCustomSide("front");
    setCustomConfirmed(false);
    setCustomVersion(0);
    setCustomDesign(
      createCustomDesign()
    );
    setAdded(false);
    setRelatedToastProduct(
      null
    );

    setPurchaseConfirmOpen(
      false
    );
  }, [productId]);

  useEffect(() => {
    if (
      !relatedToastProduct
    ) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => {
          setRelatedToastProduct(
            null
          );
        },
        2600
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [relatedToastProduct]);

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

  const relatedProducts =
    getRelatedProducts(
      product
    );

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
     VARIANT GROUPS

     일반 상품
     → 자신의 variants를 1개 그룹으로 사용

     세트 상품
     → items 안에서 variants가 있는 단품을 찾아
       OPTION (제품명) 형태로 각각 독립 선택
  ======================================================= */

  const variantGroups = isSetProduct
    ? (Array.isArray(product.items) ? product.items : [])
        .map((itemName) => {
          const childProduct = products.find(
            (item) =>
              item.name === itemName &&
              Array.isArray(item.variants) &&
              item.variants.length > 0
          );

          if (!childProduct) {
            return null;
          }

          return {
            key: childProduct.id,
            productId: childProduct.id,
            productName: childProduct.name,
            label: `OPTION (${childProduct.name})`,
            variants: childProduct.variants,
            customization: childProduct.customization || null,
          };
        })
        .filter(Boolean)
    : Array.isArray(product.variants) && product.variants.length > 0
      ? [
          {
            key: product.id,
            productId: product.id,
            productName: product.name,
            label: product.variantLabel || "COLOR",
            variants: product.variants,
            customization: product.customization || null,
          },
        ]
      : [];

  const hasVariants = variantGroups.length > 0;

  const selectedVariantList = variantGroups
    .map((group) => ({
      group,
      variant: selectedVariants[group.key] || null,
    }))
    .filter(({ variant }) => Boolean(variant));

  const variantExtraPrice = selectedVariantList.reduce(
    (sum, { variant }) =>
      sum + Number(variant?.extraPrice || 0),
    0
  );

  const customSelection = selectedVariantList.find(
    ({ variant }) => Boolean(variant?.custom)
  );

  const isCustomVariant = Boolean(customSelection);

  const selectedVariant = selectedVariantList.length
    ? {
        id: selectedVariantList
          .map(({ group, variant }) => `${group.key}:${variant.id}`)
          .join("|"),
        label: selectedVariantList
          .map(({ group, variant }) =>
            isSetProduct
              ? `${group.productName}: ${variant.label}`
              : variant.label
          )
          .join(" / "),
        extraPrice: variantExtraPrice,
        custom: isCustomVariant,
      }
    : null;

  const variantSelections = selectedVariantList.map(
    ({ group, variant }) => ({
      productId: group.productId,
      productName: group.productName,
      variant: { ...variant },
    })
  );

  const variantKey = hasVariants
    ? variantGroups
        .map((group) => {
          const variant = selectedVariants[group.key];

          if (!variant) {
            return `${group.key}:none`;
          }

          return `${group.key}:${variant.id}${
            variant.custom
              ? `-v${customVersion || 1}`
              : ""
          }`;
        })
        .join("|")
    : "default";

  const unitPrice =
    Number(product.price) +
    variantExtraPrice;

  const productTotal =
    unitPrice *
    Number(quantity);

  /*
    Gift Wrap은
    상품 수량과 관계없이
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

  const activeCustomDesign =
    customDesign[customSide];

  const customSummary =
    isCustomVariant
      ? serializeCustomDesign(
          customDesign
        )
      : null;

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

  const goPrevious = () => {
    if (!hasGallery) {
      return;
    }

    setActiveImage(
      (previous) =>
        previous === 0
          ? galleryImages.length -
            1
          : previous - 1
    );
  };

  const goNext = () => {
    if (!hasGallery) {
      return;
    }

    setActiveImage(
      (previous) =>
        previous ===
        galleryImages.length -
          1
          ? 0
          : previous + 1
    );
  };

  /* =======================================================
     OPTION / VARIANT / CUSTOM
  ======================================================= */

  const handleOptionSelect =
    (option) => {
      setSelectedOption(
        option
      );
    };

  const handleVariantSelect =
    (groupKey, variant) => {
      setSelectedVariants(
        (previous) => ({
          ...previous,
          [groupKey]: variant,
        })
      );

      if (variant.custom) {
        setCustomTargetKey(groupKey);
        setCustomOpen(true);
        return;
      }

      if (customTargetKey === groupKey) {
        setCustomConfirmed(false);
        setCustomTargetKey(null);
      }
    };

  const updateCustomSide =
    (key, value) => {
      setCustomDesign(
        (previous) => ({
          ...previous,
          [customSide]: {
            ...previous[customSide],
            [key]: value,
          },
        })
      );
    };

  const clampCustomPosition =
    (value) =>
      Math.max(
        -50,
        Math.min(150, value)
      );

  const updateCustomPositionFromPointer =
    (event) => {
      if (
        !activeCustomDesign.image
      ) {
        return;
      }

      const rect =
        event.currentTarget.getBoundingClientRect();

      const nextX =
        ((event.clientX - rect.left) /
          rect.width) *
        100;

      const nextY =
        ((event.clientY - rect.top) /
          rect.height) *
        100;

      setCustomDesign(
        (previous) => ({
          ...previous,
          [customSide]: {
            ...previous[customSide],
            x: Math.round(
              clampCustomPosition(nextX)
            ),
            y: Math.round(
              clampCustomPosition(nextY)
            ),
          },
        })
      );
    };

  const handleCustomPointerDown =
    (event) => {
      if (
        !activeCustomDesign.image
      ) {
        return;
      }

      event.preventDefault();

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      );

      updateCustomPositionFromPointer(
        event
      );
    };

  const handleCustomPointerMove =
    (event) => {
      if (
        !activeCustomDesign.image ||
        !event.currentTarget.hasPointerCapture?.(
          event.pointerId
        )
      ) {
        return;
      }

      updateCustomPositionFromPointer(
        event
      );
    };

  const handleCustomPointerUp =
    (event) => {
      if (
        event.currentTarget.hasPointerCapture?.(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture?.(
          event.pointerId
        );
      }
    };

  const handleCustomImageUpload =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        setCustomDesign(
          (previous) => ({
            ...previous,
            [customSide]: {
              ...previous[customSide],
              image: String(
                reader.result ||
                ""
              ),
              fileName: file.name,
            },
          })
        );
      };

      reader.readAsDataURL(
        file
      );

      event.target.value = "";
    };

  const handleCustomReset =
    () => {
      setCustomDesign(
        (previous) => ({
          ...previous,
          [customSide]:
            createCustomSide(),
        })
      );
    };

  const handleCustomCancel =
    () => {
      setCustomOpen(false);

      if (
        !customConfirmed &&
        customTargetKey
      ) {
        setSelectedVariants(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next[
              customTargetKey
            ];

            return next;
          }
        );

        setCustomTargetKey(null);
      }
    };

  const handleCustomApply =
    () => {
      const hasCustomImage =
        Boolean(
          customDesign.front.image ||
          customDesign.back.image
        );

      if (!hasCustomImage) {
        window.alert(
          "앞면 또는 뒷면 이미지를 한 장 이상 업로드해주세요."
        );
        return;
      }

      setCustomConfirmed(true);
      setCustomVersion(
        (previous) =>
          previous + 1
      );
      setCustomOpen(false);
    };

  const checkOption =
    () => {
      const missingVariantGroup =
        variantGroups.find(
          (group) =>
            !selectedVariants[
              group.key
            ]
        );

      if (missingVariantGroup) {
        window.alert(
          isSetProduct
            ? `${missingVariantGroup.productName} 옵션을 선택해주세요.`
            : "색상 옵션을 선택해주세요."
        );
        return false;
      }

      if (
        isCustomVariant &&
        !customConfirmed
      ) {
        if (customSelection?.group?.key) {
          setCustomTargetKey(
            customSelection.group.key
          );
        }

        setCustomOpen(true);
        return false;
      }

      if (
        !selectedOption
      ) {
        window.alert(
          "포장 옵션을 선택해주세요."
        );
        return false;
      }

      return true;
    };

  const buildCartProduct =
    () => ({
      ...product,
      basePrice:
        Number(product.price),
      price: unitPrice,
      image:
        imageSet.thumbnail ||
        "",
      thumbnail:
        imageSet.thumbnail ||
        "",
      selectedVariant:
        selectedVariant ||
        null,
      variantSelections,
      variantKey,
      customization:
        customSummary,
    });

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
        buildCartProduct(),
        quantity,
        selectedOption
      );

      setAdded(true);
    };

  const handleRelatedAdd =
    (
      event,
      relatedProduct
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const relatedImage =
        productImageMap[
          relatedProduct.id
        ]?.thumbnail ||
        "";

      const relatedVariant =
        Array.isArray(
          relatedProduct.variants
        )
          ? relatedProduct.variants[0]
          : null;

      addToCart(
        {
          ...relatedProduct,
          price:
            Number(
              relatedProduct.price
            ) +
            Number(
              relatedVariant?.extraPrice ||
              0
            ),
          image:
            relatedImage,
          thumbnail:
            relatedImage,
          selectedVariant:
            relatedVariant,
          variantKey:
            relatedVariant?.id ||
            "default",
        },
        1,
        PRODUCT_OPTIONS[0]
      );

      setRelatedToastProduct(
        {
          ...relatedProduct,
          thumbnail:
            relatedImage,
        }
      );
    };

  const handleRelatedSaved =
    (
      event,
      relatedProductId
    ) => {
      event.preventDefault();
      event.stopPropagation();

      toggleSaved(
        relatedProductId
      );
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

      sessionStorage.removeItem(
        "checkoutSelection"
      );

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
            unitPrice,

          basePrice:
            product.price,

          quantity,

          option:
            selectedOption,

          selectedVariant:
            selectedVariant ||
            null,

          variantSelections,

          variantKey,

          customization:
            customSummary,

          giftWrapFee,

          total,

          image:
            imageSet.thumbnail ||
            galleryImages[
              0
            ] ||
            "",
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
                            aria-label={`${index + 1}번 상품 이미지 보기`}
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

          <strong>
            {product.price.toLocaleString()}
            {" "}
            <em>
              KRW
            </em>
          </strong>

          <p>
            {
              product.desc
            }

            <br />

            {
              product.merit
            }
          </p>

          {Array.isArray(
            product.items
          ) &&
            product.items.length >
              0 && (
              <div>
                {product.items.map(
                  (item) => (
                    <span
                      key={
                        item
                      }
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            )}

          <hr />

          {hasVariants && (
            <div
              className={
                customStyles.variantSections
              }
            >
              {variantGroups.map(
                (group) => {
                  const selectedForGroup =
                    selectedVariants[
                      group.key
                    ] || null;

                  const groupCustomApplied =
                    Boolean(
                      selectedForGroup?.custom &&
                      customConfirmed
                    );

                  return (
                    <div
                      className={
                        customStyles.variantSection
                      }
                      key={group.key}
                    >
                      <label>
                        {group.label}
                      </label>

                      <div
                        className={
                          customStyles.variantGrid
                        }
                      >
                        {group.variants.map(
                          (variant) => {
                            const isSelected =
                              selectedForGroup?.id ===
                              variant.id;

                            return (
                              <button
                                type="button"
                                key={variant.id}
                                className={[
                                  customStyles.variantButton,
                                  variant.custom
                                    ? customStyles.customVariantFull
                                    : "",
                                  isSelected
                                    ? customStyles.variantSelected
                                    : "",
                                ].join(" ")}
                                onClick={() =>
                                  handleVariantSelect(
                                    group.key,
                                    variant
                                  )
                                }
                              >
                                <span
                                  className={[
                                    customStyles.variantSwatch,
                                    variant.custom
                                      ? customStyles.customSwatch
                                      : "",
                                  ].join(" ")}
                                  style={
                                    variant.custom
                                      ? undefined
                                      : {
                                          background:
                                            variant.swatch ||
                                            "#ddd",
                                        }
                                  }
                                />

                                <b>
                                  {variant.label}
                                </b>

                                {Number(
                                  variant.extraPrice ||
                                  0
                                ) > 0 && (
                                  <em>
                                    +{Number(
                                      variant.extraPrice
                                    ).toLocaleString()}
                                    {" KRW"}
                                  </em>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {groupCustomApplied && (
                        <button
                          type="button"
                          className={
                            customStyles.editCustomButton
                          }
                          onClick={() => {
                            setCustomTargetKey(
                              group.key
                            );
                            setCustomOpen(true);
                          }}
                        >
                          CUSTOM DESIGN EDIT →
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}

          <label>
            PACKAGING
          </label>

          <div
            className={
              styles.options
            }
          >
            {PRODUCT_OPTIONS.map(
              (option) => {
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
          PRODUCT TEXT
      =================================================== */}

      <section
        className={
          styles.productAccordion
        }
      >
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
          RELATED PRODUCTS
      =================================================== */}

      <section
        className={
          styles.relatedProducts
        }
      >
        <div
          className={
            styles.relatedProductsHeader
          }
        >
          <div>
            <small>
              RELATED PRODUCTS
            </small>

            <h2>
              함께 준비하면 좋은 상품
            </h2>
          </div>

          <span>
            {String(
              relatedProducts.length
            ).padStart(
              2,
              "0"
            )}{" "}
            ITEMS
          </span>
        </div>

        <div
          className={
            styles.relatedProductsGrid
          }
        >
          {relatedProducts.map(
            (
              relatedProduct
            ) => {
              const relatedImage =
                productImageMap[
                  relatedProduct.id
                ]?.thumbnail ||
                "";

              const liked =
                saved.includes(
                  relatedProduct.id
                );

              return (
                <article
                  key={
                    relatedProduct.id
                  }
                  className={
                    styles.productCard
                  }
                >
                  <div
                    className={
                      styles.productVisual
                    }
                  >
                    <Link
                      to={
                        `/shop/${relatedProduct.id}`
                      }
                    >
                      <span
                        className={
                          styles.cardCategory
                        }
                      >
                        {
                          relatedProduct.category
                        }
                      </span>

                      {relatedImage ? (
                        <img
                          className={
                            styles.productThumb
                          }
                          src={
                            relatedImage
                          }
                          alt={
                            relatedProduct.name
                          }
                          loading="lazy"
                        />
                      ) : (
                        <b>
                          {relatedProduct.name.slice(
                            0,
                            1
                          )}
                        </b>
                      )}
                    </Link>

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
                      onClick={(
                        event
                      ) =>
                        handleRelatedSaved(
                          event,
                          relatedProduct.id
                        )
                      }
                      aria-label={
                        liked
                          ? `${relatedProduct.name} 찜 해제`
                          : `${relatedProduct.name} 찜하기`
                      }
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M12 20.7 10.55 19.38C5.4 14.7 2 11.62 2 7.85 2 4.77 4.42 2.35 7.5 2.35c1.74 0 3.41.81 4.5 2.09a6.03 6.03 0 0 1 4.5-2.09c3.08 0 5.5 2.42 5.5 5.5 0 3.77-3.4 6.85-8.55 11.54Z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className={
                        styles.cardCart
                      }
                      onClick={(
                        event
                      ) =>
                        handleRelatedAdd(
                          event,
                          relatedProduct
                        )
                      }
                      aria-label={`${relatedProduct.name} 장바구니 담기`}
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
                      {
                        relatedProduct.category
                      }
                    </small>

                    <Link
                      to={
                        `/shop/${relatedProduct.id}`
                      }
                    >
                      <h3>
                        {
                          relatedProduct.name
                        }
                      </h3>
                    </Link>

                    <p>
                      {Number(
                        relatedProduct.price
                      ).toLocaleString()}{" "}
                      KRW
                    </p>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>

      {/* ===================================================
          RELATED QUICK CART
      =================================================== */}

      {relatedToastProduct && (
        <aside
          className={
            styles.relatedQuickCart
          }
        >
          <small>
            ADDED TO CART
          </small>

          <div>
            <span
              className={
                styles.relatedQuickVisual
              }
            >
              {relatedToastProduct.thumbnail ? (
                <img
                  src={
                    relatedToastProduct.thumbnail
                  }
                  alt={
                    relatedToastProduct.name
                  }
                />
              ) : (
                relatedToastProduct.name.slice(
                  0,
                  1
                )
              )}
            </span>

            <b>
              {
                relatedToastProduct.name
              }

              <em>
                {Number(
                  relatedToastProduct.price
                ).toLocaleString()}{" "}
                KRW · 기본 /
                Standard · 1개
              </em>
            </b>

            <Link to="/cart">
              CART →
            </Link>
          </div>
        </aside>
      )}

      {/* ===================================================
          CARRIER CUSTOM PREVIEW
      =================================================== */}

      {customOpen &&
        isCustomVariant && (
        <div
          className={
            customStyles.customBackdrop
          }
          onClick={
            handleCustomCancel
          }
        >
          <div
            className={
              customStyles.customModal
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <section
              className={
                customStyles.customWorkspace
              }
            >
              <div
                className={
                  customStyles.workspaceTop
                }
              >
                <span>
                  L:CODE CUSTOM PREVIEW
                </span>

                <b>
                  {customSide ===
                  "front"
                    ? "FRONT"
                    : "BACK"}
                </b>
              </div>

              <div
                className={
                  customStyles.suitcaseStage
                }
              >
                <div
                  className={
                    customStyles.suitcase
                  }
                >
                  <span
                    className={
                      customStyles.suitcaseHandle
                    }
                  />

                  <div
                    className={
                      customStyles.suitcaseBody
                    }
                    onPointerDown={
                      handleCustomPointerDown
                    }
                    onPointerMove={
                      handleCustomPointerMove
                    }
                    onPointerUp={
                      handleCustomPointerUp
                    }
                    onPointerCancel={
                      handleCustomPointerUp
                    }
                  >
                    {activeCustomDesign.image ? (
                      <img
                        className={
                          customStyles.customArtwork
                        }
                        src={
                          activeCustomDesign.image
                        }
                        alt={`${customSide} custom preview`}
                        style={{
                          left: `${activeCustomDesign.x}%`,
                          top: `${activeCustomDesign.y}%`,
                          transform: `translate(-50%, -50%) scale(${
                            activeCustomDesign.scale /
                            100
                          })`,
                        }}
                      />
                    ) : (
                      <div
                        className={
                          customStyles.customEmpty
                        }
                      >
                        <span>+</span>
                        <p>
                          이미지를 업로드하면
                          <br />
                          이 영역에 미리보기됩니다.
                        </p>
                      </div>
                    )}
                  </div>

                  <span
                    className={`${customStyles.wheel} ${customStyles.wheelLeft}`}
                  />
                  <span
                    className={`${customStyles.wheel} ${customStyles.wheelRight}`}
                  />
                </div>
              </div>
            </section>

            <aside
              className={
                customStyles.customPanel
              }
            >
              <button
                type="button"
                className={
                  customStyles.customClose
                }
                onClick={
                  handleCustomCancel
                }
                aria-label="커스텀 닫기"
              >
                ×
              </button>

              <small>
                CARRIER COVER CUSTOM
              </small>

              <h2>
                앞면과 뒷면을
                간단하게 꾸며보세요.
              </h2>

              <p>
                실제 제작 기능이 아닌 쇼핑몰
                프리뷰 연출입니다. 이미지 크기와
                위치만 간단하게 조절할 수 있어요.
              </p>

              <div
                className={
                  customStyles.sideTabs
                }
              >
                <button
                  type="button"
                  className={
                    customSide ===
                    "front"
                      ? customStyles.sideActive
                      : ""
                  }
                  onClick={() =>
                    setCustomSide(
                      "front"
                    )
                  }
                >
                  앞면 / FRONT
                </button>

                <button
                  type="button"
                  className={
                    customSide ===
                    "back"
                      ? customStyles.sideActive
                      : ""
                  }
                  onClick={() =>
                    setCustomSide(
                      "back"
                    )
                  }
                >
                  뒷면 / BACK
                </button>
              </div>

              <label
                className={
                  customStyles.uploadButton
                }
              >
                <span>
                  이미지 업로드
                </span>
                <b>+</b>
                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleCustomImageUpload
                  }
                />
              </label>

              {activeCustomDesign.fileName && (
                <div
                  className={
                    customStyles.fileName
                  }
                >
                  {activeCustomDesign.fileName}
                </div>
              )}

              <div
                className={
                  customStyles.rangeGroup
                }
              >
                <label>
                  <span>크기</span>
                  <b>
                    {activeCustomDesign.scale}%
                  </b>
                </label>
                <input
                  type="range"
                  min="20"
                  max="400"
                  value={
                    activeCustomDesign.scale
                  }
                  onChange={(event) =>
                    updateCustomSide(
                      "scale",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </div>

              <div
                className={
                  customStyles.rangeGroup
                }
              >
                <label>
                  <span>가로 위치</span>
                  <b>
                    {activeCustomDesign.x}%
                  </b>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="150"
                  value={
                    activeCustomDesign.x
                  }
                  onChange={(event) =>
                    updateCustomSide(
                      "x",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </div>

              <div
                className={
                  customStyles.rangeGroup
                }
              >
                <label>
                  <span>세로 위치</span>
                  <b>
                    {activeCustomDesign.y}%
                  </b>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="150"
                  value={
                    activeCustomDesign.y
                  }
                  onChange={(event) =>
                    updateCustomSide(
                      "y",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </div>

              <div
                className={
                  customStyles.customActions
                }
              >
                <button
                  type="button"
                  onClick={
                    handleCustomApply
                  }
                >
                  커스텀 적용 · +5,000 KRW
                </button>

                <button
                  type="button"
                  onClick={
                    handleCustomReset
                  }
                >
                  현재 면 초기화
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

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

              {selectedVariant && (
                <p>
                  색상 / 커버
                  <br />
                  <b>
                    {selectedVariant.label}
                    {isCustomVariant &&
                      customConfirmed &&
                      " · CUSTOM APPLIED"}
                  </b>
                </p>
              )}

              <p>
                포장 옵션
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

                {selectedVariant && (
                  <>
                    {selectedVariant.label}
                    {" · "}
                  </>
                )}

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
                    (item) =>
                      item.id !==
                      product.id
                  )
                  .slice(
                    0,
                    3
                  )
                  .map(
                    (item) => {
                      const miniImage =
                        productImageMap[
                          item.id
                        ]?.thumbnail;

                      return (
                        <div
                          key={
                            item.id
                          }
                        >
                          <div
                            className={
                              styles.miniVisual
                            }
                          >
                            {miniImage && (
                              <img
                                src={
                                  miniImage
                                }
                                alt={
                                  item.name
                                }
                                loading="lazy"
                              />
                            )}
                          </div>

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
                      );
                    }
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
