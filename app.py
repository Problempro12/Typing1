from flask import Flask, render_template, request, render_template, jsonify, redirect, url_for
import json
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # В продакшене использовать безопасный ключ

# Конфигурация JWT
JWT_SECRET = 'your-jwt-secret'  # В продакшене использовать безопасный ключ
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 24 * 60 * 60  # 24 часа в секундах

# Учетные данные учителя (в реальном приложении должны храниться в базе данных)
TEACHER_CREDENTIALS = {
    'username': 'teacher',
    'password': 'password123'
}

SCORES_FILE = 'scores.json'

# Декоратор для проверки JWT токена
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Токен отсутствует'}), 401
        
        try:
            jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Токен истек'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Недействительный токен'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def load_scores():
    try:
        if os.path.exists(SCORES_FILE):
            with open(SCORES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Ошибка загрузки результатов: {e}")
        return []

def save_scores(scores):
    try:
        with open(SCORES_FILE, 'w', encoding='utf-8') as f:
            json.dump(scores, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Ошибка сохранения результатов: {e}")
        raise

@app.route('/')
def home():
    return render_template('level_selection.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/teacher')
def teacher_page():
    token = request.cookies.get('token')
    if not token:
        return redirect('/login')
    
    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return render_template('teacher.html')
    except:
        return redirect('/login')

@app.route('/api/login', methods=['POST'])
def login():
    print("Получен запрос на вход")  # Добавляем логирование
    data = request.get_json()
    print(f"Полученные данные: {data}")  # Логируем полученные данные
    
    username = data.get('username')
    password = data.get('password')
    
    print(f"Проверка учетных данных: {username}")  # Логируем проверку
    
    if username == TEACHER_CREDENTIALS['username'] and password == TEACHER_CREDENTIALS['password']:
        print("Учетные данные верны")  # Логируем успешную аутентификацию
        token = jwt.encode(
            {'username': username, 'exp': datetime.utcnow() + timedelta(hours=24)}, 
            app.secret_key,
            algorithm='HS256'
        )
        response = jsonify({'success': True})
        response.set_cookie('token', token, httponly=True, secure=False, samesite='Lax')  # Изменяем параметры куки
        return response
    
    print("Неверные учетные данные")  # Логируем неудачную попытку
    return jsonify({'success': False, 'message': 'Неверное имя пользователя или пароль'}), 401

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'message': 'Не авторизован'}), 401
    
    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return jsonify({'message': 'Авторизован'})
    except:
        return jsonify({'message': 'Недействительный токен'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Выход выполнен'})
    response.delete_cookie('token')
    return response

@app.route('/api/scores', methods=['GET', 'POST'])
def handle_scores():
    if request.method == 'GET':
        try:
            return jsonify(load_scores())
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    if request.method == 'POST':
        try:
            scores = load_scores()
            new_score = request.json
            
            scores.append(new_score)
            
            # Сортировка по сложности и скорости
            difficulty_weight = {
                'Эксперт': 4,
                'Продвинутый': 3,
                'Обычный': 2,
                'Легкий': 1
            }
            
            scores.sort(key=lambda x: (
                difficulty_weight.get(x['difficulty'], 0),
                int(x['wpm'])
            ), reverse=True)
            
            save_scores(scores)
            
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/all-scores')
def get_all_scores():
    try:
        scores = load_scores()
        return jsonify(scores)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear-scores', methods=['POST'])
def clear_scores():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'success': False, 'message': 'Не авторизован'}), 401
    
    try:
        jwt.decode(token, app.secret_key, algorithms=['HS256'])
        # Очищаем файл с результатами
        with open('scores.json', 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
        return jsonify({'success': True, 'message': 'Результаты успешно очищены'})
    except:
        return jsonify({'success': False, 'message': 'Ошибка авторизации'}), 401

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/intermediate')
def intermediate():
    return render_template('intermediate.html')

@app.route('/easy')
def easy():
    return render_template('easy.html')

@app.route('/results')
def results():
    # Получаем параметры из URL
    data = request.args.get('data')
    difficulty = request.args.get('difficulty')
    
    # Добавляем их в контекст шаблона
    return render_template('results.html', data=data, difficulty=difficulty)

@app.route('/advanced')
def advanced():
    return render_template('advanced.html')

@app.route('/expert')
def expert():
    return render_template('expert.html')

@app.route('/about')
def about():
     return render_template('about.html')

# Добавляем обработку CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, threaded=True)