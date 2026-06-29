import React from 'react';

const SignShopView = ({
  signShopDate, signShopList = [],
  signShopTitle, setSignShopTitle, signShopCustomer, setSignShopCustomer,
  signShopDesc, setSignShopDesc, signShopPhotos, setSignShopPhotos,
  editingSignShopId, editSignShop, setEditSignShop, editSignShopPhotos, setEditSignShopPhotos,
  addSignShopJob, toggleSignShopComplete, startEditSignShop, cancelEditSignShop,
  saveSignShopEdit, removeSignShopPhoto, deleteSignShopJob, setSignShopPreview
}) => {
  return (
    <>
      <h3>🪧 Sign Shop Jobs on {signShopDate?.toLocaleDateString()}</h3>
      <div className="add-task" style={{marginBottom: '1rem'}}>
        <input type="text" placeholder="Job title *" value={signShopTitle} onChange={(e) => setSignShopTitle(e.target.value)} />
        <input type="text" placeholder="Customer" value={signShopCustomer} onChange={(e) => setSignShopCustomer(e.target.value)} />
        <textarea placeholder="Description" rows="2" style={{height: '100%', color: '#000000'}} value={signShopDesc} onChange={(e) => setSignShopDesc(e.target.value)} />
        <label style={{fontSize:'13px',marginTop:'6px', color: '#000000'}}>Attach Photos (max 5):</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setSignShopPhotos([...e.target.files].slice(0, 5))} />
        <button className="btn" onClick={addSignShopJob}>Add Sign Shop Job</button>
      </div>
      <div className="job-info-list">
        {signShopList.map((job) => (
          <div key={job._id} className={`task-item ${job.completed ? 'completed' : ''}`}>
            <div className="task-header">
              <span className="task-author">{job.author}</span>
              <span className="task-timestamp">{new Date(job.createdAt).toLocaleString()}</span>
            </div>
            {editingSignShopId === job._id ? (
              <div style={{padding:'8px 0'}}>
                <input type="text" value={editSignShop.title} onChange={(e) => setEditSignShop({...editSignShop, title: e.target.value})} placeholder="Job title" />
                <input type="text" value={editSignShop.customer} onChange={(e) => setEditSignShop({...editSignShop, customer: e.target.value})} placeholder="Customer" />
                <textarea rows="2" value={editSignShop.description} onChange={(e) => setEditSignShop({...editSignShop, description: e.target.value})} placeholder="Description" />
                {job.photos && job.photos.length > 0 && (
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap',margin:'8px 0'}}>
                    {job.photos.map((photo, idx) => (
                      <div key={idx} style={{position:'relative'}}>
                        <img src={`/signshop-photos/${photo}`} alt={`Photo ${idx+1}`} style={{width:'70px',height:'70px',objectFit:'cover',borderRadius:'6px',border:'1px solid #ddd'}} />
                        <button onClick={() => removeSignShopPhoto(job._id, photo)} style={{position:'absolute',top:'-6px',right:'-6px',background:'#f44336',color:'#fff',border:'none',borderRadius:'50%',width:'20px',height:'20px',cursor:'pointer',fontSize:'12px',lineHeight:'20px',padding:0}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <label style={{fontSize:'13px',marginTop:'4px',color:'#ccc'}}>Add more photos:</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setEditSignShopPhotos([...e.target.files].slice(0, 5))} />
                <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                  <button className="btn" onClick={() => saveSignShopEdit(job._id)}>Save</button>
                  <button className="btn" style={{background:'#888'}} onClick={cancelEditSignShop}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="task-content">
                  <label className="task-checkbox">
                    <input type="checkbox" checked={job.completed} onChange={() => toggleSignShopComplete(job._id)} />
                    <span className={job.completed ? 'completed-text' : ''}><strong>{job.title}</strong></span>
                  </label>
                  {job.customer && <p style={{margin: '4px 0 0 24px', fontSize: '1.4rem', color: '#000000'}}>Customer: {job.customer}</p>}
                  {job.description && <p style={{margin: '2px 0 0 24px', fontSize: '1.4rem', color: '#000000', height: 'auto'}}>{job.description}</p>}
                </div>
                <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                  <button className="btn" style={{padding:'4px 12px',fontSize:'12px'}} onClick={() => startEditSignShop(job)}>✏️ Edit</button>
                  <button className="delete-task" onClick={() => deleteSignShopJob(job._id)}>🗑️</button>
                </div>
                {job.photos && job.photos.length > 0 && (
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'8px'}}>
                    {job.photos.map((photo, idx) => (
                      <img key={idx} src={`/signshop-photos/${photo}`} alt={`Sign shop ${idx+1}`}
                        style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'6px',border:'1px solid #ddd',cursor:'pointer'}}
                        onClick={() => setSignShopPreview(`/signshop-photos/${photo}`)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {signShopList.length === 0 && <p>No sign shop jobs on this day.</p>}
      </div>
    </>
  );
};

export default SignShopView;
