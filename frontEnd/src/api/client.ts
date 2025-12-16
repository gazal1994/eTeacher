const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Try to parse JSON response
    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = typeof data === 'string' ? data : response.statusText;
      
      if (response.status === 409) {
        errorMessage = 'Student is already enrolled in this course.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status === 400) {
        errorMessage = typeof data === 'string' ? data : 'Invalid request data.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors
    throw new ApiError(
      'Unable to reach server. Please check your connection and try again.'
    );
  }
}
