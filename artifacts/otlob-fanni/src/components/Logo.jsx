export default function Logo() {
  return (
    <div className="flex items-center justify-center" style={{ padding: '2px 0' }}>
      <img
        src="/logo.png"
        alt="اطلب فني"
        style={{ maxWidth: '145px', width: '100%' }}
        className="h-auto object-contain"
        draggable={false}
      />
    </div>
  )
}
