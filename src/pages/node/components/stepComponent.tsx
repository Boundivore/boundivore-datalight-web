import { Button, Col, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

const StepComponent: React.FC = ({ config }) => {
	const { t } = useTranslation();
	const { stepCurrent, setStepCurrent } = useStore();
	const stepConfig = config[stepCurrent];
	const next = async () => {
		if (!stepConfig.nextStep) {
			setStepCurrent(stepCurrent + 1);
		} else {
			const goNext = await stepConfig.nextStep();
			if (goNext) {
				setStepCurrent(stepCurrent + 1);
			}
		}
	};

	const prev = () => {
		// prev();
		setStepCurrent(stepCurrent - 1);
	};
	const cancel = () => {};
	//   const { current } = this.state;
	//   const { steps, handleFinish, handleCancel, commonStyle, isSuccess } = this.props;

	return (
		<>
			<Card style={{ height: '100%' }} title={stepConfig.title}>
				{stepConfig.content}
				<Col style={{ marginTop: 24 }} offset={8} span={16}>
					<Space>
						{stepCurrent > 0 && <Button onClick={prev}>{t('previous')}</Button>}
						{stepConfig.operation ? (
							<Button type="primary" onClick={stepConfig.operation.callback}>
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
						<Button type="primary" onClick={cancel}>
							{t('cancel')}
						</Button>
					</Space>
				</Col>
			</Card>
		</>
	);
};

export default StepComponent;
