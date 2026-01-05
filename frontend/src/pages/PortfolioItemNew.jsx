import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag as TagIcon, User, Sparkles, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { portfolioProjects } from '../data/mock';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import './pages.css';

const PortfolioItem = () => {
  const { id } = useParams();
  
  // Find project by slug or id
  const project = portfolioProjects.find(p => 
    p.slug === id || p.id === parseInt(id)
  );

  if (!project) {
    return (
      <>
        <Helmet>
          <title>Project Not Found - Prompt Forge</title>
        </Helmet>
        <div className="portfolio-item-page-premium">
          <div className="not-found-container">
            <div className="not-found-content">
              <h1 className="not-found-title">Project Not Found</h1>
              <p className="not-found-text">The project you're looking for doesn't exist or has been removed.</p>
              <Link to="/portfolio">
                <Button className="back-to-portfolio-btn">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Related projects (same category, excluding current)
  const relatedProjects = portfolioProjects
    .filter(p => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "image": project.image,
    "author": {
      "@type": "Organization",
      "name": "Prompt Forge"
    },
    "datePublished": project.date,
    "keywords": project.technologies.join(', ')
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{project.seo?.title || `${project.title} - Prompt Forge Portfolio`}</title>
        <meta name="description" content={project.seo?.description || project.description} />
        <meta name="keywords" content={project.technologies.join(', ')} />
        <link rel="canonical" href={`https://mspndev.com/portfolio/${project.slug || project.id}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="portfolio-item-page-premium">
        {/* Back Navigation */}
        <div className="portfolio-item-nav" data-admin-editable="back-nav">
          <div className="section-container-premium">
            <Link to="/portfolio">
              <Button variant="ghost" className="back-button-premium">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portfolio</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Hero */}
        <section className="project-hero-section" data-admin-editable={`project-hero-${project.id}`}>
          <div className="project-hero-background">
            <div className="hero-gradient-orb orb-1"></div>
            <div className="hero-gradient-orb orb-2"></div>
          </div>
          
          <div className="section-container-premium">
            <div className="project-hero-content">
              <div className="project-hero-meta">
                {project.featured && (
                  <span className="project-featured-label">
                    <Sparkles className="h-4 w-4" />
                    Featured Project
                  </span>
                )}
                <span className="project-category-label" data-admin-editable={`project-category-${project.id}`}>
                  {project.category}
                </span>
              </div>

              <h1 className="project-hero-title" data-admin-editable={`project-title-${project.id}`}>
                {project.title}
              </h1>

              <p className="project-hero-description" data-admin-editable={`project-desc-${project.id}`}>
                {project.shortDesc || project.description}
              </p>

              <div className="project-hero-actions">
                {project.liveLink && (
                  <>
                    {project.liveLink.startsWith('/') ? (
                      <Link to={project.liveLink}>
                        <Button className="project-action-btn btn-primary">
                          <ExternalLink className="h-5 w-5" />
                          <span>View Live Demo</span>
                        </Button>
                      </Link>
                    ) : (
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                        <Button className="project-action-btn btn-primary">
                          <ExternalLink className="h-5 w-5" />
                          <span>View Live Demo</span>
                        </Button>
                      </a>
                    )}
                  </>
                )}
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="project-action-btn btn-secondary">
                      <Github className="h-5 w-5" />
                      <span>View Source Code</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Project Images Gallery */}
        <section className="project-gallery-section" data-admin-editable={`project-gallery-${project.id}`}>
          <div className="section-container-premium">
            <div className="project-gallery">
              {(project.images || [project.image]).map((image, idx) => (
                <div key={idx} className={`gallery-item ${idx === 0 ? 'gallery-main' : ''}`}>
                  <img 
                    src={image} 
                    alt={`${project.title} - Image ${idx + 1}`}
                    className="gallery-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Details & Sidebar */}
        <section className="project-details-section-premium">
          <div className="section-container-premium">
            <div className="project-details-grid-premium">
              
              {/* Main Content */}
              <div className="project-main-content-premium">
                {/* Overview */}
                <div className="content-block" data-admin-editable={`project-overview-${project.id}`}>
                  <h2 className="content-block-title">Project Overview</h2>
                  <p className="content-block-text">
                    {project.longDesc || project.description}
                  </p>
                </div>

                {/* Key Metrics */}
                {project.metrics && (
                  <div className="project-metrics-block" data-admin-editable={`project-metrics-${project.id}`}>
                    <h3 className="metrics-title">Project Impact</h3>
                    <div className="metrics-grid">
                      {project.metrics.users && (
                        <div className="metric-card">
                          <Users className="metric-icon" />
                          <div className="metric-value">{project.metrics.users}</div>
                          <div className="metric-label">Active Users</div>
                        </div>
                      )}
                      {project.metrics.increase && (
                        <div className="metric-card">
                          <TrendingUp className="metric-icon" />
                          <div className="metric-value">{project.metrics.increase}</div>
                          <div className="metric-label">Performance Increase</div>
                        </div>
                      )}
                      {project.metrics.revenue && (
                        <div className="metric-card">
                          <DollarSign className="metric-icon" />
                          <div className="metric-value">{project.metrics.revenue}</div>
                          <div className="metric-label">Revenue Growth</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Features */}
                <div className="content-block" data-admin-editable={`project-features-${project.id}`}>
                  <h2 className="content-block-title">Key Features</h2>
                  <ul className="features-list-premium">
                    {project.features && project.features.length > 0 ? (
                      project.features.map((feature, idx) => (
                        <li key={idx} className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>Responsive design that works seamlessly on all devices</span>
                        </li>
                        <li className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>Optimized performance for lightning-fast loading times</span>
                        </li>
                        <li className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>Clean, maintainable code following industry best practices</span>
                        </li>
                        <li className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>SEO-friendly architecture for better search visibility</span>
                        </li>
                        <li className="feature-item-premium">
                          <CheckCircle className="feature-check" />
                          <span>Secure implementation with industry-standard protocols</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Challenges & Solutions */}
                {project.challenges && project.challenges.length > 0 && (
                  <div className="content-block" data-admin-editable={`project-challenges-${project.id}`}>
                    <h2 className="content-block-title">Challenges & Solutions</h2>
                    <div className="challenges-grid">
                      {project.challenges.map((challenge, idx) => (
                        <div key={idx} className="challenge-card">
                          <h3 className="challenge-title">{challenge.title}</h3>
                          <p className="challenge-desc">{challenge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                {project.results && project.results.length > 0 && (
                  <div className="content-block" data-admin-editable={`project-results-${project.id}`}>
                    <h2 className="content-block-title">Results & Impact</h2>
                    <div className="results-grid">
                      {project.results.map((result, idx) => (
                        <div key={idx} className="result-card">
                          <div className="result-metric">{result.value}</div>
                          <h3 className="result-title">{result.metric}</h3>
                          <p className="result-desc">{result.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                <div className="content-block" data-admin-editable={`project-tech-${project.id}`}>
                  <h2 className="content-block-title">Technologies Used</h2>
                  <div className="tech-stack-list">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-badge-premium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="project-sidebar-premium">
                {/* Project Info Card */}
                <Card className="project-info-card-premium" data-admin-editable={`project-info-${project.id}`}>
                  <h3 className="sidebar-card-title">Project Information</h3>
                  
                  {project.date && (
                    <div className="info-item-premium">
                      <Calendar className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Completed</div>
                        <div className="info-value">{new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                  )}

                  <div className="info-item-premium">
                    <TagIcon className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Category</div>
                      <div className="info-value">{project.category}</div>
                    </div>
                  </div>

                  {project.clientName && (
                    <div className="info-item-premium">
                      <User className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Client</div>
                        <div className="info-value">{project.clientName}</div>
                      </div>
                    </div>
                  )}

                  {project.role && (
                    <div className="info-item-premium">
                      <Sparkles className="info-icon" />
                      <div className="info-content">
                        <div className="info-label">Role</div>
                        <div className="info-value">{project.role}</div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* CTA Card */}
                <Card className="project-cta-card-premium">
                  <div className="cta-card-content">
                    <h3 className="cta-card-title">Interested in a Similar Project?</h3>
                    <p className="cta-card-text">
                      Let's discuss how we can create something amazing together that exceeds your expectations.
                    </p>
                    <Link to="/contact">
                      <Button className="cta-card-button">
                        Start Your Project
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="related-projects-section-premium" data-admin-editable="related-projects">
            <div className="section-container-premium">
              <div className="section-header-center">
                <h2 className="section-title-premium">More Projects Like This</h2>
                <p className="section-description-premium">
                  Explore other projects in the {project.category} category
                </p>
              </div>

              <div className="related-projects-grid-premium">
                {relatedProjects.map((relatedProject) => (
                  <Link 
                    key={relatedProject.id} 
                    to={`/portfolio/${relatedProject.slug || relatedProject.id}`}
                    className="related-project-card"
                  >
                    <div className="related-project-image-wrapper">
                      <img 
                        src={relatedProject.image} 
                        alt={relatedProject.title}
                        className="related-project-image"
                        loading="lazy"
                      />
                      {relatedProject.featured && (
                        <div className="related-project-featured">
                          <Sparkles className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="related-project-content">
                      <span className="related-project-category">{relatedProject.category}</span>
                      <h4 className="related-project-title">{relatedProject.title}</h4>
                      <p className="related-project-desc">{relatedProject.shortDesc || relatedProject.description}</p>
                      <div className="related-project-tech">
                        {relatedProject.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="related-tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="view-all-projects">
                <Link to="/portfolio">
                  <Button variant="outline" className="view-all-btn">
                    View All Projects
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default PortfolioItem;
