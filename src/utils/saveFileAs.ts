export const saveFileAs = ({ fileName, blob }: { fileName: string; blob: Blob }) => {
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.setAttribute('download', fileName)
	link.setAttribute('href', url)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
