import { useEffect, useRef, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { createNote, exportJournal, exportNote, noteFields } from "./journal";
import type { NoteField } from "./journal";
import type { useJournal } from "./journal-state";
import { downloadText } from "./model";
import { PageHeading } from "./ui";

export function NotesPage({ journal }: { journal: ReturnType<typeof useJournal> }) {
  const { notes, setNotes, unreadable, replaceUnreadable } = journal;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const activeNoteId = selected?.id;

  useEffect(() => {
    if (activeNoteId) titleRef.current?.focus();
    else newRef.current?.focus();
  }, [activeNoteId]);

  const add = () => {
    const note = createNote();
    setNotes((old) => [note, ...old]);
    setSelectedId(note.id);
    setMessage("New note created.");
  };
  const update = (field: NoteField, value: string) => {
    if (!selected) return;
    setNotes((old) => old.map((note) => note.id === selected.id
      ? { ...note, [field]: value, updatedAt: new Date().toISOString() }
      : note));
  };
  const remove = () => {
    if (!selected || !window.confirm(`Delete “${selected.title.trim() || "Untitled learning note"}”? This cannot be undone.`)) return;
    setNotes((old) => old.filter((note) => note.id !== selected.id));
    setSelectedId(null);
    setMessage("Note deleted.");
  };

  return (
    <>
      <PageHeading title="Keep what you learn." intro="Turn real work into lessons you can use again. Record what you tried, what you verified, and what you want to practice next." />
      <div className="journal-toolbar actions">
        <button type="button" className="button primary" ref={newRef} onClick={add}>
          <Plus size={17} aria-hidden="true" /> New note
        </button>
        {notes.length > 0 && <button type="button" className="button secondary" onClick={() => {
          downloadText("learning-journal.md", exportJournal(notes));
          setMessage("Journal Markdown download started.");
        }}><Download size={17} aria-hidden="true" /> Download journal</button>}
      </div>
      {unreadable && <section className="journal-recovery" aria-label="Journal recovery">
        <p>Export this session’s notes before replacing the unreadable save. Keeping it preserves the original for recovery.</p>
        <button type="button" className="text-link" onClick={replaceUnreadable}>Replace unreadable journal</button>
      </section>}
      <p className="small-print journal-privacy">Notes stay in this browser. Download Markdown to keep a copy or share it with your agent. Nothing is uploaded or synced to repository notes.</p>
      <p className="action-message" role="status">{message}</p>
      {selected ? <div className="journal-layout">
        <aside className="journal-index" aria-labelledby="journal-index-title">
          <div className="section-heading">
            <h2 id="journal-index-title">Your notes</h2>
            <span className="quiet-count">{notes.length}</span>
          </div>
          <ul className="journal-list">
            {notes.map((note) => <li key={note.id}>
              <button type="button" aria-pressed={note.id === selected.id} onClick={() => { setSelectedId(note.id); setMessage(""); }}>
                {note.title.trim() || "Untitled learning note"}
              </button>
            </li>)}
          </ul>
        </aside>
        <section className="journal-editor" aria-labelledby="journal-editor-title">
          <div className="section-heading">
            <h2 id="journal-editor-title">Learning note</h2>
          </div>
          <form action="/notes" method="post" onSubmit={(event) => event.preventDefault()}>
            <p className="small-print journal-help">All fields are optional. A note is a reflection, not proof that a contribution is ready.</p>
            {noteFields.map((field) => {
              const hint = "hint" in field ? field.hint : undefined;
              const id = `note-${field.key}`;
              return <div className="journal-field" key={field.key}>
                <label htmlFor={id}>{field.label}</label>
                {hint && <p id={`${id}-help`} className="small-print">{hint}</p>}
                {field.key === "title" || field.key === "project"
                  ? <input ref={field.key === "title" ? titleRef : undefined} id={id} name={field.key} value={selected[field.key]} onChange={(event) => update(field.key, event.target.value)} />
                  : <textarea id={id} name={field.key} rows={field.key === "learned" || field.key === "evidence" ? 5 : 3} aria-describedby={hint ? `${id}-help` : undefined} value={selected[field.key]} onChange={(event) => update(field.key, event.target.value)} />}
              </div>;
            })}
          </form>
          <div className="actions journal-note-actions">
            <button type="button" className="button secondary" onClick={() => {
              downloadText("learning-note.md", exportNote(selected));
              setMessage("Note Markdown download started.");
            }}><Download size={17} aria-hidden="true" /> Download note</button>
            <button type="button" className="text-link" onClick={remove}><Trash2 size={17} aria-hidden="true" /> Delete note</button>
          </div>
        </section>
      </div> : <section className="journal-empty" aria-labelledby="journal-empty-title">
        <p className="eyebrow">From experience to understanding</p>
        <h2 id="journal-empty-title">No learning notes yet.</h2>
        <p>Start with one thing you learned while building, debugging, or reviewing. Add the evidence and a small next step.</p>
      </section>}
    </>
  );
}
