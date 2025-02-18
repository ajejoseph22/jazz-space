import { useCoState } from "jazz-react";
import { Board as BoardModel, Note as NoteModel } from "@/schema.ts";
import { ID } from "jazz-tools";

import Note from "../note";

const Board = ({ id }: { id: ID<BoardModel> }) => {
  const board = useCoState(BoardModel, id, [{}]);

  if (!board)
    return (
      <div className="flex-1 flex justify-center items-center">Loading...</div>
    );

  const addNote = (text: string = "") => {
    const newNote = NoteModel.create({ text }, board._owner);
    board.push(newNote);
  };

  const removeNote = (id: ID<NoteModel>) => {
    const noteIndex = board.findIndex((note) => note.id === id);
    if (noteIndex === -1) return;
    board.splice(noteIndex, 1);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-yellow-400 to-yellow-700">
      {board.map((note) => (
        <Note key={note.id} note={note} onRemove={() => removeNote(note.id)}>
          {note.text}
        </Note>
      ))}
      <button
        className="fixed top-20 right-2 bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600"
        onClick={() => addNote()}
      >
        Add Note
      </button>
    </div>
  );
};

export default Board;
