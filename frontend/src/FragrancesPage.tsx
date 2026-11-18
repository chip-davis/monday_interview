import { Heading } from "@vibe/core";
import "@vibe/core/tokens";
import FragranceManager from "./FragranceManager";

export default function FragrancesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        display: "flex",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "#ffffff",
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignSelf: "flex-start",
        }}
      >
        <Heading type="h2">Fragrances</Heading>
        <FragranceManager />
      </div>
    </main>
  );
}
