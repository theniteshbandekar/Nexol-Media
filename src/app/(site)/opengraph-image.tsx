import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nexol Media — Polished videos. Real growth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAFAFA",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#52525B",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#D6F23A",
            }}
          />
          Nexol Media
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 108,
              fontWeight: 700,
              color: "#0A0A0B",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              maxWidth: 1000,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Polished videos.
            <span style={{ color: "#D6F23A", marginLeft: 16 }}>Real growth.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#52525B",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            A media studio for Tech, AI &amp; Design creators.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#52525B",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          nexolmedia.com
        </div>
      </div>
    ),
    { ...size }
  );
}
