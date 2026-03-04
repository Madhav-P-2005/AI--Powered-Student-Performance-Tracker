Frontend installation steps :- 

Tailwindcss :-  npm install -D tailwindcss postcss autoprefixer  . 

npx @tailwindcss/cli init -p

followed by adding @import "tailwindcss"; in your .css file.

React.js :- npm install vite@latest frontend 

React Packages :- npm install react-router-dom framer-motion react-hook-form axios react-icons react-select react-date-picker react-dropzone react-toastify react-player react-player 



Django installation Steps :- 


python -m venv MyEnvironment
.\MyEnvironment\Scripts\Activate.ps1


pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install python-dotenv  # (Preferred over python-decouple for standard .env)
pip install psycopg2-binary # REQUIRED for Supabase (PostgreSQL)
pip install pandas scikit-learn joblib # REQUIRED for ML models

Step 1: Create the Django Project

django-admin startproject config .



Step 2: Create the Django Apps :- 

python manage.py startapp core
python manage.py startapp students
python manage.py startapp predictions


Step 3: Create the ML models directory 

mkdir ml_models

# This is where we'll store the trained .pkl files and the prediction helper script.


python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


madhavmproject@2026






backend/
├── manage.py
├── requirements.txt
├── config/           ← Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── core/             ← Custom User model app
├── students/         ← Student records app
├── predictions/      ← ML predictions app
└── ml_models/        ← Trained .pkl models go here


You need to run migrations for the new models :- 
python manage.py makemigrations students predictions
python manage.py migrate
python manage.py runserver


python manage.py runserver