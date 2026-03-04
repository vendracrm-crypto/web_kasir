import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaKey, FaUser, FaUserShield } from 'react-icons/fa';
import '../pages/Products.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'kasir'
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await axios.put(`/users/${editingUser.id}`, updateData);
        alert('User berhasil diupdate!');
      } else {
        if (!formData.password || formData.password.length < 6) {
          alert('Password minimal 6 karakter');
          return;
        }
        await axios.post('/users', formData);
        alert('User berhasil ditambahkan!');
      }
      
      fetchUsers();
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus user ini?')) {
      try {
        await axios.delete(`/users/${id}`);
        alert('User berhasil dihapus!');
        fetchUsers();
      } catch (error) {
        alert('Gagal menghapus user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    try {
      await axios.put(`/users/${selectedUser.id}/password`, { newPassword });
      alert('Password berhasil diubah!');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      alert('Gagal mengubah password: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'kasir'
    });
    setEditingUser(null);
    setShowModal(false);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> Tambah User
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.role === 'admin' ? <FaUserShield color="var(--brand-500)" /> : <FaUser color="var(--success-600)" />}
                    {user.username}
                  </div>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.role === 'admin' ? 'admin' : 'kasir'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(user)} title="Edit User">
                      <FaEdit />
                    </button>
                    <button className="password-btn" onClick={() => handleChangePassword(user)} title="Ubah Password" style={{ background: 'var(--brand-500)' }}>
                      <FaKey />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)} title="Hapus User">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="users-cards mobile-only">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-card-icon">
                {user.role === 'admin' ? <FaUserShield size={24} /> : <FaUser size={24} />}
              </div>
              <div className="user-card-info">
                <h3>{user.username}</h3>
                <p>{user.name}</p>
              </div>
              <span className={`status-badge ${user.role === 'admin' ? 'admin' : 'kasir'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <div className="user-card-actions">
              <button className="edit-btn" onClick={() => handleEdit(user)}>
                <FaEdit /> Edit
              </button>
              <button className="password-btn" onClick={() => handleChangePassword(user)} style={{ background: 'var(--brand-500)' }}>
                <FaKey /> Password
              </button>
              <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                <FaTrash /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  placeholder="Masukkan username"
                />
              </div>
              
              {!editingUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Masukkan email (opsional)"
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Batal
                </button>
                <button type="submit" className="submit-btn">
                  {editingUser ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Ubah Password</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>
              Ubah password untuk user: <strong>{selectedUser?.username}</strong>
            </p>
            <form onSubmit={submitPasswordChange}>
              <div className="form-group">
                <label>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Batal
                </button>
                <button type="submit" className="submit-btn" style={{ background: '#8b5cf6' }}>
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
