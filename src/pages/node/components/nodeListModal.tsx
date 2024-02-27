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
import { useState, useEffect } from 'react';
import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface NodeListModalProps {
	isModalOpen: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	component: [];
}
interface DataType {
	Hostname: string;
}
const NodeListModal: React.FC<NodeListModalProps> = ({ isModalOpen, handleOk, handleCancel, component }) => {
	const [tableData, setTableData] = useState([]);
	const [selectedNodeList, setSelectedNodeList] = useState<DataType[]>([]);
	const { nodeList } = useComponentAndNodeStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { t } = useTranslation();

	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('includeComponent'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: (text: string[]) => text.map(component => component)
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedNodeList(selectedRows);
		},
		defaultSelectedRowKeys: nodeList[id][component]?.map(({ NodeId }) => {
			return NodeId;
		})
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
		const listData = NodeWithComponentList.map(node => {
			node.NodeDetail.ComponentName = node.ComponentName;
			return node.NodeDetail;
		});
		setTableData(listData);
	};
	const selectRow = record => {
		const selectedRowKeys = [...selectedNodeList];
		if (selectedRowKeys.indexOf(record.key) >= 0) {
			selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
		} else {
			selectedRowKeys.push(record.key);
		}
		setSelectedNodeList(selectedRowKeys);
	};
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Modal title={t('selectNode')} open={isModalOpen} onOk={() => handleOk(selectedNodeList)} onCancel={handleCancel}>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={tableData}
				columns={columns}
				onRow={record => {
					return {
						onClick: () => selectRow(record) // 点击行
					};
				}}
			/>
		</Modal>
	);
};
export default NodeListModal;
