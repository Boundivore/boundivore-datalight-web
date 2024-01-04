import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
import ThemeProvider from './styles/ThemeProvider';

function App() {
	const [locale] = useState<Locale>(zhCN);

	return (
		<ConfigProvider locale={locale}>
			<ThemeProvider>{useRoutes(routes)}</ThemeProvider>
		</ConfigProvider>
	);
}

export default App;
