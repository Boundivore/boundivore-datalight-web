import React, { useState } from 'react';
import { Button, Col, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const StepComponent: React.FC = ({ config }) => {
	const { t } = useTranslation();
	const [current, setCurrent] = useState(0);
	const [isSuccess] = useState(false);
	const next = () => {
		const stepConfig = config[current];
		if (!stepConfig.nextStep) {
			setCurrent(current + 1);
		} else {
			const goNext = stepConfig.nextStep();
			if (goNext) {
				setCurrent(current + 1);
			}
		}
	};

	const prev = () => {
		// prev();
		setCurrent(current - 1);
	};
	//   const { current } = this.state;
	//   const { steps, handleFinish, handleCancel, commonStyle, isSuccess } = this.props;

	return (
		<>
			<Card style={{ height: '100%' }} title={config[current].title}>
				{config[current].content}
				<Col style={{ marginTop: 24 }} offset={8} span={16}>
					{/* <Button style={{ marginRight: '8px' }} onClick={handleCancel}>
					取消
				</Button> */}
					{current > 0 && (
						<Button style={{ marginRight: 30 }} onClick={prev}>
							{t('previous')}
						</Button>
					)}
					{config[current].operation ? (
						<Button style={{ marginRight: 30 }} type="primary" onClick={config[current].operation.callback}>
							{config[current].operation.label}
						</Button>
					) : null}
					{current < config.length - 1 && (
						<Button type="primary" onClick={next}>
							{t('next')}
						</Button>
					)}
					{current === config.length - 1 && (
						<Button
							type="primary"
							// onClick={handleFinish}
							disabled={!isSuccess}
						>
							完成
						</Button>
					)}
				</Col>
			</Card>
		</>
	);
};

export default StepComponent;
