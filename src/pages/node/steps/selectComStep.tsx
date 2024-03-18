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
 * SelectComStep - 选择组件步骤
 * @author Tracy.Guo
 */
import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Collapse, Flex, Select, Spin } from 'antd';
// import { useTranslation } from 'react-i18next';
// import type { CollapseProps } from 'antd';
import { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import NodeListModal from '../components/nodeListModal';
import useStore from '@/store/store';
import { NodeType, ServiceItemType } from '@/api/interface';

const notSelectedStates = ['SELECTED', 'SELECTED_ADDITION'];

const SelectComStep: React.FC = forwardRef((_props, ref) => {
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	const [serviceList, setServiceList] = useState<ServiceItemType[]>([]);
	const [serviceNames, setServiceNames] = useState<string[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	const [disableSelectedNode, setDisableSelectedNode] = useState(false);
	const { setCurrentPageDisabled, currentPageDisabled } = useStore();
	const [tempData, setTempData] = useState<ServiceItemType[]>([]);
	// const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const componentListRef = useRef([]);
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiSelect = APIConfig.selectComponent;
		// 将 nodeList 转换为以 ComponentName 为 key 的对象
		const nodeMap = Object.entries(nodeList[id]).reduce((acc, [componentName, nodes]) => {
			Object.values(nodes.componentNodeList).forEach(node => {
				if (!acc[componentName]) {
					acc[componentName] = {};
				}
				// 根据状态将节点分为两组
				if (node.SCStateEnum === 'UNSELECTED') {
					(acc[componentName].unselected || (acc[componentName].unselected = [])).push(node.NodeId);
				} else {
					(acc[componentName].selected || (acc[componentName].selected = [])).push(node.NodeId);
				}
			});
			return acc;
		}, {});

		// 合并数据并计算 ComponentList
		const paramsComponentList = componentListRef.current
			.filter(component => {
				return notSelectedStates.includes(component.ServiceSummary.SCStateEnum);
			}) // 过滤出这两种状态的数据提交
			.flatMap(service => {
				const serviceName = service.ServiceSummary.ServiceName;
				return service.ComponentSummaryList.flatMap(component => {
					const componentName = component.ComponentName;
					// const nodeIds = nodeMap[componentName] || [];
					// const scStateEnum = service.ServiceSummary.SCStateEnum; // 根据实际逻辑设置状态
					const result1 = {
						ComponentName: componentName,
						NodeIdList: nodeMap[componentName] === undefined ? [] : nodeMap[componentName].selected,
						SCStateEnum: 'SELECTED',
						ServiceName: serviceName
					};

					const result2 = {
						ComponentName: componentName,
						NodeIdList: nodeMap[componentName] === undefined ? [] : nodeMap[componentName].unselected,
						SCStateEnum: 'UNSELECTED',
						ServiceName: serviceName
					};
					if (nodeMap[componentName]?.selected?.length && nodeMap[componentName]?.unselected?.length) {
						return [result1, result2];
					} else if (!nodeMap[componentName]?.selected?.length) {
						return result2;
					} else {
						return result1;
					}
				});
			});

		const params = {
			ClusterId: id,
			ComponentList: paramsComponentList
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};
	const handleFocus = (componentName: string, disableSelected: boolean) => {
		setIsModalOpen(true);
		setCurrentComponent(componentName);
		setDisableSelectedNode(disableSelected);
	};
	const handleModalOk = (selectedRows: NodeType) => {
		console.log('id', selectedRows);
		console.log('nodeList[id]', nodeList[id]);
		setNodeList({
			[id]: { ...nodeList[id], [currentComponent]: { ...nodeList[id][currentComponent], componentNodeList: selectedRows } }
		});
		setIsModalOpen(false);
	};

	const handleModalCancel = () => {
		setIsModalOpen(false);
	};
	const customTagRender = ({ label }) => (
		<span className="ant-select-selection-item ant-select-selection-item-disabled" key={label} style={{ userSelect: 'none' }}>
			{label}
		</span>
	);
	const handleChange = (names: string[]) => {
		setServiceNames(names);
	};

	const getList = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		componentListRef.current = data.Data.ServiceComponentSummaryList;
		const componentList = componentListRef.current;
		const transformedData = componentList.map(item => {
			return {
				...item.ServiceSummary,
				ComponentSummaryList: item.ComponentSummaryList
			};
		});
		setTempData(transformedData);
		let tempList = {};
		transformedData.map(item => {
			item.ComponentSummaryList.map(component => {
				tempList[id] = {
					...tempList[id],
					[component.ComponentName]: { componentNodeList: component.ComponentNodeList, min: component.Min, max: component.Max }
				};
				console.log('tempList[id]', tempList[id]);
				setNodeList(tempList);
			});
		});
		setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: false, prevDisabled: false });
	};
	useEffect(() => {
		const cdata = tempData.map(item => {
			let tempList = {};
			// 是否禁用已经选择的节点
			// let disableSelected = item.SCStateEnum === 'SELECTED_ADDITION';
			let disableSelected = false;
			return {
				key: item.ServiceName,
				label: item.ServiceName,
				children: (
					<Spin indicator={<span></span>} spinning={!notSelectedStates.includes(item.SCStateEnum)}>
						<Flex wrap="wrap">
							{item.ComponentSummaryList.map(component => {
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
									?.filter((item: ServiceItemType) => item.SCStateEnum !== 'UNSELECTED')
									.map((node: NodeType) => node.Hostname);
								console.log(111, tempList[id]);
								console.log(222, nameArray);
								return (
									<div className="w-1/4">
										<p>{component.ComponentName}</p>
										<Select
											value={nameArray}
											mode="multiple"
											className="w-4/5 data-light"
											tagRender={customTagRender}
											onFocus={() => handleFocus(component.ComponentName, disableSelected)}
										/>
									</div>
								);
							})}
						</Flex>
					</Spin>
				)
			};
		});
		const serviceNamesList = tempData
			.filter(service => notSelectedStates.includes(service.SCStateEnum))
			.map(item => item.ServiceName);
		setServiceNames(serviceNamesList);
		setServiceList(cdata);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nodeList, tempData]);
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			<Collapse items={serviceList} activeKey={serviceNames} onChange={name => handleChange(name)} />
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
		</>
	);
});
export default SelectComStep;
