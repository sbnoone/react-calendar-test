import axios from 'axios'

export const api = axios.create({
	baseURL: 'https://date.nager.at/api/v3',
	headers: {
		Accept: 'application/json',
	},
})
