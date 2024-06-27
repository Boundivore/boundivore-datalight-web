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
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Flex, Space, Badge } from 'antd';
import type { TableColumnsType } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import useStore from '@/store/store';
import ItemConfigInfo from '@/components/itemConfigInfo';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { NodeType, BadgeStatus } from '@/api/interface';
import ContainerCard from '@/components/containerCard';

const LogList: FC = () => {
	const { t } = useTranslation();
	const { stateText } = useStore();
	const [tableData, setTableData] = useState();
	const { navigateToViewLog } = useNavigater();
	const { clusterComponent, selectCluster } = useCurrentCluster();

	// 单条操作按钮配置
	const buttonConfigItem = (record: NodeType) => {
		return [
			{
				id: 1,
				label: t('node.viewLog'),
				callback: () => navigateToViewLog(record.NodeId, record.Hostname),
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<NodeType> = [
		{
			title: t('node.name'),
			dataIndex: 'Hostname',
			key: 'Hostname'
		},
		{
			title: t('node.ip'),
			dataIndex: 'NodeIp',
			key: 'NodeIp'
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			key: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			key: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		},
		{
			title: t('operation'),
			key: 'Operation',
			dataIndex: 'Operation',
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];

	const getNodeList = async () => {
		const api = APIConfig.nodeList;
		const data = await RequestHttp.get(api, { params: { ClusterId: selectCluster } });
		const {
			Data: { NodeDetailList }
		} = data;

		setTableData(NodeDetailList);
	};

	useEffect(() => {
		selectCluster && getNodeList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);

	return (
		<ContainerCard>
			<Flex justify="space-between">
				<Space>
					{clusterComponent}
					{/* <Button type="primary" onClick={viewActiveJob}>
							{t('viewActiveJob')}
						</Button> */}
				</Space>
			</Flex>
			<Table className="mt-[20px]" rowKey="NodeId" columns={columns} dataSource={tableData} />
		</ContainerCard>
	);
};

export default LogList;
