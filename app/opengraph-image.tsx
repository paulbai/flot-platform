import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flot - Commerce without friction";
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
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #080808 0%, #1a1a2e 50%, #080808 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,133,103,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,133,103,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #a88567, #c9a882)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#080808",
              letterSpacing: -1,
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Flot
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 48,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Commerce without friction
        </div>

        {/* Vertical cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
          }}
        >
          {[
            { label: "Hotel", icon: "🏨" },
            { label: "Restaurant", icon: "🍽" },
            { label: "Travel", icon: "✈" },
            { label: "Store", icon: "🛍" },
          ].map((v) => (
            <div
              key={v.label}
              style={{
                width: 200,
                height: 110,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 32, display: "flex" }}>{v.icon}</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.02em",
                  display: "flex",
                }}
              >
                {v.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
          }}
        >
          <span style={{ display: "flex" }}>Four verticals</span>
          <span style={{ display: "flex", color: "rgba(168,133,103,0.8)" }}>
            ·
          </span>
          <span style={{ display: "flex" }}>One checkout</span>
          <span style={{ display: "flex", color: "rgba(168,133,103,0.8)" }}>
            ·
          </span>
          <span style={{ display: "flex" }}>Zero friction</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
