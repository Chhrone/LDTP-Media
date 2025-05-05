# Loughshinny Dublinn Travel Post (LDTP-Media)

A travel story sharing platform where users can share their travel experiences with the world. This Single Page Application (SPA) allows users to create, view, and interact with travel stories, complete with location data and media.

## 🌟 Features

- **Story Sharing**: Create and share your travel stories with photos and location data
- **Interactive Map**: View stories on an interactive map powered by MapTiler and Leaflet
- **Responsive Design**: Fully responsive design that works on all devices
- **Accessibility**: Skip to content functionality and keyboard navigation support
- **View Transitions**: Smooth page transitions using the View Transition API
- **Authentication**: User registration and login functionality
- **Guest Posting**: Post stories without logging in
- **Dark/Light Theme**: Toggle between dark and light themes
- **Multiple Map Styles**: Choose from different map styles

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript with MVP (Model-View-Presenter) architecture
- **Styling**: CSS with responsive design principles
- **Maps**: MapTiler for styles and Leaflet for interactivity
- **API**: Connects to the Story API at https://story-api.dicoding.dev/v1/
- **Notifications**: SweetAlert2 for user notifications
- **Build Tool**: Vite for fast development and optimized production builds
- **Font**: Inter font family for all text

## 📋 Project Structure

The project follows an MVP (Model-View-Presenter) architecture:

- **Models**: Handle data and API interactions
- **Views**: Render the UI components
- **Presenters**: Connect models and views, handling business logic

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Chhrone/LDTP-Media.git
   cd LDTP-Media
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🌐 API Integration

This project uses the Story API at https://story-api.dicoding.dev/v1/ for all data operations.

## 🎨 UI/UX Features

- **Consistent Card Design**: Story cards with consistent dimensions and text truncation
- **Floating Action Buttons**: Easy access to create story and back-to-top functionality
- **Pagination**: Clean pagination with hover effects
- **Hero Section**: Engaging hero section with call-to-action buttons
- **Keyboard Focus**: Special focus effects for keyboard navigation
- **Animations**: Smooth transitions between pages

## 📱 Responsive Design

The application is fully responsive and works on all devices, from mobile phones to desktop computers.

## 🔒 Authentication

- User registration and login
- Guest posting option
- Profile settings management

## 🗺️ Map Features

- Interactive map showing story locations
- Multiple map styles to choose from
- Location information on hover
- "Locate me" functionality

## 📷 Media Features

- Camera integration using MediaStream
- Image upload with compression options
- Image preview before posting

## 👥 About

This project was developed as part of the Coding Camp 2025 by DBS Foundation.

## 📄 License

Copyright © 2025 Loughshinny Dublinn Travel Post. All Rights Reserved.
