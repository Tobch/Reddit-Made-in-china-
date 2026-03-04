import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NewsSidebar() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/news/trending', {
          timeout: 8000
        });
        setNews(res.data.articles || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news-sidebar">
      <h3 className="news-title">📰 Trending News</h3>
      
      {loading && <p className="news-loading">Loading news...</p>}
      {error && <p className="news-error">{error}</p>}
      
      {!loading && news.length > 0 && (
        <div className="news-list">
          {news.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="news-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="news-content">
                <h4 className="news-headline">{article.title}</h4>
                <p className="news-source">
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && news.length === 0 && !error && (
        <p className="news-empty">No news available</p>
      )}
    </div>
  );
}

