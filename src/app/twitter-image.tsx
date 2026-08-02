import { ImageResponse } from "next/og";

export const alt = "UP ISHA - Uttar Pradesh Speech & Hearing Association";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d7377 0%, #1a2332 100%)",
          color: "white",
          padding: 60,
        }}
      >
        {/* Logo Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            background: "white",
            borderRadius: 20,
            fontSize: 48,
            fontWeight: 800,
            color: "#0d7377",
            marginBottom: 36,
            letterSpacing: -3,
          }}
        >
          UI
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          UP ISHA
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          Uttar Pradesh Speech & Hearing Association
        </div>
      </div>
    ),
    { ...size }
  );
}