import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#ECEEF2] flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg max-w-sm w-full">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-extrabold text-[#071B33] mb-2">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              تعذّر تحميل هذه الصفحة. جرّب إعادة التحميل أو العودة للرئيسية.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #FF7900, #c45e00)' }}
              >
                إعادة التحميل
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
                className="w-full py-3 rounded-2xl font-bold text-[#071B33] text-sm bg-gray-100"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
