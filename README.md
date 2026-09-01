# GitAI

> **Explore GitHub. Discover which technologies lead in popularity.**

GitAI is a GitHub repository data science and machine learning platform. It analyzes a representative dataset of **2,520 public GitHub repositories across 10 programming-language ecosystems** to investigate programming-language popularity, cross-ecosystem engagement patterns, and measurable repository characteristics associated with high popularity.

---

## 📌 Project Motivation

GitHub hosts millions of public repositories, creating a vast and complex open-source ecosystem. However, determining empirical patterns across this landscape presents key questions:

- **Which programming languages are popular?**
- **Which programming languages have more highly popular repositories?**
- **What characteristics are associated with repository popularity?**
- **Can measurable repository characteristics accurately classify popularity?**

Analyzing every repository on GitHub is outside the scope of a focused academic study. Therefore, GitAI investigates a structured, balanced cross-sectional dataset:

- **2,520** Public Repositories
- **10** Programming-Language Ecosystems
- **252** Repositories per Language (Stratified Balanced Sampling)

---

## 🔬 Research Questions

### Primary Research Focus
1. **Which programming languages are popular?** (Language representation & baseline engagement)
2. **Which languages have more popular repositories?** (Distributional skewness & upper-tail concentration)

### Secondary Analytical Inquiries
3. **What patterns are visible among highly popular repositories?** (Forks, issues, age, metadata)
4. **Can repository characteristics help explain or classify popularity?** (Supervised ML classification with zero target leakage)

---

## 🚀 What GitAI Provides

The GitAI platform is organized into 5 unified analytical sections:

```
[ GitAI Application ]
       ├── 1. Technology Trends (Cross-Language Trends & Popularity Leaderboard)
       ├── 2. Analyze (Dataset Explorer & Live GitHub URL Machine Learning Classifier)
       ├── 3. Model Benchmark (Candidate Model Evaluation & Confusion Matrix)
       ├── 4. Insights (5 Authoritative Empirical Takeaways from EDA)
       └── 5. Goals (Research Motivation, Methodology, Scope & Objective)
```

### 1. Technology Trends
- **Language Popularity Analysis**: Compares Mean vs. Median stars across the 10 language ecosystems to explain how power-law distributions differ from typical repository baselines.
- **Most Popular Repositories**: Analytical leaderboard highlighting top-starred repositories (`public-apis`, `freeCodeCamp`, `free-programming-books`, `openclaw`, `system-design-primer`) and their structural signals.
- **Community Activity & Licensing**: Evaluates median forks, open issues, and permissive open-source license distributions.

### 2. Analyze (3-State Central Workflow)
- **State 1 — Options**: Choose between exploring the 2,520-repository dataset or analyzing an external public GitHub URL.
- **State 2 — Dataset Explorer**: Filterable, searchable catalog supporting multi-criteria search, star strata filtering (`High >2k`, `Mid 200–2k`, `Low ≤200`), language filters, and 1-click analysis.
- **State 3 — Repository Analysis**:
  - *Part 1*: Core metadata (Stars, Forks, Issues, Age, License, Topics, Days since push).
  - *Part 2*: Cross-sectional dataset percentiles & annual velocity rates.
  - *Part 3*: Machine learning popularity classification ($P(\text{High})$ vs. $P(\text{Lower})$), confidence estimation, and standardized linear feature contributions ($w_i \cdot x_i$).

### 3. Model Benchmark
- Evaluates 4 candidate models on an unseen stratified $20\%$ test partition ($N = 504$).
- Displays Accuracy, Precision, Recall, F1-Score, ROC-AUC, and full confusion matrix error breakdown.

### 4. Insights
- Synthesizes 5 verified statistical discoveries from exploratory data analysis (correlations, distribution dynamics, metadata multipliers).

### 5. Goals
- Articulates the end-to-end data science methodology: **Problem → Scale Limitation → Approach → Empirical Findings → Solution → Study Scope → Objective**.

---

## 📊 Dataset

The dataset contains **2,520 public GitHub repositories** uniformly sampled across **10 programming-language ecosystems** (252 repositories each):

