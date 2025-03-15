/**
 * Main Game Script
 * Initializes the game and handles global events
 */

// Wait for DOM to load
window.addEventListener('load', () => {
    // Get canvas and create game engine
    const canvas = document.getElementById('gameCanvas');
    const engine = new Engine(canvas);
    
    // Initialize game
    engine.init();
    
    // Add event listeners
    window.addEventListener('keydown', (e) => {
        // Toggle debug mode with F1 key
        if (e.key === 'F1') {
            engine.toggleDebug();
        }
        
        // Prevent spacebar from scrolling the page
        if (e.key === ' ') {
            e.preventDefault();
        }
    });
    
    // Handle window focus/blur
    window.addEventListener('blur', () => {
        if (engine.input) {
            engine.input.clearKeys();
        }
    });
    
    // Optional: Save game state to localStorage when page is closed
    window.addEventListener('beforeunload', () => {
        // This creates the creepy effect of the game "remembering" the player
        localStorage.setItem('noEndGame_deathCount', engine.deathCount);
        localStorage.setItem('noEndGame_glitchIntensity', engine.glitchIntensity);
        localStorage.setItem('noEndGame_lastPlayed', Date.now());
    });
    
    // Optional: Check if player has played before
    const lastPlayed = localStorage.getItem('noEndGame_lastPlayed');
    if (lastPlayed) {
        const daysSinceLastPlayed = (Date.now() - parseInt(lastPlayed)) / (1000 * 60 * 60 * 24);
        
        // If they played recently, maybe show a creepy welcome back message
        if (daysSinceLastPlayed < 7) {
            setTimeout(() => {
                engine.metaManager.queueMessage("Welcome back. I've been waiting.");
            }, 5000);
        }
        
        // Optionally restore some state to make it seem like the game remembers them
        const savedDeathCount = localStorage.getItem('noEndGame_deathCount');
        if (savedDeathCount) {
            engine.deathCount = parseInt(savedDeathCount);
        }
    }
});