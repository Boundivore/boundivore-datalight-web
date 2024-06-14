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
 * @author Tracy
 */
import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Collapse, Flex, Select, Spin } from 'antd';
import { t } from 'i18next';
import type { CollapseProps } from 'antd';
import { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import NodeListModal from '../nodeListModal';
import useStore, { useScrollStore } from '@/store/store';
import {
	NodeType,
	ServiceItemType,
	ServiceComponentSummaryVo,
	ComponentSummaryVo,
	ServiceSummaryVo,
	ComponentRequest
} from '@/api/interface';

const notSelectedStates = ['SELECTED', 'SELECTED_ADDITION'];

interface Node {
	SCStateEnum: 'UNSELECTED' | 'SELECTED';
	NodeId: string;
	// 其他节点属性...
}

interface NodeList {
	[componentName: string]: {
		componentNodeList: {
			[key: string]: Node;
		};
	};
}

interface NodeMap {
	[componentName: string]: {
		selected?: string[];
		unselected?: string[];
	};
}
type CustomTagRender = (props: { label?: React.ReactNode; value?: string }) => React.ReactElement;

const SelectComStep = forwardRef((_props, ref) => {
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	const [serviceList, setServiceList] = useState<CollapseProps['items']>([]);
	const [serviceNames, setServiceNames] = useState<string[] | string>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	const [disableSelectedNode, setDisableSelectedNode] = useState(false);
	const { setCurrentPageDisabled, currentPageDisabled } = useStore();
	const { setScrollTop } = useScrollStore();
	const [tempData, setTempData] = useState<ServiceItemType[]>([]);
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const componentListRef = useRef([]);
	useImperativeHandle(ref, () => ({
		handleOk
	}));
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
		const paramsComponentList: ComponentRequest[] = componentListRef.current
			.filter((component: ServiceComponentSummaryVo) => {
				return notSelectedStates.includes(component.ServiceSummary.SCStateEnum);
			}) // 过滤出这两种状态的数据提交
			.flatMap((service: ServiceSummaryVo) => {
				const serviceName = service.ServiceSummary.ServiceName;
				return service.ComponentSummaryList.flatMap((component: ComponentSummaryVo) => {
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
	const handleModalOk = (selectedRows: NodeType[]) => {
		setNodeList({
			[id]: { ...nodeList[id], [currentComponent]: { ...nodeList[id][currentComponent], componentNodeList: selectedRows } }
		});
		setIsModalOpen(false);
	};

	const handleModalCancel = () => {
		setIsModalOpen(false);
	};

	const handleChange = (names: string[] | string) => {
		setServiceNames(names);
	};

	const getList = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		componentListRef.current = data.Data.ServiceComponentSummaryList;
		const componentList: ServiceComponentSummaryVo[] = componentListRef.current;
		const transformedData = componentList.map(item => {
			return {
				...item.ServiceSummary,
				ComponentSummaryList: item.ComponentSummaryList
			};
		});
		setTempData(transformedData);
		let tempList = { [id]: {} }; // 初始化临时数据，用id作为唯一key值
		transformedData.map(item => {
			item.ComponentSummaryList.map(component => {
				tempList[id] = {
					...tempList[id],
					[component.ComponentName]: { componentNodeList: component.ComponentNodeList, min: component.Min, max: component.Max }
				};
				setNodeList(tempList);
			});
		});
		setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: false, prevDisabled: false });
	};
	const customTagRender: CustomTagRender = ({ label, value }) => (
		<span className="ant-select-selection-item ant-select-selection-item-disabled" key={value} style={{ userSelect: 'none' }}>
			{label}
		</span>
	);
	const getRecommendation = async (serviceNames: string) => {
		const api = APIConfig.getComponentPlacementRecommendation;
		const params = {
			ClusterId: id,
			ServiceNames: serviceNames
		};
		const { Data } = await RequestHttp.get(api, { params });
		console.log(Data);
	};
	const genExtra = (isDisabled: boolean, serviceNames: string) => (
		<Button
			type="primary"
			size="small"
			disabled={isDisabled}
			ghost
			onClick={() => {
				// If you don't want click extra trigger collapse, you can prevent this:
				// event.stopPropagation();
				getRecommendation(serviceNames);
			}}
		>
			{t('recommend')}
		</Button>
	);
	useEffect(() => {
		const cdata = tempData.map(item => {
			const { ServiceName, SCStateEnum, ComponentSummaryList } = item;
			let tempList = { [id]: {} };
			// 是否禁用已经选择的节点
			// let disableSelected = item.SCStateEnum === 'SELECTED_ADDITION';
			let disableSelected = false;
			return {
				key: ServiceName,
				label: (
					<div className="flex items-center">
						<img src={`/service_logo/${ServiceName.toLowerCase()}.svg`} width="16" height="16" />
						<span className="pl-[5px]">{ServiceName}</span>
					</div>
				),
				extra: genExtra(SCStateEnum !== 'SELECTED', ServiceName),
				children: (
					<Spin indicator={<span></span>} spinning={!notSelectedStates.includes(SCStateEnum)}>
						<Flex wrap="wrap">
							{ComponentSummaryList.map((component: ComponentSummaryVo) => {
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
		setScrollTop(0);
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
