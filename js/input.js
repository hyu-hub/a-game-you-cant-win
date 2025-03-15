/**
 * Input Handler
 * Manages keyboard input for player controls
 */

class InputHandler {
    constructor() {
        this.keys = {};
        
        // Set up event listeners
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
        });
    }
    
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    // Clear all keys (useful when game loses focus)
    clearKeys() {
        this.keys = {};
    }
}