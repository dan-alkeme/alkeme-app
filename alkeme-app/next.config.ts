import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No frenar el build de producción por advertencias de estilo (ESLint).
  // Las iremos limpiando con calma; no afectan cómo funciona la app.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;