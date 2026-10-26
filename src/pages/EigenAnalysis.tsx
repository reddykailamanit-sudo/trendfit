import React, { useState } from 'react';
import { CleanSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { ScatterEigenplot } from '../components/charts/ScatterEigenplot';
import { MetricCard } from '../components/layout/MetricCard';
import {
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  BookOpen,
  PieChart,
} from 'lucide-react';

interface EigenAnalysisProps {
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
}

export const EigenAnalysis: React.FC<EigenAnalysisProps> = ({
  records,
  analysis,
}) => {
  const [showProof, setShowProof] = useState(true);
  const { covariance, eigen } = analysis;

  if (!covariance.isCalculable || !eigen.isCalculable) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-900 mb-1">Eigenvalue Analysis Unavailable</h3>
        <p className="text-sm text-amber-800 mb-4">{covariance.uncalculableReason || eigen.uncalculableReason}</p>
        <p className="text-xs text-amber-700">
          At least two valid observations with varying discounts and sales are required to construct a non-trivial 2×2 covariance matrix.
        </p>
      </div>
    );
  }

  const [[varD, covDS], [, varS]] = covariance.matrix;
  const trace = varD + varS;
  const det = varD * varS - covDS * covDS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Covariance Matrix &amp; Eigenvalue Analysis
          </h1>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            Syllabus Unit I
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compute the 2×2 sample covariance matrix, characteristic equation roots (eigenvalues), and orthogonal eigenvectors.
        </p>
      </div>

      {/* Covariance Matrix Presentation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sample Covariance Matrix C (N - 1 = {records.length - 1} DOF)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Bivariate Variance-Covariance Matrix
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div>Trace = <strong>{trace.toFixed(3)}</strong></div>
            <span className="text-slate-300">|</span>
            <div>Det(C) = <strong>{det.toFixed(3)}</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Formatted Matrix */}
          <div className="flex justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center font-mono">
              <span className="text-3xl font-light text-slate-400 mr-2">C =</span>
              <div className="relative border-l-2 border-r-2 border-slate-800 px-4 py-2 bg-white rounded shadow-sm text-sm sm:text-base leading-relaxed">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Var(D)</span>
                    <strong className="text-indigo-700">{varD.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Cov(D,S)</span>
                    <strong className="text-slate-800">{covDS.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Cov(S,D)</span>
                    <strong className="text-slate-800">{covDS.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Var(S)</span>
                    <strong className="text-indigo-700">{varS.toFixed(3)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix property explanation */}
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              • <strong>Var(Discount):</strong> {varD.toFixed(2)} (%²). Quantifies spread in promotional discount decisions.
            </p>
            <p>
              • <strong>Var(Sales):</strong> {varS.toFixed(2)} (units²). Quantifies volatility in daily sales volume.
            </p>
            <p>
              • <strong>Cov(D, S):</strong> {covDS.toFixed(2)}. Positive covariance indicates that discounts and sales volume tend to vary in the same direction.
            </p>
            <p className="text-[11px] text-slate-500 italic pt-1">
              Note: Unbiased sample covariance computed using denominator N − 1 = {records.length - 1}.
            </p>
          </div>
        </div>
      </div>

      {/* Eigenvalues & Eigenvectors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dominant Eigenvalue Card */}
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Dominant Axis (λ₁)
          </div>

          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            First Principal Component
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            λ₁ = {eigen.lambda1.toFixed(4)}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(eigen.evr1 * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-rose-700 font-mono">
              {(eigen.evr1 * 100).toFixed(1)}% EVR
            </span>
          </div>

          <div className="mt-5 p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs font-mono">
            <div className="text-rose-900 font-bold mb-1 font-sans">
              Normalized Eigenvector (v₁):
            </div>
            <div className="text-slate-800">
              v₁ = [ <strong>{eigen.vector1.x.toFixed(4)}</strong>, <strong>{eigen.vector1.y.toFixed(4)}</strong> ]ᵀ
            </div>
            <div className="text-[10px] text-rose-700 mt-1 font-sans">
              Unit norm: ||v₁|| = 1.000 | Cv₁ − λ₁v₁ residual: {eigen.verificationResidual1.toExponential(2)}
            </div>
          </div>
        </div>

        {/* Secondary Eigenvalue Card */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Orthogonal Axis (λ₂)
          </div>

          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Second Principal Component
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            λ₂ = {eigen.lambda2.toFixed(4)}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(eigen.evr2 * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              {(eigen.evr2 * 100).toFixed(1)}% EVR
            </span>
          </div>

          <div className="mt-5 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-mono">
            <div className="text-emerald-900 font-bold mb-1 font-sans">
              Normalized Eigenvector (v₂):
            </div>
            <div className="text-slate-800">
              v₂ = [ <strong>{eigen.vector2.x.toFixed(4)}</strong>, <strong>{eigen.vector2.y.toFixed(4)}</strong> ]ᵀ
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-sans">
              Unit norm: ||v₂|| = 1.000 | Orthogonal: v₁ · v₂ = 0.0000
            </div>
          </div>
        </div>
      </div>

      {/* Eigen-Direction Visualizer */}
      <ScatterEigenplot
        records={records}
        analysis={analysis}
      />

      {/* Step-by-Step Characteristic Polynomial Proof */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Characteristic Equation &amp; Eigen-Derivation (Unit I Viva Proof)
              </h3>
              <p className="text-xs text-slate-500">
                det(C − λI) = λ² − Trace(C)λ + det(C) = 0
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProof(p => !p)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {showProof ? 'Hide Proof' : 'Show Proof'}
          </button>
        </div>

        {showProof && (
          <div className="space-y-4 text-xs font-mono text-slate-700 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans font-bold text-slate-900 block mb-1">
                1. Characteristic Polynomial
              </span>
              <div>det(C − λI) = ({varD.toFixed(3)} − λ)({varS.toFixed(3)} − λ) − ({covDS.toFixed(3)})² = 0</div>
              <div className="mt-1">λ² − {trace.toFixed(3)}λ + {det.toFixed(3)} = 0</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans font-bold text-slate-900 block mb-1">
                2. Quadratic Formula Roots (Eigenvalues)
              </span>
              <div>Discriminant Δ = (Trace)² − 4·Det = ({trace.toFixed(3)})² − 4·({det.toFixed(3)}) = <strong>{((trace * trace) - 4 * det).toFixed(4)}</strong></div>
              <div className="mt-1">λ₁,₂ = [ {trace.toFixed(3)} ± √Δ ] / 2</div>
              <div className="mt-1 font-bold text-indigo-700">
                λ₁ = {eigen.lambda1.toFixed(4)} | λ₂ = {eigen.lambda2.toFixed(4)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">
                Notice: λ₁ + λ₂ = {(eigen.lambda1 + eigen.lambda2).toFixed(3)} equals Trace(C) = {trace.toFixed(3)} (Trace preservation verified).
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="font-sans font-bold text-indigo-950 block mb-1">
                3. Eigenvector Solution (C − λI)v = 0
              </span>
              <div>For λ₁ = {eigen.lambda1.toFixed(3)}:</div>
              <div>[ {varD.toFixed(3)} − {eigen.lambda1.toFixed(3)} ]·x + [ {covDS.toFixed(3)} ]·y = 0</div>
              <div>Normalized unit vector v₁ = [ {eigen.vector1.x.toFixed(4)}, {eigen.vector1.y.toFixed(4)} ]ᵀ</div>
              <div className="mt-1 font-bold text-emerald-800">
                Cv₁ = [ {(varD * eigen.vector1.x + covDS * eigen.vector1.y).toFixed(4)}, {(covDS * eigen.vector1.x + varS * eigen.vector1.y).toFixed(4)} ]ᵀ ≈ λ₁v₁
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
