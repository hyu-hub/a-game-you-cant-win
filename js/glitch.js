/**
 * Glitch Manager
 * Handles visual and gameplay glitches that increase over time
 */

class GlitchManager {
    constructor(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.ctx = engine.ctx;
        
        // Glitch effects
        this.screenShakeIntensity = 0;
        this.colorShiftAmount = 0;
        this.staticNoise = 0;
        this.lastGlitchTime = 0;
        
        // Glitch image data for post-processing
        this.imageData = null;
    }
    
    update(deltaTime) {
        const intensity = this.engine.glitchIntensity;
        
        // Update glitch effect values based on intensity
        this.screenShakeIntensity = intensity * 5;
        this.colorShiftAmount = Math.floor(intensity * 10);
        this.staticNoise = intensity * 0.2;
        
        // Occasionally trigger major glitch events
        if (intensity > 0.3 && Math.random() < intensity * 0.001 * deltaTime) {
            this.triggerMajorGlitch();
        }
    }
    
    preRender() {
        // Apply screen shake
        if (this.screenShakeIntensity > 0 && Math.random() < this.engine.glitchIntensity * 0.1) {
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
            
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
        }
    }
    
    postRender() {
        // Reset any transformations from pre-render
        this.ctx.restore();
        
        const intensity = this.engine.glitchIntensity;
        
        // Apply static noise
        if (this.staticNoise > 0) {
            this.applyStaticNoise();
        }
        
        // Apply color shifting/RGB split
        if (this.colorShiftAmount > 0 && Math.random() < intensity * 0.05) {
            this.applyColorShift();
        }
        
        // Occasionally apply scanlines
        if (intensity > 0.4 && Math.random() < intensity * 0.1) {
            this.applyScanlines();
        }
    }
    
    applyStaticNoise() {
        const intensity = this.engine.glitchIntensity;
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Only apply to a portion of the screen to save performance
        const noiseAmount = Math.min(100, Math.floor(intensity * 1000));
        
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        
        for (let i = 0; i < noiseAmount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const width = Math.random() * 20 * intensity;
            const height = Math.random() * 2 * intensity;
            
            ctx.fillRect(x, y, width, height);
        }
    }
    
    applyColorShift() {
        // This is a simplified version - for a real RGB split effect
        // you would need to use getImageData and manipulate pixels
        const ctx = this.ctx;
        const canvas = this.canvas;
        const amount = this.colorShiftAmount;
        
        try {
            // Get current canvas content
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Draw a semi-transparent red shifted version
            ctx.globalAlpha = 0.3;
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(canvas, amount, 0);
            
            // Draw a semi-transparent blue shifted version
            ctx.globalAlpha = 0.3;
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(canvas, -amount, 0);
            
            // Reset composite operation
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        } catch (e) {
            // If we can't access image data (e.g., CORS issues), fallback to a simpler effect
            ctx.fillStyle = 'rgba(255,0,0,0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    applyScanlines() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(0, y, canvas.width, 1);
        }
    }
    
    triggerMajorGlitch() {
        const now = Date.now();
        
        // Don't trigger major glitches too frequently
        if (now - this.lastGlitchTime < 10000) return;
        
        this.lastGlitchTime = now;
        const intensity = this.engine.glitchIntensity;
        
        // Choose a random major glitch effect based on intensity
        const glitchType = Math.floor(Math.random() * 5);
        
        switch (glitchType) {
            case 0:
                // Screen tear effect
                this.screenTearEffect();
                break;
            case 1:
                // Fake crash if intensity is high enough
                if (intensity > 0.6) {
                    this.engine.fakeCrash();
                }
                break;
            case 2:
                // Trigger a creepy message
                this.engine.metaManager.showRandomMessage();
                break;
            case 3:
                // Invert colors temporarily
                this.invertColorsEffect();
                break;
            case 4:
                // Play glitch sound
                if (this.engine.soundEnabled && this.engine.audioManager) {
                    this.engine.audioManager.playSound('glitch');
                }
                // Pixelate screen temporarily
                this.pixelateEffect();
                break;
        }
        
        // Play glitch sound for major effects
        if (this.engine.soundEnabled && this.engine.audioManager && Math.random() < 0.5) {
            this.engine.audioManager.playSound('glitch');
        }
    }
    
    screenTearEffect() {
        // This is a simplified version - for a real screen tear
        // you would manipulate the image data directly
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        try {
            // Get current canvas content
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Create a tear in the middle of the screen
            const tearY = Math.floor(Math.random() * canvas.height);
            const tearHeight = Math.floor(20 + Math.random() * 50);
            const tearShift = Math.floor(10 + Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
            
            // Draw the tear
            ctx.drawImage(canvas, 
                         0, tearY, canvas.width, tearHeight, 
                         tearShift, tearY, canvas.width, tearHeight);
            
            // Add multiple tears for more severe glitches
            if (this.engine.glitchIntensity > 0.7 && Math.random() < 0.5) {
                for (let i = 0; i < 3; i++) {
                    const additionalTearY = Math.floor(Math.random() * canvas.height);
                    const additionalTearHeight = Math.floor(10 + Math.random() * 30);
                    const additionalTearShift = Math.floor(5 + Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1);
                    
                    ctx.drawImage(canvas, 
                                 0, additionalTearY, canvas.width, additionalTearHeight, 
                                 additionalTearShift, additionalTearY, canvas.width, additionalTearHeight);
                }
            }
        } catch (e) {
            // Fallback if image data manipulation fails
            const tearY = Math.floor(Math.random() * canvas.height);
            const tearHeight = Math.floor(5 + Math.random() * 20);
            
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, tearY, canvas.width, tearHeight);
        }
    }
    
    invertColorsEffect() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const duration = 500 + Math.random() * 1000; // 0.5-1.5 seconds
        
        try {
            // Invert the entire screen
            ctx.globalCompositeOperation = 'difference';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Reset after duration
            setTimeout(() => {
                // This will be called on next render
                ctx.globalCompositeOperation = 'source-over';
            }, duration);
        } catch (e) {
            // Fallback if composite operation fails
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    pixelateEffect() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const intensity = this.engine.glitchIntensity;
        const duration = 300 + Math.random() * 700; // 0.3-1 second
        
        try {
            // Get current canvas content
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Calculate pixel size based on intensity
            const pixelSize = Math.max(5, Math.floor(10 * intensity));
            
            // Draw pixelated version
            for (let y = 0; y < canvas.height; y += pixelSize) {
                for (let x = 0; x < canvas.width; x += pixelSize) {
                    // Get the color of one pixel
                    const pixelData = ctx.getImageData(x, y, 1, 1).data;
                    
                    // Use that color to fill a square
                    ctx.fillStyle = `rgb(${pixelData[0]},${pixelData[1]},${pixelData[2]})`;
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                }
            }
            
            // Reset after duration
            setTimeout(() => {
                ctx.putImageData(imageData, 0, 0);
            }, duration);
        } catch (e) {
            // Fallback if image manipulation fails
            // Just add some random colored blocks
            const blockSize = 20;
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                
                ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.5)`;
                ctx.fillRect(x, y, blockSize, blockSize);
            }
        }
    }
}