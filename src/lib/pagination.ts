export const ARTISTS_PAGE_SIZE = 24;

export type PaginationMeta = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

export function parsePageParam(value: string | null): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return Math.floor(parsed);
}

export function paginate<T>(
	items: T[],
	page: number,
	pageSize = ARTISTS_PAGE_SIZE,
): { items: T[]; meta: PaginationMeta } {
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const safePage = Math.min(Math.max(1, page), totalPages);
	const start = (safePage - 1) * pageSize;

	return {
		items: items.slice(start, start + pageSize),
		meta: {
			page: safePage,
			pageSize,
			total,
			totalPages,
		},
	};
}
