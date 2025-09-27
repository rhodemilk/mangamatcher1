from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
# pandas import removed - not needed for current functionality
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///mangamatcher.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Sample User model


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# Enhanced Manga model matching the dataset schema


class Manga(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100))
    publisher = db.Column(db.String(100))
    demographic = db.Column(db.String(50))  # Shōnen, Shōjo, Seinen, Josei
    num_of_vol = db.Column(db.Integer)
    serialized = db.Column(db.String(100))  # Publication years
    sales = db.Column(db.String(50))
    sales_per_vol = db.Column(db.String(50))
    genre = db.Column(db.String(100))
    isbn_10 = db.Column(db.String(20))
    isbn_13 = db.Column(db.String(20))
    description = db.Column(db.Text)
    cover_image_url = db.Column(db.String(500))
    tags = db.Column(db.Text)  # Comma-separated tags
    rating_avg = db.Column(db.Float, default=0.0)
    year = db.Column(db.Integer)
    year_bucket = db.Column(db.String(20))  # classic, 2000s, modern
    amazon_link = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'publisher': self.publisher,
            'demographic': self.demographic,
            'num_of_vol': self.num_of_vol,
            'serialized': self.serialized,
            'sales': self.sales,
            'sales_per_vol': self.sales_per_vol,
            'genre': self.genre,
            'isbn_10': self.isbn_10,
            'isbn_13': self.isbn_13,
            'description': self.description,
            'cover_image_url': self.cover_image_url,
            'tags': self.tags,
            'rating_avg': self.rating_avg,
            'year': self.year,
            'year_bucket': self.year_bucket,
            'amazon_link': self.amazon_link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Routes


@app.route('/')
def hello():
    return jsonify({
        'message': 'Welcome to MangaMatcher API!',
        'version': '1.0.0',
        'endpoints': {
            'users': '/api/users',
            'manga': '/api/manga',
            'health': '/health'
        }
    })


@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})


@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


# Removed POST endpoint for user creation - read-only system


@app.route('/api/manga', methods=['GET'])
def get_manga():
    manga_list = Manga.query.all()
    return jsonify([manga.to_dict() for manga in manga_list])


# Removed POST endpoint for manga creation - dataset is read-only

# Quiz recommendation system


def get_manga_features():
    """Get all manga from database and create feature vectors"""
    manga_list = Manga.query.all()
    if not manga_list:
        return None, None, None

    # Create feature strings for each manga
    features = []
    manga_data = []

    for manga in manga_list:
        # Combine title, author, genre, tags, demographic, and year_bucket
        feature_text = f"{manga.title} {manga.author or ''} {manga.genre or ''} {manga.tags or ''} {manga.demographic or ''} {manga.year_bucket or ''}"
        features.append(feature_text)
        manga_data.append(manga)

    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    feature_matrix = vectorizer.fit_transform(features)

    return feature_matrix, manga_data, vectorizer


def get_quiz_recommendations(genres, audience, eras, vibe=None):
    """Get recommendations based on quiz answers"""
    feature_matrix, manga_data, vectorizer = get_manga_features()

    if feature_matrix is None or manga_data is None or vectorizer is None:
        return []

    # Create query from user preferences
    if vibe is None:
        vibe = []
    query_text = f"{' '.join(genres)} {' '.join(audience)} {' '.join(eras)} {' '.join(vibe)}"
    query_vector = vectorizer.transform([query_text])

    # Calculate similarities
    similarities = cosine_similarity(query_vector, feature_matrix).flatten()

    # Get top recommendations
    top_indices = np.argsort(similarities)[::-1][:10]  # Top 10

    recommendations = []
    for idx in top_indices:
        if similarities[idx] > 0:  # Only include positive similarities
            manga = manga_data[idx]
            recommendations.append({
                'manga': manga.to_dict(),
                'similarity_score': float(similarities[idx])
            })

    return recommendations


@app.route('/api/quiz/options', methods=['GET'])
def get_quiz_options():
    """Get available options for quiz questions"""
    # Get unique genres from database
    genres = db.session.query(Manga.genre).distinct().all()
    genre_list = [g[0] for g in genres if g[0]]

    # Get unique demographics
    demographics = db.session.query(Manga.demographic).distinct().all()
    demographic_list = [d[0] for d in demographics if d[0]]

    # Get unique year buckets
    year_buckets = db.session.query(Manga.year_bucket).distinct().all()
    year_bucket_list = [y[0] for y in year_buckets if y[0]]

    return jsonify({
        'genres': genre_list,
        'demographics': demographic_list,
        'year_buckets': year_bucket_list
    })


@app.route('/api/quiz/recommend', methods=['POST'])
def quiz_recommend():
    """Get manga recommendations based on quiz answers"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    genres = data.get('genres', [])
    audience = data.get('audience', [])
    eras = data.get('eras', [])
    vibe = data.get('vibe', [])

    if not genres and not audience and not eras and not vibe:
        return jsonify({'error': 'At least one preference must be selected'}), 400

    try:
        recommendations = get_quiz_recommendations(
            genres, audience, eras, vibe)
        return jsonify({
            'recommendations': recommendations,
            'total_found': len(recommendations)
        })
    except (ValueError, AttributeError, IndexError) as e:
        return jsonify({'error': f'Recommendation failed: {str(e)}'}), 500

# Initialize database


def create_tables():
    db.create_all()


def run():
    with app.app_context():
        create_tables()

    port = int(os.getenv('PORT', '8000'))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)


if __name__ == '__main__':
    run()
