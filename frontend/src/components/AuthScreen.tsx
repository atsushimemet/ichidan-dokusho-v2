import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // 認証情報を保存
      login(data.token, data.user);
      
      // 入力画面に遷移
      navigate('/input');
    } catch (error) {
      console.error('Authentication error:', error);
      alert('認証に失敗しました。もう一度お試しください。');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google認証に失敗しました。もう一度お試しください。');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-orange-800 mb-6">
          🔐 ログイン
        </h1>
        
        <p className="text-center text-gray-600 mb-8 text-sm">
          読書記録を投稿するには<br />
          Googleアカウントでログインしてください
        </p>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
};

export default AuthScreen; 
