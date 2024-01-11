import { useState } from 'react';
import { ConfigProvider, App as AppAnt } from 'antd';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
import ThemeProvider from './styles/ThemeProvider';

function App() {
	const [locale] = useState<Locale>(zhCN);

	return (
		<AppAnt>
			<ConfigProvider locale={locale}>
				<ThemeProvider>{useRoutes(routes)}</ThemeProvider>
			</ConfigProvider>
		</AppAnt>
	);
}

export default App;
