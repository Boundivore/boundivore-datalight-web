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
import { Form, Input, Space, Button, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { t } from 'i18next';
// import APIConfig from '@/api/config';
// import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
// import { AlertSimpleVo } from '@/api/interface';
import useNavigater from '@/hooks/useNavigater';

type FieldType = {
	AlertRuleName: string;
	RoleComment?: string;
	RoleType: string;
	PermissionId: string[];
	Enabled: boolean;
};
const CreateAlert: FC = () => {
	const [form] = Form.useForm();
	const { navigateToAlertList } = useNavigater();
	const onFinish: FormProps<FieldType>['onFinish'] = async values => {
		console.log(values);
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
				<Form.Item name="AlertRuleContent" label={t('alert.group')}>
					<Form.List name="groups">
						{(fields, { add, remove }) => (
							<div style={{ display: 'flex', rowGap: 14, flexDirection: 'column' }}>
								{fields.map(field => (
									<Card
										size="small"
										title={form.getFieldsValue()[field.name]?.groupName}
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
											name="groupName"
											rules={[{ required: true, message: t('inputRoleName') }]}
										>
											<Input />
										</Form.Item>
										<Form.Item label="告警规则" rules={[{ required: true, message: t('inputRoleName') }]}>
											<Form.List name="group">
												{(groupFields, groupOpt) => (
													<div style={{ display: 'flex', flexDirection: 'column', rowGap: 14 }}>
														{groupFields.map(groupField => (
															<Card
																size="small"
																title={`规则 ${groupField.name + 1}`}
																key={groupField.key}
																extra={
																	<CloseOutlined
																		onClick={() => {
																			groupOpt.remove(groupField.name);
																		}}
																	/>
																}
															>
																<Form.Item
																	label="规则名称"
																	name={[groupField.name, 'name']}
																	rules={[{ required: true, message: t('inputRoleName') }]}
																>
																	<Input />
																</Form.Item>

																{/* Nest Form.List */}
																<Form.Item label="规则注解" rules={[{ required: true, message: t('inputRoleName') }]}>
																	<Form.List name={[groupField.name, 'annotations']}>
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
																	<Form.List name={[groupField.name, 'labels']}>
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
														<Button type="dashed" onClick={() => groupOpt.add()} block>
															+ 新增告警规则
														</Button>
													</div>
												)}
											</Form.List>
										</Form.Item>
									</Card>
								))}

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
