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
 * @author Tracy.Guo
 */
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Card, Col, Row, Space, Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
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
import { ConfigSummaryVo } from '@/api/interface';

const ModifyConfig: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const serviceName = searchParams.get('name');
	const [tabsData, setTabsData] = useState<TabsProps['items']>([]);
	const [activeTab, setActiveTab] = useState('');
	const [activeContent, setActiveContent] = useState([]);
	const [codeEdit, setCodeEdit] = useState('');
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [messageApi, contextHolder] = message.useMessage();
	const { navigateToService } = useNavigater();

	const editorRef = useRef(null);

	// let paramData = null; // 最终保存修改时提交的数据

	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const tabs = (ConfigSummaryList as ConfigSummaryVo[]).map(item => ({
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
		const { ConfigPath } =
			tabsData?.find(item => {
				return item.key === activeTab;
			}) ?? {};
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
		// setGroupList(copyData);
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
	const handleClick = index => {
		setCurrentGroupIndex(index);
		setCodeEdit(Utf8.stringify(Base64.parse(activeContent[index].ConfigData)));
		setIsModalOpen(true);
	};
	const handleModalOk = (targetGroupIndex, data) => {
		// 新建分组，添加到其他分组
		setIsModalOpen(false);
		if (targetGroupIndex >= data.length) {
			setCurrentGroupIndex(data.length - 1);
		} else {
			setCurrentGroupIndex(targetGroupIndex);
		}
	};
	const handleModalCancel = () => {
		setIsModalOpen(false);
	};
	// const changeFile = () => {
	// 	if (editorRef.current) {
	// 		const editorValue = editorRef.current?.handleSave();
	// 		const base64Data = btoa(editorValue);
	// 		const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
	// 		setConfigGroupInfo([
	// 			...configGroupInfo,
	// 			{
	// 				...configGroupInfo[currentGroupIndex],
	// 				Sha256: hashDigest,
	// 				ConfigData: base64Data
	// 			}
	// 		]);
	// 	}
	// 	setCurrentGroupIndex(currentGroupIndex || configGroupInfo.length); // 移动时定位到currentIndex，新建时定位到最后一个分组
	// };
	const saveChange = async () => {
		const api = APIConfig.saveByGroup;
		const editorValue = editorRef.current?.handleSave();
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
			navigateToService();
		}
	};

	return (
		<Card className="min-h-[calc(100%-50px)] m-[20px]">
			{contextHolder}
			<Tabs
				items={tabsData}
				onChange={activeKey => {
					setActiveTab(activeKey);
				}}
			/>
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
			<div className="bottom-0 bg-white p-4 shadow-md">
				<Space>
					<Button onClick={navigateToService}>{t('cancel')}</Button>
					<Button type="primary" onClick={saveChange}>
						{t('save')}
					</Button>
				</Space>
			</div>
		</Card>
	);
};

export default ModifyConfig;
