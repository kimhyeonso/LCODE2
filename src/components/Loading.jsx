export default function Loading({ label = "여행을 준비하고 있어요" }) {
  return (
    <div
      role="status"
      style={{
        padding: "60px 0",
        textAlign: "center",
        fontFamily: "serif",
        fontSize: 24,
      }}
    >
      {label}…
    </div>
  );
}
