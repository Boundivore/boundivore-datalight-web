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
 * DiffConfigFile - 对比配置文件
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
import { Space, Button, Popover, List, message, Empty } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import { ConfigGroupVo, ConfigSummaryVo } from '@/api/interface';
interface DiffConfigFileProps {
	onClose: () => void;
}
const serviceName = 'HDFS';
const fileName = 'hdfs-site.xml';
const DiffConfigFile: FC<DiffConfigFileProps> = ({ onClose }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [newCode, setNewCode] = useState('');
	const [oldCode, setOldCode] = useState('');
	const [configGroup, setConfigGroup] = useState<ConfigGroupVo[]>([]);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const { setSelectedNameNode, setSelectedZKFC, setReloadMigrateList, setReloadConfigFile } = useStore();
	// const [groupNodeList, setGroupNodeList] = useState([]);
	const [messageApi, contextHolder] = message.useMessage();
	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const { ConfigPath } = ConfigSummaryList?.find((item: ConfigSummaryVo) => item.FileName === fileName) ?? {};
		getOldFileContent(ConfigPath);
	};
	const getOldFileContent = async (configPath: string) => {
		const api = APIConfig.listByGroup;

		const params = { ClusterId: id, ServiceName: serviceName, Filename: fileName, ConfigPath: configPath };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigGroupList }
		} = data;

		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));

		setOldCode(codeData);
		setConfigGroup(copyData);
	};
	const getNewHdfsSiteConfigListByGroup = async () => {
		const api = APIConfig.getNewHdfsSiteConfigListByGroup;
		const params = {
			ClusterId: id
		};
		try {
			const {
				Code,
				Data: { ConfigGroupList }
			} = await RequestHttp.get(api, { params });
			if (Code === '00000') {
				const copyData = _.cloneDeep(ConfigGroupList);
				const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
				setNewCode(codeData);
				getConfigFile();
			}
		} catch (error) {
			console.log(error);
		}
	};
	const saveChange = async () => {
		const api = APIConfig.saveByGroup;
		const editorValue = newCode;
		const base64Data = btoa(unescape(encodeURIComponent(editorValue)));
		const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
		_.merge(configGroup[currentGroupIndex], { Sha256: hashDigest, ConfigData: base64Data });
		const params = {
			ClusterId: id,
			ConfigGroupList: configGroup,
			ServiceName: 'HDFS'
		};
		const data = await RequestHttp.post(api, params);
		const { Code } = data;
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			// 成功更新配置文件后将迁移流程重置
			setTimeout(() => {
				// 成功更新配置文件后将迁移流程重置
				setSelectedNameNode([]);
				setSelectedZKFC([]);
				setReloadConfigFile(false);
				setReloadMigrateList(false);
				onClose();
			}, 2000);
		}
	};
	useEffect(() => {
		getNewHdfsSiteConfigListByGroup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			{contextHolder}
			{newCode ? (
				<>
					<Space className="m-[10px] flex justify-between">
						<Space>
							{configGroup.map((group, index) => {
								return (
									<Popover
										key={index}
										content={
											<List
												size="small"
												bordered
												dataSource={group.ConfigNodeList}
												renderItem={item => <List.Item>{item.Hostname}</List.Item>}
											/>
										}
										title="分组信息"
									>
										<Button
											key={index}
											size="middle"
											type={index === currentGroupIndex ? 'primary' : 'default'}
											shape="round"
											onClick={() => {
												setCurrentGroupIndex(index);
												setOldCode(Utf8.stringify(Base64.parse(group.ConfigData)));
											}}
										>
											{t('group', { name: index + 1 })}
										</Button>
									</Popover>
								);
							})}
						</Space>

						<Button type="primary" onClick={saveChange}>
							同步最新配置文件
						</Button>
					</Space>
					<ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
				</>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
					<Button
						type="primary"
						icon={<RedoOutlined />}
						//   loading={loadings[2]}
						onClick={getNewHdfsSiteConfigListByGroup}
					>
						刷新
					</Button>
				</Empty>
			)}
		</>
	);
};
export default DiffConfigFile;
