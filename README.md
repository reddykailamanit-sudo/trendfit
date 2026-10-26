# TrendFit — Sales Pattern & Curve Fitting Application
> **"Discover the Pattern. Understand the Data. Predict the Trend."**

An interactive, mathematically rigorous web application built to analyze retail promotional discounts, fit least-squares regression lines, calculate Pearson correlation, and compute the bivariate covariance matrix with its corresponding eigenvalues and eigenvectors.

Designed for college project presentations, vivas, and small business retail pattern discovery.

---

## 1. Syllabus & Academic Alignment

This project directly implements and visualizes topics from:

### **Unit V — Least Squares, Correlation and Regression**
* **Least-Squares Line Fitting:** Minimizes the vertical sum of squared residuals $\text{SSE} = \sum (y_i - \hat{y}_i)^2$.
* **Linear Regression Model:** $\hat{y} = a + bx$
  * Slope: $b = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2} = \frac{SS_{xy}}{SS_{xx}}$
  * Intercept: $a = \bar{y} - b\bar{x}$
* **Pearson Correlation Coefficient ($r$):**
  $$r = \frac{SS_{xy}}{\sqrt{SS_{xx} \cdot SS_{yy}}}$$
  Evaluated with qualitative thresholds ($|r| \ge 0.70$ strong, $0.30 \le |r| < 0.70$ moderate, $|r| < 0.30$ weak).
* **Goodness of Fit ($R^2$) & Residuals:**
  * Total Sum of Squares: $\text{SST} = \sum (y_i - \bar{y})^2$
  * Sum of Squared Errors: $\text{SSE} = \sum (y_i - \hat{y}_i)^2$
  * Regression Sum of Squares: $\text{SSR} = \text{SST} - \text{SSE}$
  * $R^2 = 1 - \frac{\text{SSE}}{\text{SST}}$
  * Root Mean Squared Error: $\text{RMSE} = \sqrt{\frac{\text{SSE}}{n}}$

### **Unit I — Eigenvalues and Eigenvectors**
* **Observation Vector:** $z_i = [\text{discount\_pct}_i, \text{units\_sold}_i]^T$
* **Sample 2×2 Covariance Matrix ($N - 1$ degrees of freedom):**
  $$C = \begin{bmatrix} \text{Var}(D) & \text{Cov}(D,S) \\ \text{Cov}(D,S) & \text{Var}(S) \end{bmatrix}$$
  where:
  $$\text{Var}(D) = \frac{\sum (D_i - \bar{D})^2}{n - 1}, \quad \text{Var}(S) = \frac{\sum (S_i - \bar{S})^2}{n - 1}, \quad \text{Cov}(D,S) = \frac{\sum (D_i - \bar{D})(S_i - \bar{S})}{n - 1}$$
* **Characteristic Polynomial:**
  $$\det(C - \lambda I) = 0 \iff \lambda^2 - \text{Trace}(C)\lambda + \det(C) = 0$$
* **Eigenvalues ($\lambda_1, \lambda_2$):**
  $$\lambda_{1,2} = \frac{(a+d) \pm \sqrt{(a-d)^2 + 4b^2}}{2}$$
  Guaranteed real and non-negative by the Spectral Theorem for real symmetric matrices.
* **Normalized Eigenvectors ($v_1, v_2$):**
  $$(C - \lambda_i I)v_i = 0, \quad \|v_i\| = 1.0, \quad v_1 \cdot v_2 = 0$$
* **Explained Variance Ratio (EVR):**
  $$\text{EVR}_i = \frac{\lambda_i}{\lambda_1 + \lambda_2}$$
* **Axis-Aware Visualization:** Overlays the principal eigen-directions in data coordinates centered at centroid $(\bar{D}, \bar{S})$, with an alternative standardized PCA projection view ($z$-scores).

---

## 2. Key Application Modules

