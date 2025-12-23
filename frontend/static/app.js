/**
 * Main JavaScript file for One Night Werewolf Assistant
 */

// API base URL
const API_BASE_URL = '';

// ============================================================
// ROLE CLASS SYSTEM
// ============================================================

/**
 * Base Role class
 * Each specific role inherits from this class
 */
class Role {
    /**
     * @param {string} id - Unique role identifier
     * @param {string} name - Display name
     * @param {string} img - Image path
     * @param {number} timer - Countdown timer in seconds
     * @param {boolean} wakeup - Whether this role wakes up at night
     * @param {number} wakeupOrder - Wake up order (lower = earlier)
     */
    constructor(id, name, img, timer, wakeup, wakeupOrder) {
        this.id = id;
        this.name = name;
        this.img = img;
        this.timer = timer;
        this.wakeup = wakeup;
        this.wakeupOrder = wakeupOrder;
    }

    /**
     * Get announcement text for current language
     * @returns {Promise<string>}
     */
    async getAnnouncement() {
        return await translationManager.get(this.id);
    }

    /**
     * Speak the role announcement using Web Speech API
     * @returns {Promise<void>}
     */
    async playAudio() {
        return new Promise(async (resolve, reject) => {
            // Check if speech synthesis is supported
            if (!('speechSynthesis' in window)) {
                console.warn('Speech synthesis not supported in this browser');
                resolve();
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Get announcement in current language
            const announcement = await this.getAnnouncement();
            
            if (!announcement) {
                console.warn(`No announcement text for ${this.name}`);
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(announcement);
            
            // Configure voice settings
            utterance.rate = 0.9;    // Slightly slower for clarity
            utterance.pitch = 1.0;   // Normal pitch
            utterance.volume = 1.0;  // Full volume
            
            // Select voice matching current language
            const matchingVoice = translationManager.getMatchingVoice();
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            } else {
                // Fallback to first available voice
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    utterance.voice = voices[0];
                }
            }

            utterance.onend = () => resolve();
            utterance.onerror = (error) => {
                console.warn(`Speech synthesis error for ${this.name}:`, error);
                resolve(); // Still resolve to continue workflow
            };

            window.speechSynthesis.speak(utterance);
        });
    }
}

// ============================================================
// SPECIFIC ROLE IMPLEMENTATIONS
// ============================================================

// Werewolf Team
class Werewolf extends Role {
    constructor() {
        super('werewolf', 'Werewolf', '/static/img/werewolf.jpg', 30, true, 1);
    }
}

class Minion extends Role {
    constructor() {
        super('minion', 'Minion', '/static/img/minion.jpg', 20, true, 2);
    }
}

class AlphaWolf extends Role {
    constructor() {
        super('alpha-wolf', 'Alpha Wolf', '/static/img/alpha_wolf.png', 30, true, 3);
    }
}

class MysticWolf extends Role {
    constructor() {
        super('mystic-wolf', 'Mystic Wolf', '/static/img/mystic_wolf.png', 30, true, 4);
    }
}

// Villager Team
class Villager extends Role {
    constructor() {
        super('villager', 'Villager', '/static/img/villager.png', 0, false, 999);
    }
}

class Sentinel extends Role {
    constructor() {
        super('sentinel', 'Sentinel', '/static/img/sentinel.png', 25, true, 5);
    }
}

class Seer extends Role {
    constructor() {
        super('seer', 'Seer', '/static/img/seer.png', 30, true, 6);
    }
}

class ApprenticeSeer extends Role {
    constructor() {
        super('apprentice-seer', 'Apprentice Seer', '/static/img/apprentice_seer.png', 25, true, 7);
    }
}

class ParanormalInvestigator extends Role {
    constructor() {
        super('paranormal-investigator', 'Paranormal Investigator', '/static/img/paranormal_investigator.png', 35, true, 8);
    }
}

class Witch extends Role {
    constructor() {
        super('witch', 'Witch', '/static/img/witch.png', 30, true, 9);
    }
}

