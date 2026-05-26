/**
 * Centralized API Client Service for WindCast AI.
 * Handles unified HTTP requests, automatic Auth Bearer token injections,
 * network timeouts, and response pre-processing.
 */

const DEFAULT_API_URL = "http://localhost:8010/api/v1";

class ApiClient {
  private baseUrl: string;
  private idToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
    
    // Safely load token in browser environments during initialization
    if (typeof window !== "undefined") {
      this.idToken = localStorage.getItem("windcast_auth_token");
    }
  }

  /**
   * Sets the active Firebase ID token for Authorization header injection.
   */
  public setToken(token: string | null) {
    this.idToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("windcast_auth_token", token);
      } else {
        localStorage.removeItem("windcast_auth_token");
      }
    }
  }

  /**
   * Main asynchronous HTTP request caller.
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = 12000, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    // Establish headers
    const headers = new Headers(fetchOptions.headers || {});
    
    // Automatically inject Bearer JWT token if active
    if (this.idToken) {
      headers.set("Authorization", `Bearer ${this.idToken}`);
    }

    // Set JSON header by default if not sending FormData (multi-part batch upload)
    if (!(fetchOptions.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Handle abort triggers for network timeouts
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      // Intercept 401 Unauthorized token expirations
      if (response.status === 401) {
        this.handleUnauthorizedError();
        throw new Error("Authentication Decryption Expired. Access denied.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Network response error: ${response.status}`);
      }

      // Parse JSON payload
      return await response.json();
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Network request timeout exceeded. Backend is offline.");
      }
      throw error;
    }
  }

  /**
   * Handles user redirects if the session token is rejected by the backend.
   */
  private handleUnauthorizedError() {
    this.setToken(null);
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      // Wipes local settings and redirects to login portal with alert parameter
      window.location.href = "/login?alert=expired";
    }
  }

  // HTTP Verb helpers
  public get<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
