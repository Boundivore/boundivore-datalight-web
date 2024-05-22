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
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AppAnt, message } from 'antd';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
import ThemeProvider from './styles/ThemeProvider';
import Login from '@/pages/auth/login';
import Layouts from '@/layouts';
import { getNavigationType } from '@/utils/helper';
import useStore from '@/store/store';
message.config({
	duration: 2, // 显示消息的持续时间，单位是秒
	maxCount: 3
});
function App() {
	const [locale] = useState<Locale>(zhCN);
	const { setIsRefresh } = useStore();

	useEffect(() => {
		const type = getNavigationType();
		if (type === 1 || type === 'reload') {
			// 页面是通过刷新（reload）加载的
			setIsRefresh(true);
		} else {
			setIsRefresh(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<AppAnt>
			<ConfigProvider locale={locale}>
				<ThemeProvider>
					<Router>
						<Routes>
							{/* 匹配 /login 路径时，只渲染 Login 组件，不使用 Layouts */}
							{/* AppAnt包裹, 定制design token才能对modal生效 */}
							<Route
								path="/login"
								element={
									<AppAnt>
										<Login />
									</AppAnt>
								}
							/>
							{/* 其他路径使用 Layouts 包裹 */}
							<Route
								path="/*"
								element={
									<AppAnt>
										<Layouts hideSider={true} />
									</AppAnt>
								}
							/>
							{/* 跟路径重定向至登录页 */}
							<Route path="/" element={<Navigate to="/login" replace />} />
						</Routes>
					</Router>
				</ThemeProvider>
			</ConfigProvider>
		</AppAnt>
	);
}

export default App;
