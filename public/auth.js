// Shared authentication and profile management for all pages
(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const toggleSignup = document.getElementById('toggleSignup');
    const signupFields = document.getElementById('signupFields');
    const loginTitle = document.getElementById('loginTitle');
    const authForm = document.getElementById('authForm');
    const googleLoginBtn = document.getElementById('googleLogin');
    const loginError = document.getElementById('loginError');
    const profileCircleContainer = document.getElementById('profileCircleContainer');
    const profileCircle = document.getElementById('profileCircle');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutMenu = document.getElementById('logoutMenu');
    const userInfoDropdown = document.getElementById('userInfoDropdown');
    const uploadProductLink = document.getElementById('uploadProductLink'); // for admin upload link
    const adminOrdersLink = document.getElementById('adminOrdersLink'); // for admin all orders link
    const paletteLink = document.getElementById('paletteLink'); // for admin palette link
    const messagesLink = document.getElementById('messagesLink'); // for admin messages link

    let isSignup = false;

    // Modal open/close handlers
    if (loginBtn) {
      loginBtn.onclick = () => { 
        loginModal.classList.add('active'); 
      };
    }

    if (closeLogin) {
      closeLogin.onclick = () => { 
        loginModal.classList.remove('active'); 
        loginError.textContent = ""; 
      };
    }

    // Toggle between login and signup
    if (toggleSignup) {
      toggleSignup.onclick = () => {
        isSignup = !isSignup;
        signupFields.classList.toggle('hidden', !isSignup);
        loginTitle.textContent = isSignup ? "Sign Up" : "Login";
        toggleSignup.textContent = isSignup ? "Login instead" : "Sign up instead";
        document.getElementById('loginEmailBtn').textContent = isSignup ? "Sign Up" : "Login";
        loginError.textContent = "";
      };
    }

    // Profile dropdown toggle
    if (profileCircle) {
      profileCircle.onclick = function(e) {
        e.stopPropagation();
        profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
      };
    }

    // Close dropdown when clicking outside
    document.body.onclick = () => {
      if (profileDropdown) {
        profileDropdown.style.display = "none";
      }
    };

    // Logout handler
    if (logoutMenu) {
      logoutMenu.onclick = async function(e) {
        e.preventDefault();
        if (window.firebase && firebase.auth) {
          await firebase.auth().signOut();
        }
        if (profileDropdown) {
          profileDropdown.style.display = "none";
        }
        window.location.reload();
      };
    }

    // Firebase email/password login/signup
    if (authForm) {
      authForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        loginError.textContent = "";
        const email = document.getElementById('emailField').value;
        const password = document.getElementById('passwordField').value;
        const name = isSignup ? document.getElementById('signupName').value : "";

        try {
          if (isSignup) {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            if (name) {
              await userCredential.user.updateProfile({ displayName: name });
            }
            handleLogin(userCredential.user);
          } else {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            handleLogin(userCredential.user);
          }
          loginModal.classList.remove('active');
        } catch(err) {
          loginError.textContent = err.message;
        }
      });
    }

    // Google login
    if (googleLoginBtn) {
      googleLoginBtn.onclick = async function() {
        loginError.textContent = "";
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
          const result = await firebase.auth().signInWithPopup(provider);
          handleLogin(result.user);
          loginModal.classList.remove('active');
        } catch(err) {
          loginError.textContent = err.message;
        }
      };
    }

    // Handle user login - update UI and store user info
    async function handleLogin(user) {
      // Check admin status using backend API
      // Try global helper first, fall back to direct API call if not available
      let isAdmin = false;
      try {
        if (typeof window.checkIsAdmin === 'function') {
          isAdmin = await window.checkIsAdmin(user);
        } else {
          // Fallback: call API directly if ui-utils.js is not loaded
          console.warn('window.checkIsAdmin not available (ui-utils.js may not be loaded yet), falling back to direct API call');
          const API_BASE = window.API_BASE || (
            (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
              ? 'http://localhost:5000'
              : 'https://bonnie-lass-florals.onrender.com'
          );
          const idToken = await user.getIdToken();
          const response = await fetch(`${API_BASE}/api/admin/check`, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            isAdmin = data.isAdmin === true;
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        isAdmin = false;
      }
      const role = isAdmin ? "Admin" : "Customer";
      
      // Update user info in dropdown
      if (userInfoDropdown) {
        userInfoDropdown.innerHTML = `
          <div style="padding: 0.8em 1.2em; border-bottom: 1px solid #eee; background: #f9f9f9;">
            <div style="font-weight: bold; color: #2563eb;">${user.displayName || user.email}</div>
            <div style="font-size: 0.85em; color: #666;">${user.email}</div>
            <div style="font-size: 0.85em; color: #60a5fa; margin-top: 0.3em;">Role: ${role}</div>
          </div>
        `;
      }

      // Show admin-only links for admins only
      if (uploadProductLink) {
        uploadProductLink.style.display = role === "Admin" ? "" : "none";
      }
      if (adminOrdersLink) {
        adminOrdersLink.style.display = role === "Admin" ? "" : "none";
      }
      if (paletteLink) {
        paletteLink.style.display = role === "Admin" ? "" : "none";
      }
      if (messagesLink) {
        messagesLink.style.display = role === "Admin" ? "" : "none";
      }

      if (loginBtn) loginBtn.style.display = "none";
      if (profileCircleContainer) profileCircleContainer.style.display = "flex";
      if (profileCircle) profileCircle.src = user.photoURL || "img/default-avatar.png";
      
      // Store user info in localStorage
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || "");
      localStorage.setItem('userPhoto', user.photoURL || "");
    }

    // Handle user logout - clear UI and storage
    function handleLogout() {
      if (loginBtn) loginBtn.style.display = "";
      if (profileCircleContainer) profileCircleContainer.style.display = "none";
      if (userInfoDropdown) userInfoDropdown.innerHTML = "";
      if (uploadProductLink) uploadProductLink.style.display = "none";
      if (adminOrdersLink) adminOrdersLink.style.display = "none";
      if (paletteLink) paletteLink.style.display = "none";
      if (messagesLink) messagesLink.style.display = "none";
      
      // Clear localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhoto');
    }

    // Auth state listener
    if (window.firebase && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          handleLogin(user);
        } else {
          handleLogout();
        }
      });
    }
  });
})();
