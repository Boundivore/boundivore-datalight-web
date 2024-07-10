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
 * SelectNewNode- 选择要迁移到的新节点, 第三步
 * @author Tracy
 */
import React, { useEffect, useState } from 'react';
import { Button, Flex, Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ComponentSummaryVo } from '@/api/interface';
import useStore, { useComponentAndNodeStore } from '@/store/store';
import NodeListModal from '@/components/nodeListModal';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
const SelectNewNode: React.FC = () => {
	const { selectedNameNode, selectedZKFC } = useStore();
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	const [tempData, setTempData] = useState([]);
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	const [disableSelectedNode, setDisableSelectedNode] = useState(false);
	let tempList = { [id]: {} };
	let disableSelected = false;
	const handleOk = async () => {
		const apiSelect = APIConfig.selectComponent;
		// 将 nodeList 转换为以 ComponentName 为 key 的对象
		const nodeMap: NodeMap = Object.entries(nodeList[id] as NodeList).reduce((result: NodeMap, [componentName, nodes]) => {
			Object.values(nodes.componentNodeList).forEach(node => {
				if (!result[componentName]) {
					result[componentName] = {};
				}
				// 根据状态将节点分为两组
				if (node.SCStateEnum === 'UNSELECTED') {
					(result[componentName].unselected || (result[componentName].unselected = [])).push(node.NodeId);
				} else {
					(result[componentName].selected || (result[componentName].selected = [])).push(node.NodeId);
				}
			});
			return result;
		}, {});

		// 合并数据并计算 ComponentList
		const paramsComponentList: ComponentRequest[] = Object.keys(nodeList[id]).map(key => {
			const componentName = key;
			// const nodeIds = nodeMap[componentName] || [];
			// const scStateEnum = service.ServiceSummary.SCStateEnum; // 根据实际逻辑设置状态
			const result = {
				ComponentName: componentName,
				NodeIdList: nodeMap[componentName] === undefined ? [] : nodeMap[componentName].selected,
				SCStateEnum: 'SELECTED',
				ServiceName: 'HDFS'
			};

			return result;
		});

		const params = {
			ClusterId: id,
			ComponentList: paramsComponentList
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};
	useEffect(() => {
		const transformedData = [...selectedNameNode, ...selectedZKFC];
		setTempData(transformedData);
		let tempList = { [id]: {} }; // 初始化临时数据，用id作为唯一key值
		transformedData.map(item => {
			tempList[id] = {
				...tempList[id],
				[item.ComponentName]: { componentNodeList: item.ComponentNodeList, min: item.Min, max: item.Max }
			};
		});
		setNodeList(tempList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNameNode, selectedZKFC]);
	const handleModalOk = (selectedRows: NodeType[]) => {
		console.log(selectedRows);
		setNodeList({
			[id]: { ...nodeList[id], [currentComponent]: { ...nodeList[id][currentComponent], componentNodeList: selectedRows } }
		});
		setIsModalOpen(false);
	};

	const handleModalCancel = () => {
		setIsModalOpen(false);
	};
	const handleFocus = (componentName: string, disableSelected: boolean) => {
		setIsModalOpen(true);
		setCurrentComponent(componentName);
		setDisableSelectedNode(disableSelected);
	};
	return (
		<>
			<Flex wrap="wrap">
				{tempData.map((component: ComponentSummaryVo) => {
					tempList[id] = {
						...tempList[id],
						[component.ComponentName]: {
							componentNodeList: component.ComponentNodeList,
							min: component.Min,
							max: component.Max
						}
					};
					// setNodeList(tempList);
					const nameArray = (nodeList[id] || tempList[id])[component.ComponentName].componentNodeList
						?.filter((serviceItem: ServiceItemType) => serviceItem.SCStateEnum !== 'UNSELECTED')
						.map((node: NodeType) => node.Hostname);
					return (
						<div className="w-1/4" key={component.ComponentName}>
							<p>{component.ComponentName}</p>
							<Select
								value={nameArray}
								mode="multiple"
								maxTagTextLength={8}
								maxTagCount={8}
								className="w-4/5"
								dropdownStyle={{ display: 'none' }} // 不显示下拉菜单
								// tagRender={customTagRender}
								onFocus={() => handleFocus(component.ComponentName, disableSelected)}
							/>
						</div>
					);
				})}
			</Flex>
			{isModalOpen ? (
				<NodeListModal
					isModalOpen={isModalOpen}
					handleOk={handleModalOk}
					handleCancel={handleModalCancel}
					component={currentComponent}
					disableSelectedNode={disableSelectedNode}
					// nodeList={nodeList}
				/>
			) : null}
			<Button type="primary" onClick={handleOk}>
				下一步
			</Button>
		</>
	);
};
export default SelectNewNode;
