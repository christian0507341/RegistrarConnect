# �� RegistrarConnect - AI-Powered Document Request System

> A comprehensive document requesting system for PHINMA-University of Pangasinan, featuring AI-powered chat assistance, appointment scheduling, and streamlined document request workflows.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Overview

RegistrarConnect is a full-stack application designed to streamline the document request process for students at PHINMA-University of Pangasinan. The system integrates AI-powered chatbot assistance with traditional document management workflows, enabling students to request academic documents efficiently while providing real-time status updates and appointment scheduling.

### Key Capabilities

- 🤖 **AI-Powered Chat Assistant** - Intelligent document request handling with natural language processing
- 📄 **Document Request Management** - OTR, COG, COE, and other academic certificate requests
- 📅 **Appointment Scheduling** - Automated scheduling for document pickup
- 📱 **Cross-Platform Mobile App** - Native Flutter application for iOS and Android
- 🖥️ **Web Admin Dashboard** - Faculty and registrar interface for request management
- 🔔 **Real-time Notifications** - Status updates and important announcements

## ✨ Features

### For Students
- **AI Chat Assistant** - Chat with AI to request documents naturally
- **Document Requests** - Request OTR, COG, COE, and other certificates
- **Receipt Upload** - Upload payment receipts for document processing
- **Receive Appointments** - Automatically receive appointed schedules from faculty for document claiming
- **Status Tracking** - Real-time tracking of document request status
- **Push Notifications** - Stay informed about document status changes

### For Faculty/Registrar
- **Request Management** - Review and process document requests
- **Status Updates** - Update request status through the workflow
- **Receipt Verification** - Verify and approve payment receipts
- **Appointment Scheduling** - Schedule claiming times for students when documents are ready
- **Analytics Dashboard** - View statistics and insights
- **Data Export** - Export request data to CSV/Excel

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2.4
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API**: Django REST Framework
- **AI/ML**: Transformers, PyTorch
- **File Storage**: Local/Pillow for image processing

### Mobile App
- **Framework**: Flutter 3.8+
- **State Management**: BLoC Pattern
- **HTTP Client**: Dio
- **Storage**: Flutter Secure Storage
- **Notifications**: Flutter Local Notifications

### Web Admin
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **HTTP Client**: Axios

## 📁 Project Structure

```
RegistrarConnect/
├── backend/                  # Django backend
│   ├── accounts/            # User authentication
│   ├── document_requests/   # Document request management
│   ├── appointments/        # Appointment scheduling
│   ├── ai/                  # AI chat system
│   │   ├── services/
│   │   │   ├── student_chat_ai.py      # Chat AI
│   │   │   ├── enhanced_chatbot.py     # Enhanced chatbot
│   │   │   └── train/                  # ML training
│   │   └── models/                    # ML models
│   └── common/              # Shared utilities
├── mobile/                  # Flutter mobile app
│   ├── lib/
│   │   ├── core/           # Core services, theme, routing
│   │   └── features/       # Feature modules
│   │       ├── auth/
│   │       ├── chat/
│   │       ├── document_requests/
│   │       ├── appointments/
│   │       └── notifications/
│   └── assets/             # Images, fonts, icons
├── web/                    # React web admin
│   └── registrarconnect-admin/
│       └── src/
│           ├── screens/
│           ├── components/
│           └── services/
├── backups/                # Database backups
├── database/               # Database schemas
├── infra/                  # Infrastructure configs
├── docker/                 # Docker configurations
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── requirements-ml.txt    # ML dependencies
└── docker-compose.yml     # Docker compose config
```

## 🚀 Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Flutter 3.8+
- PostgreSQL 14+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RegistrarConnect
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-ml.txt  # For AI features
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run on device/emulator**
   ```bash
   flutter run
   ```

### Web Admin Setup

1. **Navigate to web directory**
   ```bash
   cd web/registrarconnect-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## 📖 Usage

### For Students

1. **Download Mobile App** - Install the RegistrarConnect app on your mobile device
2. **Sign Up/Login** - Create an account or login with credentials
3. **Chat with AI** - Use the AI chat to request documents naturally
4. **Upload Receipt** - Upload payment receipt after completing payment
5. **Track Status** - Monitor document request status in real-time
6. **Receive Appointment** - Receive appointed claiming schedule from faculty when document is ready

### For Faculty/Registrar

1. **Access Web Dashboard** - Login to the admin dashboard
2. **Review Requests** - View pending document requests
3. **Process Requests** - Update request status through the workflow
4. **Verify Receipts** - Review and approve payment receipts
5. **Schedule Appointments** - Set claiming times for students when documents are ready
6. **Export Data** - Export data for reporting

## 📚 Documentation

### Additional Documentation Files

- **[STUDENT_CHAT_AI_README.md](STUDENT_CHAT_AI_README.md)** - Comprehensive guide to the AI chat system

### API Documentation

API endpoints are organized by domain:

- **Authentication**: `/api/auth/`, `/api/token/`
- **Document Requests**: `/api/document-requests/`
- **Appointments**: `/api/appointments/`
- **AI Chat**: `/api/ai/chat/`
- **Analytics**: `/api/ai/analytics/`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is developed for PHINMA-University of Pangasinan.

## 👥 Authors

- PHINMA-University of Pangasinan Development Team

## 🙏 Acknowledgments

- Django REST Framework
- Flutter Team
- React Community
- Open Source Contributors

---

**Built with ❤️ for PHINMA-University of Pangasinan Students** 
