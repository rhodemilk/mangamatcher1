import React from 'react';
import './Recommendations.css';

function Recommendations({ recommendations, onBackToQuiz }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="no-recommendations">
          <h2>🌸 No Recommendations Found</h2>
          <p>We couldn't find any manga matching your preferences. Try adjusting your quiz answers!</p>
          <button onClick={onBackToQuiz} className="btn btn-primary">
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>🌸 Your Manga Recommendations</h1>
        <p>Based on your preferences, here are some manga you might enjoy!</p>
        <button onClick={onBackToQuiz} className="btn btn-secondary">
          ← Retake Quiz
        </button>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((rec, index) => {
          const manga = rec.manga;
          const score = rec.similarity_score;
          
          return (
            <div key={manga.id} className="manga-card">
              <div className="manga-rank">
                #{index + 1}
              </div>
              
              <div className="manga-cover">
                {manga.cover_image_url ? (
                  <img 
                    src={manga.cover_image_url} 
                    alt={manga.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="cover-placeholder" style={{ display: manga.cover_image_url ? 'none' : 'flex' }}>
                  <span>📚</span>
                </div>
              </div>

              <div className="manga-info">
                <h3 className="manga-title">{manga.title}</h3>
                <p className="manga-author">by {manga.author}</p>
                
                <div className="manga-details">
                  {manga.genre && (
                    <span className="detail-tag genre">{manga.genre}</span>
                  )}
                  {manga.demographic && (
                    <span className="detail-tag demographic">{manga.demographic}</span>
                  )}
                  {manga.year && (
                    <span className="detail-tag year">{manga.year}</span>
                  )}
                </div>

                {manga.rating_avg > 0 && (
                  <div className="manga-rating">
                    <span className="rating-label">Rating:</span>
                    <span className="rating-value">{manga.rating_avg}/100</span>
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(manga.rating_avg / 20))}
                      {'☆'.repeat(5 - Math.floor(manga.rating_avg / 20))}
                    </div>
                  </div>
                )}

                {manga.description && (
                  <p className="manga-description">
                    {manga.description.length > 150 
                      ? `${manga.description.substring(0, 150)}...` 
                      : manga.description
                    }
                  </p>
                )}

                <div className="manga-stats">
                  {manga.num_of_vol && (
                    <span className="stat">
                      📖 {manga.num_of_vol} volumes
                    </span>
                  )}
                  {manga.sales && (
                    <span className="stat">
                      📈 {manga.sales}
                    </span>
                  )}
                </div>

                <div className="manga-actions">
                  {manga.amazon_link && (
                    <a 
                      href={manga.amazon_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-small"
                    >
                      View on Amazon
                    </a>
                  )}
                  <div className="match-score">
                    Match: {Math.round(score * 100)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="recommendations-footer">
        <p>Found {recommendations.length} recommendations based on your preferences!</p>
        <button onClick={onBackToQuiz} className="btn btn-primary btn-large">
          Find More Recommendations
        </button>
      </div>
    </div>
  );
}

export default Recommendations;
