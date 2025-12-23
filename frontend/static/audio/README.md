# Audio Announcements Using Web Speech API

This application uses the **Web Speech API** (`SpeechSynthesis`) to generate voice announcements for each role's night action. No audio files are required!

## How It Works

The app converts text announcements to speech in real-time using the browser's built-in text-to-speech engine:

```javascript
const utterance = new SpeechSynthesisUtterance("Seer, wake up!");
window.speechSynthesis.speak(utterance);
```

## Role Announcements

Each role has a predefined announcement stored as text in its class definition:

### Werewolf Team
- **Werewolf**: "Werewolves, wake up and look for other werewolves."
- **Minion**: "Minion, wake up. Werewolves, stick out your thumb so the Minion can see you."
- **Alpha Wolf**: "Alpha Wolf, wake up and exchange the center Werewolf card with another player's card."
- **Mystic Wolf**: "Mystic Wolf, wake up and look at one other player's card."

### Villager Team
- **Sentinel**: "Sentinel, wake up. You may place a shield token on any player's card but your own."
- **Seer**: "Seer, wake up. You may look at another player's card or two of the center cards."
- **Apprentice Seer**: "Apprentice Seer, wake up. You may look at one of the center cards."
- **Paranormal Investigator**: "Paranormal Investigator, wake up. You may look at up to two other players' cards."
- **Witch**: "Witch, wake up. You may look at one of the center cards and exchange it with any player's card."
- **Robber**: "Robber, wake up. You may exchange your card with another player's card, and then view your new card."
- **Troublemaker**: "Troublemaker, wake up. You may exchange cards between two other players."
- **Drunk**: "Drunk, wake up and exchange your card with a card from the center."
- **Insomniac**: "Insomniac, wake up and look at your card."
- **Revealer**: "Revealer, wake up. You may flip another player's card face up."
- **Curator**: "Curator, wake up. You may view one of the Artifact tokens and place it face down on any player's card."

## Browser Support

The Web Speech API is supported in:
- ✅ Chrome 33+
- ✅ Edge 14+
- ✅ Safari 7+
- ✅ Firefox 49+ (desktop)
- ✅ Chrome for Android
- ✅ Safari on iOS

Check browser compatibility: https://caniuse.com/speech-synthesis

## Configuration

Speech settings are configured in the `Role.playAudio()` method:

```javascript
utterance.rate = 0.9;    // Speech speed (0.1-10)
utterance.pitch = 1.0;   // Voice pitch (0-2)
utterance.volume = 1.0;  // Volume (0-1)
```

You can customize these values in [app.js](../app.js) to adjust the voice characteristics.

## Voice Selection

The app automatically uses the browser's default voice. To select a specific voice:

1. Get available voices: `window.speechSynthesis.getVoices()`
2. Filter by language: `voices.filter(v => v.lang === 'en-US')`
3. Set on utterance: `utterance.voice = selectedVoice`

Example voices you might find:
- "Google US English" (Chrome)
- "Samantha" (Safari on Mac)
- "Microsoft David" (Edge on Windows)

## Customizing Announcements

To change an announcement, edit the role class in [app.js](../app.js):

```javascript
class Seer extends Role {
    constructor() {
        super(
            'seer',
            'Seer',
            '/static/img/seer.png',
            30,
            true,
            6,
            'Your custom announcement here!'  // ← Edit this
        );
    }
}
```

## Benefits of Web Speech API

✅ **No file storage**: No MP3 files to download or host  
✅ **Zero latency**: Instant playback, no network requests  
✅ **Customizable**: Easy to edit announcements in code  
✅ **Multilingual**: Supports 40+ languages  
✅ **Accessible**: Works with screen readers  
✅ **Free**: Built into all modern browsers  

## Troubleshooting

**No sound?**
- Check browser support (see above)
- Ensure volume is up
- Check console for errors
- Try a different browser

**Voice sounds weird?**
- Adjust `rate`, `pitch`, or `volume` in code
- Try selecting a different voice
- Some platforms have better voice quality (macOS Safari is excellent)

**Announcement cut off?**
- Increase the role's timer duration
- Speech may take longer than expected on slow devices

## Alternative: Adding Custom Audio Files

If you prefer pre-recorded audio, you can modify the `playAudio()` method in the `Role` class to load MP3 files instead:

```javascript
async playAudio() {
    const audio = new Audio(`/static/audio/${this.id}.mp3`);
    await audio.play();
}
```

Then place MP3 files in this directory named by role ID (e.g., `werewolf.mp3`).
