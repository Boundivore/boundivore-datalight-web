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
 * @author Tracy.Guo
 */
import { ReactElement } from 'react';
import { Button, Col, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useNavigater from '@/hooks/useNavigater';
interface StepConfig {
	title: string;
	content: ReactElement;
	nextStep?: Function;
	hideInitButton?: boolean; // 是否隐藏初始化按钮，包括上一步、下一步、重试和取消
	hideNext?: boolean; // 是否单独隐藏下一步按钮
	operations?: {
		label: string;
		callback?: () => void;
	}[];
}

interface MyComponentProps {
	config: StepConfig[];
}
const StepComponent: React.FC<MyComponentProps> = ({ config }) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToClusterList } = useNavigater();
	const { stepCurrent, setStepCurrent, currentPageDisabled } = useStore();
	const { next: nextDisabled } = currentPageDisabled;
	const stepConfig = config[stepCurrent];
	const next = async () => {
		// 不配置nextStep，默认进入下一步页面
		if (!stepConfig.nextStep) {
			setStepCurrent(stepCurrent + 1);
		} else {
			// 配置的nextStep操作成功才进入下一步页面
			const goNext = await stepConfig.nextStep();
			if (goNext) {
				setStepCurrent(stepCurrent + 1);
			}
		}
	};

	const prev = () => {
		setStepCurrent(stepCurrent - 1);
	};
	const retry = async () => {
		await stepConfig.retry();
		// setStepCurrent(stepCurrent - 1);
	};
	const cancel = async () => {
		const api = APIConfig.removeProcedure;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.post(api, params);
		const { Code } = data;
		(Code === '00000' || Code === 'D1001') && navigateToClusterList();
	};

	return (
		<>
			<Card className="h-full" title={stepConfig.title}>
				{stepConfig.content}
				<Col className="mt-[24px]" span={24}>
					<Space className="flex justify-center">
						{stepConfig?.operations?.length
							? stepConfig.operations.map(operation => {
									return (
										<Button type="primary" onClick={operation.callback || next}>
											{operation.label}
										</Button>
									);
							  })
							: null}
						{!stepConfig.hideInitButton ? (
							<>
								{/* TODO 添加重试操作*/}
								{stepCurrent < config.length - 1 && (
									<Button onClick={retry} disabled={nextDisabled}>
										{t('retry')}
									</Button>
								)}
								{stepCurrent > 0 && stepCurrent < config.length - 1 && <Button onClick={prev}>{t('previous')}</Button>}
								{stepCurrent < config.length - 1 && !stepConfig.hideNext && (
									<Button type="primary" onClick={next} disabled={nextDisabled}>
										{t('next')}
									</Button>
								)}
								{stepCurrent < config.length - 1 && (
									<Button onClick={cancel} disabled={nextDisabled}>
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
