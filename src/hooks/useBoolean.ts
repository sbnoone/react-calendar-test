import { useState } from 'react'

export function useBoolean(initial = false) {
	const [bool, setBool] = useState(initial)

	const setTrue = () => setBool(true)
	const setFalse = () => setBool(false)
	const toggleBool = () => setBool((b) => !b)

	return { bool, setTrue, setFalse, toggleBool }
}
