// import AceEditor from 'react-ace';
// import 'ace-builds/src-noconflict/mode-javascript';
// import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/ext-language_tools'; // 引入语言工具扩展
// import 'ace-builds/src-noconflict/worker-javascript';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';

// const modified = 'ace-changed';
interface Props {
	data: string;
	mode: string;
}
const CodeEditor: React.FC<Props> = forwardRef(({ data, mode }, ref) => {
	console.log('mode', mode);
	const [value, setValue] = useState(data);
	const handleChange = val => {
		setValue(val);
	};
	const handleSave = () => {
		return value;
	};
	useImperativeHandle(ref, () => ({
		handleSave
	}));
	useEffect(() => {
		setValue(data);
	}, [data]); // 确保包含所有相关的props

	// const handleChange = value => {
	// 标记修改
	// const editor = editorRef?.current?.editor;
	// console.log('value:', value);
	// let activeLine = e.start.row;
	// if (e.action == 'insert') {
	// 	while (activeLine < e.end.row + 1) {
	// 		editor?.session.removeGutterDecoration(activeLine, modified);
	// 		editor?.session.addGutterDecoration(activeLine, modified);
	// 		activeLine++;
	// 	}
	// } else if (e.action == 'remove') {
	// 	while (activeLine < e.end.row + 1) {
	// 		editor?.session.removeGutterDecoration(activeLine, modified);
	// 		activeLine++;
	// 	}
	// 	editor?.session.addGutterDecoration(e.start.row, modified);
	// }
	// };

	return (
		// <AceEditor
		// 	ref={editorRef}
		// 	mode={mode}
		// 	theme="github"
		// 	name="code-editor"
		// 	fontSize={14}
		// 	width="100%"
		// 	value={data}
		// 	showPrintMargin={false}
		// 	editorProps={{ $blockScrolling: Infinity, $useWorker: true }}
		// 	setOptions={{
		// 		enableBasicAutocompletion: true,
		// 		enableLiveAutocompletion: true,
		// 		enableSnippets: true,
		// 		showLineNumbers: true,
		// 		tabSize: 2,
		// 		fontFamily: 'sans-serif',
		// 		fontSize: '14px',
		// 		charset: 'utf-8'
		// 	}}
		// 	onChange={(value, e) => handleChange(value, e)}
		// />
		<CodeMirror
			value={value}
			height="500px"
			// extensions={['javascript']}
			onChange={handleChange}
		/>
	);
});

export default CodeEditor;