1. **Overview Dashboard:** Top 6 real-time KPI metric cards ($n$, cumulative units sold, daily average $\bar{y}$, average promo $\bar{x}$, Pearson $r$, model $R^2$), interactive joint scatterplot, daily sales timeline with moving average, discount histogram, and automated business insights.
2. **Sales Data Table:** Complete searchable, sortable, filterable tabular dataset with observed units, predicted units ($\hat{y}$), residuals ($e_i = y_i - \hat{y}_i$), row exclusion toggles, and CSV exports.
3. **Trend Analysis:** Day-of-week sales volume breakdowns, moving average windows (2 to 7 days), and median-split promotion tier comparisons.
4. **Correlation & Regression:** Exact formula breakdowns, visual gradient correlation gauge, and a step-by-step worked mathematical derivation using the active dataset.
5. **Eigenvalue Analysis:** Formatted 2×2 matrix display, characteristic equation solver, eigenvalue cards with EVR progress bars, verification residuals ($\|Cv - \lambda v\| \approx 0$), and eigen-axes overlay.
6. **Predictions & Scenario Planner:** Dynamic slider (0% to 60%), direct numeric discount input, real-time sales forecasting, extrapolation boundary alerts, and multi-tier revenue scenario planning.
7. **About the Project:** Problem statement, full mathematical concept summary, end-to-end data workflow diagram, and 5 essential college viva defense Q&A.

---

## 3. Project Directory Structure

```text
curve-fitting-app/
├── public/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── DailySalesChart.tsx          # Timeline line chart with SMA
│   │   │   ├── DiscountDistributionChart.tsx# Discount frequency histogram
│   │   │   └── ScatterEigenplot.tsx         # Axis-aware scatter + eigen-axes + PCA
│   │   ├── layout/
│   │   │   ├── MetricCard.tsx               # Metric display with tooltips
│   │   │   ├── Navbar.tsx                   # Branding, dataset status & actions
│   │   │   └── Sidebar.tsx                  # 7-module navigation drawer
│   │   ├── report/
│   │   │   └── PrintableReport.tsx          # Print / PDF report generator
│   │   └── upload/
│   │       └── CsvUploaderModal.tsx         # Drag-and-drop CSV validation modal
│   ├── hooks/
│   │   └── useSalesData.ts                  # Reactive dataset & math state hook
│   ├── lib/
│   │   ├── correlation.ts                   # Pearson r calculation & interpretation
│   │   ├── covariance.ts                    # Sample 2x2 covariance matrix (n-1)
│   │   ├── csvParser.ts                     # RFC-compliant CSV parser
│   │   ├── dataCleaning.ts                  # Validation, duplicate & bounds checks
│   │   ├── eigenAnalysis.ts                 # Eigenvalues, eigenvectors & EVR
│   │   ├── exportUtils.ts                   # CSV and HTML report export utilities
│   │   ├── insights.ts                      # Dynamic business insights generator
│   │   ├── predictions.ts                   # Sales forecasting & extrapolation checks
│   │   ├── regression.ts                    # Least-squares slope, intercept & R²
│   │   └── sampleData.ts                    # Realistic demo retail dataset
│   ├── pages/
│   │   ├── About.tsx                        # Problem statement & viva guide
│   │   ├── EigenAnalysis.tsx                # Unit I Eigen-decomposition page
│   │   ├── Overview.tsx                     # Executive overview dashboard
│   │   ├── Predictions.tsx                  # Interactive sales prediction simulator
│   │   ├── RegressionAnalysis.tsx           # Unit V Least-squares regression page
│   │   ├── SalesData.tsx                    # Searchable data table & residual viewer
│   │   └── TrendAnalysis.tsx                # Day-of-week & promotional tier trends
│   ├── tests/
│   │   ├── covariance.test.ts               # Covariance matrix unit tests
│   │   ├── eigenAnalysis.test.ts            # Eigen-decomposition & fixture tests
│   │   └── regression.test.ts               # Regression, correlation & prediction tests
│   ├── types/
│   │   ├── analysis.ts                      # Statistical model types
│   │   └── sales.ts                         # Sales record & dataset types
│   ├── App.tsx                              # Root application component
│   ├── index.css                            # Tailwind CSS directives & custom styles
│   └── main.tsx                             # Application entry point
├── index.html                               # HTML5 shell with Inter & JetBrains Mono
├── package.json                             # Dependencies & scripts
├── postcss.config.js                        # PostCSS configuration
├── tailwind.config.js                       # Tailwind CSS color tokens
├── tsconfig.app.json                        # TypeScript React configuration
├── tsconfig.json                            # Root TypeScript configuration
└── vite.config.ts                           # Vite build configuration
```

