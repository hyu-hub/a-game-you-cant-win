/**
 * Player
 * Handles player movement, physics, and collision detection
 */

class Player {
    constructor(engine) {
        this.engine = engine;
        
        // Player properties
        this.width = 30;
        this.height = 50;
        this.color = '#3af';
        
        // Physics
        this.x = 50;
        this.y = 300;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 0.3;
        this.jumpForce = -10;
        this.gravity = 0.5;
        this.friction = 0.8;
        this.onGround = false;
        
        // Original values for reset
        this.originalX = this.x;
        this.originalY = this.y;
        this.originalColor = this.color;
    }
    
    update(deltaTime) {
        // Apply glitch effects
        this.applyGlitchEffects();
        
        // Handle input
        this.handleInput(deltaTime);
        
        // Apply physics
        this.applyPhysics(deltaTime);
        
        // Check boundaries
        this.checkBoundaries();
    }
    
    handleInput(deltaTime) {
        const input = this.engine.input;
        
        // Horizontal movement
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) {
            this.velocityX -= this.speed * deltaTime;
        }
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) {
            this.velocityX += this.speed * deltaTime;
        }
        
        // Jump
        if ((input.isKeyDown('ArrowUp') || input.isKeyDown('w') || input.isKeyDown(' ')) && this.onGround) {
            this.velocityY = this.jumpForce;
            this.onGround = false;
            
            // Play jump sound
            if (this.engine.soundEnabled && this.engine.audioManager) {
                this.engine.audioManager.playSound('jump');
            }
        }
    }
    
    applyPhysics(deltaTime) {
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Apply friction
        this.velocityX *= this.friction;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Reset onGround flag
        this.onGround = false;
    }
    
    checkBoundaries() {
        // Keep player within canvas bounds
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.width > this.engine.canvas.width) {
            this.x = this.engine.canvas.width - this.width;
            this.velocityX = 0;
        }
        
        // Check if player fell off the bottom
        if (this.y > this.engine.canvas.height) {
            this.engine.playerDied();
        }
    }
    
    checkPlatformCollisions(platforms) {
        for (const platform of platforms) {
            // Check if player is colliding with platform
            if (this.x + this.width > platform.x && 
                this.x < platform.x + platform.width && 
                this.y + this.height > platform.y && 
                this.y < platform.y + platform.height) {
                
                // Calculate overlap
                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;
                
                // Find smallest overlap
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                // Resolve collision based on smallest overlap
                if (minOverlap === overlapTop && this.velocityY > 0) {
                    // Landing on top of platform
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                } else if (minOverlap === overlapBottom && this.velocityY < 0) {
                    // Hitting bottom of platform
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                } else if (minOverlap === overlapLeft && this.velocityX > 0) {
                    // Hitting left side of platform
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                } else if (minOverlap === overlapRight && this.velocityX < 0) {
                    // Hitting right side of platform
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        }
    }
    
    checkExitCollision(exit) {
        // Check if player is colliding with exit
        return (this.x + this.width > exit.x && 
                this.x < exit.x + exit.width && 
                this.y + this.height > exit.y && 
                this.y < exit.y + exit.height);
    }
    
    applyGlitchEffects() {
        const intensity = this.engine.glitchIntensity;
        
        // Visual glitches to player
        if (intensity > 0.3) {
            // Occasionally change player color
            if (Math.random() < intensity * 0.01) {
                const r = Math.floor(Math.random() * 255);
                const g = Math.floor(Math.random() * 255);
                const b = Math.floor(Math.random() * 255);
                this.color = `rgb(${r},${g},${b})`;
            } else {
                // Gradually return to original color
                this.color = this.originalColor;
            }
            
            // Occasionally apply random force
            if (intensity > 0.6 && Math.random() < intensity * 0.005) {
                this.velocityX += (Math.random() - 0.5) * 10 * intensity;
                this.velocityY += (Math.random() - 0.5) * 10 * intensity;
            }
        }
    }
    
    render(ctx) {
        // Draw player
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw face
        ctx.fillStyle = '#000';
        
        // Eyes
        const eyeSize = 5;
        const eyeY = this.y + 15;
        ctx.fillRect(this.x + 7, eyeY, eyeSize, eyeSize);
        ctx.fillRect(this.x + this.width - 12, eyeY, eyeSize, eyeSize);
        
        // Mouth
        const mouthY = this.y + 30;
        ctx.fillRect(this.x + 10, mouthY, this.width - 20, 3);
        
        // Apply glitch visual effects based on intensity
        const intensity = this.engine.glitchIntensity;
        if (intensity > 0.5 && Math.random() < intensity * 0.1) {
            // Occasionally draw glitch artifacts
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(this.x + (Math.random() - 0.5) * 10, 
                         this.y + (Math.random() - 0.5) * 10, 
                         this.width + (Math.random() - 0.5) * 20, 
                         this.height + (Math.random() - 0.5) * 20);
        }
    }
    
    reset() {
        // Reset position
        this.x = this.originalX;
        this.y = this.originalY;
        
        // Reset physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        
        // Reset appearance
        this.color = this.originalColor;
    }
}