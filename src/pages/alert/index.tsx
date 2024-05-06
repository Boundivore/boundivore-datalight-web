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
 * 告警
 * @author Tracy
 */
import { FC, useState, useEffect } from 'react';
import { Tabs, Table, Flex, Space, Button } from 'antd';
import type { TabsProps, TableColumnsType } from 'antd';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { AlertSimpleVo } from '@/api/interface';
import useNavigater from '@/hooks/useNavigater';

const Alert: FC = () => {
	const [currentTab, setCurrentTab] = useState('1');
	const [alertList, setAlertList] = useState<AlertSimpleVo[]>([]);
	const { clusterComponent, selectCluster } = useCurrentCluster();
	const { navigateToCreateAlert } = useNavigater();

	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('node.addNode'),
			callback: () => {
				navigateToCreateAlert();
			},
			disabled: false
		}
	];

	const columns: TableColumnsType<AlertSimpleVo> = [
		{
			title: t('node.name'),
			dataIndex: 'Hostname',
			key: 'Hostname'
		}
	];
	const items: TabsProps['items'] = [
		{
			key: '1',
			label: t('alert.alert'),
			children: (
				<>
					<Flex justify="space-between">
						<Space>
							{buttonConfigTop.map(button => (
								<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
									{button.label}
								</Button>
							))}
						</Space>
						<Space>
							{clusterComponent}
							{/* <Button type="primary" onClick={viewActiveJob}>
							{t('viewActiveJob')}
						</Button> */}
						</Space>
					</Flex>
					<Table dataSource={alertList} columns={columns}></Table>
				</>
			)
		},
		{
			key: '2',
			label: t('alert.alertMethod'),
			children: 'Content of Tab Pane 1'
		}
	];
	const getAlertList = async () => {
		const api = APIConfig.getAlertSimpleList;
		const params = {
			ClusterId: selectCluster
		};
		const {
			Data: { AlertSimpleList }
		} = await RequestHttp.get(api, { params });
		setAlertList(AlertSimpleList);
		console.log(1212, AlertSimpleList);
	};
	useEffect(() => {
		selectCluster && getAlertList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);
	return (
		<ContainerCard>
			<Tabs activeKey={currentTab} items={items} onChange={setCurrentTab}></Tabs>
		</ContainerCard>
	);
};
export default Alert;
