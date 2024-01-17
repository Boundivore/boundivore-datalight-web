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
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @param {string} component - 关联的组件名称
 * @author Tracy.Guo
 */
import { useState } from 'react';
import { Modal, Table } from 'antd';
import useStore, { useComponentAndNodeStore } from '@/store/store';
import { useTranslation } from 'react-i18next';

const NodeListModal: React.FC = ({ isModalOpen, handleOk, handleCancel, component }) => {
	const { selectedRowsList } = useStore();
	const [selectedNodeList, setSelectedNodeList] = useState([]);
	const { nodeList } = useComponentAndNodeStore();
	// console.log(999, nodeList);
	const { t } = useTranslation();

	const columns = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedNodeList(selectedRows);
		},
		defaultSelectedRowKeys: nodeList[component]?.map(({ NodeId }) => {
			return NodeId;
		})
	};
	return (
		<Modal title="Basic Modal" open={isModalOpen} onOk={() => handleOk(selectedNodeList)} onCancel={handleCancel}>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={selectedRowsList}
				columns={columns}
			/>
		</Modal>
	);
};
export default NodeListModal;
