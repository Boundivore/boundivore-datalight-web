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
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Tree } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import type { GetProps, TreeDataNode } from 'antd';
import { LogViewer } from '@patternfly/react-log-viewer';

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const { DirectoryTree } = Tree;
const convertToTreeData = data => {
	return data.map(item => ({
		title: item.DirectoryName,
		key: item.DirectoryPath,
		children: [
			...item.FilePathList.map(filePath => ({
				title: filePath.substring(filePath.lastIndexOf('/') + 1), // 获取文件名作为 title
				key: filePath,
				isLeaf: true
			})),
			...convertToTreeData(item.Children) // 递归处理子目录
		]
	}));
};
const ViewLog: FC = () => {
	const [searchParams] = useSearchParams();
	const nodeId = searchParams.get('node') || '';
	const { selectCluster } = useCurrentCluster();
	const [treeData, setTreeData] = useState<TreeDataNode[]>();
	const [fileContent, setFileContent] = useState('');
	const [startOffset] = useState(0);
	const [endOffset, setEndOffset] = useState(5000);
	const [selectedFile, setSelectedFile] = useState('');

	const getNodeList = async () => {
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
		selectCluster && getNodeList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);
	useEffect(() => {
		selectedFile && getFileContent(selectedFile);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFile]);
	const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
		setSelectedFile(keys[0]);
		setEndOffset(5000);
		console.log('Trigger Select', keys, info);
	};

	return (
		<Card className="min-h-[calc(100%-50px)] m-[20px]">
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card">
						<DirectoryTree
							multiple
							defaultExpandAll
							// fieldNames={{ title: 'DirectoryName', key: 'DirectoryPath', children: 'Children' }}
							onSelect={onSelect}
							// onExpand={onExpand}
							treeData={treeData}
						/>
					</Card>
				</Col>
				<Col span={18}>
					<Card className="data-light-card">
						<LogViewer
							// className="bg-[#151515] text-[#fff] pl-[20px]"
							theme="dark"
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
				</Col>
			</Row>
		</Card>
	);
};

export default ViewLog;
