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
import { FC, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { t } from 'i18next';
import ContainerCard from '@/components/containerCard';
import AlertRuleList from '@/components/alert/alertRuleList';
import AlertHandlerMailList from '@/components/alert/alertHandlerMailList';

const Alert: FC = () => {
	const [currentTab, setCurrentTab] = useState('1');

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: t('alert.alert'),
			children: <AlertRuleList />
		},
		{
			key: '2',
			label: t('alert.alertMethod'),
			children: (
				<Tabs
					tabPosition="top"
					items={[
						{
							key: '2-1',
							label: '告警接口处理方式',
							children: <AlertRuleList />
						},
						{
							key: '2-2',
							label: '告警邮箱处理方式',
							children: <AlertHandlerMailList />
						}
					]}
				/>
			)
		}
	];

	return (
		<ContainerCard>
			<Tabs tabPosition="left" activeKey={currentTab} items={items} onChange={setCurrentTab}></Tabs>
		</ContainerCard>
	);
};
export default Alert;
