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
 * NodeListModal - 选择组件时绑定的节点弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleOk - 弹窗确定的回调函数
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @author Tracy.Guo
 */
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Table, Space, Button, Dropdown, Flex, Tag } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { DownOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/store';
import { extractUpperCaseAndNumbers } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { NodeWithComponent, ConfigNodeVo } from '@/api/interface';

interface NodeListModalProps {
	isModalOpen: boolean;
	groupIndex: number | string;
	handleOk: (index: number, data: ConfigNodeVo[]) => void;
	handleCancel: () => void;
}
const NodeListModal: React.FC<NodeListModalProps> = ({ isModalOpen, groupIndex, handleOk, handleCancel }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [selectedNodeList, setSelectedNodeList] = useState<ConfigNodeVo[]>([]);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [groupList, setGroupList] = useState<MenuProps['items']>([]);
	const [tableData, setTableData] = useState<ConfigNodeVo[]>([]);
	const { t } = useTranslation();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 0,
			label: t('service.moveToGroup'),
			disabled: !selectedNodeList.length,
			type: 'dropdown',
			callback: (index: number) => moveToOtherGroup(index)
		}
	];
	const columns: ColumnsType<ConfigNodeVo> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('includeComponent'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: (text: string[]) => (
				<Flex wrap="wrap" gap="small">
					{text.map(component => (
						<Tag bordered={false} color="processing" key={component}>
							{extractUpperCaseAndNumbers(component)}
						</Tag>
					))}
				</Flex>
			)
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: ConfigNodeVo[]) => {
			setSelectedNodeList(selectedRows);
		}
	};
	const moveToOtherGroup = (targetGroupIndex: number) => {
		const data = mergeData(targetGroupIndex, selectedNodeList);
		setConfigGroupInfo(data);
		handleOk(targetGroupIndex, data);
	};
	const mergeData = (index: number, newDataArr: ConfigNodeVo[]) => {
		// Copy the original data
		const updatedConfigGroupList = _.cloneDeep(configGroupInfo);
		// 移动当前分组中的节点到目标分组
		_.remove(updatedConfigGroupList[groupIndex].ConfigNodeList, (itemA: ConfigNodeVo) =>
			_.some(newDataArr, itemB => itemA.NodeId === itemB.NodeId)
		);

		if (updatedConfigGroupList[index]) {
			updatedConfigGroupList[index].ConfigNodeList.push(...newDataArr);
		} else {
			let copyData = _.cloneDeep(updatedConfigGroupList[groupIndex]);
			copyData.ConfigNodeList = newDataArr;
			updatedConfigGroupList[index] = copyData;
		}
		// 移动之后将没有节点的分组删除
		if (updatedConfigGroupList[groupIndex].ConfigNodeList.length === 0) {
			updatedConfigGroupList.splice(groupIndex, 1);
		}
		return updatedConfigGroupList;
	};
	const getList = async () => {
		const apiList = APIConfig.nodeListWithComponent;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const {
			Data: { NodeWithComponentList }
		} = data;
		const listData = NodeWithComponentList.map((node: NodeWithComponent) => {
			node.NodeDetail.ComponentName = node.ComponentName;
			return node.NodeDetail;
		});
		const configNodeList = configGroupInfo[groupIndex].ConfigNodeList;
		const intersection = _.intersectionWith(
			listData,
			configNodeList,
			(obj1: ConfigNodeVo, obj2: ConfigNodeVo) => obj1.Hostname === obj2.Hostname
		);
		setTableData(intersection);
	};
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let items = [];
		const validGroup = configGroupInfo
			.map((group, index) => ({
				...group,
				name: t('group', { name: index + 1 }),
				key: index
			}))
			.filter((_group, filterIndex) => {
				return filterIndex !== groupIndex;
			});
		console.log('selectedNodeList----33', selectedNodeList);
		validGroup.map(group => {
			items.push({
				key: group.key,
				label: <div className="w-[115px]">{group.name}</div>
				// nodeList: []
			});
		});
		items.push({
			key: configGroupInfo.length,
			label: <div className="w-[115px]">创建新的分组</div>
			// nodeList: []
		});
		setGroupList(items);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [configGroupInfo]);
	return (
		<Modal
			title={t('selectNode')}
			open={isModalOpen}
			// onOk={() => handleOk(selectedNodeList)}
			onCancel={handleCancel}
			footer={null}
		>
			<Space>
				{buttonConfigTop.map(button => {
					return button.type === 'dropdown' ? (
						<Dropdown
							key={button.id}
							menu={{ items: groupList, onClick: ({ key }) => button.callback(Number(key)) }}
							disabled={button.disabled}
						>
							<Button type="primary">
								<Space>
									{button.label}
									<DownOutlined />
								</Space>
							</Button>
						</Dropdown>
					) : (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					);
				})}
			</Space>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={tableData}
				columns={columns}
			/>
		</Modal>
	);
};
export default NodeListModal;
