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

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const NameNodeMigrate: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
	const items: CollapseProps['items'] = [
		{
			key: '1',
			label: '第一步',
			children: <SelectNameNode />
		},
		{
			key: '2',
			label: 'This is panel header 2',
			children: <p>{text}</p>
		},
		{
			key: '3',
			label: 'This is panel header 3',
			children: <p>{text}</p>
		}
	];

	return (
		<Drawer width={640} onClose={onClose} open={isOpen}>
			<Collapse items={items} defaultActiveKey={['1']} />
		</Drawer>
	);
};
export default NameNodeMigrate;
