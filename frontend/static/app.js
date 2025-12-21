/**
 * Main JavaScript file for One Night Werewolf Assistant
 */

// API base URL
const API_BASE_URL = '';

async function makeApiCall(endpoint) {
    const responseElement = document.getElementById('api-response');
    if (!responseElement) return;
    try {
        responseElement.innerHTML = '<p class="loading">Loading...</p>';
        const response = await fetch(API_BASE_URL + endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        responseElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (err) {
        responseElement.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
}

const menu = [
    { id: 'role-assignment', label: 'Role assignment', children: [] },
    { id: 'rules-reference', label: 'Rules reference', children: [
        { id: 'rules-by-role', label: 'Rules by role' },
        { id: 'general-rules', label: 'General rules' }
    ]},
    { id: 'settings', label: 'Settings', children: [
        { id: 'language', label: 'Language' },
        { id: 'health-check', label: 'Health check' },
        { id: 'app-info', label: 'App info' }
    ]}
];

// Role data (use local images downloaded from One Night Wiki)
const WEREWOLF_ROLES = [
    { id: 'werewolf', name: 'Werewolf', img: '/static/img/werewolf.jpg' },
    { id: 'minion', name: 'Minion', img: '/static/img/minion.jpg' },
    { id: 'alpha-wolf', name: 'Alpha Wolf', img: '/static/img/alpha_wolf.png' },
    { id: 'mystic-wolf', name: 'Mystic Wolf', img: '/static/img/mystic_wolf.png' }
];

const VILLAGER_ROLES = [
    { id: 'villager', name: 'Villager', img: '/static/img/villager.png' },
    { id: 'seer', name: 'Seer', img: '/static/img/seer.png' },
    { id: 'apprentice-seer', name: 'Apprentice Seer', img: '/static/img/apprentice_seer.png' },
    { id: 'robber', name: 'Robber', img: '/static/img/robber.png' },
    { id: 'troublemaker', name: 'Troublemaker', img: '/static/img/troublemaker.png' },
    { id: 'drunk', name: 'Drunk', img: '/static/img/drunk.png' },
    { id: 'insomniac', name: 'Insomniac', img: '/static/img/insomniac.png' },
    { id: 'hunter', name: 'Hunter', img: '/static/img/hunter.png' },
    { id: 'tanner', name: 'Tanner', img: '/static/img/tanner.png' },
    { id: 'sentinel', name: 'Sentinel', img: '/static/img/sentinel.png' },
    { id: 'paranormal-investigator', name: 'Paranormal Investigator', img: '/static/img/paranormal_investigator.png' },
    { id: 'witch', name: 'Witch', img: '/static/img/witch.png' },
    { id: 'revealer', name: 'Revealer', img: '/static/img/revealer.png' },
    { id: 'curator', name: 'Curator', img: '/static/img/curator.png' },
    { id: 'village-idiot', name: 'Village Idiot', img: '/static/img/village_idiot.png' }
];

let selectedRoles = new Map();

function toggleRole(role) {
    const required = getRequiredCards();
    if (!selectedRoles.has(role.id)) {
        if (selectedRoles.size >= required) {
            flashSelectionLimit();
            return;
        }
        selectedRoles.set(role.id, role);
    } else {
        selectedRoles.delete(role.id);
    }
    updateRoleGridSelection();
    updateSelectedPanel();
    updateCountsDisplay();
}

function flashSelectionLimit() {
    const el = document.querySelector('.selection-limit-flash');
    if (!el) return;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 800);
}

function getRequiredCards() {
    const input = document.getElementById('num-players');
    const n = input ? parseInt(input.value || '0', 10) : 0;
    return n + 3;
}

function updateCountsDisplay() {
    const selCountEl = document.getElementById('selected-count');
    const reqCountEl = document.getElementById('required-count');
    if (selCountEl) selCountEl.textContent = selectedRoles.size;
    if (reqCountEl) reqCountEl.textContent = getRequiredCards();
}

function updateRoleGridSelection() {
    document.querySelectorAll('.role-card').forEach(card => {
        const id = card.dataset.roleId;
        if (selectedRoles.has(id)) card.classList.add('selected'); else card.classList.remove('selected');
    });
}

function updateSelectedPanel() {
    const panel = document.getElementById('selected-panel-list');
    if (!panel) return;
    panel.innerHTML = '';
    selectedRoles.forEach(role => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `<span class="avatar-small"><img src="${role.img}" alt="${role.name}"/></span><span class="name">${role.name}</span>`;
        panel.appendChild(item);
    });
    const clearBtn = document.getElementById('clear-selection');
    if (clearBtn) clearBtn.disabled = selectedRoles.size === 0;
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';

    const tree = document.createElement('ul');
    tree.className = 'tree';

    menu.forEach(item => {
        const li = document.createElement('li');
        li.className = 'tree-item';

        const parent = document.createElement('div');
        parent.className = 'tree-parent';
        parent.textContent = item.label;
        parent.dataset.id = item.id;

        parent.addEventListener('click', (e) => {
            e.stopPropagation();
            // toggle expand if has children
            if (item.children && item.children.length > 0) {
                li.classList.toggle('expanded');
            } else {
                // leaf: render
                setActive(item.id);
                renderContent(item.id);
            }
        });

        li.appendChild(parent);

        if (item.children && item.children.length > 0) {
            const sub = document.createElement('ul');
            sub.className = 'sub-list';
            item.children.forEach(child => {
                const subLi = document.createElement('li');
                subLi.className = 'sub-item';
                subLi.textContent = child.label;
                subLi.dataset.id = child.id;
                subLi.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    setActive(child.id);
                    renderContent(child.id);
                });
                sub.appendChild(subLi);
            });
            li.appendChild(sub);
            // clicking parent should also expand and select parent landing
            parent.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                setActive(item.id);
                renderContent(item.id);
            });
        }

        tree.appendChild(li);
    });

    sidebar.appendChild(tree);
}

