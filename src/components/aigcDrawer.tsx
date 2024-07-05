/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */
/**
 * AIGC抽屉
 * @author Tracy
 */
import { FC, useEffect, useState, useCallback } from 'react';
import { Drawer, Input, Button, Skeleton } from 'antd';
import { t } from 'i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import MarkdownViewer from '@/components/markdownViewer';

const { TextArea } = Input;

interface AIGCDrawerProps {
	message?: string;
}
const AIGCDrawer: FC<AIGCDrawerProps> = () => {
	const [aiMessage, setAiMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [inputMessage, setInputMessage] = useState('');
	const { showerAI, setShowerAI, message } = useStore();
	const sendMessage = async (currentMessage: string = '') => {
		setLoading(true);
		const api = APIConfig.sendMessage;
		const params = { AIGCType: 'QIANFAN', Message: currentMessage || inputMessage };
		try {
			const { Data } = await RequestHttp.post(api, params, {
				// 自定义超时时间
				timeout: 1000 * 10 * 6
			});
			setAiMessage(Data);
		} finally {
			setLoading(false);
		}
	};
	const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		let isDown = false;
		const startX = e.clientX;
		const drawerElement = document.getElementsByClassName('ant-drawer-content-wrapper')[0];
		const startWidth = drawerElement.clientWidth;
		console.log('startWidth', startWidth);
		const handleMouseMove = (moveEvent: MouseEvent) => {
			if (!isDown) return;

			const newWidth = startWidth - (moveEvent.clientX - startX);
			(drawerElement as HTMLElement).style.width = `${newWidth > 378 ? newWidth : 378}px`;
		};
		const handleMouseUp = () => {
			isDown = false;
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			drawerElement.removeEventListener('mouseup', handleMouseUp);
		};

		isDown = true;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		drawerElement.addEventListener('mouseup', handleMouseUp);
	}, []);

	useEffect(() => {
		if (message) {
			setInputMessage(t('aiPrompt') + message);
			sendMessage(t('aiPrompt') + message);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message]);

	return (
		<Drawer
			open={showerAI}
			extra={
				<Button
					type="primary"
					ghost
					onClick={() => {
						const drawerElement = document.getElementsByClassName('ant-drawer-content-wrapper')[0] as HTMLElement;
						drawerElement.style.width = '378px';
					}}
				>
					{t('revert')}
				</Button>
			}
			className="text-end"
			onClose={() => setShowerAI(false)}
		>
			<div
				id="line"
				className="absolute left-0 w-[8px] h-[90%] bg-white hover:bg-gray-100 cursor-ew-resize"
				onMouseDown={e => handleMouseDown(e)}
			></div>
			<TextArea
				showCount
				value={inputMessage} // 绑定到inputMessage
				onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInputMessage(e.target.value)}
				style={{ height: 120, resize: 'none' }}
			/>
			<Button type="primary" onClick={() => sendMessage()} className="my-[20px]" loading={loading}>
				{t('ai')}
			</Button>
			{loading ? <Skeleton active /> : <MarkdownViewer markdown={aiMessage} />}
		</Drawer>
	);
};
export default AIGCDrawer;
