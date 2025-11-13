import axios from 'axios'

export class ApiService {
  isAuth = false
  #token;
  #_id;
  #baseUrl;

  constructor(routeAuth = true) {
    // Suporta tanto REACT_APP_API_BASE_URL quanto REACT_APP_API_URL para compatibilidade
    this.#baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || this.getDefaultBaseUrl();
    
    if (routeAuth) {
      this.isAuth = true
      this.token = localStorage.getItem('token')?.toString()
      this._id = localStorage.getItem('_id')?.toString()
    }
  }

  getDefaultBaseUrl() {
    // Detecta automaticamente a URL base baseada no ambiente
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Se estiver em localhost, tenta detectar o IP da rede local
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }
      // Se estiver em produção ou IP específico, usa o mesmo hostname
      return `${window.location.protocol}//${hostname}:3000/api`;
    }
    return 'http://localhost:3000/api';
  }

  getHeaders(multipart = false) {
    const headers = {}

    if (this.isAuth) {
      if (!this?.token || !this?._id)
        throw new Error('Dados de autentucação ausente!')

      headers['Authorization'] = `Bearer ${this.token.replace(/"/g, '')}`
      headers['companyid'] = this._id.replace(/"/g, '')
    }

    // Para multipart, NÃO definir Content-Type - deixar o browser definir automaticamente
    // Isso é necessário para que o boundary seja definido corretamente
    if (!multipart) {
      headers['Content-Type'] = 'application/json'
    }
    // Não definir Content-Type para multipart - axios/browser fará isso automaticamente

    return headers
  }

  verifyAuthetication(response) {
    if (response && response.status === 401 && this.isAuth) {
      return (window.location.href = '/login')
    }
  }

  getRequestConfig() {
    return {
      timeout: 30000, // 30 segundos de timeout
      headers: this.getHeaders(),
    }
  }

  getRequestConfigMultipart(multipart) {
    return {
      timeout: 60000, // 60 segundos para uploads
      headers: this.getHeaders(multipart),
    }
  }

  async get(route) {
    try {
      const response = await axios.get(this.#baseUrl + route, this.getRequestConfig())
      this.verifyAuthetication(response)
      return response
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async post(route, data, multipart = false) {
    if (!data) throw new Error('Corpo da requisição nescessário')
    try {
      const config = multipart ? this.getRequestConfigMultipart(multipart) : this.getRequestConfig()
      
      // Para FormData, garantir que o axios não sobrescreva o Content-Type
      if (multipart && data instanceof FormData) {
        // Remover Content-Type do config para que o browser defina automaticamente com o boundary correto
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
      
      const response = await axios.post(this.#baseUrl + route, data, config)
      this.verifyAuthetication(response)
      return response
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async put(route, data, multipart = false) {
    if (!data) throw new Error('Corpo da requisição nescessário')
    try {
      const config = multipart ? this.getRequestConfigMultipart(multipart) : this.getRequestConfig()
      
      // Para FormData, garantir que o axios não sobrescreva o Content-Type
      if (multipart && data instanceof FormData) {
        // Remover Content-Type do config para que o browser defina automaticamente com o boundary correto
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
      
      const response = await axios.put(this.#baseUrl + route, data, config)
      this.verifyAuthetication(response)
      return response
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async delete(route) {
    try {
      const response = await axios.delete(this.#baseUrl + route, this.getRequestConfig())
      this.verifyAuthetication(response)
      return response
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  handleError(error) {
    // Log do erro para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        url: this.#baseUrl
      })
    }
  }
}
