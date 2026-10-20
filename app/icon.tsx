import { ImageResponse } from "next/og";

export const size = {
  width: 48,
  height: 48,
};

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
          background: "linear-gradient(135deg, #183C2C 0%, #20503B 100%)",
          borderRadius: "12px",
          border: "2px solid #C29B38",
          color: "#FAF8F5",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.04em",
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  );
}
