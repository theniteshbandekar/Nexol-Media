import { ImageResponse } from "next/og";

import { getService } from "@/lib/services";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Nexol Media service";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);

  const num = service?.num ?? "00";
  const title = service?.title ?? "Service";
  const pills = service?.pills ?? [];
  const tagline =
    (service?.tagline ?? "").length > 140
      ? `${service?.tagline.slice(0, 137)}…`
      : service?.tagline ?? "";

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
          Nexol Media · Service · {num} of 05
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 156,
            fontWeight: 700,
            color: "#0A0A0B",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {title}
          <span style={{ color: "#D6F23A", marginLeft: 8 }}>.</span>
        </div>

        {pills.length > 0 && (
          <div
            style={{
              marginTop: 36,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {pills.slice(0, 4).map((p) => (
              <div
                key={p}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "1px solid #E8E8EA",
                  background: "#FFFFFF",
                  fontSize: 20,
                  color: "#52525B",
                  letterSpacing: "0.02em",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        )}

        {tagline && (
          <div
            style={{
              marginTop: "auto",
              fontSize: 26,
              color: "#52525B",
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            {tagline}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 40,
            fontSize: 20,
            color: "#71717A",
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
