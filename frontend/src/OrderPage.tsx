import OrderForm, { type Option } from "./OrderForm";
import ConnectPrompt from "./ConnectPrompt";
import { useListFragrances } from "./api/gen";
import { isOAuthRequired } from "./api/fetcher";

export default function OrderPage() {
  const {
    data: options = [],
    isPending,
    isError,
    error,
  } = useListFragrances({
    query: {
      select: (res) =>
        res.data.map((f): Option => ({ label: f.name, value: f.id, category: f.category })),
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
          maxWidth: 504,
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
        ) : isOAuthRequired(error) ? (
          <ConnectPrompt />
        ) : isError ? (
          <p>Couldn't load fragrances.</p>
        ) : (
          <OrderForm options={options} />
        )}
      </div>
    </main>
  );
}
