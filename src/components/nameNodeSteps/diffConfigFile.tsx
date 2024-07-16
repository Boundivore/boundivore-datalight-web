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
import { useSearchParams } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import _ from 'lodash';
// import CryptoJS from 'crypto-js';
// import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
// import { ConfigSummaryVo } from '@/api/interface';

const DiffConfigFile: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [newCode, setNewCode] = useState('');
	const [oldCode, setOldCode] = useState('');
	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: 'HDFS' };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const { ConfigPath } = ConfigSummaryList?.find(item => item.FileName === 'hdfs-site.xml') ?? {};
		getOldFileContent(ConfigPath);
	};
	const getOldFileContent = async configPath => {
		const api = APIConfig.listByGroup;

		const params = { ClusterId: id, ServiceName: 'HDFS', Filename: 'hdfs-site.xml', ConfigPath: configPath };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigGroupList }
		} = data;
		// setLoading(false);
		// paramData = ConfigGroupList;
		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
		setOldCode(codeData);
	};
	const getNewHdfsSiteConfigListByGroup = async () => {
		const api = APIConfig.getNewHdfsSiteConfigListByGroup;
		const params = {
			ClusterId: id
		};
		const {
			Data: { ConfigGroupList }
		} = await RequestHttp.get(api, { params });

		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
		setNewCode(codeData);
	};
	useEffect(() => {
		getNewHdfsSiteConfigListByGroup();
		getConfigFile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />;
};
export default DiffConfigFile;
