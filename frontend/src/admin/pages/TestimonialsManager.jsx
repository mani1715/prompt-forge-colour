import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Star, CheckCircle, XCircle, BadgeCheck, Mail } from 'lucide-react';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../services/testimonialService';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    email: '',
    message: '',
    rating: 5,
    image: '',
    status: 'pending',
    source: 'admin_created',
    verified: false
  });

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        role: testimonial.role || '',
        company: testimonial.company || '',
        email: testimonial.email || '',
        message: testimonial.message,
        rating: testimonial.rating,
        image: testimonial.image || '',
        status: testimonial.status,
        source: testimonial.source || 'admin_created',
        verified: testimonial.verified || false
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '',
        role: '',
        company: '',
        email: '',
        message: '',
        rating: 5,
        image: '',
        status: 'pending',
        source: 'admin_created',
        verified: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        alert('Testimonial updated successfully!');
      } else {
        await createTestimonial(formData);
        alert('Testimonial created successfully!');
      }
      
      handleCloseModal();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        alert('Testimonial deleted successfully!');
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('Failed to delete testimonial');
      }
    }
  };

  const handleToggleStatus = async (testimonial) => {
    const newStatus = testimonial.status === 'approved' ? 'pending' : 'approved';
    try {
      await updateTestimonial(testimonial.id, { status: newStatus });
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? '#FFC107' : 'none'}
        stroke={index < rating ? '#FFC107' : '#CBD5E0'}
      />
    ));
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280' }}>Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1C2A3A', margin: '0 0 8px 0' }}>
            Testimonials Manager
          </h1>
          <p style={{ color: '#6B7280', margin: 0 }}>
            Manage client testimonials - {testimonials.length} total 
            ({testimonials.filter(t => t.status === 'approved').length} approved, 
            {testimonials.filter(t => t.source === 'client_portal').length} from client portal,
            {testimonials.filter(t => t.source === 'public_submitted').length} from public)
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Add New Testimonial
        </button>
      </div>

      {/* Testimonials Table */}
      <div className="admin-stat-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Client</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Role/Company</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Message</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Rating</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Source</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                    No testimonials yet. Create your first testimonial!
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#6B7280'
                          }}>
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '500', color: '#111827' }}>{testimonial.name}</span>
                            {(testimonial.source === 'client_portal' || testimonial.source === 'public_submitted') && testimonial.verified && (
                              <BadgeCheck size={14} style={{ color: '#3b82f6' }} title="Verified Customer" />
                            )}
                          </div>
                          {testimonial.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Mail size={12} style={{ color: '#9CA3AF' }} />
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>{testimonial.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                      <div>{testimonial.role || '-'}</div>
                      {testimonial.company && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{testimonial.company}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#374151', fontSize: '14px', maxWidth: '300px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {testimonial.message}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        {renderStars(testimonial.rating)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span className={`admin-badge ${
                        testimonial.source === 'client_portal' ? 'success' :
                        testimonial.source === 'public_submitted' ? 'info' : 
                        testimonial.source === 'admin_created' ? 'secondary' :
                        'warning'
                      }`}>
                        {testimonial.source === 'client_portal' ? '✅ Client Portal' :
                         testimonial.source === 'public_submitted' ? '👤 Public' :
                         testimonial.source === 'admin_created' ? '✏️ Admin' :
                         testimonial.source === 'email' ? '📧 Email' : '📱 Social'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(testimonial)}
                        className={`admin-badge ${testimonial.status === 'approved' ? 'success' : 'warning'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {testimonial.status === 'approved' ? (
                          <>
                            <CheckCircle size={14} />
                            Approved
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Pending
                          </>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenModal(testimonial)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
              <button onClick={handleCloseModal} className="admin-modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="CEO, Marketing Director"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Tech Company Inc."
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    rows={4}
                    placeholder="Write the testimonial message..."
                  />
                </div>

                <div className="admin-form-group">
                  <label>Rating *</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange('rating', num)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Star
                          size={28}
                          fill={num <= formData.rating ? '#FFC107' : 'none'}
                          stroke={num <= formData.rating ? '#FFC107' : '#CBD5E0'}
                        />
                      </button>
                    ))}
                    <span style={{ marginLeft: '8px', color: '#6B7280' }}>
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label>Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                    >
                      <option value="customer_submitted">Customer Submitted</option>
                      <option value="admin_created">Admin Created</option>
                      <option value="email">Email</option>
                      <option value="social_media">Social Media</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={(e) => handleInputChange('verified', e.target.checked)}
                        style={{ width: 'auto', margin: 0 }}
                      />
                      <span>Verified Customer</span>
                    </label>
                    <small style={{ color: '#6B7280', display: 'block', marginTop: '4px' }}>
                      Check if this is from a real verified customer
                    </small>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={handleCloseModal} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
