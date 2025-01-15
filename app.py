from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('level_selection.html')  # Главная страница для выбора уровня

@app.route('/intermediate')
def intermediate():
    return render_template('intermediate.html')

@app.route('/about')
def about():
    return render_template('about.html')  # Страница "О нас"

if __name__ == '__main__':
    app.run(debug=True)