| Language | Repositories | Language | Repositories |
| :--- | :--- | :--- | :--- |
| **Python** | 252 | **Go** | 252 |
| **JavaScript** | 252 | **Rust** | 252 |
| **TypeScript** | 252 | **Ruby** | 252 |
| **Java** | 252 | **PHP** | 252 |
| **C++** | 252 | **C#** | 252 |

### Key Repository Attributes Analyzed
- `full_name`, `owner`, `language`, `description`, `topics`, `license`
- `stars` (Stargazers count), `forks` (Forks count), `open_issues` (Open issues backlog)
- `created_at`, `pushed_at` (Temporal indicators)
- `repo_age_years`, `days_since_last_push` (Derived temporal metrics)
- `forks_per_year`, `issues_per_year` (Annualized engagement velocity)

---

## 🤖 Machine Learning Pipeline

### Classification Task
- **Target Variable**: `popularity_class`
  - **High Popularity ($1$)**: $\text{stars} > 2,000$
  - **Lower Popularity ($0$)**: $\text{stars} \le 2,000$
- **Target Leakage Prevention**: `stars`, `log_stars`, and `stargazers_count` are strictly excluded from all model feature inputs.

### Engineered Input Features ($12$)
1. $\log(1 + \text{forks})$
2. $\log(1 + \text{open\_issues})$
3. $\text{repo\_age\_days}$ & $\text{repo\_age\_years}$
4. $\text{days\_since\_last\_push}$
5. $\text{topic\_count}$ & $\text{has\_topics}$
6. $\text{has\_description}$ & $\text{description\_length}$
7. $\text{has\_license}$
8. $\text{forks\_per\_year}$ & $\text{issues\_per\_year}$
9. One-Hot Encoded `language`

---

## 📈 Model Benchmark Results

Evaluated on the stratified hold-out test set ($N = 504$, $20\%$ partition):

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **Majority Baseline** | 66.67% | 0.00% | 0.00% | 0.0000 | 0.5000 | Baseline |
| **Logistic Regression** | **97.62%** | **94.83%** | **98.21%** | **0.9649** | **0.9954** | **Selected Best** |
| **Random Forest** | 97.02% | 95.27% | 95.83% | 0.9555 | 0.9958 | Candidate |
| **XGBoost** | 97.02% | 95.27% | 95.83% | 0.9555 | 0.9969 | Candidate |

> **Selection Rationale**: Logistic Regression achieved the highest test accuracy ($97.62\%$), superior high-popularity recall ($98.21\%$), zero overfit gap ($0.0000$), and direct linear coefficient interpretability for real-time feature attribution.

---

## 💡 Key Empirical Insights

1. **Severe Power-Law Dynamics ($+4.55$ Skewness)**: Raw engagement metrics exhibit heavy right skewness; logarithmic transformations ($\log(1+x)$) are required for linear modeling.
2. **Forks as Strong Popularity Indicator ($\rho = 0.896$)**: Spearman rank correlation between forks and stars is $0.896$, confirming code branching as a primary marker of engagement.
3. **Repository Age Non-Linearity ($r = -0.052$)**: Age alone does not linearly correlate with popularity; modern high-velocity projects rapidly cross the 2,000-star mark while inactive older repositories plateau.
4. **Metadata Curation Multiplier ($9.9\times$)**: Repositories with structured topic tags achieve a median of **1,985 stars** compared to **200 stars** for untagged repositories.
5. **Maintenance Recency Impact ($w = -1.056$)**: Days since last push has a strong negative log-odds coefficient, confirming that active maintenance significantly elevates high-popularity likelihood.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Recharts, Lucide React
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Requests, Pydantic, Python-Dotenv
- **Data Science & ML**: Pandas, NumPy, Scikit-learn, XGBoost, Joblib, SciPy
- **Graphics**: WebGL Fragment Shaders (Custom Silk Cascade interactive background)

---

## 🏗 Architecture

