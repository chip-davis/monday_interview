import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@vibe/core";
import { getSessionToken } from "./api/fetcher";

export default function ConnectPrompt() {
  const queryClient = useQueryClient();

  const connect = async () => {
    const popup = window.open("", "monday-oauth", "width=600,height=720");
    if (!popup) return;
    const token = await getSessionToken();
    popup.location.href = `/api/oauth/start?token=${encodeURIComponent(token)}`;

    const timer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(timer);
      void queryClient.invalidateQueries();
    }, 500);
  };

  return (
    <EmptyState
      title="Connect to monday"
      description="Fragrances are stored in monday storage."
      mainAction={{ text: "Connect", onClick: () => void connect() }}
    />
  );
}
