import OrderForm, { type Option } from "./OrderForm";
import { useListFragrances } from "./api/gen";

export default function App() {
  const {
    data: options = [],
    isPending,
    isError,
  } = useListFragrances({
    query: {
      select: (res) =>
        res.data.map((f): Option => ({ label: f.name, value: f.id })),
    },
  });
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
        {isPending ? (
          <p>Loading fragrances…</p>
        ) : isError ? (
          <p>Couldn't load fragrances.</p>
        ) : (
          <OrderForm options={options} />
        )}
      </div>
    </main>
  );
}
