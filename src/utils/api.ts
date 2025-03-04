/**
 * API utility functions for the Ranger SOR API SDK
 */
import { ApiError } from '../types';

/**
 * Handles API errors and throws a standardized error
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json() as ApiError;
    } catch (e) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    throw new Error(`API request failed: ${errorData.message} (${errorData.error_code})`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Creates headers with API key for requests
 */
export function createHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };
}

/**
 * Makes a GET request to the API
 */
export async function apiGet<T>(url: string, apiKey: string, params?: Record<string, string | string[]>): Promise<T> {
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(`${key}[]`, v));
      } else {
        queryParams.set(key, value);
      }
    });
  }
  
  const queryString = queryParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: createHeaders(apiKey)
  });
  
  return handleApiResponse<T>(response);
}

/**
 * Makes a POST request to the API
 */
export async function apiPost<T>(url: string, apiKey: string, data: any): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(apiKey),
    body: JSON.stringify(data)
  });
  
  return handleApiResponse<T>(response);
} 