---

## 4. Installation & Local Execution

### Prerequisites
* **Node.js:** v18.0.0 or higher (Tested on Node v20.20.2)
* **Package Manager:** `npm` or `yarn`

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated mathematical tests (Vitest)
npm test

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://127.0.0.1:5173/
```

### Production Build
To validate or produce the optimized bundle:
```bash
npm run build
npm run preview
```

---

## 5. Automated Unit Tests

Automated testing is configured using **Vitest**. All mathematical formulas, sample covariance calculations, and analytical edge cases are tested:

```text
✓ src/tests/covariance.test.ts (2 tests)
  - Computes 2x2 sample covariance with n - 1 denominator
  - Handles edge cases (fewer than 2 records)

✓ src/tests/eigenAnalysis.test.ts (4 tests)
  - Calculates real eigenvalues in descending order with trace conservation
  - Produces unit-length, orthogonal eigenvectors satisfying C*v = lambda*v
  - Handles known analytical 2x2 matrix fixture: C = [[4, 2], [2, 1]] -> lambda1=5, lambda2=0
  - Handles diagonal covariance matrix (zero covariance)

✓ src/tests/regression.test.ts (7 tests)
  - Calculates slope and intercept accurately for standard dataset
  - Calculates Pearson correlation coefficient correctly
  - Handles edge case: zero records
  - Handles edge case: single record
  - Handles edge case: constant discount (zero variance in X)
  - Handles edge case: constant units sold (zero variance in Y)
  - Computes sales predictions and flags extrapolation correctly

Total: 13 passed (100% test pass rate)
```

---

## 6. Supported CSV Format

The application accepts standard comma-delimited CSV files with column headers:

```csv
date,discount_pct,units_sold
2026-10-01,5,20
2026-10-02,10,27
2026-10-03,15,32
2026-10-04,20,41
2026-10-05,25,46
2026-10-06,10,29
2026-10-07,30,53
2026-10-08,15,35
```

The CSV importer includes flexible header matching (e.g. `discount`, `discount_percent`, `units`, `sales`), bounds checking ($0 \le \text{discount} \le 100$, $\text{units} \ge 0$ as integers), date validation, duplicate detection, and download of a ready-to-use template.

---

## 7. Viva Q&A Cheat Sheet

| Question | Answer Summary |
| :--- | :--- |
| **Why least-squares vertical residuals?** | We model units sold ($y$) as a function of discount ($x$). Vertical distance represents error in the predicted variable $\hat{y}$. |
| **Why $n - 1$ in covariance?** | Bessel's correction removes negative bias when calculating sample variance using the sample mean instead of the unknown true population mean. |
| **Why are eigenvalues guaranteed real?** | Covariance matrices are real and symmetric ($C^T = C$). By the Spectral Theorem, all eigenvalues of real symmetric matrices are strictly real. |
| **What does $v_1$ physically represent?** | The dominant eigenvector $v_1$ is the principal direction in the 2D plane along which joint discount and sales variation is maximized. |
| **Does high correlation prove causality?** | No. Correlation measures linear association, not causation. Markdowns may co-occur with holiday shopping or clearance cycles. |

---

## 8. License
Developed for educational, university presentation, and portfolio demonstration purposes. Open source under the MIT License.
