// Plain Language Documentation - Interactive Features

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;

    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied';
        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }).catch(() => {
        button.textContent = 'Error';
    });
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function highlightCode(code) {
    const keywords = new Set([
        'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'pass',
        'return', 'yield', 'try', 'except', 'finally', 'with', 'as',
        'import', 'from', 'class', 'def', 'lambda', 'async', 'await', 'raise',
        'assert', 'global', 'nonlocal', 'del', 'in', 'is', 'and', 'or', 'not',
        'create', 'make', 'define', 'repeat', 'until', 'do', 'then', 'otherwise',
        'function', 'generator', 'catch', 'throw'
    ]);

    const builtins = new Set([
        'print', 'len', 'range', 'list', 'dict', 'set', 'int', 'float', 'str',
        'bool', 'sum', 'min', 'max', 'sorted', 'map', 'filter', 'open', 'type',
        'enumerate', 'zip', 'any', 'all'
    ]);

    const booleans = new Set(['true', 'false', 'none', 'null']);

    const tokenRegex = /#.*$|\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b(?:true|false|null|none)\b|\b(?:if|elif|else|for|while|break|continue|pass|return|yield|try|except|finally|with|as|import|from|class|def|lambda|async|await|raise|assert|global|nonlocal|del|in|is|and|or|not|create|make|define|repeat|until|do|then|otherwise|function|generator|catch|throw)\b|\b(?:print|len|range|list|dict|set|int|float|str|bool|sum|min|max|sorted|map|filter|open|type|enumerate|zip|any|all)\b|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|\*\*|[+\-*/%]=?|[(){}\[\],.:]/gm;

    let result = '';
    let lastIndex = 0;

    code.replace(tokenRegex, (match, offset) => {
        result += escapeHtml(code.slice(lastIndex, offset));
        const lower = match.toLowerCase();
        let tokenType = '';

        if (match.startsWith('#') || match.startsWith('//')) {
            tokenType = 'comment';
        } else if (match.startsWith('"') || match.startsWith("'") || match.startsWith('`')) {
            tokenType = 'string';
        } else if (/^\d/.test(match)) {
            tokenType = 'number';
        } else if (booleans.has(lower)) {
            tokenType = 'boolean';
        } else if (keywords.has(lower)) {
            tokenType = 'keyword';
        } else if (builtins.has(lower)) {
            tokenType = 'builtin';
        } else if (/^[(){}\[\],.:]$/.test(match)) {
            tokenType = 'punctuation';
        } else if (/^[+\-*/%=&|!<>^~]+$/.test(match)) {
            tokenType = 'operator';
        }

        if (tokenType) {
            result += `<span class="token ${tokenType}">${escapeHtml(match)}</span>`;
        } else {
            result += escapeHtml(match);
        }

        lastIndex = offset + match.length;
        return match;
    });

    result += escapeHtml(code.slice(lastIndex));
    return result;
}

function highlightCodeBlocks() {
    const blocks = document.querySelectorAll('pre code');
    blocks.forEach(block => {
        if (block.dataset.highlighted === 'true') {
            return;
        }
        const raw = block.textContent;
        block.innerHTML = highlightCode(raw);
        block.dataset.highlighted = 'true';
    });
}

function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link');
    const path = window.location.pathname;
    const currentPage = path.endsWith('/') || path === '' ? 'index.html' : path.split('/').pop();

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPage = href.split('#')[0];
        if (!linkPage) {
            link.classList.toggle('active', currentPage === 'index.html');
            return;
        }
        link.classList.toggle('active', linkPage === currentPage);
    });
}

function initSearch() {
    const searchInput = document.getElementById('docSearch');
    const searchClear = document.getElementById('searchClear');
    
    if (!searchInput) {
        return;
    }

    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const navGroups = Array.from(document.querySelectorAll('.nav-group'));

    // Show/hide clear button based on input
    function updateClearButton() {
        if (searchClear) {
            searchClear.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
        }
    }

    searchInput.addEventListener('input', event => {
        const query = event.target.value.trim().toLowerCase();
        updateClearButton();

        navLinks.forEach(link => {
            const text = link.textContent.toLowerCase();
            link.style.display = text.includes(query) || query === '' ? '' : 'none';
        });

        navGroups.forEach(group => {
            const links = Array.from(group.querySelectorAll('.nav-link'));
            const anyVisible = links.some(link => link.style.display !== 'none');
            group.style.display = anyVisible ? '' : 'none';
        });
    });

    // Clear button functionality
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            updateClearButton();
            
            // Show all links again
            navLinks.forEach(link => {
                link.style.display = '';
            });

            navGroups.forEach(group => {
                group.style.display = '';
            });
        });
    }
}

function initReveal() {
    const sections = document.querySelectorAll('.doc-section');
    if (!('IntersectionObserver' in window)) {
        sections.forEach(section => section.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => observer.observe(section));
}

// Theme Management with Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function initTheme() {
    const savedTheme = getCookie('plain-theme') || 'dark';
    const html = document.documentElement;
    
    // Apply saved theme
    html.setAttribute('data-theme', savedTheme);
    
    // Update toggle button state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            setCookie('plain-theme', newTheme);
        });
    }
}

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!mobileToggle || !sidebar) {
        return;
    }

    function toggleMenu() {
        const isOpen = sidebar.classList.contains('open');
        sidebar.classList.toggle('open');
        mobileToggle.classList.toggle('active');
        if (overlay) {
            overlay.classList.toggle('active');
        }
        document.body.style.overflow = !isOpen ? 'hidden' : '';
    }

    mobileToggle.addEventListener('click', toggleMenu);

    // Close sidebar when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            mobileToggle.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close sidebar when clicking on a nav link (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 980) {
                sidebar.classList.remove('open');
                mobileToggle.classList.remove('active');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 980) {
                sidebar.classList.remove('open');
                mobileToggle.classList.remove('active');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        }, 250);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    document.body.classList.add('reveal');
    initSearch();
    initReveal();
    updateActiveNav();
    highlightCodeBlocks();
});

