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
import PreviewconfigStep from './steps/previewconfigStep';
import DeployStep from './steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';
// const ParseStep = React.lazy(() => import('./steps/parseStep'));
// const ParseList = React.lazy(() => import('./steps/parseList'));

const InitNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { stepCurrent } = useStore();
	const { useStepEffect, useClearStepData } = useStepLogic();
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
	const PreviewconfigStepRef = useRef<{ handleOk: () => void; onFinish: (openModal: boolean) => Promise<any> }>(null);
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
	const nextList = async () => await parseStepRef.current?.handleOk();
	const retryParseList = async () => await parseListStepRef.current?.parseHostname();
	const nextDetect = async () => await parseListStepRef.current?.handleOk();
	const retryDetectList = async () => await detectStepRef.current?.detect();
	const nextCheck = async () => await detectStepRef.current?.handleOk();
	const nextDispatch = async () => await checkStepRef.current?.handleOk();
	const nextStartWorker = async () => await dispatchStepRef.current?.handleOk();
	const nextAdd = async () => await startWorkerStepRef.current?.handleOk();
	const nextComponent = async () => await selectServiceRef.current?.handleOk();
	const nextPreconfig = async () => await selectComponentRef.current?.handleOk();
	const nextDeploy = async () => await PreconfigStepRef.current?.handleOk();
	// const preview = async () => await PreconfigStepRef.current?.onFinish(true);

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
			nextStep: nextCheck,
			retry: retryDetectList
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
			nextStep: nextAdd,
			nextText: t('node.addNodeToCluster')
		},
		{
			title: t('node.add'),
			content: <DoneStep />,
			operations: [
				{ label: t('node.deployService') }, // 不传callback默认进行一下步
				{ label: t('backHome'), callback: navigateToHome }
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
			nextStep: nextPreconfig
		},
		{
			title: t('service.preConfig'),
			content: <PreconfigStep ref={PreconfigStepRef} />,
			nextStep: nextDeploy,
			// hideInitButton: true,
			nextText: t('preview')
			// operations: [{ label: t('preview'), callback: preview }]
		},
		{
			title: t('service.preConfig'),
			content: <PreviewconfigStep ref={PreviewconfigStepRef} />,
			nextStep: nextDeploy,
			// hideInitButton: true,
			nextText: t('preview')
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
			hideNext: true
		}
	];
	// 使用新的 Hook 中的 useEffect, 获取进度，定位到当前步骤
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

export default InitNode;
