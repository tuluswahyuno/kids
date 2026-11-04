import { COLOR, type ColorId, type Fill, type ShapeId } from "./data";

const INK = "#3b2f2f";

function starPoints(): string {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 45 : 19;
    const a = (-90 + k * 36) * (Math.PI / 180);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(54 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}
const STAR = starPoints();

interface ShapeProps {
  shape: ShapeId;
  color: ColorId;
  fill?: Fill;
  size?: number;
  /** label aksesibilitas; bila kosong gambar dianggap hiasan (aria-hidden) */
  label?: string;
}

/** Bentuk digambar dengan SVG inline. Pola isi (garis/bintik/petak) membantu pembeda selain warna. */
export function Shape({ shape, color, fill = "solid", size = 64, label }: ShapeProps) {
  const hex = COLOR[color].hex;
  const pid = `bp-${fill}-${hex.slice(1)}`;
  const paint = fill === "solid" ? hex : `url(#${pid})`;
  const common = { fill: paint, stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      {fill !== "solid" && (
        <defs>
          {fill === "stripe" && (
            <pattern id={pid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill={hex} />
              <rect width="6" height="14" fill="#fff" opacity="0.7" />
            </pattern>
          )}
          {fill === "dots" && (
            <pattern id={pid} width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill={hex} />
              <circle cx="4" cy="4" r="3" fill="#fff" opacity="0.85" />
              <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.85" />
            </pattern>
          )}
          {fill === "grid" && (
            <pattern id={pid} width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill={hex} />
              <path d="M0 8H16M8 0V16" stroke="#fff" strokeWidth="3" opacity="0.7" />
            </pattern>
          )}
        </defs>
      )}
      {shape === "lingkaran" && <circle cx="50" cy="50" r="42" {...common} />}
      {shape === "persegi" && <rect x="14" y="14" width="72" height="72" rx="5" {...common} />}
      {shape === "persegi-panjang" && <rect x="5" y="26" width="90" height="48" rx="5" {...common} />}
      {shape === "segitiga" && <polygon points="50,10 93,88 7,88" {...common} />}
      {shape === "bintang" && <polygon points={STAR} {...common} />}
      {shape === "belah-ketupat" && <polygon points="50,5 92,50 50,95 8,50" {...common} />}
      {shape === "hati" && (
        <path d="M50 90 C8 60 4 28 27 17 C40 11 50 21 50 30 C50 21 60 11 73 17 C96 28 92 60 50 90 Z" {...common} />
      )}
    </svg>
  );
}
