/**
 * Main JavaScript file for One Night Werewolf Assistant
 */

// API base URL
const API_BASE_URL = '';

// ============================================================
// OPTIONAL: COUNTDOWN WARNING SOUND (BEEP EACH SECOND)
// ============================================================

// Uses Web Audio API so you don't need to ship audio files.
// Note: Browsers require a user gesture before audio can play.
class CountdownTickSound {
    constructor({ frequencyHz = 880, durationMs = 60, volume = 1.0 } = {}) {
        this.frequencyHz = frequencyHz;
        this.durationMs = durationMs;
        this.volume = volume;

        this._ctx = null;
        this._disabled = false;
    }

    _ensureContext() {
        if (this._disabled) return null;
        if (this._ctx) return this._ctx;
        const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextImpl) {
            this._disabled = true;
            console.warn('[CountdownTickSound] Web Audio API not supported');
            return null;
        }
        this._ctx = new AudioContextImpl();
        return this._ctx;
    }

    // Call from a user gesture (click/tap) to satisfy autoplay policies.
    unlock() {
        const ctx = this._ensureContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {
                // Ignore; some browsers are picky about gesture timing.
            });
        }
    }

    playTick() {
        const ctx = this._ensureContext();
        if (!ctx || this._disabled) return;
        if (ctx.state === 'suspended') return;

        const now = ctx.currentTime;
        const durationS = Math.max(0.02, this.durationMs / 1000);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.frequencyHz, now);

        // Quick fade in/out to avoid clicks.
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(this.volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationS);

        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch {
                // ignore
            }
        };
    }
}

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
     * @param {string} translationKey
     * @returns {Promise<string>}
     */
    async getAnnouncement(translationKey = this.id) {
        return await translationManager.get(translationKey);
    }

    /**
     * Speak arbitrary text using Web Speech API
     * @param {string} text
     * @returns {Promise<void>}
     */
    static async speakText(text) {
        return new Promise((resolve) => {
            // Check if speech synthesis is supported
            if (!('speechSynthesis' in window)) {
                console.warn('Speech synthesis not supported in this browser');
                resolve();
                return;
            }

            if (!text) {
                resolve();
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Ensure the utterance language matches the selected UI language
            // (helps browsers choose the correct voice even when exact voice matching fails)
            utterance.lang = translationManager.getSpeechLang();

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
                console.warn('Speech synthesis error:', error);
                resolve(); // Still resolve to continue workflow
            };

            window.speechSynthesis.speak(utterance);
        });
    }

    /**
     * Speak an announcement by translation key using Web Speech API
     * Defaults to this role's start announcement (role id).
     * @param {string} translationKey
     * @returns {Promise<void>}
     */
    async playAudio(translationKey = this.id) {
        const announcement = await this.getAnnouncement(translationKey);
        if (!announcement) {
            console.warn(`No announcement text for key '${translationKey}' (${this.name})`);
            return;
        }
        await Role.speakText(announcement);
    }

    /**
     * Speak the role end announcement (e.g. "werewolf_end")
     * @returns {Promise<void>}
     */
    async playEndAudio() {
        await this.playAudio(`${this.id}_end`);
    }
}

// ============================================================
// SPECIFIC ROLE IMPLEMENTATIONS
// ============================================================

// Werewolf Team
class Werewolf extends Role {
    constructor() {
        super('werewolf', 'Werewolf', '/static/img/werewolf.jpg', 15, true, 2);
    }
}

class Minion extends Role {
    constructor() {
        super('minion', 'Minion', '/static/img/minion.jpg', 10, true, 3);
    }
}

class AlphaWolf extends Role {
    constructor() {
        super('alpha-wolf', 'Alpha Wolf', '/static/img/alpha_wolf.png', 15, true, 2.2);
    }
}

class MysticWolf extends Role {
    constructor() {
        super('mystic-wolf', 'Mystic Wolf', '/static/img/mystic_wolf.png', 15, true, 2.3);
    }
}

