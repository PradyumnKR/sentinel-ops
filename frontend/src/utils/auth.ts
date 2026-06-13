export const saveToken = (token: string) => {
    localStorage.setItem('access_token', token)
}

export const getToken = () => {
    return localStorage.getItem('access_token')
}

export const removeToken = () => {
    localStorage.removeItem('access_token')
}

export const isAuthenticated = () => {
    return !!getToken()
}