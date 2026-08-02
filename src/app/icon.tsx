import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d7377",
          borderRadius: "6px",
          fontSize: 18,
          fontWeight: 700,
          color: "white",
          letterSpacing: -1,
        }}
      >
        UI
      </div>
    ),
    { ...size }
  );
}