class DreamWolf extends Role {
    constructor() {
        super('dream-wolf', 'Dream Wolf', '/static/img/dream_wolf.png', 0, false, 999);
    }
}

// Villager Team
class Villager extends Role {
    constructor() {
        super('villager', 'Villager', '/static/img/villager.png', 0, false, 999);
    }
}

class Mason extends Role {
    constructor() {
        super('mason', 'Mason', '/static/img/mason.png', 10, true, 4);
    }
}

class Sentinel extends Role {
    constructor() {
        super('sentinel', 'Sentinel', '/static/img/sentinel.png', 15, true, 0);
    }
}

class Bodyguard extends Role {
    constructor() {
        super('bodyguard', 'Bodyguard', '/static/img/bodyguard.png', 0, false, 999);
    }
}

class Seer extends Role {
    constructor() {
        super('seer', 'Seer', '/static/img/seer.png', 20, true, 5);
    }
}

class ApprenticeSeer extends Role {
    constructor() {
        super('apprentice-seer', 'Apprentice Seer', '/static/img/apprentice_seer.png', 15, true, 5.2);
    }
}

class ParanormalInvestigator extends Role {
    constructor() {
        super('paranormal-investigator', 'Paranormal Investigator', '/static/img/paranormal_investigator.png', 25, true, 5.3);
    }
}

class Witch extends Role {
    constructor() {
        super('witch', 'Witch', '/static/img/witch.png', 15, true, 6.2);
    }
}

class Doppelganger extends Role {
    constructor() {
        super('doppelganger', 'Doppelgänger', '/static/img/doppelganger.jpg', 20, true, 1);
    }
}

class Robber extends Role {
    constructor() {
        super('robber', 'Robber', '/static/img/robber.png', 15, true, 6);
    }
}

class Troublemaker extends Role {
    constructor() {
        super('troublemaker', 'Troublemaker', '/static/img/troublemaker.png', 15, true, 7);
    }
}

class Drunk extends Role {
    constructor() {
        super('drunk', 'Drunk', '/static/img/drunk.png', 10, true, 8);
    }
}

class Insomniac extends Role {
    constructor() {
        super('insomniac', 'Insomniac', '/static/img/insomniac.png', 10, true, 9);
    }
}

class Revealer extends Role {
    constructor() {
        super('revealer', 'Revealer', '/static/img/revealer.png', 15, true, 10);
    }
}

class Curator extends Role {
    constructor() {
        super('curator', 'Curator', '/static/img/curator.png', 15, true, 11);
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
        super('village-idiot', 'Village Idiot', '/static/img/village_idiot.png', 20, true, 7.2);
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
            'doppelganger': Doppelganger,
            'werewolf': Werewolf,
            'minion': Minion,
            'alpha-wolf': AlphaWolf,
            'mystic-wolf': MysticWolf,
            'dream-wolf': DreamWolf,
            'villager': Villager,
            'mason': Mason,
            'sentinel': Sentinel,
            'bodyguard': Bodyguard,
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
        this.isTransitioning = false;
        this.transitionPauseMs = 2000;

        this.countdownTickSound = new CountdownTickSound();
        this._halfTickTimeoutId = null;
    }

