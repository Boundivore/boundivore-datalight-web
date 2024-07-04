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
 * SelectNameNode- 选择要迁移的NameNode
 * @author Tracy
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import { Table } from 'antd';
import type { TableColumnType } from 'antd';
import { ComponentSummaryVo } from '@/api/interface';

import RequestHttp from '@/api';
import APIConfig from '@/api/config';

const SelectNameNode: React.FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const serviceName = searchParams.get('name') || '';
	const [componentList, setComponentList] = useState<ComponentSummaryVo[]>([]);
	const columns: TableColumnType<ComponentSummaryVo> = [
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: text => <span>{text}</span>
		},
		{
			title: t('service.node'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: text => <span>{text}</span>
		}
	];
	const getComponentList = async () => {
		// setLoading(true);
		const api = APIConfig.componentListByServiceName;
		const params = { ClusterId: id, ServiceName: serviceName };
		const {
			Data: { ServiceComponentSummaryList }
		} = await RequestHttp.get(api, { params });
		setComponentList(
			ServiceComponentSummaryList[0].ComponentSummaryList.filter(component => component.ComponentName.includes('NameNode'))
		);
	};
	useEffect(() => {
		getComponentList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <Table rowKey="ComponentName" columns={columns} dataSource={componentList} />;
};
export default SelectNameNode;
