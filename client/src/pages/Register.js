import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './Register.css';

// SVG Icons
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Register = () => {
  const [step, setStep] = useState(1); // 1: form, 2: OTP verify, 3: success
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Nama lengkap harus diisi');
      return false;
    }
    if (!formData.username.trim() || formData.username.length < 4) {
      setError('Username minimal 4 karakter');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username hanya boleh huruf, angka, dan underscore');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email tidak valid');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register/send-otp', {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSessionId(response.data.sessionId);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim kode OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register/verify-otp', {
        sessionId,
        otp: otpCode
      });

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register/resend-otp', {
        sessionId
      });
      
      setSessionId(response.data.sessionId);
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSendOtp} className="register-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Nama Lengkap</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Masukkan nama lengkap"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Pilih username"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Masukkan email aktif"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Minimal 6 karakter"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Konfirmasi Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Ulangi password"
          required
        />
      </div>
      
      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Mengirim OTP...
          </>
        ) : (
          'Daftar'
        )}
      </button>
      
      <p className="login-link">
        Sudah punya akun? <Link to="/login">Masuk di sini</Link>
      </p>
    </form>
  );

  const renderStep2 = () => (
    <div className="otp-section">
      <div className="otp-icon">
        <MailIcon />
      </div>
      <h2>Verifikasi Email</h2>
      <p className="otp-info">
        Kami telah mengirim kode verifikasi 6 digit ke<br />
        <strong>{formData.email}</strong>
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleVerifyOtp}>
        <div className="otp-inputs" onPaste={handleOtpPaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => otpRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(index, e)}
              className="otp-input"
            />
          ))}
        </div>
        
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Memverifikasi...
            </>
          ) : (
            'Verifikasi'
          )}
        </button>
      </form>
      
      <p className="resend-otp">
        Tidak menerima kode?{' '}
        {countdown > 0 ? (
          <span>Kirim ulang dalam {countdown}s</span>
        ) : (
          <button onClick={handleResendOtp} disabled={loading}>
            Kirim Ulang
          </button>
        )}
      </p>
      
      <button className="back-btn" onClick={() => setStep(1)}>
        <ArrowLeftIcon />
        Kembali
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="success-section">
      <div className="success-icon">
        <CheckCircleIcon />
      </div>
      <h2>Registrasi Berhasil!</h2>
      <p>Akun Anda telah berhasil dibuat. Silakan login untuk mulai menggunakan sistem.</p>
      <button className="register-btn" onClick={() => navigate('/login')}>
        Login Sekarang
      </button>
    </div>
  );

  return (
    <div className="register-container">
      <div className="register-box">
        <Link to="/" className="back-to-home">
          <ArrowLeftIcon />
          Kembali ke Home
        </Link>
        
        <div className="register-header">
          <div className="register-logo">
            <ShoppingBagIcon />
          </div>
          <h1>{step === 3 ? 'Selamat!' : 'Daftar Akun'}</h1>
          {step === 1 && <p>Buat akun admin untuk kelola bisnis Anda</p>}
        </div>
        
        {step === 1 && (
          <div className="steps-indicator">
            <div className="step active">1</div>
            <div className="step-line"></div>
            <div className="step">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
          </div>
        )}
        {step === 2 && (
          <div className="steps-indicator">
            <div className="step completed">✓</div>
            <div className="step-line active"></div>
            <div className="step active">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
          </div>
        )}
        {step === 3 && (
          <div className="steps-indicator">
            <div className="step completed">✓</div>
            <div className="step-line active"></div>
            <div className="step completed">✓</div>
            <div className="step-line active"></div>
            <div className="step completed">✓</div>
          </div>
        )}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <div className="register-footer">
          <p>© 2024 Vendra POS - All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
