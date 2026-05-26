import React from "react";
import type { AppProps } from "next/app";
import { AuthProvider } from "../services/auth";
import { SimulationProvider } from "../hooks/useWeatherSimulation";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SimulationProvider>
        <Component {...pageProps} />
      </SimulationProvider>
    </AuthProvider>
  );
}
