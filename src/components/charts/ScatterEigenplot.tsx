import React, { useState, useMemo } from 'react';
import { CleanSalesRecord } from '../../types/sales';
import { OverallAnalysis } from '../../types/analysis';
import { Info, Sliders, CheckSquare, Square } from 'lucide-react';

interface ScatterEigenplotProps {
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
  highlightedRecordId?: string | null;
  onSelectRecord?: (record: CleanSalesRecord) => void;
  predictionPoint?: { discount: number; units: number } | null;
}

export const ScatterEigenplot: React.FC<ScatterEigenplotProps> = ({
  records,
  analysis,
  highlightedRecordId,
  onSelectRecord,
  predictionPoint,
}) => {
  const [viewMode, setViewMode] = useState<'data-space' | 'standardized-pca'>('data-space');
  const [showRegressionLine, setShowRegressionLine] = useState(true);
  const [showEigen1, setShowEigen1] = useState(true);
  const [showEigen2, setShowEigen2] = useState(true);
  const [showMeanMarker, setShowMeanMarker] = useState(true);
  const [showResidualLines, setShowResidualLines] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<CleanSalesRecord | null>(null);

  const { regression, covariance, eigen } = analysis;

  // Compute SVG plot dimensions and bounds
  const svgWidth = 720;
  const svgHeight = 440;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Domain in data space
  const bounds = useMemo(() => {
    if (records.length === 0) {
      return { minX: 0, maxX: 40, minY: 0, maxY: 80 };
    }
    const xs = records.map(r => r.discount_pct);
    const ys = records.map(r => r.units_sold);
    if (predictionPoint) {
      xs.push(predictionPoint.discount);
      ys.push(predictionPoint.units);
    }
    const rawMinX = Math.min(...xs);
    const rawMaxX = Math.max(...xs);
    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);

    const xMargin = Math.max(5, (rawMaxX - rawMinX) * 0.15);
    const yMargin = Math.max(5, (rawMaxY - rawMinY) * 0.15);

    return {
      minX: Math.max(0, Math.floor(rawMinX - xMargin)),
      maxX: Math.ceil(rawMaxX + xMargin),
      minY: Math.max(0, Math.floor(rawMinY - yMargin)),
      maxY: Math.ceil(rawMaxY + yMargin),
    };
  }, [records, predictionPoint]);

  // Standardized bounds (-3.5 to +3.5)
  const stdBounds = { minX: -3.2, maxX: 3.2, minY: -3.2, maxY: 3.2 };

  // Coordinate transforms
  const toSvgX = (dataX: number, isStd = false) => {
    const curBounds = isStd ? stdBounds : bounds;
    return (
      padding.left +
      ((dataX - curBounds.minX) / (curBounds.maxX - curBounds.minX)) * plotWidth
    );
  };

  const toSvgY = (dataY: number, isStd = false) => {
    const curBounds = isStd ? stdBounds : bounds;
    return (
      padding.top +
      plotHeight -
      ((dataY - curBounds.minY) / (curBounds.maxY - curBounds.minY)) * plotHeight
    );
  };

  // Standard deviations for normalization
  const stdD = Math.sqrt(Math.max(1e-6, covariance.varD));
  const stdS = Math.sqrt(Math.max(1e-6, covariance.varS));

  // Ticks for grid
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.max(5, Math.round((bounds.maxX - bounds.minX) / 6 / 5) * 5 || 5);
    for (let x = Math.ceil(bounds.minX / step) * step; x <= bounds.maxX; x += step) {
      ticks.push(x);
    }
    return ticks;
  }, [bounds]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.max(5, Math.round((bounds.maxY - bounds.minY) / 6 / 5) * 5 || 5);
    for (let y = Math.ceil(bounds.minY / step) * step; y <= bounds.maxY; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [bounds]);

  const stdTicks = [-3, -2, -1, 0, 1, 2, 3];

  // Regression line coordinates in SVG
  const regLineCoords = useMemo(() => {
    if (!regression.isCalculable) return null;
    const x1 = bounds.minX;
    const y1 = regression.intercept + regression.slope * x1;
    const x2 = bounds.maxX;
    const y2 = regression.intercept + regression.slope * x2;
    return {
      x1: toSvgX(x1),
      y1: toSvgY(y1),
      x2: toSvgX(x2),
      y2: toSvgY(y2),
    };
  }, [regression, bounds]);

  // Eigenvector lines in Data Space (scaled by 1.8 * sqrt(lambda))
  const eigenLines = useMemo(() => {
    if (!eigen.isCalculable || !covariance.isCalculable) return null;

    const scale1 = 1.8 * Math.sqrt(Math.max(0, eigen.lambda1));
    const scale2 = 1.8 * Math.sqrt(Math.max(0, eigen.lambda2));

    // Vector 1 through mean (covariance space data coordinates)
    const meanX = covariance.meanD;
    const meanY = covariance.meanS;

    const v1dx = eigen.vector1.x * scale1;
    const v1dy = eigen.vector1.y * scale1;

    const v2dx = eigen.vector2.x * scale2;
    const v2dy = eigen.vector2.y * scale2;

    return {
      mean: { svgX: toSvgX(meanX), svgY: toSvgY(meanY), dataX: meanX, dataY: meanY },
      e1Start: { svgX: toSvgX(meanX - v1dx), svgY: toSvgY(meanY - v1dy) },
      e1End: { svgX: toSvgX(meanX + v1dx), svgY: toSvgY(meanY + v1dy) },
      e2Start: { svgX: toSvgX(meanX - v2dx), svgY: toSvgY(meanY - v2dy) },
      e2End: { svgX: toSvgX(meanX + v2dx), svgY: toSvgY(meanY + v2dy) },
    };
  }, [eigen, covariance, bounds]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Chart toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Discount vs. Sales Joint Distribution &amp; Eigen-Axes
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Overlay
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize the least-squares regression line and principal eigen-directions (Unit I &amp; V)
          </p>
        </div>

        {/* View Mode Toggle: Data space vs Standardized PCA */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('data-space')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'data-space'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Space (Units &amp; %)
          </button>
          <button
            onClick={() => setViewMode('standardized-pca')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'standardized-pca'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standardized PCA (Z-scores)
          </button>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="px-5 py-2.5 bg-slate-50/30 border-b border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-indigo-600" />
          Layers:
        </span>

        {viewMode === 'data-space' && (
          <button
            onClick={() => setShowRegressionLine(p => !p)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            {showRegressionLine ? (
              <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
            ) : (
              <Square className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>Regression Line (ŷ)</span>
          </button>
        )}

        <button
          onClick={() => setShowEigen1(p => !p)}
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
        >
          {showEigen1 ? (
            <CheckSquare className="h-3.5 w-3.5 text-rose-600" />
          ) : (
            <Square className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>Principal Eigenvector (v₁)</span>
        </button>

        <button
          onClick={() => setShowEigen2(p => !p)}
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
        >
          {showEigen2 ? (
            <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Square className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>Orthogonal Eigenvector (v₂)</span>
        </button>

        <button
          onClick={() => setShowMeanMarker(p => !p)}
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
        >
          {showMeanMarker ? (
            <CheckSquare className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Square className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>Dataset Mean Centroid</span>
        </button>

        {viewMode === 'data-space' && (
          <button
            onClick={() => setShowResidualLines(p => !p)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            {showResidualLines ? (
              <CheckSquare className="h-3.5 w-3.5 text-purple-600" />
            ) : (
              <Square className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>Residual Droplines</span>
          </button>
        )}
      </div>

      {/* Main SVG Visualization */}
      <div className="relative p-2 sm:p-4 flex-1 flex flex-col items-center justify-center bg-slate-50/20 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[760px] h-auto select-none overflow-visible"
        >
          <defs>
            {/* Arrow markers for eigenvectors */}
            <marker
              id="arrow-eigen1"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48" />
            </marker>
            <marker
              id="arrow-eigen2"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
            </marker>
          </defs>

          {/* Grid lines */}
          {viewMode === 'data-space' ? (
            <>
              {/* X Grid & Ticks */}
              {xTicks.map(x => {
                const sx = toSvgX(x);
                return (
                  <g key={`x-${x}`}>
                    <line
                      x1={sx}
                      y1={padding.top}
                      x2={sx}
                      y2={padding.top + plotHeight}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={sx}
                      y={padding.top + plotHeight + 18}
                      textAnchor="middle"
                      className="text-[11px] fill-slate-400 font-mono"
                    >
                      {x}%
                    </text>
                  </g>
                );
              })}

              {/* Y Grid & Ticks */}
              {yTicks.map(y => {
                const sy = toSvgY(y);
                return (
                  <g key={`y-${y}`}>
                    <line
                      x1={padding.left}
                      y1={sy}
                      x2={padding.left + plotWidth}
                      y2={sy}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 10}
                      y={sy + 4}
                      textAnchor="end"
                      className="text-[11px] fill-slate-400 font-mono"
                    >
                      {y}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            /* Standardized Grid & Ticks */
            <>
              {stdTicks.map(z => {
                const sx = toSvgX(z, true);
                const sy = toSvgY(z, true);
                return (
                  <React.Fragment key={`std-${z}`}>
                    <line
                      x1={sx}
                      y1={padding.top}
                      x2={sx}
                      y2={padding.top + plotHeight}
                      stroke={z === 0 ? '#94a3b8' : '#e2e8f0'}
                      strokeWidth={z === 0 ? 1.5 : 1}
                      strokeDasharray={z === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={sx}
                      y={padding.top + plotHeight + 18}
                      textAnchor="middle"
                      className="text-[11px] fill-slate-500 font-mono font-medium"
                    >
                      {z > 0 ? `+${z}σ` : `${z}σ`}
                    </text>

                    <line
                      x1={padding.left}
                      y1={sy}
                      x2={padding.left + plotWidth}
                      y2={sy}
                      stroke={z === 0 ? '#94a3b8' : '#e2e8f0'}
                      strokeWidth={z === 0 ? 1.5 : 1}
                      strokeDasharray={z === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={padding.left - 10}
                      y={sy + 4}
                      textAnchor="end"
                      className="text-[11px] fill-slate-500 font-mono font-medium"
                    >
                      {z > 0 ? `+${z}σ` : `${z}σ`}
                    </text>
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Axes border */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Axis Labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 12}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700 uppercase tracking-wider"
          >
            {viewMode === 'data-space'
              ? 'Discount Percentage (%)'
              : 'Standardized Discount (z_D = [D - μ_D] / σ_D)'}
          </text>
          <text
            x={-padding.top - plotHeight / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700 uppercase tracking-wider"
          >
            {viewMode === 'data-space'
              ? 'Units Sold (Sales Volume)'
              : 'Standardized Sales (z_S = [S - μ_S] / σ_S)'}
          </text>

          {/* Residual Droplines */}
          {viewMode === 'data-space' &&
            showResidualLines &&
            regression.isCalculable &&
            records.map(r => {
              const sx = toSvgX(r.discount_pct);
              const syActual = toSvgY(r.units_sold);
              const yHat = regression.intercept + regression.slope * r.discount_pct;
              const syPred = toSvgY(yHat);
              return (
                <line
                  key={`res-${r.id}`}
                  x1={sx}
                  y1={syActual}
                  x2={sx}
                  y2={syPred}
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              );
            })}

          {/* Regression Line */}
          {viewMode === 'data-space' && showRegressionLine && regLineCoords && (
            <g>
              <line
                x1={regLineCoords.x1}
                y1={regLineCoords.y1}
                x2={regLineCoords.x2}
                y2={regLineCoords.y2}
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Equation Label */}
              <text
                x={regLineCoords.x2 - 10}
                y={regLineCoords.y2 - 10}
                textAnchor="end"
                className="text-[11px] font-mono font-semibold fill-indigo-700 bg-white/90"
              >
                {regression.equation}
              </text>
            </g>
          )}

          {/* Principal Eigenvectors (Unit I) */}
          {viewMode === 'data-space' && eigenLines && (
            <g>
              {/* Eigenvector 1 Line (Dominant Direction) */}
              {showEigen1 && (
                <g>
                  <line
                    x1={eigenLines.e1Start.svgX}
                    y1={eigenLines.e1Start.svgY}
                    x2={eigenLines.e1End.svgX}
                    y2={eigenLines.e1End.svgY}
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrow-eigen1)"
                  />
                  <text
                    x={eigenLines.e1End.svgX + 8}
                    y={eigenLines.e1End.svgY}
                    className="text-[11px] font-bold fill-rose-600 font-mono"
                  >
                    v₁ (λ₁={eigen.lambda1.toFixed(1)})
                  </text>
                </g>
              )}

              {/* Eigenvector 2 Line (Orthogonal Direction) */}
              {showEigen2 && (
                <g>
                  <line
                    x1={eigenLines.e2Start.svgX}
                    y1={eigenLines.e2Start.svgY}
                    x2={eigenLines.e2End.svgX}
                    y2={eigenLines.e2End.svgY}
                    stroke="#059669"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-eigen2)"
                  />
                  <text
                    x={eigenLines.e2End.svgX + 8}
                    y={eigenLines.e2End.svgY}
                    className="text-[11px] font-bold fill-emerald-600 font-mono"
                  >
                    v₂ (λ₂={eigen.lambda2.toFixed(1)})
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Standardized PCA View Eigenvector Overlay */}
          {viewMode === 'standardized-pca' && eigen.isCalculable && (
            <g>
              {/* Unit circle reference */}
              <circle
                cx={toSvgX(0, true)}
                cy={toSvgY(0, true)}
                r={(plotWidth / (stdBounds.maxX - stdBounds.minX)) * 1.5}
                fill="none"
                stroke="#cbd5e1"
                strokeDasharray="4 4"
              />

              {showEigen1 && (
                <line
                  x1={toSvgX(-eigen.vector1.x * 2.2, true)}
                  y1={toSvgY(-eigen.vector1.y * 2.2, true)}
                  x2={toSvgX(eigen.vector1.x * 2.2, true)}
                  y2={toSvgY(eigen.vector1.y * 2.2, true)}
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                  markerEnd="url(#arrow-eigen1)"
                />
              )}

              {showEigen2 && (
                <line
                  x1={toSvgX(-eigen.vector2.x * 1.5, true)}
                  y1={toSvgY(-eigen.vector2.y * 1.5, true)}
                  x2={toSvgX(eigen.vector2.x * 1.5, true)}
                  y2={toSvgY(eigen.vector2.y * 1.5, true)}
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrow-eigen2)"
                />
              )}
            </g>
          )}

          {/* Mean Centroid Marker (x_bar, y_bar) */}
          {showMeanMarker && covariance.isCalculable && (
            <g>
              {viewMode === 'data-space' ? (
                <g>
                  <circle
                    cx={toSvgX(covariance.meanD)}
                    cy={toSvgY(covariance.meanS)}
                    r="6"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <circle
                    cx={toSvgX(covariance.meanD)}
                    cy={toSvgY(covariance.meanS)}
                    r="12"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toSvgX(covariance.meanD) + 14}
                    y={toSvgY(covariance.meanS) + 4}
                    className="text-[10px] font-bold fill-amber-700 bg-white/80 font-mono"
                  >
                    Mean Centroid ({covariance.meanD.toFixed(1)}%, {covariance.meanS.toFixed(1)})
                  </text>
                </g>
              ) : (
                <circle
                  cx={toSvgX(0, true)}
                  cy={toSvgY(0, true)}
                  r="6"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Interactive Data Points */}
          {records.map(r => {
            const isHighlighted = highlightedRecordId === r.id;
            const isHovered = hoveredPoint?.id === r.id;

            let sx: number;
            let sy: number;
            if (viewMode === 'data-space') {
              sx = toSvgX(r.discount_pct);
              sy = toSvgY(r.units_sold);
            } else {
              const zd = (r.discount_pct - covariance.meanD) / stdD;
              const zs = (r.units_sold - covariance.meanS) / stdS;
              sx = toSvgX(zd, true);
              sy = toSvgY(zs, true);
            }

            return (
              <g
                key={r.id}
                className="cursor-pointer transition-transform duration-100"
                onClick={() => onSelectRecord && onSelectRecord(r)}
                onMouseEnter={() => setHoveredPoint(r)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={sx}
                  cy={sy}
                  r={isHighlighted || isHovered ? 7 : 5}
                  fill={isHighlighted ? '#e11d48' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth={isHighlighted || isHovered ? 2.5 : 1.5}
                  className="transition-all hover:scale-125"
                />
              </g>
            );
          })}

          {/* Active Prediction Point Marker (if prediction active) */}
          {viewMode === 'data-space' && predictionPoint && (
            <g>
              <circle
                cx={toSvgX(predictionPoint.discount)}
                cy={toSvgY(predictionPoint.units)}
                r="8"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="animate-pulse"
              />
              <text
                x={toSvgX(predictionPoint.discount) + 12}
                y={toSvgY(predictionPoint.units) + 4}
                className="text-[11px] font-bold fill-pink-600 font-mono"
              >
                Prediction ({predictionPoint.discount}%, {predictionPoint.units} units)
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-900/90 text-white p-3 rounded-xl text-xs shadow-xl pointer-events-none z-10 backdrop-blur-xs font-mono space-y-1">
            <div className="font-sans font-bold text-slate-200 border-b border-slate-700 pb-1">
              {hoveredPoint.date}
            </div>
            <div>Discount: <span className="text-indigo-300 font-bold">{hoveredPoint.discount_pct}%</span></div>
            <div>Units Sold: <span className="text-emerald-300 font-bold">{hoveredPoint.units_sold}</span></div>
            {hoveredPoint.predicted_units !== undefined && (
              <div>Predicted: <span className="text-sky-300">{hoveredPoint.predicted_units.toFixed(2)}</span></div>
            )}
            {hoveredPoint.residual !== undefined && (
              <div>Residual: <span className={hoveredPoint.residual >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {hoveredPoint.residual >= 0 ? `+${hoveredPoint.residual.toFixed(2)}` : hoveredPoint.residual.toFixed(2)}
              </span></div>
            )}
          </div>
        )}
      </div>

      {/* Axis-aware mathematical note & legend */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            {viewMode === 'data-space' ? (
              <>
                <strong>Coordinate Note:</strong> Eigenvectors identify directions along which the data varies.
                Plotted in data coordinates centered at centroid (μ_D={covariance.meanD.toFixed(1)}%, μ_S={covariance.meanS.toFixed(1)}).
              </>
            ) : (
              <>
                <strong>Standardized PCA:</strong> Both variables are normalized to standard normal scores (μ=0, σ=1).
                Axes share isotropic aspect scale.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Observations
          </span>
          <span className="flex items-center gap-1 text-indigo-600">
            <span className="w-4 h-0.5 bg-indigo-600"></span> Regression Line
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-600"></span> v₁ (Dominant)
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600"></span> v₂ (Orthogonal)
          </span>
        </div>
      </div>
    </div>
  );
};
