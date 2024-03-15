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
 * AddNode - 新增节点
 * @author Tracy.Guo
 */
import React, { useRef, forwardRef } from 'react';
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
import useStepLogic from '@/hooks/useStepLogic';
import useNavigater from '@/hooks/useNavigater';

const AddNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	const { useStepEffect } = useStepLogic();
	const { stepCurrent } = useStore();
	const { navigateToNodeList } = useNavigater();
	const parseStepRef = useRef<{ handleOk: () => void } | null>(null);
	const initListStepRef = useRef<{ handleOk: () => void } | null>(null);
	const detectStepRef = useRef<{ handleOk: () => void } | null>(null);
	const checkStepRef = useRef<{ handleOk: () => void } | null>(null);
	const dispatchStepRef = useRef<{ handleOk: () => void } | null>(null);
	const startWorkerStepRef = useRef<{ handleOk: () => void } | null>(null);
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
			operations: [{ label: t('node.backListPage'), callback: navigateToNodeList }]
		}
	];
	//获取进度，定位到当前步骤
	useStepEffect();
	console.log('stepConfig', stepConfig);
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

export default AddNode;
