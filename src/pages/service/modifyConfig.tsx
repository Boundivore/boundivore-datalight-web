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
 * 修改配置文件页面
 * @author Tracy
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Col, Row, Space, Button, message, App } from 'antd';
import { PlusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import CodeEditor from './codeEditor';
import NodeListModal from './components/nodeListModal';
import { ConfigSummaryVo, ConfigGroupVo } from '@/api/interface';
import ContainerCard from '@/components/containerCard';

// 从 TabsProps 中提取 items 类型
type TabItem = NonNullable<TabsProps['items']>[number];

// 使用交叉类型将 ConfigSummaryVo 合并到 TabItem 中
type MergedTabItem = TabItem & ConfigSummaryVo;

// 定义扩展后的 TabsProps 类型
type MergedTabsProps = {
	items: MergedTabItem[];
};
const ModifyConfig: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const serviceName = searchParams.get('name');
	const [tabsData, setTabsData] = useState<MergedTabsProps['items']>([]);
	const [activeTab, setActiveTab] = useState('');
	const [activeContent, setActiveContent] = useState<ConfigGroupVo[]>([]);
	const [codeEdit, setCodeEdit] = useState('');
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [messageApi, contextHolder] = message.useMessage();
	const { navigateToService } = useNavigater();
	const { modal } = App.useApp();

	const editorRef = useRef<{ handleSave: () => string } | null>(null);

	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const tabs = ConfigSummaryList.map((item: ConfigSummaryVo) => ({
			...item,
			key: item.FileName,
			label: item.FileName
		}));
		// setLoading(false);
		setActiveTab(tabs[0].key); // 默认选中第一项
		setTabsData(tabs);
	};
	const getFileContent = async () => {
		// setLoading(true);
		const api = APIConfig.listByGroup;
		const { ConfigPath } = tabsData?.find(item => item.key === activeTab) ?? {};
		const params = { ClusterId: id, ServiceName: serviceName, Filename: activeTab, ConfigPath };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigGroupList }
		} = data;
		// setLoading(false);
		// paramData = ConfigGroupList;
		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
		setActiveContent(copyData);
		setCodeEdit(codeData);
		setConfigGroupInfo(copyData);
	};
	useEffect(() => {
		setActiveContent(configGroupInfo);
	}, [configGroupInfo]);
	useEffect(() => {
		getConfigFile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		activeTab && getFileContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);
	const handleClick = (index: number) => {
		setCurrentGroupIndex(index);
		setCodeEdit(Utf8.stringify(Base64.parse(activeContent[index].ConfigData)));
		setIsModalOpen(true);
	};
	const handleModalOk = useCallback((targetGroupIndex: number, data: ConfigGroupVo[]) => {
		// 新建分组，添加到其他分组
		setIsModalOpen(false);
		if (targetGroupIndex >= data.length) {
			setCurrentGroupIndex(data.length - 1);
		} else {
			setCurrentGroupIndex(targetGroupIndex);
		}
	}, []);
	const handleModalCancel = useCallback(() => {
		setIsModalOpen(false);
	}, []);
	const saveChange = async () => {
		const api = APIConfig.saveByGroup;
		const editorValue = editorRef.current?.handleSave() ?? '';
		const base64Data = btoa(unescape(encodeURIComponent(editorValue)));
		const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
		_.merge(configGroupInfo[currentGroupIndex], { Sha256: hashDigest, ConfigData: base64Data });
		const params = {
			ClusterId: id,
			ConfigGroupList: configGroupInfo,
			ServiceName: serviceName
		};
		const data = await RequestHttp.post(api, params);
		const { Code } = data;
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			// navigateToService();
		}
	};

	return (
		<ContainerCard>
			{contextHolder}
			<Tabs
				items={tabsData}
				activeKey={activeTab}
				onChange={activeKey => {
					modal.confirm({
						title: t('warning'),
						content: t('warningText'),
						okText: t('confirm'),
						cancelText: t('cancel'),
						onOk: async () => {
							setActiveTab(activeKey);
						}
					});
				}}
			/>
			<div className="flex p-4">
				<Space className="ml-auto">
					<ExclamationCircleOutlined className="text-[#FAAA14]" />
					<span className="text-gray-400">{t('switchConfirm')}</span>
					<Button type="primary" onClick={saveChange}>
						{t('save')}
					</Button>
					<Button onClick={navigateToService}>{t('cancel')}</Button>
				</Space>
			</div>
			<Row>
				<Col span={5}>
					<Space direction="vertical">
						{configGroupInfo.map((_group, index) => {
							return (
								<Space key={index}>
									<Button
										key={index}
										size="middle"
										type={index === currentGroupIndex ? 'primary' : 'default'}
										shape="round"
										onClick={() => {
											setCurrentGroupIndex(index);
											setCodeEdit(Utf8.stringify(Base64.parse(activeContent[index].ConfigData)));
										}}
									>
										{t('group', { name: index + 1 })}
									</Button>
									<PlusCircleOutlined style={{ fontSize: '16px' }} onClick={() => handleClick(index)} />
								</Space>
							);
						})}
					</Space>
				</Col>
				<Col className="min-h-[500px]" span={19}>
					{codeEdit ? <CodeEditor ref={editorRef} data={codeEdit} /> : null}
				</Col>
			</Row>
			{isModalOpen ? (
				<NodeListModal
					isModalOpen={isModalOpen}
					groupIndex={currentGroupIndex}
					handleOk={handleModalOk}
					handleCancel={handleModalCancel}
				/>
			) : null}
		</ContainerCard>
	);
};

export default ModifyConfig;
