import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION = 24 * 60 * 60  # 24 часа
    
    TEACHER_USERNAME = os.getenv('TEACHER_USERNAME', 'teacher')
    TEACHER_PASSWORD = os.getenv('TEACHER_PASSWORD', 'password123')
    
    SCORES_FILE = 'scores.json'
    
    # Настройки для разных окружений
    class Development:
        DEBUG = True
        TESTING = False
        
    class Production:
        DEBUG = False
        TESTING = False
        HTTPS = True
        SESSION_COOKIE_SECURE = True
        
    class Testing:
        DEBUG = True
        TESTING = True
        
    @staticmethod
    def get_config():
        env = os.getenv('FLASK_ENV', 'development')
        if env == 'production':
            return Config.Production
        elif env == 'testing':
            return Config.Testing
        return Config.Development 