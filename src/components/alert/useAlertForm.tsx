import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const useAlertForm = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');

	useEffect(() => {
		// Any initialization logic can be put here
	}, []);

	const navigateToAlertList = () => {
		// Logic to navigate to alert list
	};

	return { id, navigateToAlertList };
};

export default useAlertForm;
