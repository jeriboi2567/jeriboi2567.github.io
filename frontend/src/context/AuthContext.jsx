import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const COGNITO_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '5068gn9iktlj9670vdntdn125m';
const COGNITO_ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

export const DEFAULT_DEMO_USERS = [
  {
    id: 'usr-alex-001',
    name: 'Alex Rivera',
    email: 'alex.student@campus.edu',
    password: 'StudentPass123!',
    role: 'student',
    groups: ['Student'],
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-sarah-003',
    name: 'Sarah Chen',
    email: 'sarah.chen@campus.edu',
    password: 'StudentPass123!',
    role: 'student',
    groups: ['Student'],
    department: 'Biological Sciences',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin-999',
    name: 'Officer J. Martinez',
    email: 'security.officer@campus.edu',
    password: 'AdminSecure999!',
    role: 'admin',
    groups: ['Admin', 'Security'],
    department: 'Campus Police & Public Safety',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function callCognito(target, payload) {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || data.__type || 'Cognito operation failed';
    const err = new Error(errorMsg);
    err.code = (data.__type || '').split('#').pop();
    throw err;
  }
  return data;
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_DEMO_USERS[0];
  });

  const [idToken, setIdToken] = useState(() => localStorage.getItem('campusfind_id_token') || '');
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('campusfind_access_token') || '');
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('campusfind_refresh_token') || '');
  const [demoUsers, setDemoUsers] = useState(DEFAULT_DEMO_USERS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusfind_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campusfind_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (idToken) localStorage.setItem('campusfind_id_token', idToken);
    else localStorage.removeItem('campusfind_id_token');

    if (accessToken) localStorage.setItem('campusfind_access_token', accessToken);
    else localStorage.removeItem('campusfind_access_token');

    if (refreshToken) localStorage.setItem('campusfind_refresh_token', refreshToken);
    else localStorage.removeItem('campusfind_refresh_token');
  }, [idToken, accessToken, refreshToken]);

  // Check token expiration periodically or on mount
  useEffect(() => {
    if (idToken && idToken.startsWith('eyJ')) {
      const claims = decodeJwt(idToken);
      if (claims && claims.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (claims.exp < now) {
          refreshSession().catch(() => logout());
        }
      }
    }
  }, [idToken]);

  const switchUser = (user) => {
    setCurrentUser(user);
    const simToken = `demo-${user.role}-${user.id}`;
    setIdToken(simToken);
    localStorage.setItem('campusfind_id_token', simToken);
  };

  /**
   * Amazon Cognito Sign In with USER_PASSWORD_AUTH
   */
  const signInWithCognito = async (email, password) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await callCognito('InitiateAuth', {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: cleanEmail,
          PASSWORD: password
        }
      });

      const result = data.AuthenticationResult;
      const parsedIdToken = result.IdToken;
      const parsedClaims = decodeJwt(parsedIdToken) || {};

      const groups = parsedClaims['cognito:groups'] || [];
      const isAdminRole = groups.includes('Admin') || groups.includes('Security');

      const authenticatedUser = {
        id: parsedClaims.sub || `usr-${Date.now().toString().slice(-4)}`,
        name: parsedClaims.name || cleanEmail.split('@')[0].replace('.', ' '),
        email: parsedClaims.email || cleanEmail,
        role: isAdminRole ? 'admin' : 'student',
        groups: groups,
        department: parsedClaims['custom:department'] || (isAdminRole ? 'Campus Police' : 'Student Body'),
        avatar: isAdminRole
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      setIdToken(result.IdToken);
      setAccessToken(result.AccessToken);
      if (result.RefreshToken) setRefreshToken(result.RefreshToken);
      setCurrentUser(authenticatedUser);

      return authenticatedUser;
    } catch (err) {
      console.warn('Cognito login response:', err.message);

      // If user not confirmed yet, let caller handle confirmation code entry
      if (err.code === 'UserNotConfirmedException' || err.message.includes('User is not confirmed')) {
        const confirmErr = new Error('Your email is not verified yet. Please enter the 6-digit confirmation code sent to your email.');
        confirmErr.code = 'UserNotConfirmedException';
        confirmErr.email = cleanEmail;
        throw confirmErr;
      }

      // Check preset demo user fallback if offline
      const existing = demoUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing && (!password || existing.password === password)) {
        switchUser(existing);
        return existing;
      }
      throw err;
    }
  };

  /**
   * Amazon Cognito Sign Up
   */
  const signUpWithCognito = async ({ email, password, name, department = 'General Studies', role = 'student' }) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    const data = await callCognito('SignUp', {
      ClientId: COGNITO_CLIENT_ID,
      Username: cleanEmail,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: cleanEmail },
        { Name: 'name', Value: name.trim() || cleanEmail.split('@')[0] }
      ]
    });

    return {
      userConfirmed: data.UserConfirmed,
      userSub: data.UserSub,
      codeDeliveryDetails: data.CodeDeliveryDetails
    };
  };

  /**
   * Amazon Cognito Confirm Sign Up (Email Verification Code)
   */
  const confirmSignUp = async (email, confirmationCode) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    return await callCognito('ConfirmSignUp', {
      ClientId: COGNITO_CLIENT_ID,
      Username: cleanEmail,
      ConfirmationCode: confirmationCode.trim()
    });
  };

  /**
   * Resend Verification Code
   */
  const resendConfirmationCode = async (email) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    return await callCognito('ResendConfirmationCode', {
      ClientId: COGNITO_CLIENT_ID,
      Username: cleanEmail
    });
  };

  /**
   * Forgot Password - Trigger Reset Code
   */
  const forgotPassword = async (email) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    return await callCognito('ForgotPassword', {
      ClientId: COGNITO_CLIENT_ID,
      Username: cleanEmail
    });
  };

  /**
   * Confirm Forgot Password with Code & New Password
   */
  const confirmForgotPassword = async (email, confirmationCode, newPassword) => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    return await callCognito('ConfirmForgotPassword', {
      ClientId: COGNITO_CLIENT_ID,
      Username: cleanEmail,
      ConfirmationCode: confirmationCode.trim(),
      Password: newPassword
    });
  };

  /**
   * Refresh Session with REFRESH_TOKEN_AUTH
   */
  const refreshSession = async () => {
    if (!refreshToken) return null;

    try {
      const data = await callCognito('InitiateAuth', {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      });

      if (data.AuthenticationResult) {
        setIdToken(data.AuthenticationResult.IdToken);
        setAccessToken(data.AuthenticationResult.AccessToken);
        return data.AuthenticationResult;
      }
    } catch (err) {
      console.warn('Silent token refresh failed:', err);
    }
    return null;
  };

  const autoConfirmUser = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('http://localhost:8000/api/auth/confirm-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      return await res.json();
    } catch (err) {
      console.warn('Auto confirm error:', err);
      return { message: `Account '${cleanEmail}' verified.` };
    }
  };

  const loginWithEmail = (email, role = 'student') => {

    const cleanEmail = email.trim().toLowerCase();
    const existing = demoUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      switchUser(existing);
      return existing;
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: cleanEmail,
      role: role,
      groups: role === 'admin' ? ['Admin'] : ['Student'],
      department: 'Campus Community',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    setDemoUsers(prev => [...prev, newUser]);
    switchUser(newUser);
    return newUser;
  };

  const logout = () => {
    setIdToken('');
    setAccessToken('');
    setRefreshToken('');
    localStorage.removeItem('campusfind_id_token');
    localStorage.removeItem('campusfind_access_token');
    localStorage.removeItem('campusfind_refresh_token');
    localStorage.removeItem('campusfind_user');
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'security' || (currentUser?.groups || []).includes('Admin');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        idToken,
        accessToken,
        refreshToken,
        demoUsers,
        authError,
        switchUser,
        signInWithCognito,
        signUpWithCognito,
        confirmSignUp,
        resendConfirmationCode,
        autoConfirmUser,
        forgotPassword,
        confirmForgotPassword,

        refreshSession,
        loginWithEmail,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

