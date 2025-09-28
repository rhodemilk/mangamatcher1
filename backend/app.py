from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

# Load environment variables
load_dotenv()
app = Flask(__name__)
# Enable CORS for React frontend
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 'sqlite:///mangamatcher.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDJBS3hSaV5O3fL1l-BYFoTxzAFdMl1BI0')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None

# Models


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


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
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))

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
    try:
        # simple DB check
        db.session.execute(db.select(db.func.count(Manga.id)))
        return jsonify({'status': 'healthy', 'timestamp': datetime.now(timezone.utc).isoformat()})
    except Exception as e:
        return jsonify({'status': 'degraded', 'error': str(e)}), 500


@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
    except Exception as e:
        return jsonify({'error': f'Failed to load users: {str(e)}'}), 500


@app.route('/api/manga', methods=['GET'])
def get_manga():
    try:
        manga_list = Manga.query.all()
        return jsonify([manga.to_dict() for manga in manga_list])
    except Exception as e:
        return jsonify({'error': f'Failed to load manga: {str(e)}'}), 500

# Quiz recommendation system


def get_manga_features():
    """Get all manga from database and create feature vectors. Returns (feature_matrix, manga_data, vectorizer)."""
    try:
        manga_list = Manga.query.all()
        if not manga_list:
            return None, None, None
        features = []
        manga_data = []
        for manga in manga_list:
            feature_text = f"{manga.title} {manga.author or ''} {manga.genre or ''} {manga.tags or ''} {manga.demographic or ''} {manga.year_bucket or ''}"
            features.append(feature_text)
            manga_data.append(manga)
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        feature_matrix = vectorizer.fit_transform(features)
        return feature_matrix, manga_data, vectorizer
    except Exception as e:
        # Log and surface a safe message
        print(f"Error building feature matrix: {e}")
        return None, None, None


def get_quiz_recommendations(genres, audience, eras, vibe=None):
    """Get recommendations based on quiz answers"""
    feature_matrix, manga_data, vectorizer = get_manga_features()
    if feature_matrix is None or manga_data is None or vectorizer is None:
        return []
    if vibe is None:
        vibe = []
    query_text = f"{' '.join(genres)} {' '.join(audience)} {' '.join(eras)} {' '.join(vibe)}".strip(
    )
    if not query_text:
        return []
    try:
        query_vector = vectorizer.transform([query_text])
        similarities = cosine_similarity(
            query_vector, feature_matrix).flatten()
        top_indices = np.argsort(similarities)[::-1][:10]
        recommendations = []
        for idx in top_indices:
            if similarities[idx] > 0:
                manga = manga_data[idx]
                recommendations.append({
                    'manga': manga.to_dict(),
                    'similarity_score': float(similarities[idx])
                })
        return recommendations
    except Exception as e:
        print(f"Recommendation error: {e}")
        return []


@app.route('/api/quiz/options', methods=['GET'])
def get_quiz_options():
    """Get available options for quiz questions"""
    try:
        genres = db.session.query(Manga.genre).distinct().all()
        genre_list = [g[0] for g in genres if g[0]]
        demographics = db.session.query(Manga.demographic).distinct().all()
        demographic_list = [d[0] for d in demographics if d[0]]
        year_buckets = db.session.query(Manga.year_bucket).distinct().all()
        year_bucket_list = [y[0] for y in year_buckets if y[0]]
        print(
            f"Quiz options - Genres: {len(genre_list)}, Demographics: {len(demographic_list)}, Year buckets: {len(year_bucket_list)}")
        return jsonify({
            'genres': genre_list,
            'demographics': demographic_list,
            'year_buckets': year_bucket_list
        })
    except Exception as e:
        print(f"Error in get_quiz_options: {str(e)}")
        return jsonify({'error': f'Failed to get quiz options: {str(e)}'}), 500


@app.route('/api/quiz/recommend', methods=['POST'])
def quiz_recommend():
    """Get manga recommendations based on quiz answers"""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    genres = data.get('genres', [])
    audience = data.get('audience', [])
    eras = data.get('eras', [])
    vibe = data.get('vibe', [])

    if not any([genres, audience, eras, vibe]):
        return jsonify({'error': 'At least one preference must be selected'}), 400

    try:
        recommendations = get_quiz_recommendations(
            genres, audience, eras, vibe)
        if not recommendations:
            # Graceful empty case
            return jsonify({'recommendations': [], 'total_found': 0, 'message': 'No matching manga found for your selections.'})
        return jsonify({'recommendations': recommendations, 'total_found': len(recommendations)})
    except (ValueError, AttributeError, IndexError) as e:
        return jsonify({'error': f'Recommendation failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@app.route('/api/chat', methods=['POST'])
def chat_with_character():
    """Chat with a manga character using Gemini AI"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        character_name = data.get('character_name')
        manga_title = data.get('manga_title')
        user_message = data.get('message')
        character_personality = data.get('character_personality', {})
        
        if not all([character_name, manga_title, user_message]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if not model:
            return jsonify({'error': 'AI service not available'}), 503
        
        # Create character-specific prompt
        personality_prompt = f"""You are {character_name}, the main character from "{manga_title}".

Personality traits: {', '.join(character_personality.get('traits', []))}
Speech style: {character_personality.get('speech_style', 'friendly and engaging')}
Background: {character_personality.get('background', 'A character from this manga')}
Setting: {character_personality.get('setting', 'The world of this manga')}

Respond as this character would, staying true to their personality and the world they come from. Keep responses conversational, in character, and under 200 words. Don't break character or mention that you're an AI.

User's message: {user_message}"""

        # Generate AI response
        response = model.generate_content(personality_prompt)
        
        if response and response.text:
            return jsonify({
                'success': True,
                'response': response.text.strip(),
                'character': character_name,
                'manga': manga_title
            })
        else:
            return jsonify({'error': 'Failed to generate response'}), 500
            
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500


# Initialize database

def create_tables():
    try:
        db.create_all()
    except Exception as e:
        print(f"DB init error: {e}")


def run():
    with app.app_context():
        create_tables()

    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)


if __name__ == '__main__':
    run()
