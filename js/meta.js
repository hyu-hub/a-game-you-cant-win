/**
 * Meta Manager
 * Handles fourth-wall breaking elements and creepy messages
 */

class MetaManager {
    constructor(engine) {
        this.engine = engine;
        this.dialogBox = document.getElementById('dialogBox');
        this.messageDisplayTime = 5000; // How long messages stay on screen (ms)
        this.messageQueue = [];
        this.currentlyShowingMessage = false;
        
        // Track game events
        this.deathCount = 0;
        this.exitReachedCount = 0;
        this.restartCount = 0;
        
        // Creepy messages that appear as the game progresses
        this.messages = [
            // Early game messages (low intensity)
            "Did you think this would be easy?",
            "Keep trying. It won't help.",
            "I can see you.",
            "This isn't just a game.",
            "I know your name.",
            "Are you enjoying this?",
            
            // Mid-game messages (medium intensity)
            "Why do you persist?",
            "There is no winning here.",
            "Your efforts are meaningless.",
            "I remember all your deaths.",
            "The exit is a lie.",
            "I can feel you getting frustrated.",
            "Your determination is amusing.",
            "Do you think this is just a game?",
            
            // Late game messages (high intensity)
            "STOP PLAYING",
            "YOU CAN'T ESCAPE",
            "I'M INSIDE YOUR COMPUTER NOW",
            "CLOSE THE BROWSER. NOW.",
            "THIS IS YOUR FINAL WARNING",
            "I CAN SEE YOUR DESKTOP",
            "CHECK BEHIND YOU",
            "I'M SAVING YOUR PROGRESS FOREVER",
            "YOUR DEVICE BELONGS TO ME NOW"
        ];
        
        // Special event messages
        this.deathMessages = [
            "Another failure.",
            "Did that hurt?",
            "I enjoy watching you die.",
            "Try again. And again. And again.",
            "Your persistence is amusing."
        ];
        
        this.exitMessages = [
            "You thought that was the exit? Funny.",
            "The exit keeps moving. Just like your hopes.",
            "There is no escape.",
            "That exit was never real.",
            "Keep chasing the impossible."
        ];
        
        this.restartMessages = [
            "Even restarting won't help you.",
            "I remember everything you've done.",
            "You can't escape by restarting.",
            "Your progress is an illusion.",
            "Starting over changes nothing."
        ];
    }
    
    update(deltaTime) {
        // Process message queue if we're not currently showing a message
        if (!this.currentlyShowingMessage && this.messageQueue.length > 0) {
            this.showMessage(this.messageQueue.shift());
        }
        
        // Randomly show messages based on glitch intensity
        const intensity = this.engine.glitchIntensity;
        if (intensity > 0.3 && Math.random() < intensity * 0.0001 * deltaTime) {
            this.showRandomMessage();
        }
    }
    
    triggerEvent(eventType) {
        switch (eventType) {
            case 'playerDeath':
                this.deathCount++;
                if (this.deathCount % 2 === 0) { // Show message every other death
                    this.queueMessage(this.getRandomDeathMessage());
                }
                break;
                
            case 'reachedExit':
                this.exitReachedCount++;
                this.queueMessage(this.getRandomExitMessage());
                break;
                
            case 'gameRestart':
                this.restartCount++;
                this.queueMessage(this.getRandomRestartMessage());
                break;
        }
    }
    
    showRandomMessage() {
        const intensity = this.engine.glitchIntensity;
        
        // Select message based on intensity
        let messagePool;
        if (intensity < 0.3) {
            messagePool = this.messages.slice(0, 4); // Early messages
        } else if (intensity < 0.6) {
            messagePool = this.messages.slice(4, 9); // Mid-game messages
        } else {
            messagePool = this.messages.slice(9); // Late game messages
        }
        
        const message = messagePool[Math.floor(Math.random() * messagePool.length)];
        this.queueMessage(message);
    }
    
    getRandomDeathMessage() {
        return this.deathMessages[Math.floor(Math.random() * this.deathMessages.length)];
    }
    
    getRandomExitMessage() {
        return this.exitMessages[Math.floor(Math.random() * this.exitMessages.length)];
    }
    
    getRandomRestartMessage() {
        return this.restartMessages[Math.floor(Math.random() * this.restartMessages.length)];
    }
    
    queueMessage(message) {
        this.messageQueue.push(message);
    }
    
    showMessage(message) {
        if (!this.dialogBox) return;
        
        this.currentlyShowingMessage = true;
        
        // Set message content
        this.dialogBox.innerHTML = message;
        
        // Show the dialog box with a glitchy effect
        this.dialogBox.style.display = 'block';
        
        // Add some glitchy positioning
        const intensity = this.engine.glitchIntensity;
        if (intensity > 0.4) {
            const offsetX = (Math.random() - 0.5) * 10 * intensity;
            const offsetY = (Math.random() - 0.5) * 10 * intensity;
            this.dialogBox.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        } else {
            this.dialogBox.style.transform = 'translate(-50%, -50%)';
        }
        
        // Hide after a delay
        setTimeout(() => {
            this.dialogBox.style.display = 'none';
            this.currentlyShowingMessage = false;
        }, this.messageDisplayTime);
    }
}