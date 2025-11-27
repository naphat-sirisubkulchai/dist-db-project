export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now().toString(36);
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.min(
    100,
    Math.max(1, parseInt(limit || '10', 10))
  );
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
}

export function sanitizeUser(user: any) {
  const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
  return userWithoutPassword;
}

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
