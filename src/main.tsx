import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import '@/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Router>
			<Suspense fallback={<div>loading...</div>}>
				<App />
			</Suspense>
		</Router>
	</React.StrictMode>
);
