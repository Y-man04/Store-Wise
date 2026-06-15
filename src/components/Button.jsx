export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
