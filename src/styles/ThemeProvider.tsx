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
import * as React from 'react';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import useSwitchStyle from './switchStyle';
// import { background } from './gradientUtil';
import './theme.css';
// import { PREFIX } from './constant';

export interface ThemeProviderProps {
	disabled?: boolean;
	children?: React.ReactNode;
}
export default function ThemeProvider(props: ThemeProviderProps) {
	const { children } = props;

	const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);

	// Switch
	useSwitchStyle(getPrefixCls(`switch`));
	// useLayoutStyle(getPrefixCls(`switch`));

	// const passedCls = disabled ? null : PREFIX;

	return (
		<ConfigProvider
			theme={{
				components: {
					Button: {
						// defaultBg: '#51c2fe',
						// defaultColor: '#fff',
						// defaultHoverBg: '#51c2fe',
						// defaultHoverColor: '#fff'
					},
					Layout: {
						/* here is your component tokens */
						headerBg: '#fff',
						footerBg: '#fff',
						boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)'
					},
					Select: {
						multipleItemBg: '#e6f4ff'
					}
				},
				token: {
					colorPrimary: '#51c2fe',
					colorTextBase: '#2e436b',
					paddingLG: 16
				}
			}}
			layout={{ className: 'my-layout' }}
			// switch={{ className: 'my-header' }}
			// typography={{ className: passedCls }}
			// checkbox={{ className: passedCls }}
			// radio={{ className: passedCls }}
			// spin={{ className: passedCls }}
			// divider={{ className: passedCls }}
			// card={{ className: passedCls }}
		>
			<StyleProvider hashPriority="high">{children}</StyleProvider>
		</ConfigProvider>
	);
}
