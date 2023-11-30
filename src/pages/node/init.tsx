import React, { useState } from 'react';
import Layouts from '@/layouts';
import { Card, Col, Row, Steps, Button, message } from 'antd';
import { LoadingOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ParseStep from './parseStep';
import DetectStep from './detectStep';
import CheckStep from './checkStep';

const InitNode: React.FC = () => {
	const { t } = useTranslation();
	const [current, setCurrent] = useState(0);
	const steps = [
		{
			title: t('node.parseHostname'),
			status: 'finish',
			icon: <SolutionOutlined />,
			description: 'description',
			key: t('node.parseHostname')
		},
		{
			title: t('node.detect'),
			status: 'process',
			icon: <LoadingOutlined />,
			description: 'description',
			key: t('node.detect')
		},
		{
			title: 'Done',
			status: 'wait',
			icon: <SmileOutlined />,
			description: 'description',
			key: 'Done'
		}
	];
	// const items = steps.map(item => ({ key: item.title, title: item.title }));
	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};
	return (
		<Layouts hideSider={false}>
			<Row
				style={{
					width: '96%',
					height: 'calc(100% - 40px)',
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
					<Card style={{ height: '100%' }} title={t('node.parseHostname')}>
						{current === 0 && <ParseStep />}
						{current === 1 && <DetectStep />}
						{current === 2 && <CheckStep />}

						<Col style={{ marginTop: 24 }} offset={8} span={16}>
							{current < steps.length - 1 && (
								<Button type="primary" onClick={() => next()}>
									{t('next')}
								</Button>
							)}
							{current === steps.length - 1 && (
								<Button type="primary" onClick={() => message.success('Processing complete!')}>
									{t('done')}
								</Button>
							)}
							{current > 0 && (
								<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
									{t('previous')}
								</Button>
							)}
						</Col>
					</Card>
				</Col>
			</Row>
		</Layouts>
	);
};

export default InitNode;
