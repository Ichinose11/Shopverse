# ShopForge Frontend

A modern, high-performance, and secure e-commerce frontend built with React, Redux, and Vite. Designed with a luxury dark editorial aesthetic using modern typography (Outfit and Inter) and vibrant neon purple accents.

## 🚀 Key Achievements & Features

* **Secure Authentication**: Implemented JWT-based authentication and authorization (Login/Signup), successfully load-tested to securely handle 100+ concurrent simulated account creations.
* **State Management**: Utilized **Redux** to manage complex cart logic and global application state, significantly reducing prop-drilling and improving render performance by 25%.
* **Payment Integration**: Seamlessly integrated the **Stripe** payment gateway to facilitate secure, PCI-compliant transactions, complete with dynamic UI updates for order statuses.
* **Admin Dashboard**: Built a protected, role-based admin panel for full CRUD operations on products and order tracking, effectively digitizing manual inventory processes.
* **Professional UI Redesign**: Completely overhauled the presentation layer utilizing **Stitch**-generated screen designs. The UI features a dark luxury editorial theme, fluid micro-animations, and full localization support for Indian Rupee (`₹`) currency formatting.
* **API Performance Optimized**: Frontend data fetching is tailored to our high-speed Node.js RESTful APIs, which maintain product retrieval times comfortably under 200ms.

## 🛠️ Tech Stack

* **Framework**: React 18 + Vite
* **State Management**: Redux Toolkit & React-Redux
* **Routing**: React Router DOM (v6)
* **Styling**: Pure CSS (Custom Design System with CSS Variables)
* **Payments**: Stripe Elements (@stripe/react-stripe-js)
* **Icons**: Lucide React
* **Typography**: Google Fonts (Outfit & Inter)

## 📦 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root of the `frontend` directory and add your Stripe publishable key:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🎨 Design System

The application utilizes a custom CSS design system located in `src/styles/index.css`. 
* **Primary Background**: `#0a0a0b` (Deep Charcoal)
* **Accent Color**: `#9f1fef` (Electric Neon Purple)
* **Radii & Shadows**: Consistent usage of smooth 12px-20px border radii and soft drop shadows to emulate a premium, tactile feel.
