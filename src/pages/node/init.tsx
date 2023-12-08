import React, { useRef, useState } from 'react';
import Layouts from '@/layouts';
import { Card, Col, Row, Steps } from 'antd';
import { CheckOutlined, CheckCircleOutlined, SolutionOutlined, FileDoneOutlined, ImportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ParseStep from './parseStep';
import DetectStep from './detectStep';
import CheckStep from './checkStep';
import InitList from './initList';
import StepComponent from './components/stepComponent';
const InitNode: React.FC = () => {
	const { t } = useTranslation();
	const parseStepRef = useRef<HTMLDivElement>(null);
	const [sharedData, setSharedData] = useState([]);
	const steps = [
		{
			title: t('node.parseHostname'),
			status: 'finish',
			icon: <SolutionOutlined />,
			description: 'description',
			key: 0
		},
		{
			title: t('node.detect'),
			status: 'process',
			icon: <CheckOutlined />,
			description: 'description',
			key: 1
		},
		{
			title: t('node.check'),
			status: 'process',
			icon: <FileDoneOutlined />,
			description: 'description',
			key: 2
		},
		{
			title: t('node.dispatch'),
			status: 'process',
			icon: <ImportOutlined />,
			description: 'description',
			key: 3
		},
		{
			title: t('done'),
			status: 'wait',
			icon: <CheckCircleOutlined />,
			description: 'description',
			key: 4
		}
	];
	const nextList = async () => {
		const callbackData = await parseStepRef.current.handleOk();
		setSharedData(callbackData);
		return callbackData;
	};

	const stepConfig = [
		{
			title: t('node.parseHostname'),
			content: <ParseStep ref={parseStepRef} />,
			nextStep: nextList
		},
		{
			title: t('node.parseHostname'),
			content: <InitList data={sharedData} />
			// nextStep: nextDetect
		},
		{
			title: t('node.detect'),
			content: <DetectStep />
			// nextStep: next
		},
		{
			title: t('node.check'),
			content: <CheckStep />
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
						<Steps direction="vertical" items={steps} />
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
