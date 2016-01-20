import requests
from bs4 import BeautifulSoup
from flask import render_template, Flask, redirect, jsonify,request, session
from collections import defaultdict
from flask.ext.wtf import Form
from wtforms.validators import Required, url
from wtforms import SubmitField
from wtforms.fields.html5 import URLField
from flask.ext.bootstrap import Bootstrap

app = Flask(__name__)
app.config.from_object('config')
Bootstrap(app)

class myform(Form):
    url = URLField('Enter url', validators=[Required(), url()])
    submit = SubmitField('Get Summary')

def getsummary(url):
    invalid = (None, None)
    if not url:
        return invalid
    r = requests.get(url)
    if not r or r.status_code != 200:
        return invalid

    soup = BeautifulSoup(r.text)
    pagesource = soup.prettify()
    taginfo = defaultdict(int)
    
    for tag in soup.findAll():
        taginfo[tag.name] += 1
    return pagesource, taginfo

@app.route('/', methods=['GET', 'POST'])
def index():
    form = myform()
    return render_template('index.html', form=form)

@app.route('/summary', methods=['POST'])
def summary():
    form = myform()
    data = {}
    if form.validate_on_submit():
        url = str(form.url.data)
        pagesource, summary = getsummary(url)
        data['source'] = pagesource
        data['summary'] = summary
    return jsonify(**data)

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__=='__main__':
    app.run(debug=True)
