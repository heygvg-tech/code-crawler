import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import type { Language } from "../lib/types";

// Syntax highlighting for the two runnable languages.
// Want highlighting for Java/Go/Rust/C#? Great first contribution!
export default function CodeEditor({ value, onChange, language }: { value: string; onChange: (v: string) => void; language: Language }) {
  const extensions = language === "Python" ? [python()] : language === "JavaScript" ? [javascript()] : [];
  return (
    <div className="editor">
      <CodeMirror value={value} onChange={onChange} extensions={extensions} theme="dark" minHeight="260px" basicSetup={{ lineNumbers: true, foldGutter: false }} />
    </div>
  );
}
