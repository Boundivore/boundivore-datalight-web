import { useTranslation } from 'react-i18next';

interface ItemConfigInfoProps {
	text: string;
	record: any;
}

const ItemConfigInfo: React.FC<ItemConfigInfoProps> = ({ text, record }) => {
	const { t } = useTranslation();

	return (
		<a>
			{text}
			{t('node.core')} /&nbsp;{(record?.Ram / 1024).toFixed(2)}
			{t('node.gb')} /&nbsp;{(record?.DiskTotal / 1024).toFixed(2)}
			{t('node.gb')} {record.CpuArch ? `/ ${record.CpuArch}` : null}
		</a>
	);
};

export default ItemConfigInfo;
