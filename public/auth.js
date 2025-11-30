/**
 * Authentication Frontend Logic
 */

// State
const authState = {
    currentUser: null,
    isCheckingEmail: false,
    isSignup: false
};

// DOM Elements
const signInBtn = document.getElementById('sign-in-btn');
const userMenu = document.getElementById('user-menu');
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenuDropdown = document.getElementById('user-menu-dropdown');
const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');

const authModalOverlay = document.getElementById('auth-modal-overlay');
const authModalClose = document.getElementById('auth-modal-close');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authDisplayNameInput = document.getElementById('auth-display-name');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const passwordGroup = document.getElementById('password-group');
const nameGroup = document.getElementById('name-group');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');

const googleOAuthBtn = document.getElementById('google-oauth-btn');
const menuLogout = document.getElementById('menu-logout');

// Initialize auth on page load
async function initAuth() {
    try {
        const response = await fetch('/auth/me');
        const data = await response.json();

        if (data.user) {
            authState.currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Failed to check auth status:', error);
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    signInBtn.style.display = 'none';
    userMenu.classList.add('show');

    // Set user info
    const initials = authState.currentUser.displayName
        ? authState.currentUser.displayName.charAt(0).toUpperCase()
        : authState.currentUser.email.charAt(0).toUpperCase();

    userAvatar.textContent = initials;
    userDisplayName.textContent = authState.currentUser.displayName || authState.currentUser.email.split('@')[0];
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    signInBtn.style.display = 'block';
    userMenu.classList.remove('show');
    authState.currentUser = null;
}

// Open auth modal
function openAuthModal() {
    authModalOverlay.classList.remove('hidden');
    resetAuthForm();
}

// Close auth modal
function closeAuthModal() {
    authModalOverlay.classList.add('hidden');
    resetAuthForm();
}

// Reset auth form
function resetAuthForm() {
    authForm.reset();
    passwordGroup.style.display = 'none';
    nameGroup.style.display = 'none';
    authSubmitBtn.textContent = 'Continue';
    authState.isCheckingEmail = false;
    authState.isSignup = false;
    hideError();
    hideSuccess();
}

// Show error message
function showError(message) {
    authError.textContent = message;
    authError.classList.add('show');
}

// Hide error message
function hideError() {
    authError.classList.remove('show');
}

// Show success message
function showSuccess(message) {
    authSuccess.textContent = message;
    authSuccess.classList.add('show');
}

// Hide success message
function hideSuccess() {
    authSuccess.classList.remove('show');
}

// Handle form submission
async function handleAuthSubmit(e) {
    e.preventDefault();
    hideError();
    hideSuccess();

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const displayName = authDisplayNameInput.value.trim();

    if (!email) {
        showError('Please enter your email');
        return;
    }

    // Step 1: Check if email exists
    if (!authState.isCheckingEmail) {
        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = 'Checking...';

            const response = await fetch('/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.exists && data.hasPassword) {
                // User exists - show password field for login
                passwordGroup.style.display = 'block';
                authSubmitBtn.textContent = 'Sign In';
                authState.isCheckingEmail = true;
                authState.isSignup = false;
                authPassword.focus();
            } else {
                // New user - show password and name fields for signup
                passwordGroup.style.display = 'block';
                nameGroup.style.display = 'block';
                authSubmitBtn.textContent = 'Sign Up';
                authState.isCheckingEmail = true;
                authState.isSignup = true;
                authPassword.focus();
            }

            authSubmitBtn.disabled = false;

        } catch (error) {
            console.error('Check email error:', error);
            showError('Failed to check email. Please try again.');
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = 'Continue';
        }
        return;
    }

    // Step 2: Login or Signup
    if (!password) {
        showError('Please enter your password');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    try {
        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = authState.isSignup ? 'Creating account...' : 'Signing in...';

        const endpoint = authState.isSignup ? '/auth/signup' : '/auth/login';
        const body = authState.isSignup
            ? { email, password, displayName }
            : { email, password };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            authState.currentUser = data.user;
            showSuccess(authState.isSignup ? 'Account created successfully!' : 'Signed in successfully!');

            setTimeout(() => {
                closeAuthModal();
                updateUIForLoggedInUser();
            }, 1000);
        } else {
            showError(data.error || 'Authentication failed');
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = authState.isSignup ? 'Sign Up' : 'Sign In';
        }

    } catch (error) {
        console.error('Auth error:', error);
        showError('Authentication failed. Please try again.');
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = authState.isSignup ? 'Sign Up' : 'Sign In';
    }
}

// Handle Google OAuth
function handleGoogleOAuth() {
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST'
        });

        if (response.ok) {
            authState.currentUser = null;
            updateUIForLoggedOutUser();
            userMenuDropdown.classList.remove('show');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Toggle user menu dropdown
function toggleUserMenu() {
    userMenuDropdown.classList.toggle('show');
}

// Event Listeners
signInBtn.addEventListener('click', openAuthModal);
authModalClose.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) {
        closeAuthModal();
    }
});

authForm.addEventListener('submit', handleAuthSubmit);
googleOAuthBtn.addEventListener('click', handleGoogleOAuth);
userMenuBtn.addEventListener('click', toggleUserMenu);
menuLogout.addEventListener('click', handleLogout);

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenuDropdown.classList.remove('show');
    }
});

// Initialize auth on page load
initAuth();
