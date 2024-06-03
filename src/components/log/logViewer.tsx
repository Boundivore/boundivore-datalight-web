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
 * 日志展示组件
 * @author Tracy
 */
import { FC, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import { List, Button, Skeleton, message } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';

interface LogViewerProps {
	selectedFile: string;
	offset: number;
}
const LogViewer: FC<LogViewerProps> = ({ selectedFile, offset }) => {
	const [searchParams] = useSearchParams();
	const nodeId = searchParams.get('node') || '';
	const [messageApi, contextHolder] = message.useMessage();

	const { eachLog, setEachLog } = useStore();

	const [initLoading, setInitLoading] = useState(true);
	const [loading, setLoading] = useState(false);

	const [markedLogs, setMarkedLogs] = useState<string[]>([]);
	const divRef = useRef(null);
	const startOffset = useRef(0);
	const endOffset = useRef(0); //第一次请求，通过StartOffset传递0，EndOffset传递0，来获取最大偏移量
	const startOffsetUpRef = useRef(0);
	const endOffsetUpRef = useRef(0);
	const startOffsetDownRef = useRef(0);
	const endOffsetDownRef = useRef(0);

	const isFirstLoadRef = useRef(true);

	const getFileContent = async (filePath: string, position: string) => {
		setLoading(true);
		const api = APIConfig.loadFileConten;
		const params = {
			NodeId: nodeId,
			FilePath: filePath,
			StartOffset: startOffset.current,
			EndOffset: endOffset.current
		};
		if (isFirstLoadRef.current) {
			params.StartOffset = 0;
			params.EndOffset = 0;
		} else {
			if (position === 'down') {
				params.StartOffset = startOffsetDownRef.current;
				params.EndOffset = endOffsetDownRef.current;
			} else if (position === 'up') {
				params.StartOffset = startOffsetUpRef.current;
				params.EndOffset = endOffsetUpRef.current;
			}
		}
		const {
			Data: { Content, MaxOffset, StartOffset, EndOffset }
		} = await RequestHttp.get(api, { params });
		if (isFirstLoadRef.current) {
			endOffset.current = parseInt(MaxOffset);
			startOffset.current = Math.max(0, endOffset.current - offset);

			endOffsetUpRef.current = startOffset.current;
			startOffsetDownRef.current = endOffset.current;

			isFirstLoadRef.current = false;
			getFileContent(filePath, 'present');
		} else {
			if (position === 'up') {
				if (Content) {
					setEachLog(Content, false);
					endOffsetUpRef.current = parseInt(StartOffset);
				} else {
					messageApi.warning(t('haveNoMore'));
				}
			} else {
				if (Content) {
					setEachLog(Content, true);
					startOffsetDownRef.current = parseInt(EndOffset);
				} else {
					messageApi.warning(t('haveNoMore'));
				}
			}
		}
		startOffsetUpRef.current = endOffsetUpRef.current - offset;
		endOffsetDownRef.current = startOffsetDownRef.current + offset;
		setInitLoading(false);
		setLoading(false);
	};
	const getFileContentDebounced = useRef(
		debounce((file, position) => {
			getFileContent(file, position);
		}, 500)
	).current; // Adjust the debounce delay as needed

	const handleLoadMoreNew = () => {
		getFileContentDebounced(selectedFile, 'down');
	};
	const handleLoadMoreOld = () => {
		getFileContentDebounced(selectedFile, 'up');
	};

	useEffect(() => {
		startOffsetUpRef.current = endOffsetUpRef.current - offset;
		endOffsetDownRef.current = startOffsetDownRef.current + offset;
	}, [offset]);
	useEffect(() => {
		isFirstLoadRef.current = true;
		selectedFile && getFileContent(selectedFile, 'present');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFile]);
	const loadMore =
		!initLoading && !loading ? (
			<div className="text-center mt-[12px] h-[32px] leading-[32px]">
				<Button onClick={handleLoadMoreNew}>
					<RedoOutlined />
					{t('loadMore')}
				</Button>
			</div>
		) : null;

	const markLog = (markItem: string) => {
		setMarkedLogs(prev => {
			return prev.includes(markItem) ? prev.filter(logId => logId !== markItem) : [...prev, markItem];
		});
	};

	return (
		<>
			{contextHolder}
			<div ref={divRef} className="h-[420px] overflow-auto ">
				{!initLoading && !loading ? (
					<div className="text-center mt-[12px] h-[32px] leading-[32px]">
						<Button onClick={handleLoadMoreOld}>
							<RedoOutlined />
							{t('loadMore')}
						</Button>
					</div>
				) : null}
				<List
					loading={initLoading}
					itemLayout="horizontal"
					loadMore={loadMore}
					dataSource={eachLog.split('\n').filter(Boolean)}
					renderItem={item => (
						<List.Item
							key={item}
							style={{ backgroundColor: markedLogs.includes(item) ? '#ffc' : 'white' }}
							onClick={() => markLog(item)}
						>
							<Skeleton title={false} loading={!item} active>
								<List.Item.Meta title={item} />
							</Skeleton>
						</List.Item>
					)}
				></List>
			</div>
		</>
	);
};

export default LogViewer;
