import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { Button } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { t } from 'i18next';
// import { langs } from '@uiw/codemirror-extensions-langs';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import useStore from '@/store/store';

interface Props {
	data: string;
}
const CodeEditor = forwardRef<{ handleSave: () => string } | null, Props>(({ data }, ref) => {
	const editableDivRef = useRef<HTMLDivElement>(null);
	const [isButtonVisible, setIsButtonVisible] = useState(false);
	const [buttonPosition, setButtonPosition] = useState({ left: 0, top: 0 });
	const [value, setValue] = useState(data);
	const [selectedText, setSelectedText] = useState('');
	const { setShowerAI, setMessage } = useStore();
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
		let divNode: HTMLDivElement | null = null; // 创建一个局部变量来存储DOM节点

		if (editableDivRef.current) {
			divNode = editableDivRef.current; // 在effect内部复制ref的值

			// 添加事件监听器
			divNode.addEventListener('mouseup', handleMouseUp);

			// 返回一个清理函数
			return () => {
				if (divNode) {
					divNode.removeEventListener('mouseup', handleMouseUp); // 使用局部变量来移除事件监听器
				}
			};
		}

		function handleMouseUp() {
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0 && selection?.toString()) {
				// 文本被选中
				const rect = selection.getRangeAt(0).getBoundingClientRect();
				setIsButtonVisible(true);
				setButtonPosition({
					left: rect.left, // 偏移一些位置
					top: rect.bottom - 300 // 偏移一些位置
				});
				setSelectedText(selection?.toString());
			} else {
				setIsButtonVisible(false);
			}
		}
	}, []);
	useEffect(() => {
		setValue(data);
	}, [data]);

	return (
		<>
			<div ref={editableDivRef}>
				<CodeMirror
					value={value}
					height="500px"
					extensions={[StreamLanguage.define(shell), StreamLanguage.define(yaml)]}
					onChange={handleChange}
				/>
			</div>
			{isButtonVisible && (
				<Button
					type="primary"
					style={{
						position: 'absolute',
						left: `${buttonPosition.left}px`,
						top: `${buttonPosition.top}px`
					}}
					onClick={() => {
						setShowerAI(true);
						setMessage(selectedText);
					}}
				>
					{t('ai')}
				</Button>
			)}
		</>
	);
});

export default CodeEditor;
