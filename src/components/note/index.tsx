import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import { Note as NoteModel } from "@/schema.ts";

interface NoteProps {
  note: NoteModel;
  onRemove: () => void;
  children: React.ReactNode;
}

const getRandomPosition = (min: number, max: number) => {
  return Math.min(Math.max(min, Math.ceil(Math.random() * max)), max);
};

const Note = ({ note, children, onRemove }: NoteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({
    x: getRandomPosition(0, window.innerWidth - 300),
    y: getRandomPosition(0, window.innerHeight - 300),
  });
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      onRemove();
    }
  };

  const handleSave = () => {
    if (textRef.current) {
      note.text = textRef.current.value;
    }
    setIsEditing(false);
    note.isBeingEdited = false;
  };

  const tooltip = note.isBeingEdited ? (
    <div className="absolute z-50 pointer-events-none bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap group-hover:opacity-100 transition-opacity">
      Note is being edited
    </div>
  ) : null;

  return (
    <Draggable
      bounds="parent"
      handle=".handle"
      defaultPosition={{ x: position.x, y: position.y }}
      onStop={(_, data) => {
        setPosition({ x: data.x, y: data.y });
      }}
    >
      <div className="absolute w-[150px] min-h-[150px] bg-yellow-300 shadow-lg p-2">
        <div className="handle w-full h-8 bg-yellow-500 cursor-grab" />
        {isEditing ? (
          <>
            <textarea
              ref={textRef}
              className="w-full h-full max-h-[250px] bg-white/50 p-2 text-lg rounded"
              defaultValue={String(children)}
            />
            <button
              className="bg-green-500 text-white p-1 rounded mt-2"
              onClick={handleSave}
            >
              💾
            </button>
          </>
        ) : (
          <>
            <p className="text-xl font-handwritten p-2 max-h-[250px] overflow-y-auto break-words whitespace-pre-wrap">
              {children}
            </p>
            <span className="absolute bottom-2 right-2 opacity-0 transition-opacity hover:opacity-100 flex gap-1">
              <button
                onClick={() => {
                  setIsEditing(true);
                  note.isBeingEdited = true;
                }}
                className="bg-blue-500 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={note.isBeingEdited}
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={note.isBeingEdited}
                title={"Cannot delete while note is being edited"}
              >
                🗑️
              </button>
              {tooltip}
            </span>
          </>
        )}
      </div>
    </Draggable>
  );
};

export default Note;
