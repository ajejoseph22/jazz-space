import { useAccount } from "jazz-react";
import { Group } from "jazz-tools";
import { useIframeHashRouter } from "hash-slash";
import { Board } from "@/schema.ts";

export const Lobby = () => {
  const { me } = useAccount({ profile: {}, root: {} });
  const router = useIframeHashRouter();

  const createBoard = () => {
    if (!me) return;
    const group = Group.create();
    group.addMember("everyone", "writer");
    const board = Board.create([], group);
    router.navigate("/#/board/" + board.id);

    // for https://jazz.tools marketing site demo only
    // onBoardLoad(board);
  };

  return (
    <div className="h-full p-6 text-center">
      <h1 className="text-2xl font-bold">Need a space?</h1>
      <button
        onClick={createBoard}
        className="p-2 bg-blue-500 text-white rounded mt-4"
      >
        Create Board
      </button>
    </div>
  );
};
