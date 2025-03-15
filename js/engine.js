/**
 * Game Engine
 * Handles the core game loop, rendering, and basic mechanics
 */

class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000/60; // 60 fps
        
        // Game state
        this.running = false;
        this.gameTime = 0; // Time played in seconds
        this.deathCount = 0;
        
        // Glitch state
        this.glitchIntensity = 0; // 0-1 scale of how glitchy the game should be
        
        // Debug
        this.debug = false;
        
        // Audio settings
        this.soundEnabled = true;
    }
    
    init() {
        // Create game objects
        this.input = new InputHandler();
        this.player = new Player(this);
        this.level = new Level(this);
        this.glitchManager = new GlitchManager(this);
        this.metaManager = new MetaManager(this);
        this.audioManager = new AudioManager(this);
        
        // Start ambient sound
        if (this.soundEnabled) {
            this.audioManager.startAmbientSound();
        }
        
        // Start the game loop
        this.running = true;
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        if (!this.running) return;
        
        // Calculate delta time
        if (!this.lastTime) this.lastTime = timestamp;
        let deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update game time (in seconds)
        this.gameTime += deltaTime / 1000;
        
        // Update glitch intensity based on game time and death count
        this.updateGlitchIntensity();
        
        // Fixed timestep for physics
        this.accumulator += deltaTime;
        while (this.accumulator >= this.timestep) {
            this.update(this.timestep);
            this.accumulator -= this.timestep;
        }
        
        // Render
        this.render();
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // Update game objects
        this.player.update(deltaTime);
        this.level.update(deltaTime);
        
        // Check for collisions
        this.checkCollisions();
        
        // Update glitch and meta elements
        this.glitchManager.update(deltaTime);
        this.metaManager.update(deltaTime);
    }
    
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply any pre-render glitch effects
        this.glitchManager.preRender();
        
        // Render game objects
        this.level.render(this.ctx);
        this.player.render(this.ctx);
        
        // Apply any post-render glitch effects
        this.glitchManager.postRender();
        
        // Debug info
        if (this.debug) {
            this.renderDebugInfo();
        }
    }
    
    checkCollisions() {
        // Player-platform collisions
        const platforms = this.level.getPlatforms();
        this.player.checkPlatformCollisions(platforms);
        
        // Player-exit collisions
        if (this.level.exit && this.player.checkExitCollision(this.level.exit)) {
            this.metaManager.triggerEvent('reachedExit');
        }
    }
    
    updateGlitchIntensity() {
        // Calculate glitch intensity based on game time and death count
        // This will gradually increase as the player progresses
        const timeInfluence = Math.min(this.gameTime / 120, 0.5); // Max 0.5 from time (2 minutes)
        const deathInfluence = Math.min(this.deathCount / 5, 0.5); // Max 0.5 from deaths (5 deaths)
        
        this.glitchIntensity = timeInfluence + deathInfluence;
    }
    
    playerDied() {
        this.deathCount++;
        this.metaManager.triggerEvent('playerDeath');
        
        // Play death sound
        if (this.soundEnabled && this.audioManager) {
            this.audioManager.playSound('death');
        }
        
        this.player.reset();
        this.level.reset();
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Time: ${this.gameTime.toFixed(1)}s`, 10, 20);
        this.ctx.fillText(`Deaths: ${this.deathCount}`, 10, 40);
        this.ctx.fillText(`Glitch: ${(this.glitchIntensity * 100).toFixed(0)}%`, 10, 60);
    }
    
    toggleDebug() {
        this.debug = !this.debug;
    }
    
    // Fake crash and restart
    fakeCrash() {
        this.running = false;
        
        // Show fake error message
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.style.display = 'block';
        errorMsg.style.top = `${Math.random() * 50}%`;
        errorMsg.style.left = `${Math.random() * 50}%`;
        errorMsg.innerHTML = 'FATAL ERROR: Memory corruption detected.<br>Game state corrupted.<br>Attempting recovery...';
        
        // "Restart" after a delay
        setTimeout(() => {
            errorMsg.style.display = 'none';
            this.running = true;
            this.lastTime = 0; // Reset time to avoid huge delta
            requestAnimationFrame(this.gameLoop.bind(this));
            
            // Trigger meta event
            this.metaManager.triggerEvent('gameRestart');
        }, 3000);
    }
}