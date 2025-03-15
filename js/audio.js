/**
 * Audio Manager
 * Handles sound effects and background audio with glitch effects
 */

class AudioManager {
    constructor(engine) {
        this.engine = engine;
        this.sounds = {};
        this.muted = false;
        this.volume = 0.5; // Default volume
        
        // Initialize sounds
        this.initSounds();
    }
    
    initSounds() {
        // Create audio elements
        this.createSound('jump', 'audio/jump.mp3');
        this.createSound('death', 'audio/death.mp3');
        this.createSound('glitch', 'audio/glitch.mp3');
        this.createSound('exit', 'audio/exit.mp3');
        this.createSound('ambient', 'audio/ambient.mp3', true); // Looping ambient sound
        
        // Create placeholder audio elements if files don't exist yet
        this.createPlaceholderAudio();
    }
    
    createSound(name, src, loop = false) {
        const sound = new Audio();
        sound.volume = this.volume;
        sound.loop = loop;
        
        // Try to set the source, but don't worry if it fails
        // This allows the game to work even if audio files aren't created yet
        try {
            sound.src = src;
        } catch (e) {
            console.log(`Audio file ${src} not found. Using placeholder.`);
        }
        
        this.sounds[name] = sound;
    }
    
    createPlaceholderAudio() {
        // Create directory if it doesn't exist
        // This would be handled server-side in a real deployment
        
        // Create oscillator-based sounds for placeholders
        this.createOscillatorSound('jump', 200, 0.1);
        this.createOscillatorSound('death', 100, 0.3);
        this.createOscillatorSound('glitch', 50, 0.2);
        this.createOscillatorSound('exit', 300, 0.2);
        this.createOscillatorSound('ambient', 80, 1.0, true);
    }
    
    createOscillatorSound(name, frequency, duration, loop = false) {
        // Only create if we don't have a valid source
        if (!this.sounds[name].src || this.sounds[name].error) {
            // We'll use a data URI for a simple tone
            // This is a hacky way to create sounds without actual files
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Store the audio context and nodes for later use
            this.sounds[name].audioContext = audioContext;
            this.sounds[name].oscillator = oscillator;
            this.sounds[name].gainNode = gainNode;
            this.sounds[name].duration = duration;
        }
    }
    
    playSound(name) {
        if (this.muted) return;
        
        const sound = this.sounds[name];
        if (!sound) return;
        
        // Apply glitch effects to sound based on intensity
        this.applyGlitchToSound(sound);
        
        // If it's a regular audio file
        if (sound.src) {
            // Reset the audio to the beginning if it's already playing
            sound.currentTime = 0;
            sound.play().catch(e => {
                // Fallback to oscillator if audio play fails
                this.playOscillatorSound(name);
            });
        } else {
            // Use oscillator fallback
            this.playOscillatorSound(name);
        }
    }
    
    playOscillatorSound(name) {
        const sound = this.sounds[name];
        if (!sound || !sound.audioContext) return;
        
        // Create new oscillator (they can only be used once)
        const oscillator = sound.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = sound.oscillator.frequency.value;
        
        // Apply glitch to frequency
        const intensity = this.engine.glitchIntensity;
        if (intensity > 0.3) {
            oscillator.frequency.value *= (1 + (Math.random() - 0.5) * intensity * 0.5);
        }
        
        oscillator.connect(sound.gainNode);
        oscillator.start();
        
        // Stop after duration unless it's looping
        if (!sound.loop) {
            setTimeout(() => {
                oscillator.stop();
            }, sound.duration * 1000);
        } else {
            // For looping sounds, we need to create a new oscillator when this one ends
            setTimeout(() => {
                oscillator.stop();
                this.playOscillatorSound(name);
            }, sound.duration * 1000);
        }
    }
    
    applyGlitchToSound(sound) {
        const intensity = this.engine.glitchIntensity;
        
        // Skip glitch effects if intensity is low
        if (intensity < 0.2) return;
        
        // Randomly adjust volume based on glitch intensity
        if (Math.random() < intensity * 0.2) {
            sound.volume = this.volume * (1 - Math.random() * intensity * 0.5);
        } else {
            sound.volume = this.volume;
        }
        
        // Randomly adjust playback rate for weird effects
        if (intensity > 0.4 && Math.random() < intensity * 0.3) {
            // playbackRate property only works for HTML5 Audio elements
            if (sound.playbackRate !== undefined) {
                sound.playbackRate = 1.0 + (Math.random() - 0.5) * intensity;
            }
        } else if (sound.playbackRate !== undefined) {
            sound.playbackRate = 1.0;
        }
    }
    
    startAmbientSound() {
        this.playSound('ambient');
    }
    
    stopAllSounds() {
        for (const name in this.sounds) {
            const sound = this.sounds[name];
            if (sound.pause) {
                sound.pause();
                sound.currentTime = 0;
            }
        }
    }
    
    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            this.stopAllSounds();
        } else {
            // Restart ambient when unmuting
            this.startAmbientSound();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all sound volumes
        for (const name in this.sounds) {
            this.sounds[name].volume = this.volume;
        }
    }
}