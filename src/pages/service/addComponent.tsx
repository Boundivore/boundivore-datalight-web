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
 * AddComponent - 新增组件
 * @author Tracy.Guo
 */
import React, { useRef, forwardRef } from 'react';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import StepComponent from '@/pages/node/components/stepComponent';
import SelectServiceStep from '@/pages/node/steps/selectServiceStep';
import SelectComStep from '@/pages/node/steps/selectComStep';
import PreconfigStep from '@/pages/node/steps/preconfigStep';
import PreviewconfigStep from '@/pages/node/steps/previewStep';
import DeployStep from '@/pages/node/steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';

const AddComponent: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { useStepEffect } = useStepLogic(7);
	const { stepCurrent } = useStore();
	const { navigateToHome } = useNavigater();
	const { useClearStepData } = useStepLogic();
	const clearData = useClearStepData();
	const selectServiceRef = useRef<{ handleOk: () => void } | null>(null);
	const selectComponentRef = useRef<{ handleOk: () => void } | null>(null);
	const PreconfigStepRef = useRef<{ handleOk: () => void } | null>(null);
	const PreviewconfigStepRef = useRef<{ handleOk: () => void }>(null);
	const DeployStepRef = useRef<{ handleOk: () => void } | null>(null);
	const steps = [
		{
			title: t('service.selectService'),
			key: 0
		},
		{
			title: t('service.selectComponent'),
			key: 1
		},
		{
			title: t('service.preConfig'),
			key: 2
		},
		{
			title: t('service.deployOverview'),
			key: 3
		},
		{
			title: t('service.deployStep'),
			key: 4
		}
	];
	const nextComponent = () => selectServiceRef.current?.handleOk();
	const nextPreconfig = () => selectComponentRef.current?.handleOk();
	const nextDeploy = () => PreviewconfigStepRef.current?.handleOk();
	const nextPreview = () => PreconfigStepRef.current?.onFinish(true);
	const stepConfig = [
		{
			title: t('service.selectService'),
			content: <SelectServiceStep ref={selectServiceRef} />,
			nextStep: nextComponent,
			hideRetry: true
		},
		{
			title: t('service.selectComponent'),
			content: <SelectComStep ref={selectComponentRef} />,
			nextStep: nextPreconfig,
			hideRetry: true
		},
		{
			title: t('service.preConfig'),
			content: <PreconfigStep ref={PreconfigStepRef} />,
			nextStep: nextPreview,
			hideRetry: true,
			nextText: t('preview')
			// operations: [{ label: t('preview'), callback: preview }]
		},
		{
			title: t('service.deployOverview'),
			content: <PreviewconfigStep ref={PreviewconfigStepRef} />,
			nextStep: nextDeploy,
			hideRetry: true,
			nextText: t('startDeploy')
			// operations: [{ label: t('preview'), callback: preview }]
		},
		{
			title: t('service.deployStep'),
			content: <DeployStep ref={DeployStepRef} />,
			operations: [
				{
					label: t('backHome'),
					callback: () => {
						clearData();
						navigateToHome();
					}
				}
			],
			hideNext: true,
			hideRetry: true
		}
	];
	//获取进度，定位到当前步骤
	useStepEffect();
	return (
		<Row className="min-h-[calc(100%-50px)] m-[20px] pb-[50px]">
			<Col span={6}>
				<Card className="h-full">
					<Steps size="small" current={stepCurrent} direction="vertical" items={steps} />
				</Card>
			</Col>
			<Col span={18}>
				<StepComponent config={stepConfig} />
			</Col>
		</Row>
	);
});

export default AddComponent;
