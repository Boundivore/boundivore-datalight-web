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
import { FC, useEffect, useState } from 'react';
import { Button, Flex, Select, Space } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import useStore, { useComponentAndNodeStore } from '@/store/store';
import NodeListModal from '@/components/nodeListModal';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { ComponentSummaryVo, ServiceItemType, ComponentRequest, NodeType } from '@/api/interface';
interface SelectNewNodeProps {
	onClose: () => void;
}
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
const operation = 'MIGRATE';
const serviceName = 'HDFS';
const SelectNewNode: FC<SelectNewNodeProps> = ({ onClose }) => {
	const {
		selectedNameNode,
		selectedZKFC,
		setReloadMigrateList,
		setMigrateStep,
		setJobId,
		setSelectedNameNode,
		setSelectedZKFC,
		setReloadConfigFile
	} = useStore();
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	const [tempData, setTempData] = useState<ComponentSummaryVo[]>([]);
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	const [disableSelectedNode, setDisableSelectedNode] = useState(false);
	let tempList = { [id]: {} };
	let disableSelected = false;

	const selectComponent = async () => {
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
				ServiceName: serviceName
			};

			return result;
		});

		const params = {
			ClusterId: id,
			ComponentList: paramsComponentList
		};
		const { Code } = await RequestHttp.post(apiSelect, params);
		if (Code === '00000') {
			setMigrateStep(['4']);
			deploy();
		}
	};
	const getServiceList = async () => {
		const apiList = APIConfig.serviceList;
		const params = {
			ClusterId: id
		};
		const {
			Data: { ServiceSummaryList }
		} = await RequestHttp.get(apiList, { params });
		selectService(ServiceSummaryList);
	};
	const selectService = async (serviceData: ServiceItemType[]) => {
		const apiSelect = APIConfig.selectService;
		// 合并原数据和本次操作选择的数据
		// const combinedArray = serviceData.map(item => ({ ...item, SCStateEnum: 'UNSELECTED' }));
		const transformedData = serviceData.map(item => ({
			SCStateEnum: item.ServiceName === serviceName ? 'SELECTED' : 'UNSELECTED',
			ServiceName: item.ServiceName
		}));
		const params = {
			ClusterId: id,
			ServiceList: transformedData
		};
		await RequestHttp.post(apiSelect, params);
		selectComponent();
	};
	const handleOk = () => {
		getServiceList();
	};
	const handleCancel = () => {
		setSelectedNameNode([]);
		setSelectedZKFC([]);
		setReloadConfigFile(false);
		setReloadMigrateList(false);
		// setMigrateStep(['1']);
		onClose();
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
	const deploy = async () => {
		setReloadMigrateList(false);
		setIsModalOpen(true);
		const api = APIConfig.migrate;
		// const serviceNameList = webState[preStepName];
		const params = {
			ActionTypeEnum: operation,
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: [serviceName]
		};
		try {
			const {
				Code,
				Data: { JobId }
			} = await RequestHttp.post(api, params);
			setJobId(JobId);
			// setDeployState(Code === '00000');
			setReloadMigrateList(Code === '00000');
		} catch (error) {
			console.error('请求失败:', error);
		} finally {
			setIsModalOpen(false); // 在请求完成后关闭模态框，无论成功还是失败
		}
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
				/>
			) : null}
			<Space className="mt-[20px] flex justify-center">
				<Button type="primary" disabled={tempData.length <= 1} onClick={handleOk}>
					{t('next')}
				</Button>
				<Button type="primary" ghost onClick={handleCancel}>
					{t('cancel')}
				</Button>
			</Space>
		</>
	);
};
export default SelectNewNode;
