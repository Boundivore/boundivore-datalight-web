// import AceEditor from 'react-ace';
// import 'ace-builds/src-noconflict/mode-javascript';
// import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/ext-language_tools'; // 引入语言工具扩展
// import 'ace-builds/src-noconflict/worker-javascript';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
// import { langs } from '@uiw/codemirror-extensions-langs';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';

// const modified = 'ace-changed';
interface Props {
	data: string;
}
const CodeEditor: React.FC<Props> = forwardRef(({ data }, ref) => {
	const [value, setValue] = useState(data);
	const handleChange = (val: string) => {
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
	}, [data]);

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
		<CodeMirror
			value={value}
			height="500px"
			extensions={[StreamLanguage.define(shell), StreamLanguage.define(yaml)]}
			onChange={handleChange}
		/>
	);
});

export default CodeEditor;
