import React, { useState, useRef, useEffect, useMemo } from "react";
import Draggable from "react-draggable";

import { Note as NoteModel } from "@/schema.ts";

interface NoteProps {
  note: NoteModel;
  children: React.ReactNode;
  zIndex: number;
  onBringToTop: () => void;
  onRemove: () => void;
}

const NOTE_DIMENSIONS = {
  width: '10.5vw',
  height: '10.5vw',
  minWidth: '150px',
  minHeight: '150px',
  maxWidth: '10.5vw',
  maxHeight: '10.5vw',
  aspectRatio: '1',
};

const Note = ({ note, children, zIndex, onBringToTop, onRemove }: NoteProps) => {
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

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (note.isBeingEdited && isEditing) {
        note.isBeingEdited = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [note]);

  const handleDrag = (_e: any, data: { x: number, y: number }) => {
    const parent = nodeRef.current?.parentElement;
    const noteElement = nodeRef.current;
    if (!parent || !noteElement) return;

    const xPercent = (data.x / (parent.clientWidth - noteElement.offsetWidth)) * 100;
    const yPercent = (data.y / (parent.clientHeight - noteElement.offsetHeight)) * 100;

    note.x = Math.max(0, Math.min(xPercent, 100));
    note.y = Math.max(0, Math.min(yPercent, 100));
  };

  const position = useMemo(() => {
    if (!nodeRef.current?.parentElement) return { x: 0, y: 0 };

    const noteWidth = nodeRef.current?.offsetWidth || 0;
    const noteHeight = nodeRef.current?.offsetHeight || 0;

    const availableWidth = parentSize.width - noteWidth;
    const availableHeight = parentSize.height - noteHeight;

    return {
      x: (note.x * availableWidth) / 100,
      y: (note.y * availableHeight) / 100
    };
  }, [note.x, note.y, parentSize]);

  const handleEdit = () => {
    setIsEditing(true);
    note.isBeingEdited = true;
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
      bounds="parent"
      handle=".handle"
      onDrag={handleDrag}
      onStart={onBringToTop}
    >
      <div
        ref={nodeRef}
        className="absolute bg-yellow-300 shadow-lg p-2 flex flex-col"
        style={{
          ...NOTE_DIMENSIONS,
          zIndex,
        }}
        onClick={(e) => {
          if (
            !(e.target as HTMLElement).closest('button') &&
            !(e.target as HTMLElement).closest('.handle')
          ) {
            onBringToTop();
          }
        }}
      >
        <div className="handle w-full h-8 bg-yellow-500 cursor-grab shrink-0" />
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <>
              <textarea
                ref={textRef}
                className="w-full h-[calc(100%-2rem)] bg-white/50 p-2 text-lg rounded resize-none"
                defaultValue={String(children)}
              />
              <button
                className="bg-green-500 text-white p-[0.1rem] rounded"
                onClick={handleSave}
              >
                💾
              </button>
            </>
          ) : (
            <>
              <p className="text-xl font-handwritten p-2 h-full overflow-y-auto break-words whitespace-pre-wrap">
                {children}
              </p>
              <span className="absolute bottom-2 right-2 opacity-0 transition-opacity hover:opacity-100 flex gap-1">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={note.isBeingEdited}
                >
                  ✏️
                </button>
                <button
                  onClick={onRemove}
                  className="bg-red-500 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={note.isBeingEdited}
                >
                  🗑️
                </button>
                {tooltip}
              </span>
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default Note;
