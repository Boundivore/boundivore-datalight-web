// DiffViewer.js
import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-github';
import { diffChars } from 'diff';

const DiffViewer = ({ originalText, modifiedText }) => {
	const editorRef = useRef(null);

	useEffect(() => {
		if (editorRef.current && editorRef.current.editor) {
			const changes = diffChars(originalText, modifiedText);

			// Mark changes in the editor
			changes.forEach(part => {
				const className = part.added ? 'added' : part.removed ? 'removed' : 'unchanged';
				const start = part.added ? part.index : part.removed ? part.index : part.index + part.value.length;
				const end = part.added ? part.index + part.value.length : part.removed ? part.index + part.value.length : part.index;

				editorRef.current.editor.getSession().addMarker(new window.ace.Range(start, 0, end, 0), className, 'fullLine');
			});
		}
	}, [originalText, modifiedText]);

	const handleEditorLoad = editor => {
		editorRef.current = editor;
	};

	return (
		<AceEditor
			mode="text"
			theme="github"
			value={modifiedText}
			editorProps={{ $blockScrolling: true }}
			onLoad={handleEditorLoad}
		/>
	);
};

export default DiffViewer;
