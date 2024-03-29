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
 * 步骤配置
 * nodeStepConfig 为节点相关步骤
 * serviceStepConfig 为服务相关步骤
 * 出于业务关联性将该文件放置于components/step目录下，而不是自定义hooks目录下
 * @author Tracy.Guo
 */
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ParseStep from '@/components/steps/parseStep';
import ParseList from '@/components/steps/parseList';
import DetectStep from '@/components/steps/detectStep';
import CheckStep from '@/components/steps/checkStep';
import DispatchStep from '@/components/steps/dispatchStep';
import StartWorkerStep from '@/components/steps/startWorkerStep';
import DoneStep from '@/components/steps/doneStep';
import SelectServiceStep from '@/components/steps/selectServiceStep';
import SelectComStep from '@/components/steps/selectComStep';
import PreconfigStep from '@/components/steps/preconfigStep';
import PreviewconfigStep from '@/components/steps/previewStep';
import DeployStep from '@/components/steps/deployStep';
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';
import { StepRefType } from '@/api/interface';

const useStepConfig = () => {
	const { t } = useTranslation();
	const { useClearStepData, useCancelProcedure } = useStepLogic();
	const clearData = useClearStepData();
	const { navigateToHome } = useNavigater();

	const parseStepRef = useRef<StepRefType>(null);
	const parseListStepRef = useRef<StepRefType>(null);
	const detectStepRef = useRef<StepRefType>(null);
	const checkStepRef = useRef<StepRefType>(null);
	const dispatchStepRef = useRef<StepRefType>(null);
	const startWorkerStepRef = useRef<StepRefType>(null);
	const selectServiceRef = useRef<StepRefType>(null);
	const selectComponentRef = useRef<StepRefType>(null);
	const PreconfigStepRef = useRef<{ handleOk: () => void; onFinish: (openModal: boolean) => Promise<any> }>(null);
	const PreviewStepRef = useRef<StepRefType>(null);
	const DeployStepRef = useRef(null);

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

	const nodeStepConfig = [
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
		}
	];
	const serviceStepConfig = [
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
	return {
		nodeStepConfig,
		serviceStepConfig
	};
};

export default useStepConfig;