    _clearHalfTickTimeout() {
        if (this._halfTickTimeoutId) {
            clearTimeout(this._halfTickTimeoutId);
            this._halfTickTimeoutId = null;
        }
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
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        this.stop();
        this._clearHalfTickTimeout();
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
        if (this.isTransitioning) return;
        
        this.isRunning = true;
        this.isPaused = false;

        const currentRole = this.roles[this.currentIndex];
        if (!currentRole) return;

        // If we're (re)starting at the top of a role, speak the announcement first,
        // then begin the countdown ticks.
        if (this.remainingTime === currentRole.timer) {
            await currentRole.playAudio();
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
        this._clearHalfTickTimeout();
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
        this._clearHalfTickTimeout();
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Toggle between running and paused
     */
    togglePause() {
        if (this.isTransitioning) return;
        if (this.isRunning) {
            this.pause();
        } else if (this.isPaused || !this.isRunning) {
            // Unlock audio on the user's click.
            this.countdownTickSound.unlock();
            this.start();
        }
    }

    /**
     * Execute one tick of the timer
     */
    tick() {
        if (!this.isRunning || this.isPaused || this.isTransitioning) return;
        this.remainingTime -= 1;

        // Warning sound each second during countdown (but not when hitting 0).
        if (this.remainingTime > 0) {
            this.countdownTickSound.playTick();

            // Final 5 seconds: beep every 0.5s.
            if (this.remainingTime <= 5) {
                this._clearHalfTickTimeout();
                this._halfTickTimeoutId = setTimeout(() => {
                    this._halfTickTimeoutId = null;
                    if (!this.isRunning || this.isPaused || this.isTransitioning) return;
                    if (this.remainingTime <= 0) return;
                    // Still within last 5 seconds.
                    if (this.remainingTime <= 5) {
                        this.countdownTickSound.playTick();
                    }
                }, 500);
            }
        }

        if (this.remainingTime <= 0) {
            this._beginRoleTransition();
        }
    }

    async _playSystemAudio(translationKey) {
        const text = await translationManager.get(translationKey);
        if (!text) {
            console.warn(`No system announcement text for key '${translationKey}'`);
            return;
        }
        await Role.speakText(text);
    }

    _beginRoleTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Prevent any scheduled half-ticks from beeping during announcements.
        this._clearHalfTickTimeout();

        // Stop ticking while we speak end/start announcements to avoid overlap.
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this._transitionFromCurrentRole()
            .catch((err) => console.warn('Workflow transition error:', err))
            .finally(() => {
                this.isTransitioning = false;
            });
    }

    async _transitionFromCurrentRole() {
        const currentRole = this.roles[this.currentIndex] || null;
        if (currentRole) {
            await currentRole.playEndAudio();
        }

        // Small pause between back-to-back announcements to improve clarity.
        if (this.transitionPauseMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.transitionPauseMs));
        }

        this.currentIndex += 1;

        if (this.currentIndex >= this.roles.length) {
            // Workflow complete: after the last role's end announcement, everybody opens eyes.
            this.stop();
            await this._playSystemAudio('all_open_eyes');
            return;
        }

        // Set up next role
        this.remainingTime = this.roles[this.currentIndex].timer;
        await this.roles[this.currentIndex].playAudio();

