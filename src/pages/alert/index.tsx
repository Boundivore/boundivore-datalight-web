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
import { FC } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { t } from 'i18next';
import ContainerCard from '@/components/containerCard';
import AlertRuleList from '@/components/alert/alertRuleList';
import AlertHandlerMailList from '@/components/alert/alertHandlerMailList';
import AlertHandlerInterfaceList from '@/components/alert/alertHandlerInterfaceList';

const Alert: FC = () => {
	const [searchParams] = useSearchParams();
	const tab = searchParams.get('tab') || '';
	const subTab = searchParams.get('subTab') || '';

	const items: TabsProps['items'] = [
		{
			key: 'alert',
			label: (
				<Link to="/alert?tab=alert" className="text-inherit">
					{t('alert.alert')}
				</Link>
			),
			children: <AlertRuleList />
		},
		{
			key: 'handler',
			label: (
				<Link to="/alert?tab=handler&subTab=ALERT_INTERFACE" className="text-inherit">
					{t('alert.alertHandler')}
				</Link>
			),
			children: (
				<Tabs
					tabPosition="left"
					activeKey={subTab}
					items={[
						{
							key: 'ALERT_INTERFACE',
							label: (
								<Link to="/alert?tab=handler&subTab=ALERT_INTERFACE" className="text-inherit">
									{t('alert.handlerInterface')}
								</Link>
							),
							children: <AlertHandlerInterfaceList />
						},
						{
							key: 'ALERT_MAIL',
							label: (
								<Link to="/alert?tab=handler&subTab=ALERT_MAIL" className="text-inherit">
									{t('alert.handlerMail')}
								</Link>
							),

							children: <AlertHandlerMailList />
						}
					]}
				/>
			)
		}
	];

	return (
		<ContainerCard>
			<Tabs type="card" activeKey={tab} items={items}></Tabs>
		</ContainerCard>
	);
};
export default Alert;
