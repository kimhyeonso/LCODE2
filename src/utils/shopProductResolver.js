import products from "../data/products.json";

/* =========================================================
   SHOP PRODUCT RESOLVER

   장바구니 / 결제 / Firebase에 저장된 예전 상품 데이터와
   현재 products.json을 다시 연결하기 위한 공통 보정기입니다.

   지원:
   - 일반 상품 Pxxx
   - 세트 상품 Sxxx
   - id 대신 productId가 남아 있는 예전 데이터
   - name / productName / title 기반 fallback
   - detail 이미지의 배열순서 파일명 (1_1.png ...)
   - 세트 전용 파일명 (S2_1.png / S002_1.png ...)
========================================================= */

const PRODUCT_IMAGE_MODULES = import.meta.glob(
  "../assets/images/detail/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  }
);

const PRODUCT_IMAGE_FILES = Object.entries(
  PRODUCT_IMAGE_MODULES
).reduce((result, [path, src]) => {
  const fileName = path.split("/").pop();
  result[fileName] = src;
  return result;
}, {});

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const CATALOG = products.map((product, index) => ({
  ...product,
  __imageNumber: index + 1,
}));

const PRODUCT_BY_ID = new Map(
  CATALOG.map((product) => [String(product.id), product])
);

const PRODUCT_BY_NAME = new Map(
  CATALOG.map((product) => [normalizeText(product.name), product])
);

function getPossibleIds(item) {
  if (!item) return [];

  if (typeof item === "string") {
    return [item];
  }

  return [
    item.id,
    item.productId,
    item.product?.id,
    item.sku,
  ]
    .filter(Boolean)
    .map(String);
}

function getPossibleNames(item) {
  if (!item || typeof item === "string") return [];

  return [
    item.name,
    item.productName,
    item.title,
    item.productTitle,
    item.label,
  ]
    .filter(Boolean)
    .map(normalizeText)
    .filter(Boolean);
}

export function resolveCatalogProduct(item) {
  for (const id of getPossibleIds(item)) {
    const found = PRODUCT_BY_ID.get(id);

    if (found) {
      return found;
    }
  }

  for (const name of getPossibleNames(item)) {
    const found = PRODUCT_BY_NAME.get(name);

    if (found) {
      return found;
    }
  }

  return null;
}

function findFirstImage(fileBases = []) {
  const extensions = [
    "png",
    "webp",
    "jpg",
    "jpeg",
  ];

  for (const base of fileBases) {
    for (const extension of extensions) {
      const fileName =
        `${base}.${extension}`;

      if (
        PRODUCT_IMAGE_FILES[fileName]
      ) {
        return (
          PRODUCT_IMAGE_FILES[fileName]
        );
      }
    }
  }

  return "";
}

function getImageBases(product) {
  if (!product) {
    return [];
  }

  const bases = [];

  const imageNumber =
    product.__imageNumber;

  const id =
    String(
      product.id ||
      ""
    );

  /*
    세트상품 이미지 지원

    예:
    S002
    → S2_1.png
    → S002_1.png
  */
  if (
    id.startsWith("S")
  ) {
    const rawNumber =
      id.slice(1);

    const numericNumber =
      Number.parseInt(
        rawNumber,
        10
      );

    if (
      Number.isFinite(
        numericNumber
      )
    ) {
      bases.push(
        `S${numericNumber}_1`,
        `S${numericNumber}_2`,
        `S${numericNumber}`,

        `S${String(
          numericNumber
        ).padStart(
          3,
          "0"
        )}_1`,

        `S${String(
          numericNumber
        ).padStart(
          3,
          "0"
        )}_2`,

        `S${String(
          numericNumber
        ).padStart(
          3,
          "0"
        )}`
      );
    }

    bases.push(
      `${id}_1`,
      `${id}_2`,
      id
    );
  }

  /*
    현재 상세페이지 기준

    products.json 배열 순서
    → 1_1.png
    → 2_1.png
    ...
  */
  if (imageNumber) {
    bases.push(
      `${imageNumber}_1`,
      `${imageNumber}_2`,
      `${imageNumber}`
    );
  }

  /*
    예전 상품 ID 숫자 기준 이미지도
    마지막 fallback으로 지원

    P009
    → 9_1.png
  */
  if (
    id.startsWith("P")
  ) {
    const numericNumber =
      Number.parseInt(
        id.slice(1),
        10
      );

    if (
      Number.isFinite(
        numericNumber
      )
    ) {
      bases.push(
        `${numericNumber}_1`,
        `${numericNumber}_2`,
        `${numericNumber}`
      );
    }
  }

  return Array.from(
    new Set(bases)
  );
}

export function resolveProductImage(
  item
) {
  const catalogProduct =
    resolveCatalogProduct(
      item
    );

  if (
    catalogProduct?.image
  ) {
    return (
      catalogProduct.image
    );
  }

  const catalogImage =
    findFirstImage(
      getImageBases(
        catalogProduct
      )
    );

  if (catalogImage) {
    return catalogImage;
  }

  if (
    typeof item ===
      "object" &&
    item
  ) {
    return (
      item.thumbnail ||
      item.image ||
      item.productImage ||
      ""
    );
  }

  return "";
}

export function enrichShopProduct(
  item = {}
) {
  const source =
    item || {};

  const catalogProduct =
    resolveCatalogProduct(
      source
    );

  const image =
    resolveProductImage(
      source
    );

  const fallbackId =
    source.id ||
    source.productId ||
    source.product?.id ||
    "";

  const fallbackName =
    source.name ||
    source.productName ||
    source.title ||
    source.productTitle ||
    source.label ||
    "상품";

  const fallbackCategory =
    source.category ||
    source.productCategory ||
    source.type ||
    "";

  const priceCandidate =
    source.price ??
    source.unitPrice ??
    catalogProduct?.price ??
    0;

  const basePriceCandidate =
    source.basePrice ??
    catalogProduct?.price ??
    source.price ??
    0;

  return {
    ...(catalogProduct || {}),
    ...source,

    id:
      catalogProduct?.id ||
      fallbackId,

    productId:
      catalogProduct?.id ||
      source.productId ||
      fallbackId,

    name:
      catalogProduct?.name ||
      fallbackName,

    category:
      catalogProduct?.category ||
      fallbackCategory,

    basePrice:
      Number(
        basePriceCandidate ||
        0
      ),

    price:
      Number(
        priceCandidate ||
        0
      ),

    image,

    thumbnail:
      image,
  };
}

export function getShopCatalog() {
  return CATALOG;
}