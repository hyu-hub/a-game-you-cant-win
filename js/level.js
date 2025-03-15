/**
 * Level
 * Handles level design, platforms, and exit
 */

class Level {
    constructor(engine) {
        this.engine = engine;
        this.platforms = [];
        this.exit = null;
        this.backgroundColor = '#111';
        
        // Original values for reset
        this.originalPlatforms = [];
        this.originalExit = null;
        this.originalBackgroundColor = this.backgroundColor;
        
        // Create initial level
        this.createLevel();
    }
    
    createLevel() {
        // Create platforms (x, y, width, height, color)
        this.platforms = [
            // Ground
            { x: 0, y: 500, width: 300, height: 20, color: '#555' },
            { x: 350, y: 500, width: 450, height: 20, color: '#555' },
            
            // Platforms
            { x: 150, y: 400, width: 100, height: 20, color: '#555' },
            { x: 300, y: 350, width: 100, height: 20, color: '#555' },
            { x: 500, y: 300, width: 100, height: 20, color: '#555' },
            { x: 650, y: 250, width: 100, height: 20, color: '#555' },
        ];
        
        // Create exit
        this.exit = {
            x: 700,
            y: 180,
            width: 40,
            height: 70,
            color: '#5d5',
            originalX: 700,
            originalY: 180
        };
        
        // Store original values for reset
        this.originalPlatforms = JSON.parse(JSON.stringify(this.platforms));
        this.originalExit = JSON.parse(JSON.stringify(this.exit));
    }
    
    update(deltaTime) {
        // Apply glitch effects based on engine's glitch intensity
        this.applyGlitchEffects(deltaTime);
    }
    
    applyGlitchEffects(deltaTime) {
        const intensity = this.engine.glitchIntensity;
        
        // Background color glitching
        if (intensity > 0.3 && Math.random() < intensity * 0.05) {
            const r = Math.floor(Math.random() * 50);
            const g = Math.floor(Math.random() * 30);
            const b = Math.floor(Math.random() * 50);
            this.backgroundColor = `rgb(${r},${g},${b})`;
            
            // Occasionally flash the background for a more jarring effect
            if (intensity > 0.7 && Math.random() < 0.1) {
                setTimeout(() => {
                    this.backgroundColor = '#fff';
                    setTimeout(() => {
                        this.backgroundColor = `rgb(${r},${g},${b})`;
                    }, 50);
                }, 50);
            }
        } else {
            // Gradually desaturate as intensity increases
            const baseColor = 17; // #111
            const glitchColor = Math.floor(baseColor + (30 * intensity));
            this.backgroundColor = `rgb(${glitchColor},${glitchColor/2},${glitchColor})`;
        }
        
        // Platform movement glitching
        if (intensity > 0.2) {
            this.platforms.forEach((platform, index) => {
                // Only glitch some platforms and not too often
                if (Math.random() < intensity * 0.01) {
                    // Small random movements
                    platform.x += (Math.random() - 0.5) * intensity * 5;
                    platform.y += (Math.random() - 0.5) * intensity * 3;
                    
                    // Occasional color changes
                    if (Math.random() < intensity * 0.1) {
                        const r = Math.floor(50 + Math.random() * 50);
                        const g = Math.floor(50 + Math.random() * 50);
                        const b = Math.floor(50 + Math.random() * 50);
                        platform.color = `rgb(${r},${g},${b})`;
                    }
                }
                
                // At high intensity, occasionally make platforms temporarily disappear
                if (intensity > 0.6 && Math.random() < intensity * 0.001 * deltaTime) {
                    const originalColor = platform.color;
                    platform.color = 'rgba(0,0,0,0)'; // Make invisible
                    
                    // Make it reappear after a short time
                    setTimeout(() => {
                        platform.color = originalColor;
                    }, 300 + Math.random() * 700); // 0.3-1 second
                }
            });
        }
        
        // Exit glitching - moves away as player gets closer
        if (intensity > 0.4 && this.exit) {
            const player = this.engine.player;
            const distanceToExit = Math.sqrt(
                Math.pow(player.x - this.exit.x, 2) + 
                Math.pow(player.y - this.exit.y, 2)
            );
            
            // If player gets close, move the exit away
            if (distanceToExit < 150) {
                // Calculate direction away from player
                const dirX = this.exit.x - player.x;
                const dirY = this.exit.y - player.y;
                
                // Normalize and apply movement
                const length = Math.sqrt(dirX * dirX + dirY * dirY);
                if (length > 0) {
                    const moveSpeed = intensity * 0.5;
                    this.exit.x += (dirX / length) * moveSpeed;
                    this.exit.y += (dirY / length) * moveSpeed;
                    
                    // Keep exit within bounds
                    this.exit.x = Math.max(50, Math.min(this.exit.x, this.engine.canvas.width - 50));
                    this.exit.y = Math.max(50, Math.min(this.exit.y, this.engine.canvas.height - 100));
                }
                
                // Occasionally flicker the exit
                if (Math.random() < intensity * 0.1) {
                    this.exit.color = Math.random() < 0.5 ? '#5d5' : '#d55';
                }
                
                // At high intensity, occasionally teleport the exit to a random location
                if (intensity > 0.7 && Math.random() < intensity * 0.01) {
                    this.exit.x = 50 + Math.random() * (this.engine.canvas.width - 100);
                    this.exit.y = 50 + Math.random() * (this.engine.canvas.height - 150);
                    
                    // Play glitch sound when exit teleports
                    if (this.engine.soundEnabled && this.engine.audioManager) {
                        this.engine.audioManager.playSound('glitch');
                    }
                }
            } else {
                // Slowly return to original position when player is far away
                this.exit.x += (this.exit.originalX - this.exit.x) * 0.01;
                this.exit.y += (this.exit.originalY - this.exit.y) * 0.01;
                
                // Occasionally make the exit briefly invisible at high intensity
                if (intensity > 0.6 && Math.random() < intensity * 0.001) {
                    const originalColor = this.exit.color;
                    this.exit.color = 'rgba(0,0,0,0)';
                    
                    setTimeout(() => {
                        this.exit.color = originalColor;
                    }, 300 + Math.random() * 500);
                }
            }
        }
    }
    
    render(ctx) {
        // Set background color
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
        
        // Draw platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw exit
        if (this.exit) {
            ctx.fillStyle = this.exit.color;
            ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            
            // Draw door details
            ctx.fillStyle = '#000';
            ctx.fillRect(this.exit.x + this.exit.width - 10, this.exit.y + 30, 5, 5); // Doorknob
        }
    }
    
    reset() {
        // Reset platforms to original positions
        this.platforms = JSON.parse(JSON.stringify(this.originalPlatforms));
        
        // Reset exit
        if (this.exit && this.originalExit) {
            this.exit.x = this.originalExit.x;
            this.exit.y = this.originalExit.y;
            this.exit.color = this.originalExit.color;
        }
        
        // Reset background color
        this.backgroundColor = this.originalBackgroundColor;
    }
    
    getPlatforms() {
        return this.platforms;
    }
    
    getExit() {
        return this.exit;
    }
}