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
import { Collapse, Flex, Select } from 'antd';
// import { useTranslation } from 'react-i18next';
// import type { CollapseProps } from 'antd';
import { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import NodeListModal from '../components/nodeListModal';
import { NodeType } from '@/api/interface';

const SelectComStep: React.FC = forwardRef((_props, ref) => {
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	const [serviceList, setServiceList] = useState([]);
	const [serviceNames, setServiceNames] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	const [tempData, setTempData] = useState([]);
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
					acc[componentName] = [];
				}
				acc[componentName].push(node.NodeId);
			});
			return acc;
		}, {});

		// 合并数据并计算 ComponentList
		const paramsComponentList = componentListRef.current.flatMap(service => {
			const serviceName = service.ServiceSummary.ServiceName;
			return service.ComponentSummaryList.map(component => {
				const componentName = component.ComponentName;
				const nodeIds = nodeMap[componentName] || [];
				const scStateEnum = service.ServiceSummary.SCStateEnum; // 根据实际逻辑设置状态
				return {
					ComponentName: componentName,
					NodeIdList: nodeIds,
					SCStateEnum: scStateEnum,
					ServiceName: serviceName
				};
			});
		});

		const params = {
			ClusterId: id,
			ComponentList: paramsComponentList
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};
	const handleFocus = (componentName: string) => {
		setIsModalOpen(true);
		setCurrentComponent(componentName);
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
	};
	useEffect(() => {
		const cdata = tempData.map(item => {
			let tempList = {};
			return {
				key: item.ServiceName,
				label: item.ServiceName,
				children: (
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
							const nameArray = (nodeList[id] || tempList[id])[component.ComponentName].componentNodeList?.map(
								node => node.Hostname
							);
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
										onFocus={() => handleFocus(component.ComponentName)}
									/>
								</div>
							);
						})}
					</Flex>
				)
			};
		});
		const serviceNamesList = tempData.map(item => item.ServiceName);
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
			<Collapse items={serviceList} activeKey={serviceNames} />
			{isModalOpen ? (
				<NodeListModal
					isModalOpen={isModalOpen}
					handleOk={handleModalOk}
					handleCancel={handleModalCancel}
					component={currentComponent}
					// nodeList={nodeList}
				/>
			) : null}
		</>
	);
});
export default SelectComStep;
