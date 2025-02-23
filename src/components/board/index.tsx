import { useCoState } from "jazz-react";
import { ID } from "jazz-tools";
import { useState, useRef } from "react";

import { Board as BoardModel, Note as NoteModel } from "@/schema.ts";
import Note from "../note";

const Board = ({ id }: { id: ID<BoardModel> }) => {
  const board = useCoState(BoardModel, id, [{}]);
  const [zIndices, setZIndices] = useState<Map<ID<NoteModel>, number>>(new Map());
  const nextZIndex = useRef(1);

  if (!board)
    return (
      <div className="flex-1 flex justify-center items-center">Loading...</div>
    );

  const addNote = (text: string = "") => {
    const x = 10 + Math.random() * 50; 
    const y = 10 + Math.random() * 50;
    
    const newNote = NoteModel.create(
      {
        x,
        y,
        text,
        isBeingEdited: false,
      },
      board._owner,
    );

    setZIndices(new Map(zIndices.set(newNote.id, 1)));
    board.push(newNote);
  };

  const removeNote = (id: ID<NoteModel>) => {
    const noteIndex = board.findIndex((note) => note.id === id);
    if (noteIndex === -1) return;
    board.splice(noteIndex, 1);
    // Remove note from z-indices
    setZIndices(indices => {
      const newIndices = new Map(indices);
      newIndices.delete(id);
      return newIndices;
    });
  };

  const bringToTop = (noteId: ID<NoteModel>) => {
    const newZIndex = nextZIndex.current + 1;
    nextZIndex.current = newZIndex;
    setZIndices(new Map(zIndices.set(noteId, newZIndex)));
  };

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-b from-yellow-400 to-yellow-700 overflow-hidden"
    >
      {board.map((note) => (
        <Note 
          key={note.id} 
          note={note} 
          onRemove={() => removeNote(note.id)}
          onBringToTop={() => bringToTop(note.id)}
          zIndex={zIndices.get(note.id) ?? 1}
        >
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
