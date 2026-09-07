// Keep three photos plus review text comfortably below Firestore's document limit.
export async function prepareReviewPhoto(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) {
    throw new Error("15MB 이하의 JPG, PNG, WebP 사진을 선택해 주세요.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    let edge = 1200;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL("image/jpeg", 0.75);
      if (src.length <= 180000) return { name: file.name, src };
      edge *= 0.75;
    }
    throw new Error("사진 용량을 줄이지 못했어요. 다른 사진을 선택해 주세요.");
  } finally { URL.revokeObjectURL(url); }
}
