import React, { useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools'; // 引入语言工具扩展
import 'ace-builds/src-noconflict/worker-javascript';

const modified = 'ace-changed';
const CodeEditor: React.FC = ({ data }) => {
	const editorRef = useRef(null);

	const handleChange = e => {
		// 示例：根据编辑器的内容进行注释设置

		let activeLine = e.start.row;
		if (e.action == 'insert') {
			while (activeLine < e.end.row + 1) {
				editorRef.current.editor.session.removeGutterDecoration(activeLine, modified);
				editorRef.current.editor.session.addGutterDecoration(activeLine, modified);
				activeLine++;
			}
		} else if (e.action == 'remove') {
			while (activeLine < e.end.row + 1) {
				editorRef.current.editor.session.removeGutterDecoration(activeLine, modified);
				activeLine++;
			}
			editorRef.current.editor.session.addGutterDecoration(e.start.row, modified);
		}
	};

	return (
		<AceEditor
			ref={editorRef}
			mode="javascript"
			theme="github"
			name="code-editor"
			fontSize={14}
			width="100%"
			value={data}
			showPrintMargin={false}
			editorProps={{ $blockScrolling: Infinity, $useWorker: true }}
			setOptions={{
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: true,
				enableSnippets: true,
				showLineNumbers: true,
				tabSize: 2
			}}
			onChange={(_value, e) => handleChange(e)}
		/>
	);
};

export default CodeEditor;
