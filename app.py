from flask import Flask, render_template, request, render_template, jsonify
import json
import os

app = Flask(__name__)

SCORES_FILE = 'scores.json'

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
            
            # Оставляем только топ-10
            scores = scores[:10]
            save_scores(scores)
            
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/')
def home():
    return render_template('level_selection.html')

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