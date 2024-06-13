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
 * StepComponent -Step步骤操作封装
 * @author Tracy
 */
import { ReactElement, FC } from 'react';
import { Button, Col, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import useStepLogic from '@/hooks/useStepLogic';

interface StepConfig {
	title: string;
	content: ReactElement;
	extra: ReactElement;
	nextStep?: () => boolean | void;
	retry?: () => void;
	hideInitButton?: boolean; // 是否隐藏初始化按钮，包括上一步、下一步、重试和取消
	hideRetry?: boolean; // 是否单独隐藏重试按钮
	hidePrev?: boolean; // 是否单独隐藏上一步按钮
	hideNext?: boolean; // 是否单独隐藏下一步按钮
	nextText?: string; // 重置下一步文案
	operations?: {
		label: string;
		key: string;
		callback?: () => void;
	}[];
}

interface MyComponentProps {
	config: StepConfig[];
}
// 适配集群引导和新增组件，新增组件重新定义步骤进度，将前边节点相关步骤减去
const stepNum = 7;

const StepComponent: FC<MyComponentProps> = ({ config }) => {
	const { t } = useTranslation();
	const { useCancelProcedure } = useStepLogic();
	const { stepCurrent, setStepCurrent, currentPageDisabled, setIsRefresh } = useStore();
	const { nextDisabled, retryDisabled, prevDisabled, cancelDisabled } = currentPageDisabled;
	const stepConfig = config[stepCurrent] || config[stepCurrent - stepNum]; // 适配集群引导和新增组件
	const next = async () => {
		// 不配置nextStep，默认进入下一步页面
		if (!stepConfig.nextStep) {
			setStepCurrent(stepCurrent + 1);
		} else {
			// 配置的nextStep操作成功才进入下一步页面
			const goNext = await stepConfig.nextStep();
			if (goNext) {
				setIsRefresh(false); // 点击上一步，重置isRefresh状态, 可以激活异步页面的执行操作，如parse，detect等
				setStepCurrent(stepCurrent + 1);
			}
		}
	};

	const prev = () => {
		setIsRefresh(false); // 点击下一步，重置isRefresh状态, 可以激活异步页面的执行操作，如parse，detect等
		setStepCurrent(stepCurrent - 1);
	};
	const retry = async () => {
		stepConfig.retry && (await stepConfig.retry());
	};
	const cancel = useCancelProcedure();
	return (
		<>
			<Card className="h-full" title={stepConfig.title} extra={stepConfig?.extra}>
				{stepConfig.content}
				<Col className="mt-[24px]" span={24}>
					<Space className="flex justify-center">
						{stepConfig?.operations?.length
							? stepConfig.operations.map(operation => {
									return (
										<Button type="primary" key={operation.key} onClick={operation.callback || next} disabled={nextDisabled}>
											{operation.label}
										</Button>
									);
							  })
							: null}
						{!stepConfig.hideInitButton ? (
							<>
								{/* TODO 添加重试操作*/}
								{stepCurrent < config.length && !stepConfig.hideRetry && (
									<Button onClick={retry} disabled={retryDisabled}>
										{t('retry')}
									</Button>
								)}
								{stepCurrent > 0 && stepCurrent < config.length && !stepConfig.hidePrev && (
									<Button onClick={prev} disabled={prevDisabled}>
										{t('previous')}
									</Button>
								)}
								{stepCurrent < config.length - 1 && !stepConfig.hideNext && (
									<Button type="primary" onClick={next} disabled={nextDisabled}>
										{stepConfig.nextText || t('next')}
									</Button>
								)}
								{stepCurrent < config.length && (
									<Button onClick={cancel} disabled={cancelDisabled}>
										{t('cancel')}
									</Button>
								)}
							</>
						) : null}
					</Space>
				</Col>
			</Card>
		</>
	);
};

export default StepComponent;