function clearActive() {
    document.querySelectorAll('.tree-parent, .sub-item').forEach(el => el.classList.remove('active'));
}

function setActive(id) {
    clearActive();
    const parent = document.querySelector(`[data-id="${id}"]`);
    if (parent) parent.classList.add('active');
}

function renderContent(id) {
    const main = document.getElementById('main-pane');
    if (!main) return;
    main.innerHTML = '';

    // Role assignment landing
    if (id === 'role-assignment') {
        const container = document.createElement('div');
        container.className = 'role-layout';

        const content = document.createElement('div');
        content.className = 'role-content';

        const title = document.createElement('h2');
        title.textContent = 'Role Assignment';
        const intro = document.createElement('p');
        intro.textContent = 'Set up a new game and assign roles to players.';

        // Top controls
        const controls = document.createElement('div');
        controls.className = 'role-controls';
        controls.innerHTML = `
            <label>Number of players: <input id="num-players" type="number" min="1" value="5"/></label>
            <div class="counts">Selected: <span id="selected-count">0</span> / Required: <span id="required-count">8</span>
            <span class="selection-limit-flash"></span></div>
        `;

        content.appendChild(title);
        content.appendChild(intro);
        content.appendChild(controls);

        // Role sections
        const sections = document.createElement('div');
        sections.className = 'role-sections';

        // Werewolf team
        const wSection = document.createElement('section');
        wSection.className = 'role-section';
        const wTitle = document.createElement('h3');
        wTitle.textContent = 'Werewolf team';
        wSection.appendChild(wTitle);
        const wGrid = document.createElement('div');
        wGrid.className = 'role-grid';
        WEREWOLF_ROLES.forEach(r => {
            const card = document.createElement('div');
            card.className = 'role-card';
            card.dataset.roleId = r.id;
            card.innerHTML = `<div class="avatar"><img src="${r.img}" alt="${r.name}"/></div><div class="role-name">${r.name}</div>`;
            card.addEventListener('click', () => toggleRole(r));
            wGrid.appendChild(card);
        });
        wSection.appendChild(wGrid);

        // Villager team
        const vSection = document.createElement('section');
        vSection.className = 'role-section';
        const vTitle = document.createElement('h3');
        vTitle.textContent = 'Villager team';
        vSection.appendChild(vTitle);
        const vGrid = document.createElement('div');
        vGrid.className = 'role-grid';
        VILLAGER_ROLES.forEach(r => {
            const card = document.createElement('div');
            card.className = 'role-card';
            card.dataset.roleId = r.id;
            card.innerHTML = `<div class="avatar"><img src="${r.img}" alt="${r.name}"/></div><div class="role-name">${r.name}</div>`;
            card.addEventListener('click', () => toggleRole(r));
            vGrid.appendChild(card);
        });
        vSection.appendChild(vGrid);

        sections.appendChild(wSection);
        sections.appendChild(vSection);
        content.appendChild(sections);

        // Right side selected panel
        const selectedPanel = document.createElement('aside');
        selectedPanel.className = 'selected-panel';
        selectedPanel.innerHTML = `
            <div class="selected-panel-inner">
                <h3>Selected Roles</h3>
                <div id="selected-panel-list" class="selected-list"></div>
                <div class="selected-actions">
                    <button id="clear-selection" class="btn">Clear</button>
                </div>
            </div>
        `;

        container.appendChild(content);
        container.appendChild(selectedPanel);
        main.appendChild(container);

        // hooks
        document.getElementById('num-players').addEventListener('input', () => {
            updateCountsDisplay();
        });
        document.getElementById('clear-selection').addEventListener('click', () => {
            selectedRoles.clear();
            updateRoleGridSelection();
            updateSelectedPanel();
            updateCountsDisplay();
        });

        // initial display
        updateCountsDisplay();
        updateSelectedPanel();
        updateRoleGridSelection();

        return;
    }

    // Rules by role
    if (id === 'rules-by-role') {
        const title = document.createElement('h2');
        title.textContent = 'Rules by Role';
        const p = document.createElement('p');
        p.textContent = 'Lookup rules specific to each role.';
        main.appendChild(title);
        main.appendChild(p);
        main.appendChild(createPlaceholderBox('Example: Werewolf - wakes at night, tries to eliminate villagers.'));
        return;
    }

    // General rules
    if (id === 'general-rules') {
        const title = document.createElement('h2');
        title.textContent = 'General Rules';
        main.appendChild(title);
        main.appendChild(createPlaceholderBox('General rules for One Night Werewolf: etc.'));
        return;
    }

    // Settings - Language
    if (id === 'language') {
        const title = document.createElement('h2');
        title.textContent = 'Language Settings';
        main.appendChild(title);
        main.appendChild(createPlaceholderBox('Select app language (placeholder).'));
        return;
    }

    // Settings - Health check (calls API)
    if (id === 'health-check') {
        const title = document.createElement('h2');
        title.textContent = 'Health Check';
        main.appendChild(title);
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Check API Health';
        const resp = document.createElement('div');
        resp.id = 'api-response';
        resp.className = 'response-box';
        btn.addEventListener('click', () => makeApiCall('/api/health'));
        main.appendChild(btn);
        main.appendChild(resp);
        return;
    }

    // Settings - App info (calls API)
    if (id === 'app-info') {
        const title = document.createElement('h2');
        title.textContent = 'App Info';
        main.appendChild(title);
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Get App Info';
        const resp = document.createElement('div');
        resp.id = 'api-response';
        resp.className = 'response-box';
        btn.addEventListener('click', () => makeApiCall('/api/info'));
        main.appendChild(btn);
        main.appendChild(resp);
        return;
    }

    // Default landing
    main.innerHTML = `<div class="landing"><h2>Welcome!</h2><p>Select a module on the left.</p></div>`;
}

function createPlaceholderBox(text) {
    const box = document.createElement('div');
    box.className = 'response-box';
    box.innerHTML = `<p>${text}</p>`;
    return box;
}

function generatePlaceholderRoles(n) {
    const pool = ['Villager','Villager','Werewolf','Seer','Robber','Troublemaker','Drunk'];
    const roles = [];
    for (let i = 0; i < n; i++) roles.push(pool[i % pool.length]);
    return roles;

}

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    // default select first item
    setActive('role-assignment');
    renderContent('role-assignment');
    console.log('Frontend menu initialized');
});
