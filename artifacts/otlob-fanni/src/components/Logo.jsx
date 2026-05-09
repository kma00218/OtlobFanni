export default function Logo() {
  return (
    <div className="flex items-center justify-center py-3">
      <img
        src="/logo.png"
        alt="اطلب فني"
        style={{ maxWidth: '260px', width: '100%' }}
        className="h-auto object-contain"
        draggable={false}
      />
    </div>
  )
}
