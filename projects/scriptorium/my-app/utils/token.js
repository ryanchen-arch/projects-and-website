// utils/token.js
export function setAccessToken(token) {
	localStorage.setItem("access_token", token);
}

export function getAccessToken() {
	return localStorage.getItem("access_token");
}

export function setRefreshToken(token) {
	localStorage.setItem("refresh_token", token);
}

export function getRefreshToken() {
	return localStorage.getItem("refresh_token");
}

export function clearTokens() {
	localStorage.removeItem("access_token");
	localStorage.removeItem("refresh_token");
}
