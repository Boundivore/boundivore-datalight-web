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
import React, { useRef, useEffect, forwardRef } from 'react';
// import { useSearchParams } from 'react-router-dom';
import { Card, Col, Row, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import Layouts from '@/layouts';
import useStore from '@/store/store';
// import APIConfig from '@/api/config';
// import RequestHttp from '@/api';
import ParseStep from './parseStep';
import DetectStep from './detectStep';
import CheckStep from './checkStep';
import InitList from './parseList';
import StepComponent from './components/stepComponent';

const AddNode: React.FC = forwardRef(() => {
	const { t } = useTranslation();
	// const { stepCurrent, setStepCurrent, setJobNodeId, stepMap, setSelectedRowsList } = useStore();
	const { stepCurrent } = useStore();
	// const [searchParams] = useSearchParams();
	const parseStepRef = useRef<{ handleOk: () => void } | null>(null);
	const initListStepRef = useRef<{ handleOk: () => void } | null>(null);
	const detectStepRef = useRef<{ handleOk: () => void } | null>(null);
	const checkStepRef = useRef<{ handleOk: () => void } | null>(null);
	// const id = searchParams.get('id');
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
			content: <CheckStep ref={checkStepRef} />
		}
	];
	// 获取进度，定位到当前步骤
	// const getProcedure = async () => {
	// 	const apiGetProcedure = APIConfig.getProcedure;
	// 	const data = await RequestHttp.get(apiGetProcedure, { params: { ClusterId: id } });
	// 	const {
	// 		Code,
	// 		Data: { NodeJobId, ProcedureState, NodeInfoList }
	// 	} = data;
	// 	if (Code === '00000') {
	// 		setStepCurrent(stepMap[ProcedureState]);
	// 		setJobNodeId(NodeJobId);
	// 		setSelectedRowsList(NodeInfoList);
	// 	} else if (Code === 'D1001') {
	// 		setStepCurrent(0);
	// 	}
	// };
	useEffect(() => {
		// getProcedure();
	}, []);

	return (
		<Layouts hideSider={false}>
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
		</Layouts>
	);
});

export default AddNode;
