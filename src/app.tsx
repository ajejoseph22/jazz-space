import { apiKey } from "@/api-key.ts";
import { getRandomUsername, inIframe } from "@/util.ts";
import { useIframeHashRouter } from "hash-slash";
import { JazzProvider, useAccount } from "jazz-react";
import { ID } from "jazz-tools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Board as BoardModel } from "./schema.ts";
import { ThemeProvider } from "./theme-provider.tsx";
import Board from "@/components/board";
import { Lobby } from "@/components/lobby";
import { TopBar } from "@/components/top-bar";

export function App() {
  const { me, logOut } = useAccount();
  const router = useIframeHashRouter();

  return (
    <div className="flex flex-col justify-between w-screen h-screen bg-stone-50 dark:bg-stone-925 dark:text-white">
      <TopBar>
        <input
          type="text"
          value={me?.profile?.name ?? ""}
          className="bg-transparent"
          onChange={(e) => {
            if (!me?.profile) return;
            me.profile.name = e.target.value;
          }}
          placeholder="Set username"
        />
        {!inIframe && <button onClick={logOut}>Log out</button>}
      </TopBar>
      {router.route({
        "/": () => <Lobby />,
        "/board/:id": (id) => <Board id={id as ID<BoardModel>} />,
      })}
    </div>
  );
}

const url = new URL(window.location.href);
const defaultProfileName = url.searchParams.get("user") ?? getRandomUsername();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <StrictMode>
      <JazzProvider
        sync={{
          peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
        }}
        defaultProfileName={defaultProfileName}
      >
        <App />
      </JazzProvider>
    </StrictMode>
  </ThemeProvider>,
);
