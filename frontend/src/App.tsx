import OrderForm, { type Option } from "./OrderForm";
import { sampleFragrances } from "./fragrances";

const options: Option[] = sampleFragrances.map((f) => ({
  label: f.name,
  value: f.id,
}));

export default function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <OrderForm options={options} />
      </div>
    </main>
  );
}
