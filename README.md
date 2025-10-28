# RegistrarConnect - AI-Powered Appointment System

A comprehensive document request and appointment management system for universities, featuring AI-powered chatbot, automated scheduling, and role-based workflows for students, faculty, registrar, and finance staff.

## 🌟 Features

### Core Functionality
- **Document Request Management**: Request OTR, COG, COE, and custom documents
- **AI-Powered Chatbot**: Intelligent document request assistant with context understanding
- **Automated Appointment Scheduling**: Intelligent time slot assignment for document claiming
- **Role-Based Access Control**: Separate interfaces for Students, Faculty, Registrar, Finance, and Admin
- **Receipt Upload**: Secure payment verification with file upload
- **Real-Time Notifications**: System-wide notification system
- **Multi-Platform**: Web admin portal and mobile app (Flutter)

### Document Types Supported
- **OTR** (Official Transcript of Records): Complete academic transcript
- **COG** (Certificate of Grades): Semester-specific grade certificates
- **COE** (Certificate of Enrollment): Current enrollment verification
- **Others**: Custom certificates (Good Moral, Clearance, etc.)

## 🏗️ Architecture

### Technology Stack
- **Backend**: Django REST Framework 5.2.4
- **Database**: PostgreSQL
- **AI/ML**: HuggingFace Transformers, PyTorch
- **Mobile**: Flutter (BLoC Clean Architecture)
- **Web**: React + TypeScript (Feature-Sliced Design)
- **Auth**: JWT (Django REST Framework Simple JWT)

### Project Structure
```
RegistrarConnect/
├── backend/          # Django REST API
│   ├── accounts/      # User management & authentication
│   ├── document_requests/  # Document request workflow
│   ├── appointments/  # Scheduling system
│   └── ai/           # AI chatbot & ML services
├── mobile/           # Flutter mobile app
│   └── lib/
│       ├── core/     # Core services, theme, widgets
│       └── features/ # Feature modules (auth, chat, appointments, etc.)
└── web/              # React admin portal
    └── registrarconnect-admin/
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Flutter 3.0+
- PostgreSQL 12+

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
   pip install -r requirements-ml.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   POSTGRES_DB=registrar_connect
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_HOST=127.0.0.1
   POSTGRES_PORT=5432
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000`

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

### Web Portal Setup

1. **Navigate to web admin directory**
   ```bash
   cd web/registrarconnect-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The admin portal will be available at `http://localhost:5173`

## 📱 User Roles

### Student
- Request documents (OTR, COG, COE, Others)
- Upload payment receipts
- Chat with AI assistant
- View request history and status

### Faculty
- Review pending document requests
- Approve/reject student requests
- Manage appointment schedule
- Provide appointed time for document claiming
- View assigned students

### Registrar
- Approve document requests
- View all appointments
- Manage time slots
- Oversee document processing workflow

### Finance
- Verify payment receipts
- Approve/reject payments
- Track payment status
- Generate financial reports

### Admin
- Manage all users
- System configuration
- View analytics and reports
- Access activity logs

## 🎯 Workflow

### Document Request Flow

1. **Student initiates request via AI chatbot or mobile/web app**
2. **AI processes request**: Determines document type, semester, school year
3. **Faculty review**: For documents requiring academic approval
4. **Payment verification**: Upload receipt → Finance verifies payment
5. **Registrar approval**: Final document request approval
6. **Appointment scheduling**: System automatically assigns time slot
7. **Document claiming**: Student claims document at scheduled time

**Note**: Registrar/Faculty appoints the time for document claiming of students' requested documents.

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/me/` - Get current user profile

### Document Requests
- `GET /api/document-requests/` - List document requests
- `POST /api/document-requests/` - Create new request
- `GET /api/document-requests/{id}/` - Get request details
- `POST /api/document-requests/{id}/receipt/` - Upload receipt

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/statistics/` - Get statistics

### AI Chat
- `POST /api/ai/chat/` - Send message to AI chatbot
- `GET /api/ai/chat/history/` - Get chat history
- `GET /api/ai/analytics/` - Get chat analytics

## 🤖 AI Features

### Intelligent Chatbot
- Document type classification (OTR, COG, COE, Others)
- Semester and school year detection
- Context-aware conversations
- Multi-language support (English, Filipino)
- Duplicate request prevention

### ML Models
- **Document Type Classifier**: Predicts document type from user input
- **Semester Classifier**: Identifies academic semester/school year
- Model training scripts located in `backend/ai/services/train/`

## 📊 Database Schema

### Core Models
- **User**: Custom user model with roles
- **DocumentRequest**: Document request workflow
- **Appointment**: Scheduled claiming appointments
- **ChatHistory**: AI conversation logs
- **Notification**: System notifications

## 🛠️ Development

### Running Tests
```bash
python manage.py test
```

### Training AI Models
```bash
cd backend/ai/services/train
python run_enhanced_training.py
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## 📝 Environment Variables

Required `.env` variables:
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_HOST`: Database host
- `POSTGRES_PORT`: Database port
