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
 * 查看日志页
 * @author Tracy
 */
import { FC, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Tree, Tooltip, Flex, InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import { t } from 'i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import type { GetProps, TreeDataNode } from 'antd';
import { Resizable } from 're-resizable';
import ContainerCard from '@/components/containerCard';
import useStore from '@/store/store';
import { LogFileCollectionVo } from '@/api/interface';
import LogViewer from '@/components/log/logViewer';
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const { DirectoryTree } = Tree;
interface TreeNode {
	title: React.ReactNode;
	key: string;
	children?: TreeNode[];
	isLeaf: boolean;
}

const ViewLog: FC = () => {
	const { clearEachLog } = useStore();
	const [searchParams] = useSearchParams();
	const nodeId = searchParams.get('node') || '';
	const hostName = searchParams.get('name') || '';
	const { selectCluster } = useCurrentCluster();
	const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
	const [selectedFile, setSelectedFile] = useState('');
	const [offset, setOffset] = useState(5000);
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<(HTMLSpanElement | null)[]>([]);

	//记录向上滚动加载和向下滚动记载的范围

	const convertToTreeData = (data: LogFileCollectionVo[], startIndex = 0): TreeNode[] => {
		let currentIndex = startIndex; // 当前索引
		return data.map((item: LogFileCollectionVo) => ({
			title: item.DirectoryName,
			key: item.DirectoryPath,
			children: [
				...item.FilePathList.map(filePath => {
					const textRefIndex = currentIndex++; // 计算当前索引
					return {
						title: (
							<Tooltip placement="right" title={filePath.substring(filePath.lastIndexOf('/') + 1)}>
								<span
									ref={ref => (textRef.current[textRefIndex] = ref)}
									style={{ width: '160px' }}
									className={`inline-block whitespace-nowrap overflow-hidden text-ellipsis`}
								>
									{filePath.substring(filePath.lastIndexOf('/') + 1)}
								</span>
							</Tooltip>
						), // 获取文件名作为 title
						key: filePath,
						isLeaf: true
					};
				}),
				...convertToTreeData(item.Children, currentIndex) // 递归处理子目录
			],
			isLeaf: false
		}));
	};

	const getFileList = async () => {
		const apiRoot = APIConfig.getLogRootDirectory;
		const api = APIConfig.getLogCollection;
		const {
			Data: { RootDirectoryPath }
		} = await RequestHttp.get(apiRoot);
		const data = await RequestHttp.get(api, { params: { NodeId: nodeId, RootLogFileDirectory: RootDirectoryPath } });
		const {
			Data: { Children }
		} = data;
		const antdTreeData = convertToTreeData(Children);
		setTreeData(antdTreeData);
		setSelectedFile(antdTreeData[0].children?.[0]?.key || '');
	};

	useEffect(() => {
		selectCluster && getFileList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);

	useEffect(() => {
		//离开当前页面，清空日志
		return () => {
			clearEachLog();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
		info.node.isLeaf && setSelectedFile(keys[0] as string);
		clearEachLog();
	};

	// const [logViewerWidth, setLogViewerWidth] = useState(0); // 初始化 Log Viewer 的高度为 300px

	const handleResize = (ref: HTMLElement) => {
		// const containWidth = containerRef.current?.clientWidth ?? 0;
		textRef.current.forEach(element => {
			if (element) {
				element.style.width = `${ref.offsetWidth - 200}px`;
			}
		});
		// setLogViewerWidth(containWidth - ref.offsetWidth - 100);
	};
	// useEffect(() => {
	// 	if (containerRef.current) {
	// 		const width = containerRef.current.clientWidth * 0.75; // 以 70% 的宽度初始化
	// 		setLogViewerWidth(width - 100);
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [containerRef.current]);
	const handleOffsetChange: InputNumberProps['onChange'] = value => {
		const newValue = (value === null || value === undefined ? 5000 : value) as number;
		setOffset(newValue);
	};

	return (
		<ContainerCard ref={containerRef}>
			<Flex gap="middle" className="w-[100%] overflow-hidden">
				<Resizable
					className="flex"
					defaultSize={{
						width: '25%',
						height: 'auto'
					}}
					maxWidth="100%"
					minWidth="1"
					onResize={(_e, _direction, ref) => handleResize(ref)}
				>
					<Card className="data-light-card h-[515px] overflow-y-auto w-[100%]" title={hostName}>
						{treeData.length ? (
							<DirectoryTree multiple defaultExpandAll selectedKeys={[selectedFile]} onSelect={onSelect} treeData={treeData} />
						) : null}
					</Card>
				</Resizable>
				<Card
					style={{ width: '100%', minWidth: '1px' }}
					title={selectedFile.substring(selectedFile.lastIndexOf('/') + 1)}
					extra={
						<>
							<span>{t('offset')}</span>
							<InputNumber
								placeholder={t('offsetPlaceholder')}
								min={1}
								max={100000}
								value={offset}
								onChange={handleOffsetChange}
								style={{ width: 200 }}
								parser={value => value?.replace(/\.\d*/g, '') as unknown as number} // 确保只接受整数输入
							/>
						</>
					}
				>
					{selectedFile ? <LogViewer selectedFile={selectedFile} offset={offset} /> : null}
					{/* <LogViewer
						theme="dark"
						width={logViewerWidth}
						height={400}
						hasLineNumbers={false}
						isTextWrapped={true}
						data={eachLog}
						// onScroll={({ scrollOffsetToBottom }) => handleScroll(scrollOffsetToBottom)}
					/> */}
				</Card>
			</Flex>
		</ContainerCard>
	);
};

export default ViewLog;
