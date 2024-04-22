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
 * InitNode - 节点初始化
 * @author Tracy
 */
import React, { forwardRef, useEffect } from 'react';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import StepComponent from '@/components/stepComponent';
import useStepLogic from '@/hooks/useStepLogic';
import useStepConfig from '@/components/steps/config/useStepConfig';
// const ParseStep = React.lazy(() => import('./steps/parseStep'));
// const ParseList = React.lazy(() => import('./steps/parseList'));

const InitNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { stepCurrent, setIsRefresh } = useStore();
	const { useStepEffect } = useStepLogic();
	const { nodeStepConfig, serviceStepConfig } = useStepConfig();

	const steps = [
		{
			title: t('node.parseHostname'),
			key: 0
		},
		{
			title: t('node.chooseHostname'),
			key: 1
		},
		{
			title: t('node.detect'),
			key: 2
		},
		{
			title: t('node.check'),
			key: 3
		},
		{
			title: t('node.dispatch'),
			key: 4
		},
		{
			title: t('node.startWorker'),
			key: 5
		},
		{
			title: t('node.add'),
			key: 6
		},
		{
			title: t('service.selectService'),
			key: 7
		},
		{
			title: t('service.selectComponent'),
			key: 8
		},
		{
			title: t('service.preConfig'),
			key: 9
		},
		{
			title: t('service.deployOverview'),
			key: 10
		},
		{
			title: t('service.deployStep'),
			key: 11
		}
	];

	const stepConfig = [...nodeStepConfig, ...serviceStepConfig];
	useStepEffect();
	useEffect(() => {
		// 离开当前页面时重置isRefresh为true，再次进入该页面不进行parse操作，除非通过上一步，下一步将isRefresh设为false
		return () => {
			setIsRefresh(true);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Row className="min-h-[calc(100%-50px)] m-[20px] pb-[50px]">
			<Col span={5}>
				<Card className="h-full">
					<Steps size="small" current={stepCurrent} direction="vertical" items={steps} />
				</Card>
			</Col>
			<Col span={19}>
				<StepComponent config={stepConfig} />
			</Col>
		</Row>
	);
});

export default InitNode;
