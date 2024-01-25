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
 * 节点管理列表页
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

// import useStore from '@/store/store';

interface DataType {
	HasAlreadyNode: boolean;
	ClusterId: number;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: string;
	ClusterState: string;
	DlcVersion: string;
	RelativeClusterId: number;
}

const ManageList: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [selectData, setSelectData] = useState([]);
	const [defaultSelectValue, setDefaultSelectValue] = useState('');
	// const { modal } = App.useApp();
	const columns: ColumnsType<DataType> = [
		{
			title: t('cluster.name'),
			dataIndex: 'Hostname',
			key: 'Hostname'
		},
		{
			title: t('cluster.description'),
			dataIndex: 'NodeIp',
			key: 'NodeIp'
		},
		{
			title: t('operation'),
			key: 'IsExistInitProcedure',
			dataIndex: 'IsExistInitProcedure',
			render: () => {
				// const hasAlreadyNode = record.HasAlreadyNode;
				// if (hasAlreadyNode && !text) {
				// 	return null;
				// } else {
				return (
					<Space>
						<Button
							type="primary"
							size="small"
							ghost
							onClick={() => {
								// navigate('/cluster/create');
							}}
						>
							{t('node.restart')}
						</Button>
						<Button
							type="primary"
							size="small"
							ghost
							onClick={() => {
								// navigate('/cluster/create');
							}}
						>
							{t('node.remove')}
						</Button>
					</Space>
				);
				// }
			}
		}
	];
	const getClusterList = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		const listData = ClusterList.map(item => {
			return {
				value: item.ClusterId,
				label: item.ClusterName
			};
		});
		setLoading(false);
		setDefaultSelectValue(listData[0].value);
		setSelectData(listData);
		// getNodeList(id);
	};
	const getNodeList = async id => {
		const api = APIConfig.nodeList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { NodeDetailList }
		} = data;
		setTableData(NodeDetailList);
	};
	const handleChange = value => {
		setDefaultSelectValue(value);
	};
	useEffect(() => {
		defaultSelectValue && getNodeList(defaultSelectValue);
	}, [defaultSelectValue]);
	useEffect(() => {
		getClusterList();
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Flex justify="space-between">
				<Button
					type="primary"
					disabled={!selectData.length}
					onClick={() => {
						navigate(`/node/addNode?id=${defaultSelectValue}`);
					}}
				>
					{t('node.addNode')}
				</Button>
				<div>
					{t('node.currentCluster')}
					<Select className="w-[200px]" options={selectData} value={defaultSelectValue} onChange={handleChange} />
				</div>
			</Flex>
			<Table className="mt-[20px]" rowKey="NodeId" columns={columns} dataSource={tableData} loading={loading} />
		</Card>
	);
};

export default ManageList;
