import React from 'react';
import { Button, Col, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

const StepComponent: React.FC = ({ config }) => {
	const { t } = useTranslation();
	// const [current, setCurrent] = useState(0);
	const { stepCurrent, setStepCurrent } = useStore();
	// const [isSuccess] = useState(false);
	const stepConfig = config[stepCurrent];
	const next = () => {
		if (!stepConfig.nextStep) {
			setStepCurrent(stepCurrent + 1);
		} else {
			const goNext = stepConfig.nextStep();
			if (goNext) {
				setStepCurrent(stepCurrent + 1);
			}
		}
	};

	const prev = () => {
		// prev();
		setStepCurrent(stepCurrent - 1);
	};
	//   const { current } = this.state;
	//   const { steps, handleFinish, handleCancel, commonStyle, isSuccess } = this.props;

	return (
		<>
			<Card style={{ height: '100%' }} title={stepConfig.title}>
				{stepConfig.content}
				<Col style={{ marginTop: 24 }} offset={8} span={16}>
					{/* <Button style={{ marginRight: '8px' }} onClick={handleCancel}>
					取消
				</Button> */}
					{stepCurrent > 0 && (
						<Button style={{ marginRight: 30 }} onClick={prev}>
							{t('previous')}
						</Button>
					)}
					{stepConfig.operation ? (
						<Button style={{ marginRight: 30 }} type="primary" onClick={stepConfig.operation.callback}>
							{stepConfig.operation.label}
						</Button>
					) : null}
					{stepCurrent < config.length - 1 && (
						<Button type="primary" onClick={next}>
							{t('next')}
						</Button>
					)}
					{stepCurrent === config.length - 1 && (
						<Button
							type="primary"
							onClick={stepConfig.finish}
							// disabled={!isSuccess}
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
