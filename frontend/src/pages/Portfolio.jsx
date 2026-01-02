import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getBackendURL } from '../lib/utils';

const BACKEND_URL = getBackendURL();

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/projects/`);
        setProjects(res.data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const categories = [
    'All',
    ...new Set(projects.map(p => p.category).filter(Boolean))
  ];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter(p => p.category === selectedCategory);

  if (loading) {
    return <div className="page-loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  return (
    <div className="portfolio-page">
      {/* Hero */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-content">
          <h1 className="page-title">Our Portfolio</h1>
          <p className="page-subtitle">
            Explore our collection of successful projects and client solutions
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="filter-section">
        <div className="filter-container">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="filter-button"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="portfolio-projects-section">
        <div className="portfolio-projects-grid">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              to={`/portfolio/${project.slug || project.id}`}
              className="portfolio-card-link"
            >
              <Card className="portfolio-card">
                <div className="portfolio-image">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    loading="lazy"
                  />
                  <div className="portfolio-overlay">
                    <span className="portfolio-category">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="portfolio-info">
                  <h3 className="portfolio-title">{project.title}</h3>
                  <p className="portfolio-description">
                    {project.description}
                  </p>

                  <div className="portfolio-technologies">
                    {(project.tech_stack || []).map((tech, i) => (
                      <span key={i} className="portfolio-tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
