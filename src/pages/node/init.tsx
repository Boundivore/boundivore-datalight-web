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
 * @author Tracy.Guo
 */
import React, { useRef, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import ParseStep from './steps/parseStep';
import DetectStep from './steps/detectStep';
import CheckStep from './steps/checkStep';
import InitList from './steps/parseList';
import StepComponent from './components/stepComponent';
import DispatchStep from './steps/dispatchStep';
import StartWorkerStep from './steps/startWorkerStep';
import DoneStep from './steps/doneStep';
import SelectServiceStep from './steps/selectServiceStep';
import SelectComStep from './steps/selectComStep';
import PreconfigStep from './steps/preconfigStep';
import DeployStep from './steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';

const InitNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { stepCurrent } = useStore();
	const [searchParams] = useSearchParams();
	const { useStepEffect } = useStepLogic();
	const { navigateToHome } = useNavigater();
	const parseStepRef = useRef<{ handleOk: () => void } | null>(null);
	const initListStepRef = useRef<{ handleOk: () => void } | null>(null);
	const detectStepRef = useRef<{ handleOk: () => void } | null>(null);
	const checkStepRef = useRef<{ handleOk: () => void } | null>(null);
	const dispatchStepRef = useRef<{ handleOk: () => void } | null>(null);
	const startWorkerStepRef = useRef<{ handleOk: () => void } | null>(null);
	const selectServiceRef = useRef<{ handleOk: () => void } | null>(null);
	const selectComponentRef = useRef<{ handleOk: () => void } | null>(null);
	// const addStepRef = useRef<HTMLDivElement>(null);
	const id = searchParams.get('id');
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
			title: t('service.deployStep'),
			key: 10
		}
	];
	const nextList = async () => {
		const callbackData = await parseStepRef.current?.handleOk();
		return callbackData;
	};
	const nextDetect = async () => {
		const callbackData = await initListStepRef.current?.handleOk();
		return callbackData;
	};
	const nextCheck = async () => {
		const callbackData = await detectStepRef.current?.handleOk();
		return callbackData;
	};
	const nextDispatch = async () => {
		const callbackData = await checkStepRef.current?.handleOk();
		return callbackData;
	};
	const nextStartWorker = async () => {
		const callbackData = await dispatchStepRef.current?.handleOk();
		return callbackData;
	};
	const nextAdd = async () => {
		const callbackData = await startWorkerStepRef.current?.handleOk();
		return callbackData;
	};
	const nextComponent = async () => {
		const callbackData = await selectServiceRef.current?.handleOk();
		return callbackData;
	};
	const nextPreconfig = async () => {
		const callbackData = await selectComponentRef.current?.handleOk();
		return callbackData;
	};

	const stepConfig = [
		{
			title: t('node.parseHostname'),
			content: <ParseStep ref={parseStepRef} />,
			nextStep: nextList
		},
		{
			title: t('node.chooseHostname'),
			content: <InitList ref={initListStepRef} />,
			nextStep: nextDetect
		},
		{
			title: t('node.detect'),
			content: <DetectStep ref={detectStepRef} />,
			nextStep: nextCheck
		},
		{
			title: t('node.check'),
			content: <CheckStep ref={checkStepRef} />,
			nextStep: nextDispatch
		},
		{
			title: t('node.dispatch'),
			content: <DispatchStep ref={dispatchStepRef} />,
			nextStep: nextStartWorker
		},
		{
			title: t('node.startWorker'),
			content: <StartWorkerStep ref={startWorkerStepRef} />,
			nextStep: nextAdd
		},
		{
			title: t('node.add'),
			content: <DoneStep />,
			operations: [
				{ label: t('node.deployService'), callback: navigateToHome },
				{ label: t('backHome') } // 不传callback默认进行一下步
			]
		},
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
			content: <PreconfigStep />
			// nextStep: nextComponent
		},
		{
			title: t('service.deployStep'),
			content: <DeployStep />
			// nextStep: nextComponent
		}
	];
	// 使用新的 Hook 中的 useEffect, 获取进度，定位到当前步骤
	useStepEffect(id);
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

export default InitNode;
