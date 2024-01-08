import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

const useSetStep = step => {
	const { stepCurrentTag } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSetProcedure = APIConfig.setProcedure;
	const setProcedure = () => {
		const params = {
			ClusterId: id,
			ProcedureStateEnum: step,
			Tag: stepCurrentTag
		};
		const data = RequestHttp.post(apiSetProcedure, params);
		console.log(data);
	};
	useEffect(() => {
		setProcedure();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export default useSetStep;
