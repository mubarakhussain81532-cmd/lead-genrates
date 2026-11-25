import { ImageResponse } from "next/og";

export const alt = "eCore Business - B2B data and lead generation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px",
          color: "#ffffff",
          background:
            "linear-gradient(125deg, #0a1d2b 0%, #123343 68%, #087f75 140%)",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              width: "54px",
              height: "54px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background: "#81dfc7",
              color: "#0a1d2b",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            e
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700 }}>
            eCore Business
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "62px",
              fontWeight: 700,
              lineHeight: 1.12,
            }}
          >
            <span>Better business data.</span>
            <span>More focused growth.</span>
          </div>
          <div style={{ color: "#c5d5dd", fontSize: "25px" }}>
            Research, marketing databases, and practical lead support.
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(255,255,255,0.22)",
          }}
        />
      </div>
    ),
    size,
  );
}
