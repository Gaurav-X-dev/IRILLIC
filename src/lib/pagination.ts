export function paginationFromUrl(request: Request) {
  const params = new URL(request.url).searchParams;
  const requestedPage = Number(params.get("page") || 1);
  const requestedLimit = Number(params.get("limit") || 20);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;
  return {
    params,
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    pageCount: Math.max(1, Math.ceil(total / limit)),
    hasPrevious: page > 1,
    hasNext: page * limit < total,
  };
}
