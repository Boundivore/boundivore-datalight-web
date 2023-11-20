import i18n from 'i18next'
import enTrans from './en'
import zhTrans from './zh'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
	resources: {
		en: {
			translation: enTrans
		},
		zh: {
			translation: zhTrans
		}
	},
	fallbackLng: 'zh',
	debug: false,
	interpolation: {
		escapeValue: false
	}
})

export default i18n
