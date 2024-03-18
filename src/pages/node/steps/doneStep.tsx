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
 * DoneStep - 第七步
 * @author Tracy.Guo
 */
import { FC, useEffect } from 'react';
import { Result } from 'antd';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

const DoneStep: FC = () => {
	const { t } = useTranslation();
	const { setCurrentPageDisabled, currentPageDisabled } = useStore();
	useEffect(() => {
		setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <Result status="success" title={t('node.addSuccessTitle')} />;
};
export default DoneStep;
