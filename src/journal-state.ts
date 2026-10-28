import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { loadJournal, saveJournal } from "./journal";
import type { LearningNote } from "./journal";

export function useJournal() {
  const [initial] = useState(() => {
    try {
      return loadJournal(window.localStorage);
    } catch {
      return { notes: [] as LearningNote[], unreadable: false, warning: "Browser storage is unavailable. Your journal will stay in this session; export it before leaving." };
    }
  });
  const [notes, setCurrentNotes] = useState(initial.notes);
  const notesRef = useRef(initial.notes);
  const unreadableRef = useRef(initial.unreadable);
  const [unreadable, setUnreadable] = useState(initial.unreadable);
  const [warning, setWarning] = useState(initial.warning);
  const [saveStatus, setSaveStatus] = useState(initial.warning ? "Session only — not saved" : "Saved on this device");

  const persist = useCallback((next: LearningNote[]) => {
    if (unreadableRef.current) return; // Never overwrite a record we could not read implicitly.
    let saved = false;
    try {
      saved = saveJournal(window.localStorage, next);
    } catch { /* Access to localStorage can itself throw. */ }
    setSaveStatus(saved ? "Saved on this device" : "Session only — not saved");
    setWarning(saved ? "" : "Your browser could not save this journal change. Keep this tab open and export your notes before leaving.");
  }, []);

  const setNotes = useCallback<Dispatch<SetStateAction<LearningNote[]>>>((update) => {
    const next = typeof update === "function" ? update(notesRef.current) : update;
    if (next === notesRef.current) return;
    notesRef.current = next;
    setCurrentNotes(next);
    persist(next);
  }, [persist]);

  const replaceUnreadable = () => {
    if (!window.confirm("Replace the unreadable saved journal with this session’s notes? The old saved journal will be lost.")) return;
    unreadableRef.current = false;
    setUnreadable(false);
    persist(notesRef.current);
  };

  return { notes, setNotes, warning, saveStatus, unreadable, replaceUnreadable };
}
