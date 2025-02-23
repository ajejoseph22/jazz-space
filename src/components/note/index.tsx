import React, { useState, useRef, useEffect, useMemo } from "react";
import Draggable from "react-draggable";
import { Note as NoteModel } from "@/schema.ts";

interface NoteProps {
  note: NoteModel;
  onRemove: () => void;
  children: React.ReactNode;
}

const Note = ({ note, children, onRemove }: NoteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateParentSize = () => {
      if (nodeRef.current?.parentElement) {
        setParentSize({
          width: nodeRef.current.parentElement.clientWidth,
          height: nodeRef.current.parentElement.clientHeight
        });
      }
    };

    updateParentSize();
    window.addEventListener('resize', updateParentSize);
    return () => window.removeEventListener('resize', updateParentSize);
  }, []);

  const handleDrag = (_e: any, data: { x: number, y: number }) => {
    const parent = nodeRef.current?.parentElement;
    const noteElement = nodeRef.current;
    if (!parent || !noteElement) return;

    // Calculate maximum allowed positions considering note dimensions
    const noteWidth = noteElement.offsetWidth;
    const noteHeight = noteElement.offsetHeight;

    // Convert to percentages but account for note size
    const xPercent = (data.x / (parent.clientWidth - noteWidth)) * 100;
    const yPercent = (data.y / (parent.clientHeight - noteHeight)) * 100;

    // Clamp values between 0 and 100
    note.x = Math.max(0, Math.min(xPercent, 100));
    note.y = Math.max(0, Math.min(yPercent, 100));
  };

  const position = useMemo(() => {
    if (!nodeRef.current?.parentElement) return { x: 0, y: 0 };
    
    const noteWidth = nodeRef.current?.offsetWidth || 150; 
    const noteHeight = nodeRef.current?.offsetHeight || 150; 
    
    const availableWidth = parentSize.width - noteWidth;
    const availableHeight = parentSize.height - noteHeight;
    
    return {
      x: (note.x * availableWidth) / 100,
      y: (note.y * availableHeight) / 100
    };
  }, [note.x, note.y, parentSize]);

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
      nodeRef={nodeRef}
      position={position}
      onDrag={handleDrag}
      bounds="parent"
      handle=".handle"
    >
      <div ref={nodeRef} className="absolute w-[150px] min-h-[150px] bg-yellow-300 shadow-lg p-2">
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
