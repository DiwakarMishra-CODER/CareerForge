// Speech Service - Text-to-Speech and Speech-to-Text
// Optimized for professional interviewer voice

class SpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.shouldKeepListening = false;
        this.initializeRecognition();
    }

    initializeRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript && this.onTranscript) {
                    this.onTranscript(transcript);
                }
            };

            this.recognition.onend = () => {
                if (this.shouldKeepListening && !this.isSpeaking) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        this.isListening = false;
                    }
                } else {
                    this.isListening = false;
                }
            };
        }
    }

    speak(text, onEnd = null) {
        if (!this.synthesis || !text) {
            if (onEnd) onEnd();
            return;
        }

        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Find a natural English voice
        const voices = this.synthesis.getVoices();
        utterance.voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
        utterance.rate = 0.9;

        utterance.onstart = () => {
            this.isSpeaking = true;
            if (this.onSpeakingChange) this.onSpeakingChange(true);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            if (this.onSpeakingChange) this.onSpeakingChange(false);
            if (onEnd) onEnd();
            if (this.shouldKeepListening) {
                try { this.recognition.start(); this.isListening = true; } catch (e) { }
            }
        };

        this.synthesis.speak(utterance);
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            if (this.onSpeakingChange) this.onSpeakingChange(false);
        }
    }

    startListening(onTranscript, onError) {
        if (!this.recognition) return false;
        this.onTranscript = onTranscript;
        this.shouldKeepListening = true;
        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (e) {
            return false;
        }
    }

    stopListening() {
        this.shouldKeepListening = false;
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    setSpeakingCallback(callback) {
        this.onSpeakingChange = callback;
    }
}

const speechService = new SpeechService();
export default speechService;
