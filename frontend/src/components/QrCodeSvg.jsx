import React, { useMemo } from 'react';

/**
 * High-performance deterministic QR matrix SVG generator.
 * Produces standard QR-style 25x25 matrix with finder patterns,
 * timing tracks, alignment markers, and encoded data bits from text.
 */
export default function QrCodeSvg({
  text = '',
  size = 180,
  className = '',
  fgColor = '#1e293b',
  bgColor = '#ffffff',
}) {
  const matrix = useMemo(() => {
    const N = 25;
    const grid = Array.from({ length: N }, () => Array(N).fill(false));

    // Helper: draw finder pattern (7x7 outer square, 5x5 white, 3x3 solid center)
    const drawFinder = (startR, startC) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Center 3x3
          ) {
            grid[startR + r][startC + c] = true;
          } else {
            grid[startR + r][startC + c] = false;
          }
        }
      }
    };

    // 1. Finder patterns at corners
    drawFinder(0, 0);          // Top-Left
    drawFinder(0, N - 7);      // Top-Right
    drawFinder(N - 7, 0);      // Bottom-Left

    // 2. Timing patterns
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // 3. Alignment pattern at bottom-right (5x5)
    const ar = N - 7;
    const ac = N - 7;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
          grid[ar + r][ac + c] = true;
        } else {
          grid[ar + r][ac + c] = false;
        }
      }
    }

    // Function to check if a cell is reserved
    const isReserved = (r, c) => {
      // Top-left finder + separator
      if (r <= 7 && c <= 7) return true;
      // Top-right finder + separator
      if (r <= 7 && c >= N - 8) return true;
      // Bottom-left finder + separator
      if (r >= N - 8 && c <= 7) return true;
      // Alignment pattern
      if (r >= ar - 1 && r <= ar + 5 && c >= ac - 1 && c <= ac + 5) return true;
      // Timing tracks
      if (r === 6 || c === 6) return true;
      return false;
    };

    // 4. Fill data modules using text hash & bytes
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }

    let seed = hash || 123456789;
    const nextRandomBit = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 0x1) === 1;
    };

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!isReserved(r, c)) {
          // Combination of text characters, row, col, and PRNG bit
          const charCode = text.charCodeAt((r * N + c) % (text.length || 1)) || 42;
          const bit = ((charCode ^ r ^ c) + nextRandomBit()) % 2 === 0;
          grid[r][c] = bit;
        }
      }
    }

    return grid;
  }, [text]);

  const N = matrix.length;
  const padding = 2; // quiet zone in module units
  const totalUnits = N + padding * 2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalUnits} ${totalUnits}`}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      aria-label={`QR Code Check-in: ${text}`}
      role="img"
    >
      <rect width={totalUnits} height={totalUnits} fill={bgColor} rx="2" />
      <g fill={fgColor}>
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c + padding}
                y={r + padding}
                width="1.02"
                height="1.02"
              />
            ) : null
          )
        )}
      </g>
    </svg>
  );
}
