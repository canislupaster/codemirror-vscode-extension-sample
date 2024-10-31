import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

new EditorView({
	parent: document.body,
	state: EditorState.create({
		doc: "hi",
		extensions: [vscodeDark, basicSetup]
	})
});