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
 * Step封装
 * @author Tracy.Guo
 */
import { ReactElement } from 'react';
import { Button, Col, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
interface StepConfig {
	title: string;
	content: ReactElement;
	nextStep?: Function;
}

interface MyComponentProps {
	config: StepConfig[];
}
const StepComponent: React.FC<MyComponentProps> = ({ config }) => {
	const { t } = useTranslation();
	const { stepCurrent, setStepCurrent } = useStore();
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
	const retry = () => {
		// retry();
		// setStepCurrent(stepCurrent - 1);
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
						{/* TODO 添加重试操作*/}
						{stepCurrent < config.length - 1 && <Button onClick={retry}>{t('retry')}</Button>}
						{stepCurrent > 0 && stepCurrent < config.length - 1 && <Button onClick={prev}>{t('previous')}</Button>}
						{/* {stepConfig.operation ? (
							<Button type="primary" onClick={stepConfig.operation.callback}>
								{stepConfig.operation.label}
							</Button>
						) : null} */}
						{stepCurrent < config.length - 1 && (
							<Button type="primary" onClick={next}>
								{t('next')}
							</Button>
						)}
						{/* {stepCurrent === 6 && (
							<Button
								type="primary"
								onClick={stepConfig.finish}
								// disabled={!isSuccess}
							>
								{t('node.startWorker')}
							</Button>
						)} */}
						{stepCurrent === 6 && (
							<>
								<Button
									type="primary"
									href="/home"
									// disabled={!isSuccess}
								>
									返回首页
								</Button>
								<Button
									type="primary"
									// disabled={!isSuccess}
									onClick={next}
								>
									部署服务
								</Button>
							</>
						)}
						{stepCurrent < config.length - 1 && <Button onClick={cancel}>{t('cancel')}</Button>}
					</Space>
				</Col>
			</Card>
		</>
	);
};

export default StepComponent;
