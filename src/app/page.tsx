import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  LayoutDashboard,
  Lock,
  Mail,
  MessageCircle,
  Receipt,
  Shield,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Property Management',
    urdu: 'جائیداد کا انتظام',
    description: 'Keep every plot and shop organized with price, size, booking date, client and availability status.',
  },
  {
    icon: UserRound,
    title: 'Client Records',
    urdu: 'گاہک کا مکمل ریکارڈ',
    description: 'Save complete customer records and see their property, payments and outstanding balance in one place.',
  },
  {
    icon: Wallet,
    title: 'Payment Tracking',
    urdu: 'ادائیگی کا حساب',
    description: 'Record installments and receipts while Society Khata automatically calculates the remaining balance.',
  },
  {
    icon: Receipt,
    title: 'Expense Management',
    urdu: 'اخراجات کا انتظام',
    description: 'Track office and development expenses to understand where your society money is being spent.',
  },
  {
    icon: FileText,
    title: 'Clear Reports',
    urdu: 'آسان اور واضح رپورٹس',
    description: 'Get useful sales, collection, outstanding and expense reports whenever you need them.',
  },
  {
    icon: Shield,
    title: 'Roles & Permissions',
    urdu: 'محفوظ رسائی',
    description: 'Give every staff member the right level of access with custom roles and permissions.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your society',
    urdu: 'اپنی سوسائٹی بنائیں',
    description: 'Register your office and create the administrator account in a few simple steps.',
  },
  {
    number: '02',
    title: 'Add properties & clients',
    urdu: 'جائیداد اور گاہک شامل کریں',
    description: 'Enter your plots, shops and customer records in one organized system.',
  },
  {
    number: '03',
    title: 'Manage every rupee',
    urdu: 'ہر روپے کا حساب رکھیں',
    description: 'Record payments and expenses, then view your complete business position instantly.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block text-base font-bold leading-none text-slate-900">Society Khata</span>
              <span className="font-urdu text-[10px] text-slate-500">سوسائٹی کھاتہ</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600">
              How it works
            </a>
            <a href="#why-us" className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600">
              Why us
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-700 sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 sm:px-5"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#f6f5f1] pb-20 pt-28 sm:pb-28 sm:pt-36">
        <div className="absolute bottom-0 right-0 top-0 hidden w-[42%] bg-primary-900 [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] lg:block" />
        <div className="absolute right-6 top-28 hidden origin-right rotate-90 text-[10px] font-bold uppercase tracking-[0.35em] text-primary-300 xl:block">
          Society Khata · Pakistan
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
              <span className="text-xs font-bold text-primary-700">01</span>
              <span className="h-px w-12 bg-slate-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Digital property management
              </span>
            </div>
            <h1 className="text-5xl font-bold leading-[1.03] tracking-[-0.045em] text-slate-900 sm:text-6xl lg:text-7xl">
              Property ka kaam.
              <span className="mt-2 block text-primary-700">
                Khata bilkul saaf.
              </span>
            </h1>
            <p className="mt-7 max-w-xl border-l-2 border-primary-600 pl-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Properties, clients, installments, expenses aur reports ko asaani se manage karein — bina
              registers aur complicated spreadsheets ke.
            </p>
            <p className="font-urdu mt-5 text-base leading-8 text-slate-500">
              اپنی سوسائٹی کا مکمل حساب کتاب آسان، محفوظ اور منظم بنائیں
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-primary-700 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-800"
              >
                Free Account Banayein <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center border border-slate-300 bg-transparent px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-700 hover:text-primary-700"
              >
                Features Dekhein
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
              {['No credit card required', 'Easy setup', 'English + اردو'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary-600" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative overflow-hidden bg-slate-50 shadow-[0_30px_70px_-25px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between bg-primary-900 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Azlan City</p>
                    <p className="text-[9px] text-primary-300">Society Khata</p>
                  </div>
                </div>
                <div className="h-7 w-7 rounded-full bg-primary-700" />
              </div>

              <div className="grid min-h-[390px] grid-cols-[72px_1fr] sm:grid-cols-[116px_1fr]">
                <div className="space-y-2 bg-primary-900 p-2 sm:p-3">
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', active: true },
                    { icon: Building2, label: 'Properties' },
                    { icon: UserRound, label: 'Clients' },
                    { icon: Wallet, label: 'Payments' },
                    { icon: Receipt, label: 'Expenses' },
                    { icon: FileText, label: 'Reports' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-[9px] ${
                        item.active ? 'bg-primary-600 text-white' : 'text-primary-200'
                      }`}
                    >
                      <item.icon className="h-3 w-3 shrink-0" />
                      <span className="hidden sm:block">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden p-3 sm:p-5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Dashboard</p>
                    <p className="text-[9px] text-slate-400">Overview of Azlan City accounts</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      { label: 'Total Plots', value: '248', icon: Building2, color: 'bg-primary-50 text-primary-600' },
                      { label: 'Total Sales', value: '186', icon: TrendingUp, color: 'bg-success-50 text-success-600' },
                      { label: 'Received', value: 'Rs 8.4M', icon: Wallet, color: 'bg-success-50 text-success-600' },
                      { label: 'Expenses', value: 'Rs 1.2M', icon: Receipt, color: 'bg-error-50 text-error-600' },
                      { label: 'Outstanding', value: 'Rs 3.6M', icon: FileText, color: 'bg-warning-50 text-warning-600' },
                      { label: 'Staff Users', value: '08', icon: Users, color: 'bg-accent-50 text-accent-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm">
                        <div className={`mb-2 flex h-6 w-6 items-center justify-center rounded-md ${stat.color}`}>
                          <stat.icon className="h-3 w-3" />
                        </div>
                        <p className="text-[8px] text-slate-400">{stat.label}</p>
                        <p className="text-xs font-bold text-slate-800">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-slate-700">Sales Summary</p>
                      <span className="font-urdu text-[8px] text-slate-400">فروخت خلاصہ</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        ['Total Property Value', 'Rs 42.5M'],
                        ['Total Received', 'Rs 8.4M'],
                        ['Total Outstanding', 'Rs 3.6M'],
                      ].map(([label, value], index) => (
                        <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-2 text-[8px] last:border-0">
                          <span className="text-slate-500">{label}</span>
                          <span className={`font-bold ${index === 1 ? 'text-success-600' : index === 2 ? 'text-warning-600' : 'text-slate-700'}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <p className="max-w-sm text-sm font-bold text-slate-800">
            Designed for housing societies, property dealers and developers across Pakistan
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500">
            <span>Plots & Shops</span>
            <span>Installments</span>
            <span>PKR Reporting</span>
            <span>Urdu Support</span>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-5 border-b-2 border-slate-900 pb-7 md:grid-cols-[1fr_auto]">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">Khata modules / 01—06</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Society management, made simple
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-slate-500 md:text-right">
              Rozana ke tamam zaroori kaam ek simple aur organized system mein manage karein.
            </p>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white p-6 transition-colors hover:bg-primary-50"
              >
                <span className="absolute right-5 top-5 font-mono text-xs font-bold text-slate-300">
                  0{index + 1}
                </span>
                <div className="mb-8 flex h-11 w-11 items-center justify-center bg-primary-600 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{feature.title}</h3>
                <p className="font-urdu mt-1 text-sm text-primary-600">{feature.urdu}</p>
                <p className="mt-4 text-sm leading-6 text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28">
              <span className="text-sm font-bold uppercase tracking-wider text-primary-600">Quick setup</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Registers se digital system tak, sirf 3 steps mein
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
                Society Khata ko use karne ke liye technical knowledge ki zaroorat nahi. Account banayein aur
                apna kaam shuru karein.
              </p>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                Get started now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="border-y border-slate-300">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-5 border-b border-slate-300 p-5 last:border-b-0 sm:p-7">
                  <span className="w-12 shrink-0 text-2xl font-bold text-primary-600">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                    <p className="font-urdu mt-1 text-sm text-primary-600">{step.urdu}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why-us" className="bg-primary-900 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-primary-300">Made for your business</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Aap ka data, aap ka control
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-primary-100/70">
                Har society ka account aur data alag rehta hai. Staff ko sirf wohi access dein jo unke kaam ke
                liye zaroori ho.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Lock, title: 'Secure accounts', text: 'Protected login for your office' },
                  { icon: Shield, title: 'Permission control', text: 'Control what each user can do' },
                  { icon: Users, title: 'Multi-user access', text: 'Keep your whole team connected' },
                  { icon: TrendingUp, title: 'Live overview', text: 'Know your position at a glance' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 border-t border-primary-700 p-4">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-primary-200/60">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l-4 border-primary-400 bg-primary-800 p-7 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-lg shadow-accent-900/20">
                <TrendingUp className="h-7 w-7" />
              </div>
              <p className="mt-7 text-2xl font-bold leading-snug">
                Behtar records. Behtar decisions. Behtar business.
              </p>
              <p className="font-urdu mt-4 text-lg leading-9 text-primary-200">
                مکمل ریکارڈ کے ساتھ بہتر کاروباری فیصلے کریں
              </p>
              <div className="mt-8 border-t border-primary-700/50 pt-7">
                <p className="text-sm leading-6 text-primary-100/70">
                  From first booking to final installment, Society Khata keeps your team and accounts on the same
                  page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid items-center gap-8 border-l-8 border-primary-800 bg-primary-600 px-6 py-12 sm:px-12 md:grid-cols-[1fr_auto] md:text-left">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-100">Ready when you are</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Apna hisaab aaj hi digital banayein</h2>
              <p className="font-urdu mt-4 max-w-xl text-base leading-8 text-primary-100">
                اپنی سوسائٹی کا اکاؤنٹ بنائیں اور مکمل انتظام ایک جگہ سے کریں
              </p>
            </div>
            <div className="md:text-right">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-50"
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs text-primary-100/70">Setup takes only a few minutes</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Need help or a demo?</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">XubrTech se direct rabta karein</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Society Khata ki setup, demo ya kisi bhi sawal ke liye WhatsApp ya email karein.
            </p>
          </div>
          <div>
            <a
              href="mailto:xubrtech@gmail.com"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-primary-600 hover:text-primary-600"
            >
              <Mail className="h-4 w-4" />
              xubrtech@gmail.com
            </a>
          </div>
        </div>
      </section>

      <a
        href="https://wa.me/923160140154"
        target="_blank"
        rel="noreferrer"
        aria-label="Contact XubrTech on WhatsApp"
        title="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-success-700 hover:shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Society Khata</p>
              <p className="font-urdu text-[10px] text-slate-400">سوسائٹی کھاتہ</p>
            </div>
          </div>
          <div className="text-xs leading-5 text-slate-400">
            <p>© {new Date().getFullYear()} Society Khata. Built for property businesses in Pakistan.</p>
            <p>
              Developed by{' '}
              <a
                href="mailto:xubrtech@gmail.com"
                className="font-bold text-primary-600 transition-colors hover:text-primary-700"
              >
                XubrTech
              </a>
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
            <Link href="/login" className="hover:text-primary-600">Login</Link>
            <a href="#features" className="hover:text-primary-600">Features</a>
            <a href="#contact" className="hover:text-primary-600">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
