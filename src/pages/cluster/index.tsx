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
import { Card, Button } from 'antd';
import RequestHttp from '@/api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CreateCluster from './modal/createCluster';

const Cluster: React.FC = () => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation();
	const api = '/api/v1/master/cluster/new';

	const getData = () => {
		RequestHttp.post(api);
	};
	// const showModal = () => {
	// 	setOpen(true);
	// };
	const handleOk = () => {
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
	};
	useEffect(() => {
		getData();
	}, []);
	return (
		<>
			<Card
				style={{
					width: '96%',
					height: 'calc(100% - 40px)',
					minHeight: '600px',
					margin: '20px auto',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Button type="primary" size={'large'}>
					<Link to="create">{t('cluster.create')}</Link>
				</Button>
			</Card>
			<CreateCluster open={open} onOk={handleOk} onCancel={handleCancel}></CreateCluster>
		</>
	);
};

export default Cluster;
