import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "UP ISHA - Uttar Pradesh Indian Speech & Hearing Association";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoFile = await readFile(
    path.join(process.cwd(), "public/images/upishalogo.png")
  );
  const logoBase64 = Buffer.from(logoFile).toString("base64");
  const logoUrl = `data:image/png;base64,${logoBase64}`;

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
        {/* Logo */}
        <img
          src={logoUrl}
          width={120}
          height={120}
          alt="UP ISHA Logo"
          style={{
            objectFit: "contain",
            background: "white",
            borderRadius: 24,
            padding: 8,
            marginBottom: 40,
          }}
        />

        {/* Main Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          Uttar Pradesh Indian Speech & Hearing Association
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            textAlign: "center",
            opacity: 0.9,
            marginBottom: 40,
          }}
        >
          Advancing Audiology & Speech-Language Pathology in Uttar Pradesh, India
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "8px 24px",
              borderRadius: 100,
            }}
          >
            🎓 Education
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "8px 24px",
              borderRadius: 100,
            }}
          >
            🏥 Healthcare
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "8px 24px",
              borderRadius: 100,
            }}
          >
            👥 Community
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}