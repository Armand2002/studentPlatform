export default function LoadingSpinner({ size = 16 }: { size?: number }) {
	const dim = `${size}px`
	return (
		<span
			aria-label="loading"
			style={{ width: dim, height: dim }}
			className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
		/>
	)
}
