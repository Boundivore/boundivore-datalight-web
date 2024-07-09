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
 * NameNodeMigrate- NameNode迁移
 * @author Tracy
 */
import React, { useState, useEffect } from 'react';
import { Drawer, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { useSearchParams } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import SelectNameNode from '@/components/nameNodeSteps/selectNameNode';
import SelectNewNode from '@/components/nameNodeSteps/selectNewNode';
import SelectZKFC from '@/components/nameNodeSteps/selectZKFC';
import { ComponentSummaryVo } from '@/api/interface';
import useStore from '@/store/store';

const NameNodeMigrate: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const serviceName = searchParams.get('name') || '';
	const { selectedNameNode } = useStore();
	const [componentList, setComponentList] = useState<ComponentSummaryVo[]>([]);
	const [zkFailoverControllerList, setZkFailoverControllerList] = useState<ComponentSummaryVo[]>([]);
	const [nameNodeList, setNameNodeList] = useState<ComponentSummaryVo[]>([]);
	const items: CollapseProps['items'] = [
		{
			key: '1',
			label: '第一步',
			children: <SelectNameNode componentList={nameNodeList} />
		},
		{
			key: '2',
			label: '第二步',
			children: <SelectZKFC componentList={zkFailoverControllerList} />
		},
		{
			key: '3',
			label: '第三步',
			children: <SelectNewNode />
		}
	];
	const getComponentList = async () => {
		// setLoading(true);
		const api = APIConfig.componentListByServiceName;
		const params = { ClusterId: id, ServiceName: serviceName };
		const {
			Data: { ServiceComponentSummaryList }
		} = await RequestHttp.get(api, { params });
		setComponentList(ServiceComponentSummaryList[0].ComponentSummaryList);
		setNameNodeList(
			ServiceComponentSummaryList[0].ComponentSummaryList.filter(component => component.ComponentName.includes('NameNode'))
		);
	};
	useEffect(() => {
		getComponentList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		// setLoading(false);
		const zkFailoverControllers = componentList.filter(component => {
			// 检查ComponentName是否以"ZKFailoverController"开头
			if (component.ComponentName.startsWith('ZKFailoverController')) {
				// 提取ZKFailoverController名称中的数字部分
				const zkNumberStr = component.ComponentName.slice('ZKFailoverController'.length);
				const zkNumber = parseInt(zkNumberStr, 10);

				// 检查是否存在对应的NameNode
				for (const nn of selectedNameNode) {
					// 假设NameNode的ComponentName是"NameNode"后跟数字，提取这个数字
					const nnNumberStr = nn.ComponentName.slice('NameNode'.length);
					const nnNumber = parseInt(nnNumberStr, 10);

					// 如果ZKFailoverController的数字与NameNode的数字匹配，则返回true
					if (zkNumber === nnNumber) {
						return true;
					}
				}
			}
			// 如果没有找到匹配的ZKFailoverController，则返回false
			return false;
		});
		setZkFailoverControllerList(zkFailoverControllers);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNameNode]);

	return (
		<Drawer width={640} onClose={onClose} open={isOpen}>
			<Collapse items={items} defaultActiveKey={['1']} />
		</Drawer>
	);
};
export default NameNodeMigrate;
