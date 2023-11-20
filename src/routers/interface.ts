export interface RouteObject {
	path: string;
	element: React.ReactNode;
	children?: RouteObject[]; // 可选的子路由对象数组
}
