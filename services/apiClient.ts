
const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private get token(): string | null {
    return localStorage.getItem('portela_hub_token');
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${API_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    } as any;

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('portela_hub_token');
      window.location.href = '/login';
      throw new Error('Não autorizado');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    return this.request(path, { method: 'GET' });
  }

  async post<T>(path: string, body: any): Promise<T> {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: any): Promise<T> {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request(path, { method: 'DELETE' });
  }

  setToken(token: string) {
    localStorage.setItem('portela_hub_token', token);
  }

  clearToken() {
    localStorage.removeItem('portela_hub_token');
  }
}

export const apiClient = new ApiClient();
