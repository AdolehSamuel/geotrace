# GeoTrace – IP Address & Domain Location Tracker

GeoTrace is a simple and fun web app that lets you look up the location of any IP address or website (domain name). It shows you info like the city, country, timezone, and ISP, and even puts a pin on the map!

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Challenges & Solutions](#challenges--solutions)
- [Credits](#credits)

---

## Features

- Look up the location of any IP address or website
- See details like city, country, timezone, and ISP
- View the location on an interactive map
- Search for any IP or domain using the search bar
- Clean, responsive design that works on phones and computers

---

## Tech Stack

- **HTML**
- **CSS**
- **JavaScript**
- **[Leaflet.js](https://leafletjs.com/)** for the map

---

## Getting Started

### Installation

To try out **GeoTrace** on your own computer:

#### 1. Clone the repository

```sh
git clone https://github.com/AdolehSamuel/geotrace.git
cd geotrace
```

#### 2. (No dependencies needed!)

GeoTrace is just HTML, CSS, and Javascript. You don't need to install anything for the frontend.

---

### Running the Application

Just open the `index.html` file in your browser:

```sh
open index.html
```

Or, right-click and select “Open with…” in your favorite browser.

---

## How It Works

- When you load the page, GeoTrace asks the backend proxy for info about your current IP address (the one your internet provider gives you).
- You can also type any IP address or website (like `google.com`) into the search bar and hit enter.
- The app sends your search to a backend proxy server, which then talks to a third-party geolocation API (geo.ipify.org).
- The backend sends back info about the IP or domain, and GeoTrace shows it on the page and on the map.
- **Note:** GeoTrace does NOT use your device's GPS or the browser's Geolocation API. It only looks up info based on IP addresses or domain names.

---

## Deployment

You can put GeoTrace on any static web server (like GitHub Pages, Netlify or Vercel):

1. Upload everything in the `geotrace/` folder to your web server.
2. Open `index.html` in your browser.

---

## Challenges & Solutions

### Challenge 1: CORS (Cross-Origin Resource Sharing)

- **Problem:** Browsers block some requests to outside APIs for security reasons.
- **Solution:** GeoTrace uses a backend proxy server to fetch data from the geolocation API, so the frontend never runs into CORS issues.

### Challenge 2: Making the Map Easy to Use

- **Problem:** Showing the right location and updating the map smoothly.
- **Solution:** Used Leaflet.js, a simple JavaScript library for interactive maps, and made sure the map updates whenever you search.

---

## Credits

- **Map Library:** [Leaflet.js](https://leafletjs.com/)
- **Geolocation API:** [geo.ipify.org](https://geo.ipify.org/)
- **Icons & Images:** Custom assets in `geotrace/images/`

---

If you have ideas to make GeoTrace better, or if you find a bug, feel free to contribute or open an issue! 🚀
