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
// import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/store';
import { extractUpperCaseAndNumbers } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { NodeType } from '@/api/interface';

const NodeListModal: React.FC = ({ isModalOpen, groupIndex, handleOk, handleCancel }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [selectedNodeList, setSelectedNodeList] = useState([]);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [groupList, setGroupList] = useState([]);
	const [tableData, setTableData] = useState<NodeType[]>([]);
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
	const columns = [
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
						<Tag bordered={false} color="processing">
							{extractUpperCaseAndNumbers(component)}
						</Tag>
					))}
				</Flex>
			)
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: []) => {
			setSelectedNodeList(selectedRows);
		}
	};
	const moveToOtherGroup = (targetGroupIndex: number) => {
		const data = mergeData(targetGroupIndex, selectedNodeList);
		console.log('selectedNodeList----22', selectedNodeList);
		setConfigGroupInfo(data);
		handleOk(targetGroupIndex);
	};
	const mergeData = (n, newDataArr) => {
		// Copy the original data
		const updatedConfigGroupList = _.cloneDeep(configGroupInfo);
		_.pull(updatedConfigGroupList[groupIndex].ConfigNodeList, newDataArr);
		if (updatedConfigGroupList[n]) {
			updatedConfigGroupList[n].ConfigNodeList.push(...newDataArr);
		} else {
			let copyData = _.cloneDeep(updatedConfigGroupList[groupIndex]);
			copyData.ConfigNodeList = newDataArr;
			updatedConfigGroupList[n] = copyData;
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
			(obj1: NodeType, obj2: NodeType) => obj1.Hostname === obj2.Hostname
		);
		setTableData(intersection);
	};
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let items = [];
		const validGroup = configGroupInfo.filter((_group, filterIndex) => filterIndex !== groupIndex);
		console.log('selectedNodeList----33', selectedNodeList);
		validGroup.map((_group, index) => {
			items.push({
				key: index,
				label: <div className="w-[115px]">{t('group', { name: index + 1 })}</div>
				// nodeList: []
			});
		});
		items.push({
			key: validGroup.length + 1,
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
					console.log('selectedNodeList----66666', selectedNodeList);
					return button.type === 'dropdown' ? (
						<Dropdown.Button
							icon={<DownOutlined />}
							type="primary"
							menu={{ items: groupList, onClick: ({ key }) => button.callback(Number(key)) }}
							disabled={button.disabled}
						>
							{button.label}
						</Dropdown.Button>
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
