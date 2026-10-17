import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { createState, loadState, saveState } from "./model";
import type { AppState } from "./model";

export const StateContext = createContext<{
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
} | null>(null);
export function useApp() {
  const value = useContext(StateContext);
  if (!value) throw new Error("App state is unavailable");
  return value;
}
export function usePersistentState() {
  const [initial] = useState(() => {
    try {
      return loadState(window.localStorage);
    } catch {
      return {
        state: createState(),
        warning:
          "Browser storage is unavailable. Your work will stay in this session; export it before leaving.",
      };
    }
  });
  const [state, setCurrentState] = useState(initial.state);
  const stateRef = useRef(initial.state);
  const [warning, setWarning] = useState(initial.warning);
  const [saveStatus, setSaveStatus] = useState(
    initial.warning ? "Session only" : "Saved on this device",
  );
  const setState = useCallback<Dispatch<SetStateAction<AppState>>>((update) => {
    const next =
      typeof update === "function" ? update(stateRef.current) : update;
    if (next === stateRef.current) return;
    stateRef.current = next;
    setCurrentState(next);
    let saved = false;
    try {
      saved = saveState(window.localStorage, next);
    } catch {
      /* Storage access can itself be blocked. */
    }
    setSaveStatus(saved ? "Saved on this device" : "Session only — not saved");
    setWarning(
      saved
        ? ""
        : "Your browser could not save this change. Keep this tab open and export your work before leaving.",
    );
  }, []);
  return { state, setState, warning, saveStatus };
}
