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
 * NameNodeMigrate- NameNode迁移
 * @author Tracy
 */
import React from 'react';
import { Drawer, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import SelectNameNode from '@/components/nameNodeSteps/selectNameNode';
import SelectNewNode from '@/components/nameNodeSteps/selectNewNode';
import SelectZKFC from '@/components/nameNodeSteps/selectZKFC';
import MigrateList from '@/components/nameNodeSteps/migrateList';
import DiffConfigFile from '@/components/nameNodeSteps/diffConfigFile';

const NameNodeMigrate: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
	const items: CollapseProps['items'] = [
		{
			key: '1',
			label: '第一步',
			children: <SelectNameNode />
		},
		{
			key: '2',
			label: '第二步',
			children: <SelectZKFC />
		},
		{
			key: '3',
			label: '第三步',
			children: <SelectNewNode />
		},
		{
			key: '4',
			label: '第四步',
			children: <MigrateList />
		},
		{
			key: '5',
			label: '第五步',
			children: <DiffConfigFile />
		}
	];

	return (
		<Drawer width="90%" onClose={onClose} open={isOpen}>
			<Collapse items={items} defaultActiveKey={['1']} />
		</Drawer>
	);
};
export default NameNodeMigrate;
