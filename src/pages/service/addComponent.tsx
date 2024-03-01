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
import React, { useRef, forwardRef, useEffect } from 'react';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import StepComponent from '@/pages/node/components/stepComponent';
import SelectServiceStep from '@/pages/node/steps/selectServiceStep';
import SelectComStep from '@/pages/node/steps/selectComStep';
import PreconfigStep from '@/pages/node/steps/preconfigStep';
import DeployStep from '@/pages/node/steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';

const AddComponent: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { useStepEffect } = useStepLogic(8);
	const { stepCurrent, setStepCurrent } = useStore();
	const { navigateToHome } = useNavigater();
	const selectServiceRef = useRef<{ handleOk: () => void } | null>(null);
	const selectComponentRef = useRef<{ handleOk: () => void } | null>(null);
	const PreconfigStepRef = useRef<{ handleOk: () => void } | null>(null);
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
			title: t('service.deployStep'),
			key: 3
		}
	];
	const nextComponent = async () => {
		const callbackData = await selectServiceRef.current?.handleOk();
		return callbackData;
	};
	const nextPreconfig = async () => {
		const callbackData = await selectComponentRef.current?.handleOk();
		return callbackData;
	};
	const nextDeploy = async () => {
		const callbackData = await PreconfigStepRef.current?.handleOk();
		return callbackData;
	};
	const preview = async () => {
		const callbackData = await PreconfigStepRef.current?.onFinish(true);
		return callbackData;
	};
	useEffect(() => {
		setStepCurrent(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const stepConfig = [
		{
			title: t('service.selectService'),
			content: <SelectServiceStep ref={selectServiceRef} />,
			nextStep: nextComponent
		},
		{
			title: t('service.selectComponent'),
			content: <SelectComStep ref={selectComponentRef} />,
			nextStep: nextPreconfig
		},
		{
			title: t('service.preConfig'),
			content: <PreconfigStep ref={PreconfigStepRef} />,
			nextStep: nextDeploy,
			hideNext: true,
			operations: [
				{ label: t('preview'), callback: preview },
				{ label: t('startDeploy') } // 不传callback默认进行一下步
			]
		},
		{
			title: t('service.deployStep'),
			content: <DeployStep ref={DeployStepRef} />,
			operations: [{ label: t('backHome'), callback: navigateToHome }]
			// nextStep: nextComponent
		}
	];
	//获取进度，定位到当前步骤
	useStepEffect();
	return (
		<Row className="min-h-[calc(100%-100px)] m-[20px] pb-[50px]">
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
