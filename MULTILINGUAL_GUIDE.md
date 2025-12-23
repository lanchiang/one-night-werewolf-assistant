# Quick Guide: Multilingual Support

## How to Use

### 1. Change Language

**In the app:**
1. Click **Settings** in the sidebar
2. Click **Language**
3. Select your language from the dropdown
4. Click **Test Announcement** to hear a sample

**Available languages:**
- 🇺🇸 English
- 🇪🇸 Español (Spanish)
- 🇨🇳 中文 (Chinese)

### 2. Play Game in Your Language

1. Select roles as usual
2. Click **Start the game**
3. All announcements will play in your chosen language
4. The browser will automatically use the appropriate voice

### 3. Test Different Languages

Visit `/test-speech.html`:
- Change the language dropdown
- Click role buttons (🐺 Werewolf, 🔮 Seer, etc.)
- Hear how each role sounds in different languages

## For Developers

### Add a New Language

**Step 1:** Create translation file

`/frontend/static/translations/fr.json`
```json
{
  "werewolf": "Loups-garous, réveillez-vous et cherchez les autres loups-garous.",
  "minion": "Sbire, réveillez-vous. Loups-garous, levez le pouce pour que le Sbire vous voie.",
  "seer": "Voyant, réveillez-vous. Vous pouvez regarder la carte d'un autre joueur ou deux cartes du centre.",
  "robber": "Voleur, réveillez-vous. Vous pouvez échanger votre carte avec celle d'un autre joueur.",
  "troublemaker": "Fauteur de troubles, réveillez-vous. Vous pouvez échanger les cartes entre deux autres joueurs.",
  "drunk": "Ivrogne, réveillez-vous et échangez votre carte avec une carte du centre.",
  "insomniac": "Insomniaque, réveillez-vous et regardez votre carte."
}
```

**Step 2:** Register in translation-manager.js

```javascript
this.supportedLanguages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'es', name: 'Español', voice: 'es-ES' },
    { code: 'zh', name: '中文', voice: 'zh-CN' },
    { code: 'fr', name: 'Français', voice: 'fr-FR' }  // Add this line
];
```

**Done!** The language will appear in the dropdown automatically.

### Use in Code

```javascript
// Change language programmatically
await translationManager.setLanguage('es');

// Get current language
const lang = translationManager.getCurrentLanguage(); // 'es'

// Get translation for a role
const text = await translationManager.get('seer');
console.log(text); // Spanish text

// Create and speak a role
const seer = RoleFactory.createRole('seer');
await seer.playAudio(); // Speaks in Spanish with Spanish voice
```

## Translation Template

All 19 roles need translations:

```json
{
  "werewolf": "",
  "minion": "",
  "alpha-wolf": "",
  "mystic-wolf": "",
  "villager": "",
  "sentinel": "",
  "seer": "",
  "apprentice-seer": "",
  "paranormal-investigator": "",
  "witch": "",
  "robber": "",
  "troublemaker": "",
  "drunk": "",
  "insomniac": "",
  "revealer": "",
  "curator": "",
  "hunter": "",
  "tanner": "",
  "village-idiot": ""
}
```

## Voice Codes Reference

Common voice locale codes:

| Language | Code |
|----------|------|
| English (US) | en-US |
| English (UK) | en-GB |
| Spanish (Spain) | es-ES |
| Spanish (Mexico) | es-MX |
| French (France) | fr-FR |
| French (Canada) | fr-CA |
| German | de-DE |
| Italian | it-IT |
| Portuguese (Brazil) | pt-BR |
| Portuguese (Portugal) | pt-PT |
| Chinese (Simplified) | zh-CN |
| Chinese (Traditional) | zh-TW |
| Japanese | ja-JP |
| Korean | ko-KR |
| Russian | ru-RU |
| Arabic | ar-SA |
| Hindi | hi-IN |

## Examples

### English
> "Werewolves, wake up and look for other werewolves."

### Spanish
> "Hombres lobo, despierten y busquen a otros hombres lobo."

### Chinese
> "狼人，醒来并寻找其他狼人。"

## Tips

✅ **Keep it natural**: Write how a game master would speak  
✅ **Match game rules**: Use official terminology if available  
✅ **Test pronunciation**: Different TTS engines vary  
✅ **Be concise**: Shorter is better for timers  
✅ **Use proper names**: "Seer" not "The Seer"  

---

Need help? Check [MULTILINGUAL_IMPLEMENTATION.md](MULTILINGUAL_IMPLEMENTATION.md) for details.
