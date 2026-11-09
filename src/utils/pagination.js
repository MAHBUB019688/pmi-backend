function getPagination(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.per_page) || 12));
  const skip = (page - 1) * perPage;

  return { page, perPage, skip, take: perPage };
}

function buildPagination({ page, perPage, total }) {
  const lastPage = Math.max(1, Math.ceil(total / perPage) || 1);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return {
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
  };
}

module.exports = { getPagination, buildPagination };
