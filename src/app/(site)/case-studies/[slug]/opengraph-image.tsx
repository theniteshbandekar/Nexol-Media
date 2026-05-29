import { ImageResponse } from "next/og";

import { getCaseStudy } from "@/lib/case-studies";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Nexol Media case study";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);

  const name = study?.name ?? "Case Study";
  const role = study?.role ?? "Nexol Media";
  const stats = study?.stats ?? [];

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
          Nexol Media · Case Study
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#71717A",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {role}
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 132,
            fontWeight: 700,
            color: "#0A0A0B",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {name}
          <span style={{ color: "#D6F23A", marginLeft: 8 }}>.</span>
        </div>

        {stats.length > 0 && (
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              gap: 56,
              borderTop: "1px solid #E8E8EA",
              paddingTop: 28,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 700,
                    color: "#0A0A0B",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#52525B",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
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