        // Resume ticking if the workflow is still running
        if (this.isRunning && !this.isPaused) {
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
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
    { id: 'mystic-wolf', name: 'Mystic Wolf', img: '/static/img/mystic_wolf.png' },
    { id: 'dream-wolf', name: 'Dream Wolf', img: '/static/img/dream_wolf.png' }
];

const VILLAGER_ROLES = [
    { id: 'doppelganger', name: 'Doppelgänger', img: '/static/img/doppelganger.jpg' },
    { id: 'villager', name: 'Villager', img: '/static/img/villager.png' },
    { id: 'mason', name: 'Mason', img: '/static/img/mason.png' },
    { id: 'sentinel', name: 'Sentinel', img: '/static/img/sentinel.png' },
    { id: 'bodyguard', name: 'Bodyguard', img: '/static/img/bodyguard.png' },
    { id: 'seer', name: 'Seer', img: '/static/img/seer.png' },
    { id: 'apprentice-seer', name: 'Apprentice Seer', img: '/static/img/apprentice_seer.png' },
    { id: 'paranormal-investigator', name: 'Paranormal Investigator', img: '/static/img/paranormal_investigator.png' },
    { id: 'witch', name: 'Witch', img: '/static/img/witch.png' },
    { id: 'robber', name: 'Robber', img: '/static/img/robber.png' },
    { id: 'troublemaker', name: 'Troublemaker', img: '/static/img/troublemaker.png' },
    { id: 'drunk', name: 'Drunk', img: '/static/img/drunk.png' },
    { id: 'insomniac', name: 'Insomniac', img: '/static/img/insomniac.png' },
    { id: 'revealer', name: 'Revealer', img: '/static/img/revealer.png' },
    { id: 'curator', name: 'Curator', img: '/static/img/curator.png' },
    { id: 'hunter', name: 'Hunter', img: '/static/img/hunter.png' },
    { id: 'tanner', name: 'Tanner', img: '/static/img/tanner.png' },
    { id: 'village-idiot', name: 'Village Idiot', img: '/static/img/village_idiot.png' }
];

// Role multiplicity configuration
const ROLE_MULTIPLICITY = {
    'werewolf': 2,        // Up to 2 werewolves
    'minion': 1,
    'alpha-wolf': 1,
    'mystic-wolf': 1,
    'dream-wolf': 1,
    'doppelganger': 1,
    'villager': 3,        // Up to 3 villagers
    'mason': { min: 0, max: 2, step: 2 },  // 0 or 2 masons only
    'sentinel': 1,
    'bodyguard': 1,
    'seer': 1,
    'apprentice-seer': 1,
    'paranormal-investigator': 1,
    'witch': 1,
    'robber': 1,
    'troublemaker': 1,
    'drunk': 1,
    'insomniac': 1,
    'revealer': 1,
    'curator': 1,
    'hunter': 1,
    'tanner': 1,
    'village-idiot': 1
};

// Map of selected role counts: { roleId: count }
let selectedRoles = new Map();

/**
 * Check if Insomniac can be selected (requires Robber or Troublemaker in the game)
 * @returns {boolean} true if Robber or Troublemaker is selected
 */
function isInsomniacAvailable() {
    return (selectedRoles.get('robber') || 0) > 0 || (selectedRoles.get('troublemaker') || 0) > 0;
}

/**
 * Get the maximum allowed count for a role
 * @param {string} roleId
 * @returns {number}
 */
function getMaxRoleCount(roleId) {
    const config = ROLE_MULTIPLICITY[roleId];
    if (typeof config === 'number') return config;
    if (typeof config === 'object' && config.max) return config.max;
    return 1;
}

/**
 * Get the minimum allowed count for a role
 * @param {string} roleId
 * @returns {number}
 */
function getMinRoleCount(roleId) {
    const config = ROLE_MULTIPLICITY[roleId];
    if (typeof config === 'object' && config.min !== undefined) return config.min;
    return 0;
}

/**
 * Get total count of selected roles
 * @returns {number}
 */
function getTotalRoleCount() {
    let total = 0;
    selectedRoles.forEach(count => { total += count; });
    return total;
}

function toggleRole(role, increment = true) {
    const required = getRequiredCards();
    const currentCount = selectedRoles.get(role.id) || 0;
    const maxCount = getMaxRoleCount(role.id);
    const minCount = getMinRoleCount(role.id);
    
    let newCount = currentCount;
    
    if (increment) {
        // Left click behavior: add an instance
        // Special handling for Mason: can only be 0 or 2
        if (role.id === 'mason') {
            if (currentCount === 0) {
                if (getTotalRoleCount() + 2 > required) {
                    flashSelectionLimit();
                    return;
                }
                newCount = 2;
            } else {
                // Already selected; left-click does not remove. Use right-click to remove.
                return;
            }
        } else {
            // Single-instance roles toggle on left click
            if (maxCount === 1) {
                newCount = currentCount > 0 ? 0 : 1;
                if (newCount === 1 && getTotalRoleCount() + 1 > required) {
                    flashSelectionLimit();
                    return;
                }
            } else {
                // Multi-instance roles: increment up to max
                if (currentCount >= maxCount) return;
                if (getTotalRoleCount() + 1 > required) {
                    flashSelectionLimit();
                    return;
                }
                newCount = currentCount + 1;
            }
        }
    } else {
        // Right click behavior: remove an instance
        if (role.id === 'mason') {
            newCount = 0;
        } else {
            if (currentCount <= 0) return;
            newCount = Math.max(minCount, currentCount - 1);
        }
    }
    
    // Prevent selecting Insomniac if requirement not met
    if (role.id === 'insomniac' && newCount > currentCount && !isInsomniacAvailable()) {
        flashSelectionLimit();
        return;
    }
    
    // Update role count
    if (newCount > 0) {
        selectedRoles.set(role.id, newCount);
    } else {
        selectedRoles.delete(role.id);
        
        // Auto-deselect Insomniac if its requirement (Robber or Troublemaker) is no longer met
        if ((role.id === 'robber' || role.id === 'troublemaker') && (selectedRoles.get('insomniac') || 0) > 0 && !isInsomniacAvailable()) {
            selectedRoles.delete('insomniac');
        }
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
    const totalCount = getTotalRoleCount();
    const required = getRequiredCards();
    
    if (selCountEl) selCountEl.textContent = totalCount;
    if (reqCountEl) reqCountEl.textContent = required;

    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.disabled = !(required > 0 && totalCount === required);
    }
}

function updateRoleGridSelection() {
    document.querySelectorAll('.role-card').forEach(card => {
        const id = card.dataset.roleId;
        const count = selectedRoles.get(id) || 0;
        
        // Update selection state
        if (count > 0) {
            card.classList.add('selected');
            // Show count for roles that can have multiple instances
            const maxCount = getMaxRoleCount(id);
            if (maxCount > 1) {
                const countLabel = card.querySelector('.role-count');
                if (countLabel) {
                    countLabel.textContent = count;
                } else {
                    const label = document.createElement('span');
                    label.className = 'role-count';
                    label.textContent = count;
                    card.appendChild(label);
                }
            }
        } else {
            card.classList.remove('selected');
            const countLabel = card.querySelector('.role-count');
            if (countLabel) countLabel.remove();
        }
        
        // Handle Insomniac availability
        if (id === 'insomniac') {
            if (isInsomniacAvailable() || count > 0) {
                card.classList.remove('disabled');
                card.style.pointerEvents = 'auto';
                card.style.opacity = '1';
            } else {
                card.classList.add('disabled');
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.5';
            }
        }
    });
}

function updateSelectedPanel() {
    const panel = document.getElementById('selected-panel-list');
    if (!panel) return;
    panel.innerHTML = '';
    
    selectedRoles.forEach((count, roleId) => {
        const roleData = WEREWOLF_ROLES.find(r => r.id === roleId) || VILLAGER_ROLES.find(r => r.id === roleId);
        if (!roleData) return;
        
        for (let i = 0; i < count; i++) {
            const item = document.createElement('div');
            item.className = 'selected-item';
            item.innerHTML = `<span class="avatar-small"><img src="${roleData.img}" alt="${roleData.name}"/></span><span class="name">${roleData.name}</span>`;
            panel.appendChild(item);
        }
    });
    
    const clearBtn = document.getElementById('clear-selection');
    if (clearBtn) clearBtn.disabled = getTotalRoleCount() === 0;
}

/**
 * Convert selected roles to Role instances and initialize workflow
 * @returns {Array<Role>}
 */
function getSelectedRoleInstances() {
    const roleInstances = [];
    selectedRoles.forEach((count, roleId) => {
        if (!count || count <= 0) return;
        const role = RoleFactory.createRole(roleId);
        if (role) roleInstances.push(role);
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
            <label>Number of players:
                <select id="num-players" aria-label="Number of players">
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5" selected>5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
            </label>
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
            card.addEventListener('click', () => toggleRole(r, true));
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleRole(r, false);
            });
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
            card.addEventListener('click', () => toggleRole(r, true));
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleRole(r, false);
            });
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
        document.getElementById('num-players').addEventListener('change', () => {
            updateCountsDisplay();
        });
        document.getElementById('start-game').addEventListener('click', () => {
            const required = getRequiredCards();
            if (getTotalRoleCount() !== required) return;
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
