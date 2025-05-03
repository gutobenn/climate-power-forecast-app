# Climate Power Forecast

Climate Power Forecast is an interactive web platform that visualizes renewable energy potential worldwide, from historical data to projections through 2099. Our mission is to empower researchers, planners, and the public to make informed decisions about renewable energy development.

## Table of Contents

- [Features](#features)
- [Introduction Video](#introduction-video)
- [Data Sources & Methodology](#data-sources--methodology)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Team](#team)
- [Future Developments](#future-developments)
- [Contributing](#contributing)
- [License](#license)
- [Data & Notebooks Repository](#data-notebooks-repository)

---

## Features

- 🌍 **Interactive Maps:** Explore global wind energy potential with historical and future projections.
- 📊 **High-Resolution Data:** Surface wind measurements at 3-hour intervals, with comprehensive regional coverage.
- 🔎 **User-Friendly Interface:** Easily navigate and visualize renewable energy data.
- 🕰️ **Time Travel:** View data from the past and projections up to the year 2099.

---

## Introduction Video

Watch our [About Climate Power Forecast video](https://www.youtube.com/watch?v=U5kS1eaH7hI) for a guided tour of the platform, including a demonstration of its main functionalities and a deep dive into our methodology.

---

## Data Sources & Methodology

Climate Power Forecast uses climate model data from the CORDEX project:

- **Historical Data:**  
  `sfcWind_SAM-22_NCC-NorESM1-M_historical_r1i1p1_GERICS-REMO2015_v1_3hr`
- **Future Projections:**  
  `sfcWind_SAM-22_MOHC-HadGEM2-ES_rcp85_r1i1p1_GERICS-REMO2015_v1_3hr`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/climate-power-forecast.git
   cd climate-power-forecast
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
  app/
    about/
      page.js      # About page with project info and video
    ...
  components/
    Header.js      # Site header
    ...
public/
  ...              # Static assets
README.md
...
```

---

## Team

Climate Power Forecast is developed by:
- **Natália de Assis Brasil Weber**
- **Augusto Bennemann**

---

## Future Developments

We are expanding Climate Power Forecast to include:
- ☀️ Solar energy potential maps
- 💧 Hydropower energy potential maps

---

## Contributing

We welcome contributions! Please open an issue or submit a pull request for bug fixes, improvements, or new features.

---

## License

This project is licensed under the MIT License.
