# Role Class System Implementation

## Overview

The One Night Werewolf Assistant now uses a robust JavaScript class-based system for managing roles and the night phase workflow. This eliminates the need for a Python backend and runs entirely in the browser.

## Architecture

### 1. Base Role Class

```javascript
class Role {
    constructor(id, name, img, timer, wakeup, wakeupOrder)
}
```

**Properties:**
- `id`: Unique role identifier (e.g., 'werewolf', 'seer')
- `name`: Display name for the UI
- `img`: Path to role card image
- `timer`: Countdown duration in seconds
- `wakeup`: Boolean indicating if role wakes at night
- `wakeupOrder`: Integer defining wake sequence (lower = earlier)
- `announcement`: Text announcement spoken via Web Speech API

**Methods:**
- `playAudio()`: Converts announcement text to speech using browser's TTS engine

### 2. Specific Role Implementations

Each game role extends the base `Role` class:

#### Werewolf Team
- **Werewolf** (order: 1, timer: 30s)
- **Minion** (order: 2, timer: 20s)
- **Alpha Wolf** (order: 3, timer: 30s)
- **Mystic Wolf** (order: 4, timer: 30s)

#### Villager Team
- **Sentinel** (order: 5, timer: 25s)
- **Seer** (order: 6, timer: 30s)
- **Apprentice Seer** (order: 7, timer: 25s)
- **Paranormal Investigator** (order: 8, timer: 35s)
- **Witch** (order: 9, timer: 30s)
- **Robber** (order: 10, timer: 25s)
- **Troublemaker** (order: 11, timer: 25s)
- **Drunk** (order: 12, timer: 20s)
- **Insomniac** (order: 13, timer: 20s)
- **Revealer** (order: 14, timer: 25s)
- **Curator** (order: 15, timer: 25s)

#### Non-wakeup Roles
- **Villager** (wakeup: false)
- **Hunter** (wakeup: false)
- **Tanner** (wakeup: false)
- **Village Idiot** (wakeup: false)

### 3. RoleFactory

Creates role instances from IDs:

```javascript
const role = RoleFactory.createRole('werewolf');
```

### 4. WorkflowManager

Orchestrates the night phase:

```javascript
const wfm = new WorkflowManager();
wfm.setRoles(selectedRoleInstances);  // Initialize
wfm.start();                           // Begin workflow
wfm.pause();                           // Pause timer
wfm.togglePause();                     // Toggle play/pause
wfm.reset();                           // Restart from beginning
```

**Key Features:**
- Automatically filters roles with `wakeup: true`
- Sorts by `wakeupOrder` ascending
- Plays role-specific audio at start of each turn
- Uses each role's custom timer duration
- Updates UI in real-time (100ms refresh)

## Usage Example

```javascript
// User selects roles in UI
const selectedRoles = new Map([
    ['werewolf', { id: 'werewolf', name: 'Werewolf', img: '...' }],
    ['seer', { id: 'seer', name: 'Seer', img: '...' }],
    ['robber', { id: 'robber', name: 'Robber', img: '...' }]
]);

// Convert to Role instances
const roleInstances = [];
selectedRoles.forEach((data, id) => {
    const role = RoleFactory.createRole(id);
    if (role) roleInstances.push(role);
});

// Initialize workflow
workflowManager.setRoles(roleInstances);

// Roles are automatically:
// 1. Filtered (only wakeup: true)
// 2. Sorted by wakeupOrder
// 3. Ready to play with custom timers

// Start the night phase
workflowManager.start();
```

## Audio Integration

The app uses the **Web Speech API** (`SpeechSynthesis`) to generate voice announcements in real-time:

1. Each role has a text `announcement` property
2. When a role's turn begins, `role.playAudio()` is called
3. The browser converts text to speech instantly
4. No audio files required - fully client-side TTS

**Configuration:**
```javascript
utterance.rate = 0.9;    // Speech speed (0.1-10)
utterance.pitch = 1.0;   // Voice pitch (0-2)  
utterance.volume = 1.0;  // Volume (0-1)
```

**Browser Support:**
- Chrome 33+, Edge 14+, Safari 7+, Firefox 49+
- Works on mobile (iOS Safari, Chrome for Android)

See [`/frontend/static/audio/README.md`](frontend/static/audio/README.md) for detailed configuration options and voice selection.

## Testing

Run the test suites:

1. **Role Class Tests**: Navigate to `/test-roles.html`
   - Verifies role creation, filtering, sorting
   
2. **Speech API Tests**: Navigate to `/test-speech.html`
   - Tests browser support
   - Lists available voices
   - Tests role announcements
   - Custom text-to-speech playground

View console for detailed test results.

## Future Enhancements

✅ **Simpler deployment**: Static files only (no Python/FastAPI required)  
✅ **Better performance**: No network latency for timer/audio  
✅ **Offline capable**: Works without server after initial load  
✅ **Easier debugging**: All logic in one place (browser DevTools)  
✅ **Native audio**: Web Speech API provides instant text-to-speech  
✅ **Type safety**: Class-based inheritance provides clear contracts  
✅ **Zero audio files**: No MP3s to create, host, or manage  

## Migration from Old System

The legacy system used:
- `NIGHT_WAKEUP_ROLE_IDS` set for filtering
- `NIGHT_STEP_SECONDS` constant for all timers
- Manual state tracking in `wakeupState` object
- MP3 audio files

The new system:
- Encapsulates all role data in class instances
- Supports per-role custom timers
- Centralizes workflow logic in `WorkflowManager`
- Uses Web Speech API for text-to-speech (no audio files)
- Maintains backward compatibility with existing UI code

## Future Enhancements

Potential improvements:

1. **TypeScript conversion**: Add static typing for better IDE support
2. **Role variants**: Support multiple versions of same role (e.g., "Drunk" vs "Drunk 2")
3. **Custom timers**: Let users adjust timer durations in settings
4. **Voice selection**: UI to choose from available browser voices
5. **Multilingual**: Support announcements in multiple languages (Web Speech API supports 40+ languages)
6. **Accessibility**: Already accessible via TTS; add visual cues for hearing-impaired users
7. **Replay/history**: Save and replay previous games

## File Structure

```
frontend/
├── static/
│   ├── app.js           # Main app (includes Role classes with TTS)
│   ├── style.css
│   ├── audio/
│   │   └── README.md    # Web Speech API documentation
│   └── img/
│       └── ...
├── index.html
├── test-roles.html      # Role class test suite
└── test-speech.html     # Web Speech API test suite
```

## Contributing

When adding new roles:

1. Create a class extending `Role`:
   ```javascript
   class NewRole extends Role {
       constructor() {
           super(
               'new-role',
               'New Role',
               '/static/img/new-role.png',
               25,           // 25s timer
               true,         // wakes up at night
               16,           // wakeup order
               'New Role, wake up and perform your action!'  // TTS announcement
           );
       }
   }
   ```

2. Register in `RoleFactory`:
   ```javascript
   const roleMap = {
       // ... existing roles
       'new-role': NewRole
   };
   ```

3. Add to UI role lists: `WEREWOLF_ROLES` or `VILLAGER_ROLES`

No audio files needed - announcements are spoken via Web Speech API!

## License

See [LICENSE](../LICENSE) file in project root.
