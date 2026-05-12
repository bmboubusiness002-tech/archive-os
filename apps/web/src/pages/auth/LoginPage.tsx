import { useState } from 'react'

type Locale = 'ar' | 'en' | 'fr'

const languages = {
  ar: { label: 'العربية', short: 'AR', dir: 'rtl' },
  en: { label: 'English', short: 'EN', dir: 'ltr' },
  fr: { label: 'Français', short: 'FR', dir: 'ltr' },
} as const

const copy = {
  ar: {
    title: 'منصة أعمال ذكية تدير البيع، المخزون، الصيانة، المال والعملاء من مكان واحد.',
    description: 'BMBOU ERP يساعد أصحاب المتاجر، مراكز الصيانة، فرق المبيعات والإدارة المالية على تشغيل أعمالهم اليومية بوضوح وسرعة وتحكم كامل.',
    chips: ['نقاط البيع', 'المخزون', 'إصلاح الأجهزة', 'المالية', 'العملاء', 'الموظفون', 'التقارير', 'التسعير الذكي'],
    cards: [
      ['تحكم يومي أسرع', 'عمليات موحدة', 'بيع، شراء، مخزون، عملاء وصيانة دون تشتيت بين أدوات متعددة.'],
      ['قرارات أوضح', 'رؤية مالية', 'تتبع الإيرادات، المصاريف، النقد، الديون وقيمة المخزون لحظة بلحظة.'],
      ['خدمة أقوى', 'تجربة عملاء', 'سجل عميل كامل، مدفوعات، إصلاحات، فواتير وتتبع حالة الخدمة.'],
    ],
    access: 'دخول آمن',
    signIn: 'تسجيل الدخول إلى BMBOU ERP',
    signInText: 'ادخل إلى مساحة العمل لإدارة العمليات اليومية، المبيعات، المخزون، الصيانة والتقارير.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    cta: 'دخول مساحة العمل',
    note: 'وضع العرض التجريبي. التالي: المصادقة الحقيقية، الصلاحيات، الفروع وحفظ اللغة.',
    alert: 'تم قبول الدخول التجريبي إلى BMBOU ERP.',
  },
  en: {
    title: 'A smart business platform for sales, inventory, repair, finance, customers, and teams.',
    description: 'BMBOU ERP helps retailers, repair centers, sales teams, and financial operators run daily work with clarity, speed, and full control.',
    chips: ['Point of Sale', 'Inventory', 'Device Repair', 'Finance', 'Customers', 'Employees', 'Reports', 'Smart Pricing'],
    cards: [
      ['Faster daily control', 'Unified operations', 'Sales, purchases, stock, customers, and repair workflows without scattered tools.'],
      ['Clearer decisions', 'Financial visibility', 'Track revenue, expenses, cash, debt, and inventory value in one workspace.'],
      ['Better service', 'Customer experience', 'Customer history, payments, repair tickets, invoices, and service tracking.'],
    ],
    access: 'Secure access',
    signIn: 'Sign in to BMBOU ERP',
    signInText: 'Access your workspace to manage daily operations, sales, inventory, repair, and reports.',
    email: 'Email address',
    password: 'Password',
    remember: 'Keep me signed in',
    forgot: 'Forgot password?',
    cta: 'Enter workspace',
    note: 'Demo mode. Next: real authentication, roles, branches, and language persistence.',
    alert: 'BMBOU ERP demo access accepted.',
  },
  fr: {
    title: 'Une plateforme intelligente pour les ventes, le stock, la réparation, la finance et les clients.',
    description: 'BMBOU ERP aide les commerces, centres de réparation, équipes commerciales et responsables financiers à piloter leurs opérations avec clarté et rapidité.',
    chips: ['Point de vente', 'Stock', 'Réparation', 'Finance', 'Clients', 'Employés', 'Rapports', 'Tarification intelligente'],
    cards: [
      ['Contrôle quotidien', 'Opérations unifiées', 'Ventes, achats, stock, clients et réparations sans outils dispersés.'],
      ['Décisions plus claires', 'Vision financière', 'Suivez revenus, dépenses, trésorerie, dettes et valeur du stock au même endroit.'],
      ['Meilleur service', 'Expérience client', 'Historique client, paiements, tickets de réparation, factures et suivi.'],
    ],
    access: 'Accès sécurisé',
    signIn: 'Connexion à BMBOU ERP',
    signInText: 'Accédez à votre espace pour gérer les opérations, ventes, stocks, réparations et rapports.',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    remember: 'Rester connecté',
    forgot: 'Mot de passe oublié ?',
    cta: 'Entrer dans l’espace',
    note: 'Mode démo. Ensuite : authentification réelle, rôles, branches et préférence de langue.',
    alert: 'Accès démo BMBOU ERP accepté.',
  },
}

export function LoginPage() {
  const [locale, setLocale] = useState<Locale>('ar')
  const [languageOpen, setLanguageOpen] = useState(false)
  const currentLanguage = languages[locale]
  const t = copy[locale]

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.alert(t.alert)
  }

  function selectLanguage(nextLocale: Locale) {
    setLocale(nextLocale)
    setLanguageOpen(false)
  }

  return (
    <main className="login-page" dir={currentLanguage.dir} lang={locale}>
      <section className="login-hero">
        <div className="login-orb login-orb-primary" />
        <div className="login-orb login-orb-secondary" />

        <div className="language-menu">
          <button className="language-trigger" type="button" onClick={() => setLanguageOpen(!languageOpen)}>
            <span className="language-globe">◌</span>
            <span>{currentLanguage.label}</span>
            <strong>{currentLanguage.short}</strong>
          </button>

          {languageOpen && (
            <div className="language-popover">
              {(Object.keys(languages) as Locale[]).map((language) => (
                <button
                  key={language}
                  type="button"
                  className={language === locale ? 'language-item language-item-active' : 'language-item'}
                  onClick={() => selectLanguage(language)}
                >
                  <span>{languages[language].label}</span>
                  <small>{languages[language].short}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="login-brand">
          <div className="brand-mark">B</div>
          <div>
            <p className="eyebrow">BMBOU ERP</p>
            <h1>{t.title}</h1>
            <p className="hero-copy">{t.description}</p>
          </div>
        </div>

        <div className="feature-showcase">
          {t.chips.map((chip) => <div className="feature-pill" key={chip}>{chip}</div>)}
        </div>

        <div className="hero-grid">
          {t.cards.map(([label, value, caption]) => (
            <div className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{caption}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="login-panel-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <p className="eyebrow">{t.access}</p>
            <h2>{t.signIn}</h2>
            <p>{t.signInText}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>{t.email}</span>
              <input type="email" defaultValue="admin@bmbou.local" autoComplete="email" />
            </label>

            <label className="field">
              <span>{t.password}</span>
              <input type="password" placeholder="••••••••" autoComplete="current-password" />
            </label>

            <div className="form-row">
              <label className="remember-row">
                <input type="checkbox" defaultChecked />
                <span>{t.remember}</span>
              </label>
              <button type="button" className="link-button">{t.forgot}</button>
            </div>

            <button className="primary-button" type="submit">
              {t.cta}
              <span>{currentLanguage.dir === 'rtl' ? '←' : '→'}</span>
            </button>
          </form>

          <div className="security-note">
            <span className="pulse-dot" />
            {t.note}
          </div>
        </div>
      </section>
    </main>
  )
}
