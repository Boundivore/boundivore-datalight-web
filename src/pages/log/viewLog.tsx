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
 * 节点管理列表页
 * @author Tracy.Guo
 */
import { FC, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Tree, Typography, Tooltip, Flex } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import type { GetProps, TreeDataNode } from 'antd';
import { LogViewer } from '@patternfly/react-log-viewer';
import { Resizable } from 're-resizable';
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const { DirectoryTree } = Tree;
const { Text } = Typography;
const style = {
	display: 'flex'
	// alignItems: 'center',
	// justifyContent: 'center'
	// border: 'solid 1px #ddd'
	// background: '#f0f0f0'
};

const convertToTreeData = data => {
	return data.map(item => ({
		title: item.DirectoryName,
		key: item.DirectoryPath,
		children: [
			...item.FilePathList.map(filePath => ({
				title: (
					<Tooltip title={filePath.substring(filePath.lastIndexOf('/') + 1)}>
						<Text ellipsis={true} className="w-[160px]">
							{filePath.substring(filePath.lastIndexOf('/') + 1)}
						</Text>
					</Tooltip>
				), // 获取文件名作为 title
				key: filePath,
				isLeaf: true
			})),
			...convertToTreeData(item.Children) // 递归处理子目录
		],
		isLeaf: false
	}));
};
const ViewLog: FC = () => {
	const [searchParams] = useSearchParams();
	const nodeId = searchParams.get('node') || '';
	const hostName = searchParams.get('name') || '';
	const { selectCluster } = useCurrentCluster();
	const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
	const [fileContent, setFileContent] = useState('');
	const [startOffset] = useState(0);
	const [endOffset, setEndOffset] = useState(5000);
	const [selectedFile, setSelectedFile] = useState('');
	const containerRef = useRef(null);

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
		setSelectedFile(antdTreeData[0].children[0].key);
	};
	const getFileContent = async (filePath: string) => {
		const api = APIConfig.loadFileConten;
		const params = {
			NodeId: nodeId,
			FilePath: filePath,
			StartOffset: startOffset,
			EndOffset: endOffset
		};
		const {
			Data: { Content, EndOffset }
		} = await RequestHttp.get(api, { params });
		setEndOffset(parseInt(EndOffset) + 5000);
		setFileContent(Content);
	};

	useEffect(() => {
		selectCluster && getFileList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);
	useEffect(() => {
		selectedFile && getFileContent(selectedFile);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFile]);
	const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
		info.node.isLeaf && setSelectedFile(keys[0]);
		setEndOffset(5000);
		console.log('Trigger Select', keys, info);
	};
	// const onResize = (event, { size }) => {
	// 	// 在这里处理拖拽改变大小的逻辑
	// 	console.log(size);
	// };
	const [logViewerWidth, setLogViewerWidth] = useState(0); // 初始化 Log Viewer 的高度为 300px

	const handleResize = (e, direction, ref) => {
		console.log(ref.offsetWidth);
		const containWidth = containerRef.current.clientWidth;
		console.log(containWidth - ref.offsetWidth);
		setLogViewerWidth(containWidth - ref.offsetWidth - 100);
	};
	useEffect(() => {
		if (containerRef.current) {
			const width = containerRef.current.clientWidth * 0.75; // 以 70% 的宽度初始化
			setLogViewerWidth(width - 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerRef.current]);

	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]" ref={containerRef}>
			<Flex
				gap="middle"
				style={{
					width: '100%',
					overflow: 'hidden'
				}}
			>
				<Resizable
					style={style}
					defaultSize={{
						width: '25%'
						// height: 200
					}}
					maxWidth="100%"
					minWidth="1"
					onResize={handleResize}
				>
					<Card className="data-light-card h-[515px] overflow-y-auto w-[100%]" title={hostName}>
						{treeData.length ? (
							<DirectoryTree
								multiple
								defaultExpandAll
								selectedKeys={[selectedFile]}
								// fieldNames={{ title: 'DirectoryName', key: 'DirectoryPath', children: 'Children' }}
								onSelect={onSelect}
								// onExpand={onExpand}
								treeData={treeData}
							/>
						) : null}
					</Card>
				</Resizable>
				<Card style={{ width: '100%', minWidth: '1px' }} title={selectedFile.substring(selectedFile.lastIndexOf('/') + 1)}>
					<LogViewer
						// className="bg-[#151515] text-[#fff] pl-[20px]"
						// style={{}}
						theme="dark"
						width={logViewerWidth}
						height={400}
						hasLineNumbers={true}
						data={fileContent}
						onScroll={({ scrollDirection, scrollOffset, scrollOffsetToBottom }) => {
							console.log(scrollDirection, scrollOffset, scrollOffsetToBottom);
							if (scrollOffsetToBottom >= 0 && scrollOffsetToBottom < 10) {
								getFileContent(selectedFile);
							}
						}}
					/>
				</Card>
			</Flex>
		</Card>
	);
};

export default ViewLog;
