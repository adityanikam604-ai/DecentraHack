import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — redirect to login
      localStorage.removeItem('sb-access-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
