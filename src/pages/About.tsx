import React from 'react';
import {
  BookOpen,
  GraduationCap,
  GitCommit,
  Compass,
  Layers,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export const About: React.FC = () => {
  const workflowSteps = [
    { title: '1. Import Data', desc: 'Accept client CSV with dates, discounts, and sales.' },
    { title: '2. Clean & Validate', desc: 'Filter corrupted rows, detect duplicates, handle bounds.' },
    { title: '3. Fit Regression', desc: 'Compute least-squares slope (b) and intercept (a).' },
    { title: '4. Pearson Correlation', desc: 'Evaluate direction and strength of linear association (r).' },
    { title: '5. Covariance Matrix', desc: 'Construct sample 2×2 matrix with (N - 1) denominator.' },
    { title: '6. Eigen-Decomposition', desc: 'Solve characteristic polynomial for λ₁, λ₂, and v₁, v₂.' },
    { title: '7. Predict & Simulate', desc: 'Generate forecasts and scenario pricing simulations.' },
  ];

  const vivaQuestions = [
    {
      q: 'Why does the least-squares regression line minimize vertical residuals rather than perpendicular distance?',
      a: 'Simple linear regression treats the discount percentage as an independent explanatory variable (x) and units sold as a dependent random variable (y). We aim to minimize the sum of squared errors in predicting y: SSE = Σ (y_i - ŷ_i)². In contrast, minimizing perpendicular distances corresponds to Total Least Squares / Orthogonal Distance Regression (closely linked to PCA).',
    },
    {
      q: 'Why are the eigenvalues of the sample covariance matrix guaranteed to be real?',
      a: 'The sample covariance matrix C is real and symmetric (Cov(D, S) = Cov(S, D)). By the Spectral Theorem for symmetric real matrices, all eigenvalues of a real symmetric matrix are guaranteed to be real, and their corresponding eigenvectors are mutually orthogonal.',
    },
    {
      q: 'Why is the sample covariance calculated with denominator (n - 1) instead of n?',
      a: 'Dividing by (n - 1) provides Bessel\'s correction, yielding an unbiased estimator of the population covariance. When sample means (x̄ and ȳ) are substituted for unknown population means, one degree of freedom is consumed.',
    },
    {
      q: 'What is the physical meaning of the first eigenvector v₁ in this application?',
      a: 'The leading eigenvector v₁ indicates the principal direction of maximum joint variance in the 2D [discount, sales] space. The corresponding eigenvalue λ₁ quantifies the magnitude of variance concentrated along that axis.',
    },
    {
      q: 'Does a strong positive correlation (r > 0.95) prove that discounts cause higher sales?',
      a: 'No. Correlation establishes mathematical linear co-variation, but does not prove causation. Unobserved confounding variables (e.g. holiday marketing, clearance of seasonal goods, weekend foot traffic) could independently influence both discounts and sales.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-xs font-semibold mb-4">
            <GraduationCap className="h-4 w-4" />
            Applied Mathematics &amp; Data Science Project
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            TrendFit — Sales Pattern &amp; Curve Fitting
          </h1>
          <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
            Discover the Pattern. Understand the Data. Predict the Trend.
          </p>
          <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Built as an end-to-end mathematical analytics tool demonstrating <strong>Unit I (Eigenvalues and Eigenvectors)</strong> and <strong>Unit V (Least Squares, Correlation and Regression)</strong> applied to small retail pricing and sales patterns.
          </p>
        </div>
      </div>

      {/* Syllabus Alignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unit V Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Syllabus Unit V
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                Least Squares, Correlation &amp; Regression
              </h3>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Least-Squares Line Fitting:</strong> Fits ŷ = a + bx by minimizing Σ(yᵢ − ŷᵢ)².</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Slope &amp; Intercept Formulas:</strong> b = SSxy / SSxx, a = ȳ − bx̄.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Pearson Correlation (r):</strong> r = SSxy / √(SSxx · SSyy) with strength categorization.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Goodness of Fit &amp; Residuals:</strong> SSE, SST, SSR, R², and RMSE spread analysis.</span>
            </li>
          </ul>
        </div>

        {/* Unit I Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Syllabus Unit I
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                Eigenvalues &amp; Eigenvectors
              </h3>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>2×2 Covariance Matrix:</strong> Symmetric matrix C with (n − 1) denominator.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Characteristic Polynomial:</strong> det(C − λI) = λ² − Trace(C)λ + det(C) = 0.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Normalized Eigenvectors:</strong> Unit vectors v₁, v₂ satisfying Cv = λv.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Explained Variance Ratio:</strong> EVR = λᵢ / (λ₁ + λ₂), identifying principal axes.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Application Workflow Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-base mb-2">
          End-to-End Application Workflow
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          How data flows from raw shop CSV input to statistical synthesis and interactive predictions
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-indigo-700 block mb-1">
                  {step.title}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* College Project Viva Preparation Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Viva &amp; Presentation Defense Cheat-Sheet
            </h3>
            <p className="text-xs text-slate-500">
              Key mathematical concepts and answers frequently asked during project demonstrations
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {vivaQuestions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 font-sans flex items-start gap-2">
                <span className="text-indigo-600 font-mono">Q{idx + 1}:</span>
                <span>{q.q}</span>
              </div>
              <p className="text-slate-600 pl-6 leading-relaxed">
                {q.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
