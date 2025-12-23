/**
 * Translation Manager with lazy loading support
 * Manages multilingual announcements for role cards
 */

class TranslationManager {
    constructor() {
        this.translations = {}; // Cache: { 'en': {...}, 'es': {...} }
        this.currentLanguage = this.loadSavedLanguage();
        this.supportedLanguages = [
            { code: 'en', name: 'English', voice: 'en-US' },
            { code: 'es', name: 'Español', voice: 'es-ES' },
            { code: 'zh', name: '中文', voice: 'zh-CN' }
        ];
        this.loadingPromises = {}; // Track in-flight requests
    }

    /**
     * Load saved language preference from localStorage
     */
    loadSavedLanguage() {
        return localStorage.getItem('gameLanguage') || 'en';
    }

    /**
     * Set current language and save to localStorage
     * @param {string} languageCode - Language code (e.g., 'en', 'es', 'zh')
     */
    async setLanguage(languageCode) {
        const isSupported = this.supportedLanguages.some(
            lang => lang.code === languageCode
        );

        if (!isSupported) {
            console.warn(`Language '${languageCode}' not supported. Using English.`);
            languageCode = 'en';
        }

        this.currentLanguage = languageCode;
        localStorage.setItem('gameLanguage', languageCode);

        // Preload translations if not already loaded
        await this.loadTranslations(languageCode);
    }

    /**
     * Get current language code
     * @returns {string}
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get list of supported languages
     * @returns {Array<{code: string, name: string, voice: string}>}
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Lazy load translations for a specific language
     * @param {string} languageCode - Language code
     * @returns {Promise<Object>} Translation dictionary
     */
    async loadTranslations(languageCode) {
        // Return cached if already loaded
        if (this.translations[languageCode]) {
            return this.translations[languageCode];
        }

        // Return existing promise if already loading
        if (this.loadingPromises[languageCode]) {
            return this.loadingPromises[languageCode];
        }

        // Start loading
        this.loadingPromises[languageCode] = fetch(
            `/static/translations/${languageCode}.json`
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load translations for '${languageCode}'`);
                }
                return response.json();
            })
            .then(data => {
                this.translations[languageCode] = data;
                delete this.loadingPromises[languageCode];
                return data;
            })
            .catch(error => {
                console.error(`Error loading translations for '${languageCode}':`, error);
                delete this.loadingPromises[languageCode];
                
                // Fallback to English if not English
                if (languageCode !== 'en') {
                    return this.loadTranslations('en');
                }
                
                return {};
            });

        return this.loadingPromises[languageCode];
    }

    /**
     * Get translated announcement for a role
     * @param {string} roleId - Role identifier (e.g., 'werewolf', 'seer')
     * @returns {Promise<string>} Translated announcement
     */
    async get(roleId) {
        // Ensure current language is loaded
        await this.loadTranslations(this.currentLanguage);

        const translation = this.translations[this.currentLanguage]?.[roleId];

        // Fallback to English if translation missing
        if (!translation && this.currentLanguage !== 'en') {
            await this.loadTranslations('en');
            return this.translations['en']?.[roleId] || '';
        }

        return translation || '';
    }

    /**
     * Get the best matching voice for current language
     * @returns {SpeechSynthesisVoice|null}
     */
    getMatchingVoice() {
        const voices = window.speechSynthesis.getVoices();
        
        // Find language config
        const langConfig = this.supportedLanguages.find(
            lang => lang.code === this.currentLanguage
        );

        if (!langConfig) return null;

        // Try exact match first (e.g., 'en-US')
        let voice = voices.find(v => v.lang === langConfig.voice);
        
        // Try language prefix match (e.g., 'en')
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith(langConfig.code));
        }

        return voice || null;
    }

    /**
     * Preload all supported languages
     * Useful for offline support
     */
    async preloadAll() {
        const promises = this.supportedLanguages.map(lang => 
            this.loadTranslations(lang.code)
        );
        await Promise.all(promises);
    }

    /**
     * Check if a language is loaded
     * @param {string} languageCode
     * @returns {boolean}
     */
    isLoaded(languageCode) {
        return !!this.translations[languageCode];
    }

    /**
     * Get loading status
     * @returns {Object} Status of each language
     */
    getLoadingStatus() {
        return this.supportedLanguages.reduce((status, lang) => {
            status[lang.code] = {
                loaded: this.isLoaded(lang.code),
                loading: !!this.loadingPromises[lang.code]
            };
            return status;
        }, {});
    }
}

// Global instance
const translationManager = new TranslationManager();

// Preload current language on page load
if ('speechSynthesis' in window) {
    translationManager.loadTranslations(translationManager.getCurrentLanguage());
}
