import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaUpload } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Makanan',
    price: '',
    stock: '',
    sku: '',
    description: '',
    image_url: '',
    brand: '',
    cost: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting data:', formData);
      
      if (editingProduct) {
        const response = await axios.put(`/products/${editingProduct.id}`, formData);
        console.log('Update response:', response.data);
        alert('Produk berhasil diupdate!');
      } else {
        const response = await axios.post('/products', formData);
        console.log('Create response:', response.data);
        alert('Produk berhasil ditambahkan!');
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Submit error:', error.response || error);
      alert('Gagal menyimpan produk: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setImagePreview(product.image_url || '');
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    try {
      setUploading(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post('/products/upload-image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData({ ...formData, image_url: response.data.imageUrl });
      setImagePreview(response.data.imageUrl);
      alert('Gambar berhasil diupload!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload gambar: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await axios.delete(`/products/${id}`);
        alert('Produk berhasil dihapus!');
        fetchProducts();
      } catch (error) {
        alert('Gagal menghapus produk: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Makanan',
      price: '',
      stock: '',
      sku: '',
      description: '',
      image_url: '',
      brand: '',
      cost: ''
    });
    setEditingProduct(null);
    setImagePreview('');
    setShowModal(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Manajemen Produk</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> Tambah Produk
        </button>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="products-table-wrapper desktop-view">
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama</th>
                <th>Brand</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Modal</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td><span className="badge badge-brand">{product.sku}</span></td>
                  <td><span style={{fontWeight: 600}}>{product.name}</span></td>
                  <td>{product.brand || '-'}</td>
                  <td><span className="badge badge-brand">{product.category}</span></td>
                  <td>{formatRupiah(product.price)}</td>
                  <td style={{color: 'var(--gray-500)'}}>{product.cost ? formatRupiah(product.cost) : '-'}</td>
                  <td>
                    <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(product)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="products-cards mobile-view">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-card-header">
              <div>
                <h3>{product.name}</h3>
                <p className="product-sku">SKU: {product.sku}</p>
              </div>
              <span className="category-badge">{product.category}</span>
            </div>
            <div className="product-card-body">
              <div className="product-info">
                <div className="info-item">
                  <span className="info-label">Harga</span>
                  <span className="info-value">{formatRupiah(product.price)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stok</span>
                  <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                    {product.stock}
                  </span>
                </div>
              </div>
            </div>
            <div className="product-card-actions">
              <button className="edit-btn" onClick={() => handleEdit(product)}>
                <FaEdit /> Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                <FaTrash /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Produk *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: Nichoa, General"
                  />
                </div>
                <div className="form-group">
                  <label>Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Snack</option>
                    <option>Elektronik</option>
                    <option>Alat Tulis</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga Jual *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    placeholder="Harga jual ke customer"
                  />
                </div>
                <div className="form-group">
                  <label>Harga Modal</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    placeholder="Harga modal / cost"
                  />
                </div>
                <div className="form-group">
                  <label>Stok *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Gambar Produk</label>
                <div className="image-upload-container">
                  {imagePreview || formData.image_url ? (
                    <div className="image-preview">
                      <img src={imagePreview || formData.image_url} alt="Preview" />
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <FaImage size={50} />
                      <p>Belum ada gambar</p>
                    </div>
                  )}
                  <div className="upload-actions">
                    <label htmlFor="image-upload" className="upload-btn">
                      <FaUpload /> {uploading ? 'Uploading...' : 'Upload Gambar'}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p className="upload-hint">Max 5MB - JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
