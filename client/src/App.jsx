import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      {/* Hero Section — Phase 0 verification */}
      <div className="animate-fade-in">
        <div className="text-center py-20">
          {/* Gradient heading */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Welcome to{' '}
            <span className="text-gradient">SmartClaimr</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
            Intelligent expense reimbursement, simplified.
          </p>

          {/* CTA placeholder */}
          <button className="btn-primary text-base px-8 py-3">
            Get Started →
          </button>
        </div>

        {/* Verification Cards — proves Tailwind works */}
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          {[
            {
              icon: '💸',
              title: 'Submit Expenses',
              desc: 'Multi-currency support with OCR receipt scanning',
              color: 'from-brand-500/10 to-brand-600/5',
            },
            {
              icon: '✅',
              title: 'Smart Approvals',
              desc: 'Configurable multi-level approval workflows',
              color: 'from-success-500/10 to-success-600/5',
            },
            {
              icon: '🧠',
              title: 'AI Suggestions',
              desc: 'Intelligent flags for duplicates and anomalies',
              color: 'from-warning-500/10 to-warning-600/5',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4`}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-sm text-slate-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default App;
