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
import { Modal, Table, Space, Button, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownOutlined } from '@ant-design/icons';
import useStore from '@/store/store';

const NodeListModal: React.FC = ({ isModalOpen, groupIndex, handleOk, handleCancel }) => {
	const [selectedNodeList, setSelectedNodeList] = useState([]);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [groupList, setGroupList] = useState([]);
	const { t } = useTranslation();
	const tableData = configGroupInfo[groupIndex].ConfigNodeList;
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.createGroup'),
			callback: () => createGroup(),
			disabled: !selectedNodeList.length
		},
		{
			id: 2,
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
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: []) => {
			setSelectedNodeList(selectedRows);
		}
	};
	const createGroup = () => {
		setConfigGroupInfo([
			...configGroupInfo,
			{
				...configGroupInfo[groupIndex],
				ConfigNodeList: selectedNodeList
			}
		]);
		console.log(2222, [
			...configGroupInfo,
			{
				...configGroupInfo[groupIndex],
				ConfigNodeList: selectedNodeList
			}
		]);
		handleOk();
	};
	const moveToOtherGroup = (targetGroupIndex: number) => {
		const data = mergeData(targetGroupIndex, selectedNodeList);
		setConfigGroupInfo(data);
		handleOk(targetGroupIndex);
	};
	const mergeData = (n, newDataArr) => {
		// Copy the original data
		const updatedConfigGroupList = [...configGroupInfo];

		if (updatedConfigGroupList[n]) {
			updatedConfigGroupList[n].ConfigNodeList.push(...newDataArr);
		}
		return updatedConfigGroupList;
	};

	useEffect(() => {
		let items = [];
		configGroupInfo.map((_group, index) => {
			items.push({
				key: index,
				label: t('group', { name: index + 1 })
			});
		});
		setGroupList(items);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [configGroupInfo]);

	return (
		<Modal title="节点" open={isModalOpen} onOk={() => handleOk(selectedNodeList)} onCancel={handleCancel} footer={null}>
			<Space>
				{buttonConfigTop.map(button => {
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
