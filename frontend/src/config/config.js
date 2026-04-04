const config = {
    API_URL: String(import.meta.env.VITE_API_URL || 'http://localhost:3000/api'),
    MODE: String(import.meta.env.VITE_NODE_ENV || 'development'),
}

export default config;