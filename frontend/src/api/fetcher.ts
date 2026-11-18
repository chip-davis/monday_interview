import { monday } from "../monday";

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(status: number, info: unknown) {
    super(`API request failed with ${status}`);
    this.status = status;
    this.info = info;
  }
}

export type ErrorType<_E> = ApiError;

export const isOAuthRequired = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 403 &&
  (error.info as { detail?: unknown } | undefined)?.detail === "oauth_required";

export const getSessionToken = async () =>
  (await monday.get("sessionToken")).data;

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Authorization", await getSessionToken());

  const res = await fetch(url, { ...options, headers });
  const body: unknown =
    res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) throw new ApiError(res.status, body);
  return { status: res.status, data: body, headers: res.headers } as T;
};
