import { useState } from 'react'

type Locale = 'ar' | 'en' | 'fr'

type LoginPageProps = {
  onLogin: () => void
}

const languages = {
  ar: { label: 'العربية', short: 'AR', dir: 'rtl' },
  en: { label: 'English', short: 'EN', dir: 'ltr' },
  fr: { label: 'Français', short: 'FR', dir: 'ltr' },
} as const

const copy = {
  ar: {
    badge: 'منصة تشغيل أعمال موحدة',
    title: 'BMBOU ERP يحوّل البيع، المخزون، الصيانة والمالية إلى نظام تشغيل واحد.',
    description: 'واجهة ذكية لأصحاب المتاجر ومراكز الصيانة والفرق المالية: كل عملية بيع، حركة مخزون، تذكرة إصلاح، دفعة عميل وتقرير مالي تظهر في مساحة عمل واحدة واضحة وسريعة.',
    chips: ['بيع أسرع', 'مخزون أدق', 'صيانة منظمة', 'تقارير مالية', 'تتبع العملاء', 'قرارات أذكى'],
    cards: [
      ['تحكم تشغيلي', 'من نقطة البيع إلى المخزون', 'كل عملية تؤثر مباشرة على المخزون، الفواتير، التدفق المالي وسجل العميل.'],
      ['رؤية إدارية', 'أرقام مفهومة لحظة بلحظة', 'إيرادات، مصاريف، ديون، نقد، قيمة المخزون وإشارات ذكية لاتخاذ القرار.'],
      ['خدمة احترافية', 'إصلاحات وعملاء في مسار واحد', 'تذاكر صيانة، أجهزة، قطع غيار، فواتير وتتبع حالة الخدمة من نفس النظام.'],
    ],
    previewTitle: 'نبض العمليات اليومي',
    previewItems: ['بيع جديد خفّض المخزون', 'تذكرة إصلاح تنتظر قطعة', 'إشارة تسعير لمنتج بطيء', 'دفعة عميل جاهزة للتسجيل'],
    access: 'دخول آمن',
    signIn: 'تسجيل الدخول إلى BMBOU ERP',
    signInText: 'ادخل إلى مساحة العمل لإدارة المبيعات، المخزون، الصيانة، العملاء والمالية.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    create: 'إنشاء حساب جديد',
    cta: 'دخول مساحة العمل',
    note: 'وضع العرض التجريبي. التالي: المصادقة الحقيقية، الصلاحيات، الفروع وحفظ اللغة.',
  },
  en: {
    badge: 'Unified business operating platform',
    title: 'BMBOU ERP turns sales, inventory, repair, and finance into one operating system.',
    description: 'A smart workspace for retailers, repair centers, and finance teams: every sale, stock move, repair ticket, customer payment, and financial report lives in one clear interface.',
    chips: ['Faster sales', 'Accurate stock', 'Repair flow', 'Financial reports', 'Customer tracking', 'Smarter decisions'],
    cards: [
      ['Operational control', 'From POS to inventory', 'Every transaction updates stock, invoices, cash flow, and customer history.'],
      ['Management visibility', 'Readable numbers in real time', 'Revenue, expenses, receivables, cash, inventory value, and decision signals.'],
      ['Professional service', 'Repair and customers together', 'Repair tickets, devices, parts, invoices, and service status in one system.'],
    ],
    previewTitle: 'Daily operations pulse',
    previewItems: ['New sale reduced stock', 'Repair ticket waiting for part', 'Pricing signal for slow item', 'Customer payment ready to record'],
    access: 'Secure access',
    signIn: 'Sign in to BMBOU ERP',
    signInText: 'Access your workspace to manage sales, inventory, repair, customers, and finance.',
    email: 'Email address',
    password: 'Password',
    remember: 'Keep me signed in',
    forgot: 'Forgot password?',
    create: 'Create account',
    cta: 'Enter workspace',
    note: 'Demo mode. Next: real authentication, roles, branches, and language persistence.',
  },
  fr: {
    badge: 'Plateforme unifiée de gestion',
    title: 'BMBOU ERP transforme ventes, stock, réparation et finance en un seul système.',
    description: 'Un espace intelligent pour commerces, centres de réparation et équipes financières : ventes, stock, tickets, paiements et rapports dans une interface claire.',
    chips: ['Ventes rapides', 'Stock précis', 'Réparation', 'Rapports financiers', 'Suivi client', 'Décisions claires'],
    cards: [
      ['Contrôle opérationnel', 'Du point de vente au stock', 'Chaque transaction met à jour le stock, les factures, la trésorerie et l’historique client.'],
      ['Vision de gestion', 'Des chiffres lisibles en temps réel', 'Revenus, dépenses, créances, cash, valeur du stock et signaux de décision.'],
      ['Service professionnel', 'Réparation et clients ensemble', 'Tickets, appareils, pièces, factures et statut de service dans un seul système.'],
    ],
    previewTitle: 'Pulse opérationnel quotidien',
    previewItems: ['Nouvelle vente et stock réduit', 'Ticket en attente de pièce', 'Signal prix sur produit lent', 'Paiement client prêt à saisir'],
    access: 'Accès sécurisé',
    signIn: 'Connexion à BMBOU ERP',
    signInText: 'Accédez à votre espace pour gérer ventes, stock, réparation, clients et finance.',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    remember: 'Rester connecté',
    forgot: 'Mot de passe oublié ?',
    create: 'Créer un compte',
    cta: 'Entrer dans l’espace',
    note: 'Mode démo. Ensuite : authentification réelle, rôles, branches et préférence de langue.',
  },
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [locale, setLocale] = useState<Locale>('ar')
  const [languageOpen, setLanguageOpen] = useState(false)
  const currentLanguage = languages[locale]
  const t = copy[locale]

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onLogin()
  }

  function selectLanguage(nextLocale: Locale) {
    setLocale(nextLocale)
    setLanguageOpen(false)
  }

  return (
    <main className="login-page" dir={currentLanguage.dir} lang={locale}>
      <div className="ambient-layer" aria-hidden="true">
        <span className="ambient-dot dot-one" />
        <span className="ambient-dot dot-two" />
        <span className="ambient-dot dot-three" />
      </div>

      <section className="login-hero">
        <div className="language-menu">
          <button className="language-trigger" type="button" onClick={() => setLanguageOpen(!languageOpen)}>
            <span className="language-globe">◎</span>
            <span>{currentLanguage.label}</span>
            <strong>{currentLanguage.short}</strong>
          </button>

          {languageOpen && (
            <div className="language-popover">
              {(Object.keys(languages) as Locale[]).map((language) => (
                <button key={language} type="button" className={language === locale ? 'language-item language-item-active' : 'language-item'} onClick={() => selectLanguage(language)}>
                  <span>{languages[language].label}</span>
                  <small>{languages[language].short}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="login-brand">
          <div className="brand-row">
            <div className="brand-mark">B</div>
            <div>
              <p className="eyebrow">BMBOU ERP</p>
              <p className="hero-badge">{t.badge}</p>
            </div>
          </div>
          <h1>{t.title}</h1>
          <p className="hero-copy">{t.description}</p>
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
        <div className="operations-preview">
          <div className="preview-header">
            <span className="pulse-dot" />
            <strong>{t.previewTitle}</strong>
          </div>
          {t.previewItems.map((item, index) => (
            <div className="preview-row" key={item}>
              <span>0{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>

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

            <button type="button" className="secondary-auth-button">
              {t.create}
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
