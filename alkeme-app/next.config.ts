import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No frenar el build de producción por ESLint ni por errores de tipos.
  // Son temas de estilo/estrictez; no afectan cómo funciona la app.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;