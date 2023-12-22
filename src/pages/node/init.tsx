import React, { useRef } from 'react';
import Layouts from '@/layouts';
import { Card, Col, Row, Steps } from 'antd';
import { CheckOutlined, CheckCircleOutlined, SolutionOutlined, FileDoneOutlined, ImportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import ParseStep from './parseStep';
import DetectStep from './detectStep';
import CheckStep from './checkStep';
import InitList from './initList';
import StepComponent from './components/stepComponent';
import DispatchStep from './dispatchStep';
import AddStep from './addStep';
const InitNode: React.FC = () => {
	const { t } = useTranslation();
	const { stepCurrent } = useStore();
	const parseStepRef = useRef<HTMLDivElement>(null);
	const initListStepRef = useRef<HTMLDivElement>(null);
	const detectStepRef = useRef<HTMLDivElement>(null);
	const checkStepRef = useRef<HTMLDivElement>(null);
	const dispatchStepRef = useRef<HTMLDivElement>(null);
	const addStepRef = useRef<HTMLDivElement>(null);
	const steps = [
		{
			title: t('node.parseHostname'),
			icon: <SolutionOutlined />,
			description: 'description',
			key: 0
		},
		{
			title: t('node.chooseHostname'),
			icon: <SolutionOutlined />,
			description: 'description',
			key: 1
		},
		{
			title: t('node.detect'),
			icon: <CheckOutlined />,
			description: 'description',
			key: 2
		},
		{
			title: t('node.check'),
			icon: <FileDoneOutlined />,
			description: 'description',
			key: 3
		},
		{
			title: t('node.dispatch'),
			icon: <ImportOutlined />,
			description: 'description',
			key: 4
		},
		{
			title: t('node.add'),
			icon: <CheckCircleOutlined />,
			description: 'description',
			key: 5
		}
	];
	const nextList = async () => {
		const callbackData = await parseStepRef.current.handleOk();
		return callbackData;
	};
	const nextDetect = async () => {
		const callbackData = await initListStepRef.current.handleOk();
		return callbackData;
	};
	const nextCheck = async () => {
		const callbackData = await detectStepRef.current.handleOk();
		return callbackData;
	};
	const nextDispatch = async () => {
		const callbackData = await checkStepRef.current.handleOk();
		return callbackData;
	};
	const handleFinish = async () => {
		const callbackData = await addStepRef.current.handleOk();
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
			content: <DispatchStep ref={dispatchStepRef} />
		},
		{
			title: t('node.add'),
			content: <AddStep ref={addStepRef} />,
			finish: handleFinish
		}
	];

	return (
		<Layouts hideSider={false}>
			<Row
				style={{
					width: '96%',
					height: 'calc(100% - 40px)',
					minHeight: '600px',
					margin: '20px auto',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Col span={6} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<Steps current={stepCurrent} direction="vertical" items={steps} />
					</Card>
				</Col>
				<Col span={18} style={{ height: '100%' }}>
					<StepComponent config={stepConfig} />
				</Col>
			</Row>
		</Layouts>
	);
};

export default InitNode;
