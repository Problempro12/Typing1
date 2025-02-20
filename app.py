from flask import Flask, render_template, request, render_template

app = Flask(__name__)

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
    return render_template('results.html')

@app.route('/advanced')
def advanced():
    return render_template('advanced.html')

@app.route('/expert')
def expert():
    return render_template('expert.html')

@app.route('/about')
def about():
     return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)

