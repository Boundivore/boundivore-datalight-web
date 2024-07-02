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
import { FC, useEffect, useState } from 'react';
import { Drawer, Input, Button } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';

const { TextArea } = Input;

interface AIGCDrawerProps {
	message?: string;
}
const AIGCDrawer: FC<AIGCDrawerProps> = () => {
	const [aiMessage, setAiMessage] = useState('');
	const { showerAI, setShowerAI, message } = useStore();
	const sendMessage = async () => {
		const api = APIConfig.sendMessage;
		const params = { AIGCType: 'QIANFAN', Message: '请帮我分析并优化一下以下内容，并输出markdown格式的回复' + message };
		const { Data } = await RequestHttp.post(api, params);
		console.log(11, Data);
		setAiMessage(Data);
	};
	useEffect(() => {
		message && sendMessage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message]);
	return (
		<Drawer open={showerAI} className="text-end" onClose={() => setShowerAI(false)}>
			<TextArea
				showCount
				value={'请帮我分析并优化一下以下内容，并输出markdown格式的回复' + message}
				style={{ height: 120, resize: 'none' }}
			/>
			<Button type="primary" onClick={sendMessage} className="my-[5px]">
				AI分析
			</Button>
			<p className="text-start">{aiMessage}</p>
		</Drawer>
	);
};
export default AIGCDrawer;