class Robber extends Role {
    constructor() {
        super('robber', 'Robber', '/static/img/robber.png', 25, true, 10);
    }
}

class Troublemaker extends Role {
    constructor() {
        super('troublemaker', 'Troublemaker', '/static/img/troublemaker.png', 25, true, 11);
    }
}

class Drunk extends Role {
    constructor() {
        super('drunk', 'Drunk', '/static/img/drunk.png', 20, true, 12);
    }
}

class Insomniac extends Role {
    constructor() {
        super('insomniac', 'Insomniac', '/static/img/insomniac.png', 20, true, 13);
    }
}

class Revealer extends Role {
    constructor() {
        super('revealer', 'Revealer', '/static/img/revealer.png', 25, true, 14);
    }
}

class Curator extends Role {
    constructor() {
        super('curator', 'Curator', '/static/img/curator.png', 25, true, 15);
    }
}

class Hunter extends Role {
    constructor() {
        super('hunter', 'Hunter', '/static/img/hunter.png', 0, false, 999);
    }
}

class Tanner extends Role {
    constructor() {
        super('tanner', 'Tanner', '/static/img/tanner.png', 0, false, 999);
    }
}

class VillageIdiot extends Role {
    constructor() {
        super('village-idiot', 'Village Idiot', '/static/img/village_idiot.png', 0, false, 999);
    }
}

// ============================================================
// ROLE FACTORY
// ============================================================

/**
 * Utility: Ensure speech synthesis voices are loaded
 * Some browsers require this async operation
 */
function loadVoices() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                resolve(window.speechSynthesis.getVoices());
            };
        }
    });
}

// Load voices on page load
if ('speechSynthesis' in window) {
    loadVoices();
}

/**
 * Factory to create Role instances by ID
 */
const RoleFactory = {
    createRole(id) {
        const roleMap = {
            'werewolf': Werewolf,
            'minion': Minion,
            'alpha-wolf': AlphaWolf,
            'mystic-wolf': MysticWolf,
            'villager': Villager,
            'sentinel': Sentinel,
            'seer': Seer,
            'apprentice-seer': ApprenticeSeer,
            'paranormal-investigator': ParanormalInvestigator,
            'witch': Witch,
            'robber': Robber,
            'troublemaker': Troublemaker,
            'drunk': Drunk,
            'insomniac': Insomniac,
            'revealer': Revealer,
            'curator': Curator,
            'hunter': Hunter,
            'tanner': Tanner,
            'village-idiot': VillageIdiot
        };

        const RoleClass = roleMap[id];
        return RoleClass ? new RoleClass() : null;
    }
};

// ============================================================
// WORKFLOW MANAGER
// ============================================================

/**
 * Manages the night phase workflow: sequencing roles, countdown timers, and audio
 */
