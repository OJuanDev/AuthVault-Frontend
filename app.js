const API_URL = 'http://localhost:3000/api';
let accessToken = localStorage.getItem('accessToken') || null;
let appConfig = { googleClientId: null, githubClientId: null };

// UI Elements
const views = {
    authContainer: document.getElementById('auth-container'),
    login: document.getElementById('login-view'),
    signup: document.getElementById('signup-view'),
    forgot: document.getElementById('forgot-view'),
    reset: document.getElementById('reset-view'),
    dashboard: document.getElementById('dashboard-view'),
    sideTitle: document.getElementById('side-title'),
    sideDesc: document.getElementById('side-desc')
};

async function init() {
    // Carrega configurações públicas (IDs de Cliente Social)
    try {
        appConfig = await apiRequest('/auth/config');
    } catch (e) {
        console.warn('Não foi possível carregar configurações sociais.');
    }

    handleGithubCallback();
    accessToken ? showView('dashboard') : showView('login');
}

function showView(viewName) {
    const forms = ['login', 'signup', 'forgot', 'reset'];
    forms.forEach(f => { if (views[f]) views[f].style.display = 'none'; });

    if (viewName === 'dashboard') {
        const authCont = document.getElementById('auth-container');
        if (authCont) authCont.style.display = 'none';
        views.dashboard.style.display = 'block';
        loadDashboard();
    } else {
        const authCont = document.getElementById('auth-container');
        if (authCont) authCont.style.display = 'grid';
        views.dashboard.style.display = 'none';
        views[viewName].style.display = 'block';
        
        if (viewName === 'signup') {
            views.sideTitle.textContent = 'Junte-se à Elite da Segurança.';
            views.sideDesc.textContent = 'Crie sua conta em segundos e comece a gerenciar suas identidades com controle total.';
        } else if (viewName === 'forgot' || viewName === 'reset') {
            views.sideTitle.textContent = 'Recupere sua conta.';
            views.sideDesc.textContent = 'Não se preocupe, o sistema de segurança AuthVault ajuda você a redefinir seu acesso com segurança.';
        } else {
            views.sideTitle.textContent = 'Gestão de Identidade Próxima Geração.';
            views.sideDesc.textContent = 'Uma infraestrutura robusta para controle de acesso sob demanda, protegida por criptografia.';
        }
    }
}

function showError(view, message) {
    const errorEl = document.getElementById(`${view}-error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
    }
}

// Global API Helper
async function apiRequest(endpoint, options = {}) {
    const headers = { 
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };
    
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (res.status === 401 && accessToken) {
        const refreshed = await silentRefresh();
        if (refreshed) return apiRequest(endpoint, options);
        handleLogout();
        throw new Error('Sessão expirada.');
    }
    
    if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || 'Erro na requisição');
    }
    
    return res.status === 204 ? null : res.json();
}

async function silentRefresh() {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, { method: 'POST' });
        if (!res.ok) return false;
        const data = await res.json();
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        return true;
    } catch (e) { return false; }
}

// Auth Handlers
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    try {
        btn.disabled = true;
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        showView('dashboard');
    } catch (err) { showError('login', err.message); }
    finally { btn.disabled = false; }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const btn = document.getElementById('signup-btn');
    try {
        btn.disabled = true;
        await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        alert('Cadastro realizado!');
        showView('login');
    } catch (err) { showError('signup', err.message); }
    finally { btn.disabled = false; }
});

// Recovery Handlers
document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
        const data = await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
        document.getElementById('forgot-success').textContent = data.message;
        document.getElementById('forgot-success').style.display = 'block';
        setTimeout(() => showView('reset'), 3000);
    } catch (err) { showError('forgot', err.message); }
});

document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('reset-token').value;
    const password = document.getElementById('reset-password').value;
    try {
        await apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
        alert('Senha redefinida!');
        showView('login');
    } catch (err) { showError('reset', err.message); }
});

// Social Login Logic
function loginWithGoogle() {
    if (!appConfig.googleClientId || appConfig.googleClientId === 'your_google_client_id') {
        return alert('Configuração do Google ausente no .env do servidor.');
    }
    
    google.accounts.id.initialize({
        client_id: appConfig.googleClientId,
        callback: async (response) => {
            try {
                const data = await apiRequest('/auth/google', {
                    method: 'POST',
                    body: JSON.stringify({ idToken: response.credential })
                });
                accessToken = data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                showView('dashboard');
            } catch (e) {
                showError('login', 'Falha Google: ' + e.message);
            }
        }
    });
    google.accounts.id.prompt();
}

function loginWithGithub() {
    if (!appConfig.githubClientId || appConfig.githubClientId === 'your_github_client_id') {
        return alert('Configuração do GitHub ausente no .env do servidor.');
    }
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${appConfig.githubClientId}&scope=user:email&redirect_uri=${redirectUri}`;
}

async function handleGithubCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        try {
            window.history.replaceState({}, document.title, window.location.pathname);
            const data = await apiRequest('/auth/github', { method: 'POST', body: JSON.stringify({ code }) });
            accessToken = data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            showView('dashboard');
        } catch (e) { showError('login', 'Falha GitHub'); }
    }
}

// Dashboard
async function loadDashboard() {
    await Promise.all([loadUser(), loadSessions(), loadLogs()]);
}

async function loadUser() {
    try {
        const user = await apiRequest('/auth/me');
        document.getElementById('user-initials').textContent = user.name.charAt(0).toUpperCase();
        document.querySelector('.bento-item.item-large h2').textContent = `Olá, ${user.name}`;
    } catch (e) {}
}

async function loadSessions() {
    const list = document.getElementById('session-list');
    try {
        const sessions = await apiRequest('/sessions');
        list.innerHTML = sessions.length ? '' : '<p style="color: var(--text-secondary);">Sem outras sessões.</p>';
        sessions.forEach(s => {
            const card = document.createElement('div');
            card.className = 'session-card';
            card.innerHTML = `
                <div><h5 style="margin-bottom: 4px;">${s.device || 'Desconhecido'}</h5>
                <p style="font-size: 0.7rem; color: var(--text-secondary);">${s.ip} • ${new Date(s.lastActive).toLocaleDateString()}</p></div>
                <button class="revoke-btn" onclick="revokeSession('${s.token}')">Remover</button>
            `;
            list.appendChild(card);
        });
    } catch (e) {}
}

async function loadLogs() {
    const list = document.getElementById('audit-log-list');
    try {
        const logs = await apiRequest('/audit-logs');
        list.innerHTML = '';
        logs.forEach(log => {
            const item = document.createElement('div');
            item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            item.style.paddingBottom = '8px';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                    <span style="color: ${log.status === 'success' ? 'var(--success)' : 'var(--error)'}; font-weight:700;">${log.action}</span>
                    <span>${new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
                <div style="font-size: 0.7rem; opacity: 0.7;">IP: ${log.ipAddress}</div>
            `;
            list.appendChild(item);
        });
    } catch (e) {}
}

async function revokeSession(token) {
    await apiRequest('/sessions/revoke', { method: 'POST', body: JSON.stringify({ token }) });
    loadSessions();
}

async function revokeAllSessions() {
    if (!confirm('Encerrar TODAS?')) return;
    await apiRequest('/sessions/revoke-all', { method: 'POST' });
    loadSessions();
}

async function handleLogout() {
    try { await apiRequest('/auth/logout', { method: 'POST' }); } catch(e) {}
    localStorage.removeItem('accessToken');
    accessToken = null;
    showView('login');
}

setInterval(() => { if (accessToken) silentRefresh(); }, 10 * 60 * 1000);
init();
