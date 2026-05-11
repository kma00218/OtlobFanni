import { useEffect, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import {
  Eye, Pencil, Building2, Phone, MapPin, Briefcase, Clock,
  Facebook, Image, FileText, Lock, Shield, Info, XCircle
} from 'lucide-react'
import { categories } from '../../data/services'
import api from '../../lib/api'

const EXP_LABEL = {
  less1: 'أقل من سنة', '1-2': '1-2 سنوات', '3-5': '3-5 سنوات',
  '6-10': '6-10 سنوات', '10+': 'أكثر من 10 سنوات',
}

const DAY_AR = {
  Saturday:'السبت', Sunday:'الأحد', Monday:'الاثنين',
  Tuesday:'الثلاثاء', Wednesday:'الأربعاء', Thursday:'الخميس', Friday:'الجمعة',
}

const CAT_LABEL = Object.fromEntries(categories.map(c => [c.id, c.nameAr]))

const emptyForm = {
  company_name: '', contact_name: '', phone: '', whatsapp: '',
  commercial_reg: '', city: '', area: '', address: '',
  specialty: '', years_active: '', description: '', certifications: '',
  price_from: '', price_to: '', available_now: false, emergency: false,
  hours_from: '', hours_to: '', service_radius: '', facebook: '', instagram: '',
}

export default function Companies() {
  const { isSuperAdmin } = useAdmin()
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [viewItem, setViewItem]     = useState(null)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const reload = () => {
    setLoading(true)
    api.admin.companies.list()
      .then(rows => { setData(rows); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleRevoke = async (id) => {
    if (!confirm('هل تريد إلغاء الموافقة على هذه الشركة؟ ستعود إلى قائمة الطلبات.')) return
    try {
      await api.admin.companies.setStatus(id, 'pending')
      setData(prev => prev.filter(r => r.id !== id))
      if (viewItem?.id === id) setViewItem(null)
      showToast('تم إلغاء الموافقة وإعادة الشركة إلى قائمة الطلبات')
    } catch { showToast('حدث خطأ', 'error') }
  }

  const openEdit = (row) => {
    setEditItem(row)
    setForm({
      company_name:   row.companyName   || '',
      contact_name:   row.contactName   || '',
      phone:          row.phone         || '',
      whatsapp:       row.whatsapp      || '',
      commercial_reg: row.commercialReg || '',
      city:           row.city          || '',
      area:           row.area          || '',
      address:        row.address       || '',
      specialty:      row.specialty     || '',
      years_active:   row.yearsActive   || '',
      description:    row.description   || '',
      certifications: row.certifications|| '',
      price_from:     row.priceFrom     || '',
      price_to:       row.priceTo       || '',
      available_now:  row.availableNow  ?? false,
      emergency:      row.emergency     ?? false,
      hours_from:     row.hoursFrom     || '',
      hours_to:       row.hoursTo       || '',
      service_radius: row.serviceRadius || '',
      facebook:       row.facebook      || '',
      instagram:      row.instagram     || '',
    })
    setViewItem(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.admin.companies.update(editItem.id, form)
      setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...updated } : r))
      showToast('تم حفظ التغييرات بنجاح')
      setEditItem(null)
    } catch { showToast('حدث خطأ', 'error') }
    setSaving(false)
  }

  const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()

  const filtered = data.filter(r => {
    const name    = r.companyName  || ''
    const contact = r.contactName  || ''
    const s = !search || name.includes(search) || contact.includes(search) || r.phone?.includes(search) || r.city?.includes(search)
    const c = !filterCity || r.city === filterCity
    return s && c
  })

  const columns = [
    {
      key: 'companyName', label: 'الشركة / المؤسسة',
      render: (v, row) => {
        const logo = row.companyLogo || null
        const contact = row.contactName || ''
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/8">
              {logo
                ? <img src={logo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white text-xs font-bold rounded-xl">
                    {(v || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
              }
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{v || '—'}</p>
              <p className="text-xs text-[#555570]">{contact || '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone', label: 'الهاتف',
      render: (v) => <span className="text-xs text-[#8888A8]" dir="ltr">{v || '—'}</span>,
    },
    { key: 'city', label: 'المدينة', render: v => v || '—' },
    {
      key: 'specialty', label: 'التخصص',
      render: (v) => CAT_LABEL[v] || v || '—',
    },
    {
      key: 'yearsActive', label: 'سنوات النشاط',
      render: (v) => EXP_LABEL[v] || v || '—',
    },
    {
      key: 'createdAt', label: 'تاريخ الانضمام',
      render: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '—',
    },
    {
      key: 'id', label: 'إجراءات',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={() => setViewItem(row)}
            className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(row)}
            className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors" title="تعديل">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleRevoke(row.id)}
            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="إلغاء الموافقة">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>هذه الشركات تمت الموافقة عليها وأصبحت جزءاً من الدليل. يمكن تعديل بياناتها أو إلغاء الموافقة عليها.</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف أو المدينة..."
        actions={
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
            className="border border-white/8 rounded-xl px-3 py-2 text-sm text-[#C0C0E0] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/30 bg-white/5">
            <option value="">كل المدن</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        }
        emptyMessage="لا توجد شركات مقبولة بعد — قم بالموافقة على الطلبات من صفحة طلبات الشركات"
      />

      {/* ── View Modal ──────────────────────────────────────────────── */}
      <FormModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="تفاصيل الشركة"
        submitLabel="تعديل البيانات"
        onSubmit={e => { e.preventDefault(); openEdit(viewItem) }}
        size="lg"
      >
        {viewItem && (() => {
          const compName    = viewItem.companyName  || ''
          const contactName = viewItem.contactName  || ''
          const logo        = viewItem.companyLogo  || null
          const workImgs    = viewItem.workImages   || []
          const availNow    = viewItem.availableNow ?? false
          const hoursFrom   = viewItem.hoursFrom    || ''
          const hoursTo     = viewItem.hoursTo      || ''
          const workDays    = viewItem.workingDays  || []
          const priceFrom   = viewItem.priceFrom    || ''
          const priceTo     = viewItem.priceTo      || ''
          const svcRadius   = viewItem.serviceRadius|| ''
          const commReg     = viewItem.commercialReg|| ''
          const commDoc     = viewItem.commercialDoc|| null
          const workLic     = viewItem.workLicense  || null
          const yearsActive = viewItem.yearsActive  || ''
          const createdAt   = viewItem.createdAt    || ''

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white/10 shadow">
                  {logo
                    ? <img src={logo} alt="" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightbox(logo)} />
                    : <div className="w-full h-full bg-[#1A1A30] flex items-center justify-center text-white font-bold text-2xl rounded-xl">
                        {compName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <h3 className="font-bold text-white text-lg">{compName}</h3>
                  </div>
                  <p className="text-sm text-[#8888A8]">
                    {CAT_LABEL[viewItem.specialty] || viewItem.specialty} • {viewItem.city}
                  </p>
                  <p className="text-xs text-[#555570] mt-0.5">{contactName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400">شركة مقبولة ✓</span>
                    <span className="text-xs text-[#555570]">{createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                </div>
              </div>

              <Sec icon={Building2} title="معلومات الشركة">
                <G2>
                  <IC label="اسم الشركة"      value={compName} />
                  <IC label="جهة التواصل"      value={contactName || '—'} />
                  <IC label="رقم الهاتف"        value={viewItem.phone}    dir="ltr" />
                  <IC label="واتساب"           value={viewItem.whatsapp} dir="ltr" />
                  <IC label="السجل التجاري"     value={commReg || '—'} />
                  <IC label="المدينة"           value={viewItem.city} />
                  <IC label="المنطقة / الحي"    value={viewItem.area || '—'} />
                  <IC label="نطاق الخدمة"      value={svcRadius ? `${svcRadius} كم` : '—'} />
                </G2>
                {viewItem.address && (
                  <div className="mt-2 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-0.5">العنوان التفصيلي</p>
                    <p className="text-sm text-[#C0C0D8]">{viewItem.address}</p>
                  </div>
                )}
              </Sec>

              <Sec icon={Briefcase} title="معلومات الخدمة">
                <G2>
                  <IC label="التخصص"       value={CAT_LABEL[viewItem.specialty] || viewItem.specialty} />
                  <IC label="سنوات النشاط" value={EXP_LABEL[yearsActive] || yearsActive} />
                  <IC label="السعر الأدنى"  value={priceFrom ? `${priceFrom} د.ل` : '—'} />
                  <IC label="السعر الأقصى"  value={priceTo   ? `${priceTo} د.ل`   : '—'} />
                </G2>
                {viewItem.description && (
                  <div className="mt-2.5 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-1">وصف الخدمات</p>
                    <p className="text-sm text-[#C0C0D8] leading-relaxed">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.certifications && (
                  <div className="mt-2 bg-blue-500/10 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> الشهادات والاعتمادات
                    </p>
                    <p className="text-sm text-blue-300 leading-relaxed">{viewItem.certifications}</p>
                  </div>
                )}
              </Sec>

              <Sec icon={Clock} title="التوفر والجدول">
                <G2>
                  <IC label="متاح الآن"
                    value={availNow ? '✓ نعم' : '✗ لا'}
                    valueClass={availNow ? 'text-emerald-400 font-semibold' : 'text-[#555570]'} />
                  <IC label="خدمة الطوارئ 24/7"
                    value={viewItem.emergency ? '✓ نعم' : '✗ لا'}
                    valueClass={viewItem.emergency ? 'text-[#FF7900] font-semibold' : 'text-[#555570]'} />
                  {hoursFrom && <IC label="بداية الدوام" value={hoursFrom} dir="ltr" />}
                  {hoursTo   && <IC label="نهاية الدوام" value={hoursTo}   dir="ltr" />}
                </G2>
                {workDays.length > 0 && (
                  <div className="mt-2.5 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-[#555570] mb-2">أيام العمل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workDays.map(d => (
                        <span key={d} className="bg-white/10 text-[#C0C0D8] text-xs px-2.5 py-1 rounded-lg">{DAY_AR[d] || d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Sec>

              {(viewItem.facebook || viewItem.instagram) && (
                <Sec icon={Facebook} title="التواصل الاجتماعي">
                  {viewItem.facebook && (
                    <div className="bg-white/5 rounded-xl p-3 mb-2">
                      <p className="text-xs text-[#555570] mb-0.5">فيسبوك</p>
                      <a href={viewItem.facebook} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all" dir="ltr">{viewItem.facebook}</a>
                    </div>
                  )}
                  {viewItem.instagram && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-[#555570] mb-0.5">إنستغرام</p>
                      <a href={viewItem.instagram} target="_blank" rel="noreferrer"
                        className="text-sm text-pink-400 hover:underline break-all" dir="ltr">{viewItem.instagram}</a>
                    </div>
                  )}
                </Sec>
              )}

              {workImgs.length > 0 && (
                <Sec icon={Image} title={`معرض الأعمال (${workImgs.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {workImgs.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-white/8 cursor-zoom-in hover:opacity-90"
                        onClick={() => setLightbox(src)} />
                    ))}
                  </div>
                </Sec>
              )}

              <Sec icon={Lock} title="الوثائق الرسمية — للاستخدام الداخلي فقط" titleClass="text-red-400">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">سرية تامة — لا تُشارك مع العملاء</p>
                </div>
                {(commDoc || workLic) ? (
                  <div className="space-y-3">
                    {commDoc && (
                      <div>
                        <p className="text-xs text-[#666680] font-medium mb-1">السجل التجاري / الترخيص</p>
                        <img src={commDoc} alt="commercial"
                          className="w-full max-h-40 rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(commDoc)} />
                      </div>
                    )}
                    {workLic && (
                      <div>
                        <p className="text-xs text-[#666680] font-medium mb-1">رخصة العمل / شهادة الاعتماد</p>
                        <img src={workLic} alt="license"
                          className="w-full max-h-40 rounded-xl border border-white/8 object-cover cursor-zoom-in hover:opacity-90"
                          onClick={() => setLightbox(workLic)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 text-[#555570]">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">لم يتم رفع وثائق رسمية</p>
                  </div>
                )}
              </Sec>

              <button
                onClick={() => handleRevoke(viewItem.id)}
                className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
                إلغاء الموافقة وإعادة إلى قائمة الطلبات
              </button>
            </div>
          )
        })()}
      </FormModal>

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      <FormModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={`تعديل بيانات: ${editItem?.companyName || ''}`}
        submitLabel="حفظ التغييرات"
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        {editItem && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">اسم الشركة *</label>
              <input required value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">جهة التواصل</label>
              <input value={form.contact_name}
                onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">رقم الهاتف</label>
              <input value={form.phone} dir="ltr"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">واتساب</label>
              <input value={form.whatsapp} dir="ltr"
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السجل التجاري</label>
              <input value={form.commercial_reg}
                onChange={e => setForm(f => ({ ...f, commercial_reg: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">التخصص</label>
              <select value={form.specialty}
                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                className="form-input">
                <option value="">اختر التخصص</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">المدينة</label>
              <input value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">المنطقة / الحي</label>
              <input value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">سنوات النشاط</label>
              <select value={form.years_active}
                onChange={e => setForm(f => ({ ...f, years_active: e.target.value }))}
                className="form-input">
                <option value="">اختر</option>
                {Object.entries(EXP_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">نطاق الخدمة (كم)</label>
              <input value={form.service_radius} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, service_radius: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السعر الأدنى (د.ل)</label>
              <input value={form.price_from} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">السعر الأقصى (د.ل)</label>
              <input value={form.price_to} type="number" min="0"
                onChange={e => setForm(f => ({ ...f, price_to: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">وقت بداية الدوام</label>
              <input value={form.hours_from} type="time"
                onChange={e => setForm(f => ({ ...f, hours_from: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">وقت نهاية الدوام</label>
              <input value={form.hours_to} type="time"
                onChange={e => setForm(f => ({ ...f, hours_to: e.target.value }))}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">فيسبوك</label>
              <input value={form.facebook} dir="ltr"
                onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))}
                className="form-input" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="form-label">إنستغرام</label>
              <input value={form.instagram} dir="ltr"
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                className="form-input" placeholder="https://instagram.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">العنوان التفصيلي</label>
              <input value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">الوصف</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="form-input resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-6">
              {[['available_now', 'متاح الآن'], ['emergency', 'طوارئ 24/7']].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                    className="w-4 h-4 accent-[#FF7900]" />
                  <span className="text-sm text-[#C0C0D8]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

function Sec({ icon: Icon, title, titleClass, children }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${titleClass || 'text-[#555570]'}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}
function G2({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
function IC({ label, value, dir, valueClass }) {
  return (
    <div className="bg-white/5 rounded-xl p-3">
      <p className="text-xs text-[#555570] mb-0.5">{label}</p>
      <p className={`font-medium text-white text-sm ${valueClass || ''}`} dir={dir}>{value || '—'}</p>
    </div>
  )
}
