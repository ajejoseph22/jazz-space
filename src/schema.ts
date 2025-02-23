import { CoList, CoMap, co } from "jazz-tools";

export class Note extends CoMap {
  text = co.string;
  isBeingEdited = co.boolean;
  x = co.number;
  y = co.number;
}

export class Board extends CoList.Of(co.ref(Note)) {}
