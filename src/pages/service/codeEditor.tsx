import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools'; // 引入语言工具扩展
import 'ace-builds/src-noconflict/worker-javascript';

const modified = 'ace-changed';
interface Props {
	editorRef: React.RefObject<AceEditor>;
	data: string;
	mode: string;
}
const CodeEditor: React.FC<Props> = ({ editorRef, data, mode }) => {
	const handleChange = (_value: string, e: { start: { row: number }; action: string; end: { row: number } }) => {
		// 标记修改
		const editor = editorRef?.current?.editor;
		let activeLine = e.start.row;
		if (e.action == 'insert') {
			while (activeLine < e.end.row + 1) {
				editor?.session.removeGutterDecoration(activeLine, modified);
				editor?.session.addGutterDecoration(activeLine, modified);
				activeLine++;
			}
		} else if (e.action == 'remove') {
			while (activeLine < e.end.row + 1) {
				editor?.session.removeGutterDecoration(activeLine, modified);
				activeLine++;
			}
			editor?.session.addGutterDecoration(e.start.row, modified);
		}
	};

	return (
		<AceEditor
			ref={editorRef}
			mode={mode}
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
				tabSize: 2,
				fontFamily: 'sans-serif',
				fontSize: '14px',
				charset: 'utf-8'
			}}
			onChange={(value, e) => handleChange(value, e)}
		/>
	);
};

export default CodeEditor;
