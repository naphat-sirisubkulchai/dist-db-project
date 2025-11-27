export async function getUserFromToken(jwt: any, headers: any): Promise<{ userId: string; username: string }> {
  const auth = headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    throw new Error('Unauthorized - No token provided');
  }

  const token = auth.substring(7);
  const payload = await jwt.verify(token);

  if (!payload || !payload.userId) {
    throw new Error('Unauthorized - Invalid token');
  }

  return payload as { userId: string; username: string };
}