class WorkflowManager {
    constructor() {
        this.roles = [];
        this.currentIndex = 0;
        this.remainingTime = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Initialize workflow with selected roles
     * @param {Array<Role>} roles - Array of Role instances
     */
    setRoles(roles) {
        // Filter roles that wake up at night and sort by wakeup order
        this.roles = roles
            .filter(role => role.wakeup)
            .sort((a, b) => a.wakeupOrder - b.wakeupOrder);
        this.reset();
    }

    /**
     * Reset workflow to initial state
     */
    reset() {
        this.stop();
        this.currentIndex = 0;
        this.remainingTime = this.roles[0]?.timer || 0;
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Start or resume the workflow
     */
    async start() {
        if (this.roles.length === 0) return;
        
        this.isRunning = true;
        this.isPaused = false;

        // Play audio for current role if just starting this role
        if (this.remainingTime === this.roles[this.currentIndex].timer) {
            await this.roles[this.currentIndex].playAudio();
        }

        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    /**
     * Pause the workflow
     */
    pause() {
        this.isPaused = true;
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Stop the workflow completely
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Toggle between running and paused
     */
    togglePause() {
        if (this.isRunning) {
            this.pause();
        } else if (this.isPaused || !this.isRunning) {
            this.start();
        }
    }

    /**
     * Execute one tick of the timer
     */
    tick() {
        this.remainingTime -= 1;

        if (this.remainingTime <= 0) {
            this.advanceToNextRole();
        }
    }

    /**
     * Move to the next role in sequence
     */
    async advanceToNextRole() {
        this.currentIndex += 1;

        if (this.currentIndex >= this.roles.length) {
            // Workflow complete
            this.stop();
            return;
        }

        // Set up next role
        this.remainingTime = this.roles[this.currentIndex].timer;
        await this.roles[this.currentIndex].playAudio();
    }

    /**
     * Get current role
     * @returns {Role|null}
     */
    getCurrentRole() {
        return this.roles[this.currentIndex] || null;
    }

    /**
     * Check if workflow is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.currentIndex >= this.roles.length && !this.isRunning;
    }
}

// Global workflow manager instance
const workflowManager = new WorkflowManager();

// ============================================================
// API AND UTILITY FUNCTIONS
// ============================================================

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
    { id: 'role-assignment', label: 'Play a game', children: [] },
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
// Legacy format for UI display - will be converted to Role instances
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

// Map of selected role IDs (using legacy format for compatibility)
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

    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        const required = getRequiredCards();
        startGameBtn.disabled = !(required > 0 && selectedRoles.size === required);
    }
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

/**
 * Convert selected roles to Role instances and initialize workflow
 * @returns {Array<Role>}
 */
function getSelectedRoleInstances() {
    const roleInstances = [];
    selectedRoles.forEach((roleData, roleId) => {
        const role = RoleFactory.createRole(roleId);
        if (role) {
            roleInstances.push(role);
        }
    });
    return roleInstances;
}

/**
 * Update UI to reflect current workflow state
 */
function updateWorkflowUI() {
    const roles = workflowManager.roles;
    const currentIndex = workflowManager.currentIndex;

    // Update node states
    document.querySelectorAll('.wakeup-node').forEach((node, idx) => {
        node.classList.remove('active', 'completed');
        if (idx < currentIndex) {
            node.classList.add('completed');
        } else if (idx === currentIndex) {
            node.classList.add('active');
        }
    });

    // Update arrows
    document.querySelectorAll('.wakeup-arrows line').forEach((line, idx) => {
        line.classList.remove('completed');
        if (idx < currentIndex) {
            line.classList.add('completed');
        }
    });

    // Update timer display
    document.querySelectorAll('.wakeup-node .timer').forEach(el => (el.textContent = ''));
    const activeTimer = document.querySelector(`.wakeup-node[data-index="${currentIndex}"] .timer`);
    if (activeTimer && workflowManager.remainingTime > 0) {
        activeTimer.textContent = `${workflowManager.remainingTime}s`;
    }

    // Update button text
    const btn = document.getElementById('wakeup-start');
    if (btn) {
        if (workflowManager.isComplete()) {
            btn.textContent = 'Complete';
            btn.disabled = true;
        } else {
            btn.textContent = workflowManager.isRunning ? 'Pause' : 'Start';
            btn.disabled = false;
        }
    }
}

/**
 * Start UI update loop
 */
function startUIUpdateLoop() {
    // Update UI every 100ms for smooth display
    const updateInterval = setInterval(() => {
        if (workflowManager.isRunning || workflowManager.isPaused) {
            updateWorkflowUI();
        } else if (workflowManager.isComplete()) {
            updateWorkflowUI();
            clearInterval(updateInterval);
        }
    }, 100);

    // Store interval ID for cleanup
    workflowManager._uiUpdateInterval = updateInterval;
}

function layoutWakeupNodesAndDrawArrows() {
    const nodesContainer = document.getElementById('wakeup-nodes');
    const svg = document.getElementById('wakeup-arrows');
    const workflow = document.getElementById('wakeup-workflow');
    if (!nodesContainer || !svg || !workflow) return;

    const nodes = Array.from(nodesContainer.querySelectorAll('.wakeup-node'));
    if (nodes.length === 0) return;

    // Compute columns based on available width.
    const containerWidth = nodesContainer.clientWidth;
    const nodeMin = 130; // matches CSS min width.
    const gap = 26;
    const cols = Math.max(2, Math.floor((containerWidth + gap) / (nodeMin + gap)));
    nodesContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(${nodeMin}px, 1fr))`;

    // Place nodes in zig-zag order.
    nodes.forEach((node, idx) => {
        const row = Math.floor(idx / cols);
        const colInRow = idx % cols;
        const col = (row % 2 === 0) ? (colInRow + 1) : (cols - colInRow);
        node.style.gridRowStart = (row + 1);
        node.style.gridColumnStart = col;
    });

    // Resize SVG to workflow container.
    svg.setAttribute('width', `${workflow.clientWidth}`);
    svg.setAttribute('height', `${workflow.clientHeight}`);
    svg.setAttribute('viewBox', `0 0 ${workflow.clientWidth} ${workflow.clientHeight}`);

    // Clear existing lines.
    svg.querySelectorAll('line[data-from]').forEach(l => l.remove());

    const wfRect = workflow.getBoundingClientRect();
    const centers = nodes.map(n => {
        const r = n.getBoundingClientRect();
        return {
            x: (r.left - wfRect.left) + r.width / 2,
            y: (r.top - wfRect.top) + r.height / 2
        };
    });

    for (let i = 0; i < centers.length - 1; i++) {
        const a = centers[i];
        const b = centers[i + 1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.y);
        line.setAttribute('marker-end', 'url(#arrowhead)');
        line.dataset.from = String(i);
        svg.appendChild(line);
    }
}

function renderWakeupOrderView() {
    const main = document.getElementById('main-pane');
    if (!main) return;

    // Initialize workflow with selected roles
    const roleInstances = getSelectedRoleInstances();
    workflowManager.setRoles(roleInstances);

    main.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'wakeup-page';
    wrapper.innerHTML = `
        <h2>Night Phase</h2>
        <div id="wakeup-workflow" class="wakeup-workflow">
            <div id="wakeup-nodes" class="wakeup-nodes" aria-label="Night wakeup workflow"></div>
            <svg id="wakeup-arrows" class="wakeup-arrows" aria-hidden="true">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" />
                    </marker>
                </defs>
            </svg>
        </div>
        <div class="wakeup-actions">
            <button id="wakeup-start" class="btn">Start</button>
            <button id="wakeup-restart" class="btn">Restart</button>
        </div>
        <div class="wakeup-hint">Roles wake up in order. Each role has a custom timer and audio announcement.</div>
    `;
    main.appendChild(wrapper);

    const nodesContainer = document.getElementById('wakeup-nodes');
    if (!nodesContainer) return;

    const nightRoles = workflowManager.roles;

    if (nightRoles.length === 0) {
        nodesContainer.innerHTML = '<div class="wakeup-empty">No roles with night actions selected.</div>';
        document.getElementById('wakeup-start').disabled = true;
        document.getElementById('wakeup-restart').disabled = true;
        return;
    }

    nightRoles.forEach((role, idx) => {
        const node = document.createElement('div');
        node.className = 'wakeup-node';
        node.dataset.index = String(idx);
        node.innerHTML = `
            <div class="avatar"><img src="${role.img}" alt="${role.name}"/></div>
            <div class="name">${role.name}</div>
            <div class="timer" aria-live="polite"></div>
        `;
        nodesContainer.appendChild(node);
    });

    // Initialize UI
    updateWorkflowUI();

    const startBtn = document.getElementById('wakeup-start');
    const restartBtn = document.getElementById('wakeup-restart');
    
    startBtn.addEventListener('click', () => {
        workflowManager.togglePause();
        updateWorkflowUI();
    });
    
    restartBtn.addEventListener('click', () => {
        workflowManager.reset();
        updateWorkflowUI();
        layoutWakeupNodesAndDrawArrows();
    });

    // Start UI update loop
    startUIUpdateLoop();

    // Draw after layout
    requestAnimationFrame(() => {
        layoutWakeupNodesAndDrawArrows();
    });

    // Redraw on resize
    const onResize = () => layoutWakeupNodesAndDrawArrows();
    window.addEventListener('resize', onResize, { passive: true });

    // Clean up on navigation
    workflowManager._cleanup = () => {
        window.removeEventListener('resize', onResize);
        if (workflowManager._uiUpdateInterval) {
            clearInterval(workflowManager._uiUpdateInterval);
        }
        workflowManager.stop();
    };
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

    // stop wakeup timers when leaving the wakeup page
    if (workflowManager._cleanup) {
        workflowManager._cleanup();
        workflowManager._cleanup = null;
    }
    workflowManager.stop();

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
            <button id="start-game" class="btn btn-small" disabled>Start the game</button>
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
        document.getElementById('start-game').addEventListener('click', () => {
            const required = getRequiredCards();
            if (selectedRoles.size !== required) return;
            renderWakeupOrderView();
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
        
        const description = document.createElement('p');
        description.textContent = 'Select the language for role announcements. Voice announcements will automatically use the appropriate text-to-speech voice.';
        main.appendChild(description);
        
        // Get current language
        const currentLang = translationManager.getCurrentLanguage();
        const languages = translationManager.getSupportedLanguages();
        
        // Create language selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'language-selector';
        selectorContainer.innerHTML = `
            <label for="language-select">Choose Language:</label>
            <select id="language-select" class="btn">
                ${languages.map(lang => 
                    `<option value="${lang.code}" ${lang.code === currentLang ? 'selected' : ''}>
                        ${lang.name}
                    </option>`
                ).join('')}
            </select>
        `;
        main.appendChild(selectorContainer);
        
        // Current status
        const statusBox = document.createElement('div');
        statusBox.id = 'language-status';
        statusBox.className = 'response-box';
        const currentLangName = languages.find(l => l.code === currentLang)?.name || 'English';
        statusBox.innerHTML = `<p>Current language: <strong>${currentLangName}</strong></p>`;
        main.appendChild(statusBox);
        
        // Test button
        const testBtn = document.createElement('button');
        testBtn.className = 'btn';
        testBtn.textContent = 'Test Announcement';
        testBtn.style.marginTop = '10px';
        main.appendChild(testBtn);
        
        const testOutput = document.createElement('div');
        testOutput.id = 'test-output';
        testOutput.className = 'response-box';
        testOutput.style.marginTop = '10px';
        main.appendChild(testOutput);
        
        // Language change handler
        const select = document.getElementById('language-select');
        select.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            const langName = languages.find(l => l.code === newLang)?.name;
            
            statusBox.innerHTML = '<p class="loading">Loading translations...</p>';
            
            try {
                await translationManager.setLanguage(newLang);
                statusBox.innerHTML = `<p class="success">✓ Language changed to <strong>${langName}</strong></p>`;
            } catch (error) {
                statusBox.innerHTML = `<p class="error">Error loading language: ${error.message}</p>`;
                console.error('Language change error:', error);
            }
        });
        
        // Test button handler
        testBtn.addEventListener('click', async () => {
            testOutput.innerHTML = '<p class="loading">Speaking test announcement...</p>';
            
            try {
                // Create a test role and speak its announcement
                const testRole = RoleFactory.createRole('seer');
                await testRole.playAudio();
                
                const announcement = await testRole.getAnnouncement();
                testOutput.innerHTML = `<p class="success">✓ Test complete!</p><p><em>"${announcement}"</em></p>`;
            } catch (error) {
                testOutput.innerHTML = `<p class="error">Error: ${error.message}</p>`;
                console.error('Test error:', error);
            }
        });
        
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
