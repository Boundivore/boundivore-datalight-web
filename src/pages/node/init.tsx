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
import React, { useRef, forwardRef, useEffect } from 'react';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import ParseStep from './steps/parseStep';
import DetectStep from './steps/detectStep';
import CheckStep from './steps/checkStep';
import ParseList from './steps/parseList';
import StepComponent from './components/stepComponent';
import DispatchStep from './steps/dispatchStep';
import StartWorkerStep from './steps/startWorkerStep';
import DoneStep from './steps/doneStep';
import SelectServiceStep from './steps/selectServiceStep';
import SelectComStep from './steps/selectComStep';
import PreconfigStep from './steps/preconfigStep';
import PreviewconfigStep from './steps/previewStep';
import DeployStep from './steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';
// const ParseStep = React.lazy(() => import('./steps/parseStep'));
// const ParseList = React.lazy(() => import('./steps/parseList'));

const InitNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { stepCurrent, setIsRefresh } = useStore();
	const { useStepEffect, useClearStepData, useCancelProcedure } = useStepLogic();
	const { navigateToHome } = useNavigater();
	const clearData = useClearStepData();
	const parseStepRef = useRef<{ handleOk: () => void } | null>(null);
	const parseListStepRef = useRef<{ handleOk: () => void } | null>(null);
	const detectStepRef = useRef<{ handleOk: () => void } | null>(null);
	const checkStepRef = useRef<{ handleOk: () => void } | null>(null);
	const dispatchStepRef = useRef<{ handleOk: () => void } | null>(null);
	const startWorkerStepRef = useRef<{ handleOk: () => void } | null>(null);
	const selectServiceRef = useRef<{ handleOk: () => void } | null>(null);
	const selectComponentRef = useRef<{ handleOk: () => void } | null>(null);
	const PreconfigStepRef = useRef<{ handleOk: () => void; onFinish: (openModal: boolean) => Promise<any> }>(null);
	const PreviewStepRef = useRef<{ handleOk: () => void }>(null);
	const DeployStepRef = useRef(null);
	// const addStepRef = useRef<HTMLDivElement>(null);
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
	const nextList = () => parseStepRef.current?.handleOk();
	const retryParseList = () => parseListStepRef.current?.parseHostname();
	const nextDetect = () => parseListStepRef.current?.handleOk();
	const retryDetect = () => detectStepRef.current?.detect();
	const nextCheck = () => detectStepRef.current?.handleOk();
	const retryCheck = () => checkStepRef.current?.check();
	const nextDispatch = () => checkStepRef.current?.handleOk();
	const retryDispatch = () => dispatchStepRef.current?.dispatch();
	const nextStartWorker = () => dispatchStepRef.current?.handleOk();
	const retryStartWorker = () => startWorkerStepRef.current?.startWorker();
	const nextAdd = () => startWorkerStepRef.current?.handleOk();
	const nextComponent = () => selectServiceRef.current?.handleOk();
	const nextPreconfig = () => selectComponentRef.current?.handleOk();
	const nextPreview = () => PreconfigStepRef.current?.onFinish(true);
	const nextDeploy = () => PreviewStepRef.current?.handleOk();
	const retryDeploy = () => DeployStepRef.current?.deploy();

	const stepConfig = [
		{
			title: t('node.parseHostname'),
			content: <ParseStep ref={parseStepRef} />,
			nextStep: nextList,
			hideRetry: true
		},
		{
			title: t('node.chooseHostname'),
			content: <ParseList ref={parseListStepRef} />,
			nextStep: nextDetect,
			retry: retryParseList
		},
		{
			title: t('node.detect'),
			content: <DetectStep ref={detectStepRef} />,
			retry: retryDetect,
			nextStep: nextCheck
		},
		{
			title: t('node.check'),
			content: <CheckStep ref={checkStepRef} />,
			retry: retryCheck,
			nextStep: nextDispatch
		},
		{
			title: t('node.dispatch'),
			content: <DispatchStep ref={dispatchStepRef} />,
			retry: retryDispatch,
			nextStep: nextStartWorker
		},
		{
			title: t('node.startWorker'),
			content: <StartWorkerStep ref={startWorkerStepRef} />,
			retry: retryStartWorker,
			nextStep: nextAdd,
			nextText: t('node.addNodeToCluster')
		},
		{
			title: t('node.add'),
			content: <DoneStep />,
			operations: [
				{ label: t('node.deployService') }, // 不传callback默认进行一下步
				{ label: t('backHomeTemp'), callback: navigateToHome },
				{ label: t('done'), callback: useCancelProcedure() }
			],
			hideInitButton: true
		},
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
			content: <PreviewconfigStep ref={PreviewStepRef} />,
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
			retry: retryDeploy,
			hideNext: true
		}
	];
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
