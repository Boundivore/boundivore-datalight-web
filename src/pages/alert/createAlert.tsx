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
 * 新建告警规则
 * @author Tracy
 */
import { FC, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, InputNumber, Space, Button, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
// import { AlertSimpleVo } from '@/api/interface';
import useNavigater from '@/hooks/useNavigater';
const { Item } = Form;
type FieldType = {
	AlertRuleName: string;
	AlertRuleContent: {};
	RoleType: string;
	PermissionId: string[];
	Enabled: boolean;
};
const CreateAlert: FC = () => {
	const [form] = Form.useForm();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToAlertList } = useNavigater();
	const onFinish: FormProps<FieldType>['onFinish'] = async values => {
		console.log(values);
		const updatedValues = { ...values };

		updatedValues.AlertRuleContent.Groups.forEach(group => {
			group.Rules.forEach(rule => {
				const { d = 0, h = 0, m = 0, s = 0 } = rule.For;
				const resultString = `${d}d${h}h${m}m${s}s`;
				rule.For = resultString; // 直接修改原始对象中的 For 字段值
				rule.Expr = btoa(rule.Expr);
				const resultAnnotations = {};
				const resultLabels = {};
				rule.Annotations.forEach(annotation => {
					resultAnnotations[annotation.key] = annotation.value;
				});
				rule.Labels.forEach(label => {
					resultLabels[label.key] = label.value;
				});
				rule.Annotations = resultAnnotations;
				rule.Labels = resultLabels;
			});
		});
		// console.log(121212, updatedValues);
		const params = {
			...updatedValues,
			ClusterId: id
		};
		const api = APIConfig.newAlertRule;
		const data = await RequestHttp.post(api, params);
		console.log('data', data);
	};
	useEffect(() => {}, []);
	return (
		<ContainerCard>
			<Form
				form={form}
				name="basic"
				className="pt-[50px]"
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				style={{ maxWidth: 800 }}
				autoComplete="off"
				onFinish={onFinish}
				// initialValues={{ RoleName: roleInfo.RoleName }}
			>
				<Form.Item<FieldType>
					label={t('alert.alertRuleName')}
					name="AlertRuleName"
					rules={[{ required: true, message: t('inputRoleName') }]}
				>
					<Input />
				</Form.Item>
				<Form.Item label={t('alert.group')}>
					<Form.List name={['AlertRuleContent', 'Groups']}>
						{(fields, { add, remove }) => (
							<div style={{ display: 'flex', rowGap: 14, flexDirection: 'column' }}>
								{fields.map(field => {
									return (
										<Card
											size="small"
											// title={form.getFieldsValue()[field.name]?.groupName}
											title={
												<Form.Item noStyle shouldUpdate>
													{() => {
														console.log(form.getFieldsValue());
														console.log(form.getFieldsValue()?.groupName);
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
												rules={[{ required: true, message: t('inputRoleName') }]}
											>
												<Input />
											</Form.Item>
											<Form.Item label="告警规则" rules={[{ required: true, message: t('inputRoleName') }]}>
												<Form.List name={[field.name, 'Rules']}>
													{(ruleFields, ruleOpt) => (
														<div style={{ display: 'flex', flexDirection: 'column', rowGap: 14 }}>
															{ruleFields.map(ruleField => (
																<Card
																	size="small"
																	title={
																		<Form.Item noStyle shouldUpdate>
																			{() => {
																				console.log(form.getFieldsValue());
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
																		label="规则名称"
																		name={[ruleField.name, 'Alert']}
																		rules={[{ required: true, message: t('inputRoleName') }]}
																	>
																		<Input />
																	</Form.Item>
																	<Form.Item
																		label="告警规则判断表达式"
																		name={[ruleField.name, 'Expr']}
																		rules={[{ required: true, message: t('inputRoleName') }]}
																	>
																		<Input />
																	</Form.Item>
																	<Form.Item
																		label="多久后执行告警"
																		name={[ruleField.name, 'For']}
																		rules={[{ required: true, message: t('inputRoleName') }]}
																	>
																		<Space.Compact>
																			<Item
																				name={[ruleField.name, 'For', 'd']}
																				noStyle
																				rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} addonAfter="天" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 'h']}
																				noStyle
																				rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={23} addonAfter="小时" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 'm']}
																				noStyle
																				rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={59} addonAfter="分" style={{ width: '100%' }} />
																			</Item>
																			<Item
																				name={[ruleField.name, 'For', 's']}
																				noStyle
																				rules={[{ required: true, message: 'Province is required' }]}
																			>
																				<InputNumber min={0} max={59} addonAfter="秒" style={{ width: '100%' }} />
																			</Item>
																		</Space.Compact>
																	</Form.Item>

																	{/* Nest Form.List */}
																	<Form.Item label="规则注解" rules={[{ required: true, message: t('inputRoleName') }]}>
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
																						+ 新增注解
																					</Button>
																				</div>
																			)}
																		</Form.List>
																	</Form.Item>
																	<Form.Item label="规则标签" rules={[{ required: true, message: t('inputRoleName') }]}>
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
																						+ 新增标签
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
						<Button onClick={navigateToAlertList}>{t('cancel')}</Button>
						<Button type="primary" htmlType="submit">
							{t('submit')}
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</ContainerCard>
	);
};
export default CreateAlert;
