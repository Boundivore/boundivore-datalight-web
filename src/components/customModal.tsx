// customModal.tsx

import React, { ReactNode, useState } from 'react';
import { Modal, ModalProps } from 'antd';

interface CustomModalProps extends ModalProps {
	title: ReactNode;
	content: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ title, content }) => {
	const [open, setOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const handleOk = () => {
		// setConfirmLoading(true);
		// setTimeout(() => {
		setOpen(false);

		setConfirmLoading(false);
		// }, 2000);
	};

	const handleCancel = () => {
		setOpen(false);
	};
	return (
		<Modal open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
			{title && <div className="modal-title">{title}</div>}
			{content}
		</Modal>
	);
};

export default CustomModal;
