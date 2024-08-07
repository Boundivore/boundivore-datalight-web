/** @type {import('tailwindcss').Config} */
export default {
	important: true,
	corePlugins: {
		preflight: false
	},
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			backgroundImage: {
				'login-page': "url('/assets/loginBg.jpg')"
			}
		}
	},
	plugins: []
};
