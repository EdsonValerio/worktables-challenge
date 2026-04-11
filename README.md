# Worktables - Full Stack Developer Assessment 🌍

This repository contains the complete solution for the Full Stack Developer assessment at Worktables. The application consists of a React/TypeScript front-end integrated with the monday.com Work OS, and a Node.js/Express back-end that provides real-time weather data.

## Key Features & Overdelivery

While adhering strictly to the core requirements, I implemented several architectural and UX enhancements to deliver a production-ready product:

* **monday.com SDK Integration:** Fetches country data directly from the "World Countries" board safely.
* **Interactive World Map (Bonus):** Integrated `react-leaflet` to render a fully interactive world map. Countries are displayed as dynamic circle markers based on their precise coordinates.
* **Advanced Filtering:** Real-time search by country name and a dynamic Continent Dropdown filter (extracted automatically from the board's region data).
* **Rich Weather Modal:** A highly detailed modal featuring:
  * High-res flags fetched via `restcountries.com` (No API key required).
  * Demographic statistics extracted from the monday.com board.
  * Real-time climate conditions fetched from the custom Node.js back-end.
* **Vibe Design System:** Fully implemented using monday.com's modern `@vibe/core` component library (Modals, Dropdowns, Inputs, Loaders, and Typography) for a native look and feel.
* **Fully Responsive:** Uses a modern tab-based navigation system on mobile devices to switch between the Map and the List seamlessly without breaking the layout.

## Technologies Used

### Front-end
* React 18 + Vite
* TypeScript
* `@vibe/core` (monday.com UI components)
* `monday-sdk-js`
* `react-leaflet` & `leaflet` (Map rendering)

### Back-end
* Node.js + Express
* TypeScript
* Axios
* `dotenv` (Environment variables management)

## How to Run the Project Locally

This is a Monorepo containing both the Front-end and Back-end architectures.

### 1. Back-end Setup
a. Open a terminal and navigate to the backend folder:
   `cd backend`
b. Install dependencies:
   `npm install`
c. Create a `.env` file in the `backend` folder and add your WeatherAPI key and Port:
```env
WEATHER_API_KEY=your_weatherapi_key_here
PORT=3001
```
d. Start the development server:
   `npm run dev`
   (The API will be running on http://localhost:3001)

### 2. Front-end Setup

a. Open a new terminal and navigate to the frontend folder:
   `cd frontend`
b. Install dependencies:
   `npm install`
c. Start the Vite development server:
   `npm run dev`
   (The UI will be running on http://localhost:3000)

### 3. monday.com Visualization

To see the app properly integrated with the monday.com environment:

a. Ensure both the Front-end and Back-end servers are running.
b. Go to the "World Countries" board on the provided Worktables monday.com account.
c. Open the DEVELOP HERE Board View.


Edson Valerio

www.linkedin.com/in/edson-v/

Edsonvalerio3225@gmail.com
