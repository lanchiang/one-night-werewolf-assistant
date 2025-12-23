# Quick Start: Web Speech API Text-to-Speech

## What Changed

Your app now uses **browser text-to-speech** instead of MP3 files for role announcements.

## How to Test

1. **Open the app** in a modern browser (Chrome, Safari, Edge, Firefox)

2. **Select some roles** (e.g., Werewolf, Seer, Robber)

3. **Click "Start the game"**

4. **Click "Start"** on the Night Phase Workflow

5. **Listen!** The browser will speak each role's announcement:
   - "Werewolves, wake up and look for other werewolves."
   - "Seer, wake up. You may look at another player's card..."
   - etc.

## Test Pages

- **`/test-speech.html`** - Test browser TTS capabilities
  - Check browser support
  - View available voices
  - Test individual role announcements
  - Playground for custom text

- **`/test-roles.html`** - Test role class system
  - Verify roles load correctly
  - Check wakeup order sorting

## How It Works

```javascript
// Each role has announcement text
class Seer extends Role {
    constructor() {
        super(
            'seer', 'Seer', '/static/img/seer.png',
            30, true, 6,
            'Seer, wake up. You may look at another player\'s card or two of the center cards.'
            //                           ↑ This text is spoken by browser
        );
    }
}

// Browser speaks it
const seer = RoleFactory.createRole('seer');
await seer.playAudio(); // Browser says the announcement
```

## Customize Announcements

Edit role classes in [app.js](frontend/static/app.js#L60):

```javascript
class Werewolf extends Role {
    constructor() {
        super(
            'werewolf',
            'Werewolf',
            '/static/img/werewolf.jpg',
            30,
            true,
            1,
            'Say anything you want here!' // ← Change this
        );
    }
}
```

## Adjust Voice Settings

In [app.js](frontend/static/app.js#L40), modify the `playAudio()` method:

```javascript
utterance.rate = 0.9;    // Speed: 0.1 (slow) to 10 (fast)
utterance.pitch = 1.0;   // Pitch: 0 (low) to 2 (high)
utterance.volume = 1.0;  // Volume: 0 (silent) to 1 (full)
```

## Benefits

✅ No MP3 files needed  
✅ Works instantly (no file loading)  
✅ Easy to customize (just edit text)  
✅ Works offline  
✅ Supports 40+ languages  

## Browser Support

| Browser | Works? |
|---------|--------|
| Chrome | ✅ Yes |
| Safari | ✅ Yes (best voices on Mac) |
| Edge | ✅ Yes |
| Firefox | ✅ Yes |
| Mobile browsers | ✅ Yes |

## Troubleshooting

**No sound?**
- Unmute your device
- Check browser console for errors
- Try `/test-speech.html` to verify TTS works

**Wrong language?**
- Voices are based on browser/OS language settings
- You can select specific voices (see [audio/README.md](frontend/static/audio/README.md))

**Speech too fast/slow?**
- Adjust `utterance.rate` in `playAudio()` method

## Documentation

- [WEB_SPEECH_IMPLEMENTATION.md](WEB_SPEECH_IMPLEMENTATION.md) - Full implementation details
- [frontend/static/audio/README.md](frontend/static/audio/README.md) - Web Speech API guide
- [ROLE_SYSTEM.md](ROLE_SYSTEM.md) - Complete architecture

## Need MP3s Instead?

If you want to use pre-recorded audio files instead, modify `playAudio()`:

```javascript
async playAudio() {
    const audio = new Audio(`/static/audio/${this.id}.mp3`);
    await audio.play();
}
```

Then add MP3 files to `/frontend/static/audio/` named by role ID.

---

**That's it!** Your app now speaks role announcements automatically. 🎤
