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
import React, { useRef, useEffect, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layouts from '@/layouts';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import ParseStep from './parseStep';
import DetectStep from './detectStep';
import CheckStep from './checkStep';
import InitList from './initList';
import StepComponent from './components/stepComponent';
import DispatchStep from './dispatchStep';
import StartWorkerStep from './startWorkerStep';
import DoneStep from './doneStep';
import SelectServiceStep from './selectServiceStep';
import SelectComStep from './selectComStep';
import PreconfigStep from './preconfigStep';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
const InitNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { stepCurrent, setStepCurrent, setJobNodeId, stepMap, setSelectedRowsList } = useStore();
	const [searchParams] = useSearchParams();
	const parseStepRef = useRef<{ handleOk: () => void } | null>(null);
	const initListStepRef = useRef<{ handleOk: () => void } | null>(null);
	const detectStepRef = useRef<{ handleOk: () => void } | null>(null);
	const checkStepRef = useRef<{ handleOk: () => void } | null>(null);
	const dispatchStepRef = useRef<{ handleOk: () => void } | null>(null);
	const startWorkerStepRef = useRef<{ handleOk: () => void } | null>(null);
	const selectServiceRef = useRef<{ handleOk: () => void } | null>(null);
	const selectComponentRef = useRef<{ handleOk: () => void } | null>(null);
	// const addStepRef = useRef<HTMLDivElement>(null);
	const apiGetProcedure = APIConfig.getProcedure;
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
			title: t('service.deployOverview'),
			key: 10
		},
		{
			title: t('service.deployStep'),
			key: 11
		},
		{
			title: t('service.deploySuccess'),
			key: 12
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
			content: <DoneStep />
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
		}
	];
	// 获取进度，定位到当前步骤
	const getProcedure = async () => {
		const data = await RequestHttp.get(apiGetProcedure, { params: { ClusterId: id } });
		const {
			// @ts-ignore
			Code,
			// @ts-ignore
			Data: { NodeJobId, ProcedureState, NodeInfoList }
		} = data;
		if (Code === '00000') {
			setStepCurrent(stepMap[ProcedureState]);
			setJobNodeId(NodeJobId);
			setSelectedRowsList(NodeInfoList);
		} else if (Code === 'D1001') {
			setStepCurrent(0);
		}
		console.log(data);
	};
	useEffect(() => {
		getProcedure();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Layouts hideSider={false}>
			<Row className="h-[calc(100%-100px)] min-h-[600px] m m-[20px]">
				<Col span={6} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<Steps size="small" current={stepCurrent} direction="vertical" items={steps} />
					</Card>
				</Col>
				<Col span={18} style={{ height: '100%' }}>
					{/* {selectedRowsList.length ? <StepComponent config={stepConfig} /> : null} */}
					<StepComponent config={stepConfig} />
				</Col>
			</Row>
		</Layouts>
	);
});

export default InitNode;
