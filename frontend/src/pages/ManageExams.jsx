import { useState, useEffect } from 'react';
import { examAPI, questionAPI } from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const EMPTY_EXAM = { title: '', description: '', category: '', duration: 60, passingMarks: 0, instructions: '', isPublished: false };
const EMPTY_Q = { questionText: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 };

const ManageExams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [examForm, setExamForm] = useState(EMPTY_EXAM);
  const [qForm, setQForm] = useState(EMPTY_Q);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('exams');

  const loadExams = () => examAPI.getAll().then(r => setExams(r.data.exams)).catch(() => {});

  useEffect(() => { loadExams().finally(() => setLoading(false)); }, []);

  const loadQuestions = async (exam) => {
    setSelectedExam(exam);
    const res = await examAPI.getById(exam._id);
    setQuestions(res.data.questions);
    setActiveTab('questions');
  };

  // --- Exam CRUD ---
  const openCreateExam = () => { setEditingExam(null); setExamForm(EMPTY_EXAM); setShowExamModal(true); };
  const openEditExam = (e, ev) => { ev.stopPropagation(); setEditingExam(e); setExamForm({ ...e }); setShowExamModal(true); };

  const saveExam = async () => {
    setSaving(true);
    try {
      if (editingExam) await examAPI.update(editingExam._id, examForm);
      else await examAPI.create(examForm);
      await loadExams();
      setShowExamModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteExam = async (id, ev) => {
    ev.stopPropagation();
    if (!window.confirm('Delete this exam and all its questions?')) return;
    await examAPI.delete(id);
    await loadExams();
    if (selectedExam?._id === id) { setSelectedExam(null); setQuestions([]); setActiveTab('exams'); }
  };

  const togglePublish = async (exam, ev) => {
    ev.stopPropagation();
    await examAPI.update(exam._id, { isPublished: !exam.isPublished });
    await loadExams();
  };

  // --- Question CRUD ---
  const openCreateQ = () => { setEditingQ(null); setQForm({ ...EMPTY_Q, examId: selectedExam._id }); setShowQModal(true); };
  const openEditQ = (q) => { setEditingQ(q); setQForm({ ...q, options: q.options?.length ? q.options : ['', '', '', ''] }); setShowQModal(true); };

  const saveQuestion = async () => {
    setSaving(true);
    try {
      const payload = { ...qForm };
      if (payload.type !== 'mcq') delete payload.options;
      if (editingQ) await questionAPI.update(editingQ._id, payload);
      else await questionAPI.create({ ...payload, examId: selectedExam._id });
      await loadQuestions(selectedExam);
      setShowQModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await questionAPI.delete(id);
    await loadQuestions(selectedExam);
  };

  if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h2 className="topbar-title">📚 Manage Exams</h2>
          <p className="topbar-subtitle">{exams.length} exams total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateExam}>+ Create Exam</button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
          📚 All Exams ({exams.length})
        </button>
        {selectedExam && (
          <button className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
            ❓ Questions — {selectedExam.title} ({questions.length})
          </button>
        )}
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No exams yet</div>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openCreateExam}>Create your first exam</button>
          </div>
        ) : (
          <div className="exams-grid">
            {exams.map(exam => (
              <div key={exam._id} className="exam-card" onClick={() => loadQuestions(exam)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-primary">{exam.category}</span>
                  <span className={`badge ${exam.isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {exam.isPublished ? '✓ Published' : '⊘ Draft'}
                  </span>
                </div>
                <div className="exam-title">{exam.title}</div>
                <div className="exam-meta">
                  <span className="exam-meta-item">⏱️ {exam.duration} min</span>
                  <span className="exam-meta-item">📊 {exam.totalMarks} marks</span>
                </div>
                <div className="exam-footer">
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to manage questions</span>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm btn-secondary" onClick={e => togglePublish(exam, e)}>
                      {exam.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={e => openEditExam(exam, e)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={e => deleteExam(exam._id, e)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && selectedExam && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Total marks: <strong style={{ color: 'var(--primary-light)' }}>{selectedExam.totalMarks}</strong>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openCreateQ}>+ Add Question</button>
          </div>

          {questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❓</div>
              <div className="empty-title">No questions yet</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openCreateQ}>Add first question</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {questions.map((q, i) => (
                <div key={q._id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span className="badge badge-secondary">Q{i + 1}</span>
                        <span className="badge badge-primary">{q.type.replace('_', ' ')}</span>
                        <span className="badge badge-warning">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.questionText}</div>
                      {q.type === 'mcq' && q.options?.length > 0 && (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {q.options.map((opt, oi) => (
                            <span key={oi} style={{
                              padding: '2px 10px', borderRadius: 20,
                              border: `1px solid ${opt === q.correctAnswer ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                              background: opt === q.correctAnswer ? 'rgba(16,185,129,0.1)' : 'var(--bg-card2)',
                              color: opt === q.correctAnswer ? '#34d399' : 'inherit',
                            }}>{opt}</span>
                          ))}
                        </div>
                      )}
                      {q.type !== 'short_answer' && (
                        <div style={{ fontSize: 12, color: '#34d399', marginTop: 6 }}>✓ Answer: {q.correctAnswer}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditQ(q)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteQuestion(q._id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== Exam Modal ===== */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <span className="modal-title">{editingExam ? '✏️ Edit Exam' : '+ Create Exam'}</span>
              <button className="modal-close" onClick={() => setShowExamModal(false)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Exam Title *</label>
                <input className="form-control" placeholder="e.g. Mathematics Mid-Term" value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} placeholder="Brief description…" value={examForm.description} onChange={e => setExamForm({ ...examForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input className="form-control" placeholder="e.g. Science" value={examForm.category} onChange={e => setExamForm({ ...examForm, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes) *</label>
                <input type="number" className="form-control" min="1" value={examForm.duration} onChange={e => setExamForm({ ...examForm, duration: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Passing Marks</label>
                <input type="number" className="form-control" min="0" value={examForm.passingMarks} onChange={e => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={examForm.isPublished} onChange={e => setExamForm({ ...examForm, isPublished: e.target.checked })} />
                  Publish immediately
                </label>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Instructions</label>
                <textarea className="form-control" rows={2} placeholder="Instructions for students…" value={examForm.instructions} onChange={e => setExamForm({ ...examForm, instructions: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowExamModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveExam} disabled={saving || !examForm.title || !examForm.category}>
                {saving ? 'Saving…' : editingExam ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Question Modal ===== */}
      {showQModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <span className="modal-title">{editingQ ? '✏️ Edit Question' : '+ Add Question'}</span>
              <button className="modal-close" onClick={() => setShowQModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea className="form-control" rows={3} placeholder="Enter the question…" value={qForm.questionText} onChange={e => setQForm({ ...qForm, questionText: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-control" value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value, options: ['', '', '', ''], correctAnswer: '' })}>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marks *</label>
                <input type="number" className="form-control" min="1" value={qForm.marks} onChange={e => setQForm({ ...qForm, marks: Number(e.target.value) })} />
              </div>
            </div>

            {qForm.type === 'mcq' && (
              <>
                <div className="form-group">
                  <label className="form-label">Options (one per box)</label>
                  {qForm.options.map((opt, i) => (
                    <input key={i} className="form-control" style={{ marginBottom: 8 }} placeholder={`Option ${i + 1}`} value={opt}
                      onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} />
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Correct Answer *</label>
                  <select className="form-control" value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })}>
                    <option value="">-- Select correct option --</option>
                    {qForm.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </>
            )}

            {qForm.type === 'true_false' && (
              <div className="form-group">
                <label className="form-label">Correct Answer *</label>
                <select className="form-control" value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })}>
                  <option value="">-- Select --</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}

            {qForm.type === 'short_answer' && (
              <div className="form-group">
                <label className="form-label">Expected Answer (for reference)</label>
                <input className="form-control" placeholder="Expected answer…" value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })} />
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowQModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveQuestion} disabled={saving || !qForm.questionText || !qForm.correctAnswer}>
                {saving ? 'Saving…' : editingQ ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageExams;