```
User (Browser)
      │
      ▼
GitAI React Frontend (Vite + Motion + Recharts)
      │
      ▼ HTTP REST API (Proxy: /api)
FastAPI Backend Server (Uvicorn :8000)
      ├── GET /api/health
      ├── GET /api/dataset/summary
      ├── GET /api/dataset/repositories
      ├── GET /api/models/benchmarks
      ├── GET /api/insights
      └── POST /api/analyze
            ├── GitHub REST API v3 (Live Metadata Fetching)
            ├── Feature Extraction Pipeline (Log transforms, deltas, rates)
            └── Scikit-Learn Inference (Logistic Regression Pipeline)
```

---

## 📁 Repository Structure

```text
GitAI/
├── app/
│   ├── frontend/                       # React 19 + TypeScript + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── background/         # WebGL Silk Cascade shader background
│   │   │   │   ├── dashboard/          # NavigationBar, DashboardLayout, and Tabs
│   │   │   │   │   └── tabs/           # TechnologyTrends, Analyze, ModelPerformance, DataInsights, Goals
│   │   │   │   ├── landing/            # LandingHero, RepositoryUrlInput, DashboardPreviewCard
│   │   │   │   └── ui/                 # GlassCard, MetricBadge
│   │   │   ├── hooks/                  # useGitAI data fetching & analysis hook
│   │   │   ├── App.tsx                 # Root spatial view coordinator
│   │   │   ├── main.tsx                # React entry point
│   │   │   └── index.css               # Apple typography scale & design tokens
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server.py                       # FastAPI application & ML inference endpoints
│
├── data/
│   ├── raw/                            # Raw repository datasets collected from GitHub API
│   └── processed/                      # Cleaned & feature-engineered datasets (2,520 records)
│
├── models/
│   ├── best_model.pkl                  # Serialized Logistic Regression scikit-learn pipeline
│   ├── model_comparison.csv            # Candidate architecture test evaluation metrics
│   └── logistic_regression_popularity.pkl
│
├── notebooks/
│   ├── 01_data_collection.ipynb        # GitHub API collection & rate-limit handling
│   ├── 02_eda_and_insights.ipynb       # Exploratory data analysis & statistical distributions
│   ├── 03_feature_engineering.ipynb    # Feature transformations, encoding & leak-free splits
│   └── 04_modeling.ipynb               # Model training, hyperparameter tuning & evaluation
│
├── src/                                # Reusable Python data science modules
│   ├── data_collector.py
│   ├── preprocessor.py
│   ├── model.py
│   └── utils.py
│
├── .env.example                        # Environment variable template
├── .gitignore                          # Git ignore rules for Python, Node, and OS artifacts
├── requirements.txt                    # Python dependencies
└── README.md                           # Comprehensive documentation
```

---

## ⚡ Setup & Installation

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.0.0` or higher
- **npm**: `9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/GitAI.git
cd GitAI
```

### 2. Backend Setup
Create and activate a Python virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

*(Optional)* Configure a GitHub Personal Access Token for higher API rate limits in `.env`:
```bash
cp .env.example .env
# Edit .env and set GITHUB_TOKEN=your_personal_access_token
```

### 3. Frontend Setup
```bash
cd app/frontend
npm install
cd ../..
```

---

## 🏃 Running GitAI

### Development Mode (Recommended)

1. **Start the FastAPI Backend** (Terminal 1):
   ```bash
   ./.venv/bin/uvicorn app.server:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Start the Vite Frontend** (Terminal 2):
   ```bash
   cd app/frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
Build the client bundle:
```bash
cd app/frontend
npm run build
```
The FastAPI backend can serve the compiled production build directly at [http://localhost:8000](http://localhost:8000).

---

## 🔒 Security & Environment Variables

- GitAI uses a server-side proxy for GitHub API queries to ensure **zero client secret exposure**.
- Sensitive files (`.env`, `.env.local`, `*.pyc`, `node_modules/`, `.venv/`) are strictly ignored via `.gitignore`.

---

## 🖼 Screenshots

*(Screenshots of the Landing Page, Technology Trends, Analyze Workflow, Model Benchmark, and Insights can be added here)*

---

## 📄 License

This project was developed for educational and academic data science research purposes.
