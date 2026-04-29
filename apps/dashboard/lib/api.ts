class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new ApiError("API URL is not configured", 0);
  }

  const token = getToken();
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(body.error || "Request failed", res.status);
  }

  return res;
}

export { ApiError };
