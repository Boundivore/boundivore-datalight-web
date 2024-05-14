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
import { FC, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Card, Space, Button, InputNumber, message } from 'antd';
import { t } from 'i18next';
import { CloseOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useNavigater from '@/hooks/useNavigater';
import { Annotations, Labels, AlertRuleVo } from '@/api/interface';
import useCurrentCluster from '@/hooks/useCurrentCluster';
const { Item } = Form;
const exceptKeys = ['alert_type', 'alert_id', 'alert_job', 'alert_instance'];
interface TimeFormat {
	d: number;
	h: number;
	m: number;
	s: number;
}
type KeyValue = {
	key: string;
	value: string;
};

type FieldType = {
	AlertRuleName: string;
	AlertRuleContent: {
		Groups: {
			Name: string;
			Rules: {
				Alert: string;
				For: TimeFormat | string;
				Expr: string;
				Annotations: KeyValue[];
				Labels: KeyValue[];
			}[];
		}[];
	};
};

interface AlertFormProps {
	type?: string;
	alertRuleData?: AlertRuleVo;
}
const AlertForm: FC<AlertFormProps> = ({ type = 'add', alertRuleData }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { selectCluster } = useCurrentCluster();
	const [form] = Form.useForm();
	const { navigateToAlertList } = useNavigater();
	const [messageApi, contextHolder] = message.useMessage();
	const enabled = useRef();
	const onFinish: FormProps<FieldType>['onFinish'] = async values => {
		const updatedValues = { ...values };
		const updatedAlertRuleVo = {
			AlertRuleName: updatedValues?.AlertRuleName || '',
			AlertRuleContent: {
				Groups: (updatedValues?.AlertRuleContent?.Groups || []).map(group => ({
					Name: group.Name,
					Rules: group.Rules.map(rule => {
						const { d = 0, h = 0, m = 0, s = 0 } = rule.For as TimeFormat;
						const resultString = `${d}d${h}h${m}m${s}s`;
						let resultAnnotations = {};
						let resultLabels = {};
						rule.Annotations.forEach((annotation: Annotations) => {
							resultAnnotations = {
								...resultAnnotations,
								[annotation.key]: annotation.value
							};
						});
						rule.Labels.forEach((label: Labels) => {
							resultLabels = {
								...resultLabels,
								[label.key]: label.value
							};
						});
						const updatedRule = {
							Alert: rule.Alert,
							For: resultString,
							Expr: btoa(rule.Expr),
							Annotations: resultAnnotations,
							Labels: resultLabels
						};
						return updatedRule;
					})
				}))
			}
		};
		let params = {
			...updatedAlertRuleVo,
			ClusterId: selectCluster
		};
		let api = APIConfig.newAlertRule;
		if (type === 'edit') {
			api = APIConfig.updateAlertRule;
			params = {
				...params,
				AlertRuleId: id,
				Enabled: enabled.current
			};
		}
		const { Code } = await RequestHttp.post(api, params);
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			navigateToAlertList('alert');
		}
	};
	const parseAlertDetail = () => {
		const parseData = { ...alertRuleData };
		const updatedFieldType: FieldType = {
			AlertRuleName: parseData?.AlertRuleName || '',
			AlertRuleContent: {
				Groups: (parseData?.AlertRuleContent?.Groups || []).map(group => ({
					Name: group.Name,
					Rules: group.Rules.map(rule => {
						const match = rule.For.match(/(\d+)d(\d+)h(\d+)m(\d+)s/)!;
						const d = match[1] ? parseInt(match[1]) : 0;
						const h = match[2] ? parseInt(match[2]) : 0;
						const m = match[3] ? parseInt(match[3]) : 0;
						const s = match[4] ? parseInt(match[4]) : 0;
						return {
							Alert: rule.Alert,
							Annotations: Object.entries(rule.Annotations)
								.filter(item => {
									return exceptKeys.indexOf(item[0]) < 0;
								})
								.map(([key, value]) => ({ key, value })),
							Expr: rule.Expr,
							For: { d, h, m, s },
							Labels: Object.entries(rule.Labels).map(([key, value]) => ({ key, value }))
						};
					})
				}))
			}
		};

		form.setFieldsValue(updatedFieldType);
		enabled.current = parseData.Enabled;
	};
	useEffect(() => {
		type === 'edit' && parseAlertDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);
	return (
		<>
			{contextHolder}
			<Form
				form={form}
				name="basic"
				className="pt-[50px]"
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				style={{ maxWidth: 800 }}
				autoComplete="off"
				onFinish={onFinish}
			>
				<Form.Item<FieldType>
					label={t('alert.alertRuleName')}
					name="AlertRuleName"
					rules={[{ required: true, message: t('alert.alertRuleNameConfirm') }]}
				>
					<Input disabled={type === 'edit'} />
				</Form.Item>
				<Form.Item
					name={['AlertRuleContent', 'Groups']}
					label={t('alert.group')}
					rules={[{ required: true, message: t('alert.groupConfirm') }]}
				>
					<Form.List name={['AlertRuleContent', 'Groups']}>
						{(fields, { add, remove }) => (
							<div style={{ display: 'flex', rowGap: 14, flexDirection: 'column' }}>
								{fields.map(field => {
									return (
										<Card
											size="small"
											title={
												<Form.Item noStyle shouldUpdate>
													{() => {
														return <pre>{form.getFieldsValue()?.AlertRuleContent.Groups[field.name]?.Name}</pre>;
													}}
												</Form.Item>
											}
											key={field.key}
											extra={
												<CloseOutlined
													onClick={() => {
														remove(field.name);
													}}
												/>
											}
										>
											<Form.Item
												label={t('alert.groupName')}
												name={[field.name, 'Name']}
												rules={[{ required: true, message: t('alert.groupNameConfirm') }]}
											>
												<Input />
											</Form.Item>
											<Form.Item
												name={[field.name, 'Rules']}
												label={t('alert.rule')}
												rules={[{ required: true, message: t('alert.ruleConfirm') }]}
											>
												<Form.List name={[field.name, 'Rules']}>
													{(ruleFields, ruleOpt) => (
														<div style={{ display: 'flex', flexDirection: 'column', rowGap: 14 }}>
															{ruleFields.map(ruleField => (
																<Card
																	size="small"
																	title={
																		<Form.Item noStyle shouldUpdate>
																			{() => {
																				return (
																					<pre>
																						{
																							form.getFieldsValue()?.AlertRuleContent.Groups[field.name].Rules[ruleField.name]
																								?.Alert
																						}
																					</pre>
																				);
																			}}
																		</Form.Item>
																	}
																	key={ruleField.key}
																	extra={
																		<CloseOutlined
																			onClick={() => {
																				ruleOpt.remove(ruleField.name);
																			}}
																		/>
																	}
																>
																	<Form.Item
																		label={t('alert.alertName')}
																		name={[ruleField.name, 'Alert']}
																		rules={[{ required: true, message: t('alert.alertNameConfirm') }]}
																	>
																		<Input />
																	</Form.Item>
																	<Form.Item
																		label={t('alert.expr')}
																		name={[ruleField.name, 'Expr']}
																		rules={[{ required: true, message: t('alert.exprConfirm') }]}
																	>
																		<Input />
																	</Form.Item>
																	<Form.Item
																		label={t('alert.for')}
																		name={[ruleField.name, 'For']}
																		rules={[{ required: true, message: t('alert.forConfirm') }]}
																	>
																		<Space.Compact>
																			<Item
																				name={[ruleField.name, 'For', 'd']}
																				noStyle
																				// rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} addonAfter="天" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 'h']}
																				noStyle
																				// rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={23} addonAfter="小时" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 'm']}
																				noStyle
																				// rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={59} addonAfter="分" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 's']}
																				noStyle
																				// rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={59} addonAfter="秒" style={{ width: '100%' }} />
																			</Item>
																		</Space.Compact>
																	</Form.Item>

																	{/* Nest Form.List */}
																	<Form.Item
																		label={t('alert.annotations')}
																		name={[ruleField.name, 'Annotations']}
																		rules={[{ required: true, message: t('alert.annotationsConfirm') }]}
																	>
																		<Form.List name={[ruleField.name, 'Annotations']}>
																			{(annotationsFields, annotationsOpt) => (
																				<div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
																					{annotationsFields.map(annotationsField => (
																						<Space key={annotationsField.key}>
																							<Form.Item noStyle name={[annotationsField.name, 'key']}>
																								<Input placeholder="键" />
																							</Form.Item>
																							:
																							<Form.Item noStyle name={[annotationsField.name, 'value']}>
																								<Input placeholder="值" />
																							</Form.Item>
																							<CloseOutlined
																								onClick={() => {
																									annotationsOpt.remove(annotationsField.name);
																								}}
																							/>
																						</Space>
																					))}
																					<Button type="dashed" onClick={() => annotationsOpt.add()} block>
																						{t('alert.addAnnotations')}
																					</Button>
																				</div>
																			)}
																		</Form.List>
																	</Form.Item>
																	<Form.Item
																		label={t('alert.label')}
																		name={[ruleField.name, 'Labels']}
																		rules={[{ required: true, message: t('alert.labelConfirm') }]}
																	>
																		<Form.List name={[ruleField.name, 'Labels']}>
																			{(labelsFields, labelsOpt) => (
																				<div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
																					{labelsFields.map(labelsField => (
																						<Space key={labelsField.key}>
																							<Form.Item noStyle name={[labelsField.name, 'key']}>
																								<Input placeholder="键" />
																							</Form.Item>
																							:
																							<Form.Item noStyle name={[labelsField.name, 'value']}>
																								<Input placeholder="值" />
																							</Form.Item>
																							<CloseOutlined
																								onClick={() => {
																									labelsOpt.remove(labelsField.name);
																								}}
																							/>
																						</Space>
																					))}
																					<Button type="dashed" onClick={() => labelsOpt.add()} block>
																						{t('alert.addLabel')}
																					</Button>
																				</div>
																			)}
																		</Form.List>
																	</Form.Item>
																</Card>
															))}
															<Button type="dashed" onClick={() => ruleOpt.add()} block>
																+ 新增告警规则
															</Button>
														</div>
													)}
												</Form.List>
											</Form.Item>
										</Card>
									);
								})}

								<Button type="dashed" onClick={() => add()} block>
									+ 新增分组
								</Button>
							</div>
						)}
					</Form.List>
				</Form.Item>
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Space>
						<Button onClick={() => navigateToAlertList('alert')}>{t('cancel')}</Button>
						<Button type="primary" htmlType="submit">
							{t('submit')}
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</>
	);
};

export default AlertForm;
