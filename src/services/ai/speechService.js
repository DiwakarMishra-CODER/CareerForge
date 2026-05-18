/**
 * speechService.js
 * Robust TTS + STT service for the Mock Interview feature.
 *
 * TTS: Uses the Web Speech API's SpeechSynthesis with the "Global Memory Hack"
 *      (window.activeUtterances) to prevent Chrome's garbage collector from
 *      killing utterances before they finish playing.
 *
 * STT: Wraps the browser's SpeechRecognition API with a 2.5-second silence
 *      detector that automatically fires an onSilenceCallback so the interview
 *      session can auto-submit spoken answers without extra button clicks.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TTS (Text-to-Speech)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global registry that keeps SpeechSynthesisUtterance objects alive in memory.
 * Chrome's garbage collector can prematurely destroy utterance objects while
 * they are still queued/playing, causing silent failures. Holding a reference
 * here prevents that.
 */
if (!window.activeUtterances) {
    window.activeUtterances = [];
}

/** Track whether the audio engine has been unlocked by a user gesture. */
let audioUnlocked = false;

/**
 * unlockAudio()
 * Call this function synchronously inside a click/tap event handler BEFORE
 * any async work. It plays a zero-length silent utterance which satisfies the
 * browser's "user gesture required for audio" policy for all future TTS calls.
 */
export function unlockAudio() {
    if (audioUnlocked) return;
    try {
        window.speechSynthesis.cancel(); // clear any stale queue
        const silent = new SpeechSynthesisUtterance('');
        silent.volume = 0;
        silent.rate = 16;
        window.activeUtterances.push(silent);
        silent.onend = () => {
            const idx = window.activeUtterances.indexOf(silent);
            if (idx !== -1) window.activeUtterances.splice(idx, 1);
        };
        window.speechSynthesis.speak(silent);
        audioUnlocked = true;
        console.log('[SpeechService] Audio engine unlocked.');
    } catch (err) {
        console.warn('[SpeechService] unlockAudio failed:', err);
    }
}

/**
 * speak(text, onEndCallback?)
 * Speaks the given text using the browser's TTS engine.
 *
 * @param {string}   text          - The text to speak.
 * @param {Function} [onEndCallback] - Optional callback fired when speech ends.
 * @returns {SpeechSynthesisUtterance} The utterance object (can be used to cancel).
 */
export function speak(text, onEndCallback) {
    // Cancel anything currently playing/queued so we start fresh.
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
        onEndCallback && onEndCallback();
        return null;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Push into the global registry to keep it alive.
    window.activeUtterances.push(utterance);

    // Voice configuration – prefer a natural-sounding English voice.
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
        (v) =>
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')) &&
            v.lang.startsWith('en')
    );
    if (preferred) utterance.voice = preferred;

    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const cleanup = () => {
        const idx = window.activeUtterances.indexOf(utterance);
        if (idx !== -1) window.activeUtterances.splice(idx, 1);
    };

    utterance.onend = () => {
        cleanup();
        onEndCallback && onEndCallback();
    };

    utterance.onerror = (e) => {
        // 'interrupted' is thrown when we cancel; that's expected – don't log it.
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.error('[SpeechService] TTS error:', e.error);
        }
        cleanup();
        onEndCallback && onEndCallback();
    };

    /**
     * Chrome TTS Workaround:
     * Chrome stops utterances longer than ~15 seconds. We use a periodic
     * resume() call to keep it alive during long AI responses.
     */
    const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
        } else {
            clearInterval(resumeInterval);
        }
    }, 10000);

    utterance.onend = () => {
        clearInterval(resumeInterval);
        cleanup();
        onEndCallback && onEndCallback();
    };

    utterance.onerror = (e) => {
        clearInterval(resumeInterval);
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.error('[SpeechService] TTS error:', e.error);
        }
        cleanup();
        onEndCallback && onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
}

/**
 * stopSpeaking()
 * Immediately cancels all active TTS output.
 */
export function stopSpeaking() {
    window.speechSynthesis.cancel();
    window.activeUtterances = [];
}

// ─────────────────────────────────────────────────────────────────────────────
// STT (Speech-to-Text)
// ─────────────────────────────────────────────────────────────────────────────

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

/** Shared recognition instance – only one can be active at a time. */
let recognitionInstance = null;

/** Timer handle for 2.5-second silence detection. */
let silenceTimer = null;

/** Silence detection threshold in milliseconds. */
const SILENCE_THRESHOLD_MS = 2500;

/**
 * startListening(onResultCallback, onSilenceCallback)
 * Starts the microphone and streams transcripts back via callbacks.
 *
 * The silence detector resets every time new speech is detected. If
 * SILENCE_THRESHOLD_MS passes without any new speech, onSilenceCallback is
 * fired so the session can auto-submit the accumulated transcript.
 *
 * @param {Function} onResultCallback   - Called with (transcriptString, isFinal).
 * @param {Function} onSilenceCallback  - Called when 2.5 s of silence is detected.
 * @returns {boolean} false if SpeechRecognition is unsupported.
 */
export function startListening(onResultCallback, onSilenceCallback) {
    if (!SpeechRecognition) {
        console.error('[SpeechService] SpeechRecognition is not supported in this browser.');
        return false;
    }

    // Stop any existing session first to avoid overlapping instances.
    stopListening();

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    recognitionInstance.maxAlternatives = 1;

    let accumulatedFinal = '';

    const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            console.log('[SpeechService] Silence detected – auto-submitting.');
            stopListening();
            onSilenceCallback && onSilenceCallback(accumulatedFinal.trim());
        }, SILENCE_THRESHOLD_MS);
    };

    recognitionInstance.onstart = () => {
        console.log('[SpeechService] Listening started.');
        resetSilenceTimer(); // start the initial silence clock
    };

    recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let latestFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                latestFinal += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }

        if (latestFinal) {
            accumulatedFinal += latestFinal;
        }

        const combined = (accumulatedFinal + interimTranscript).trim();
        onResultCallback && onResultCallback(combined, false);

        // Reset silence timer every time speech comes in.
        resetSilenceTimer();
    };

    recognitionInstance.onerror = (event) => {
        if (event.error === 'no-speech') {
            // This is the natural end of silence – let the timer handle it.
            return;
        }
        if (event.error === 'aborted') {
            // Intentional stop, nothing to do.
            return;
        }
        console.error('[SpeechService] STT error:', event.error);
    };

    recognitionInstance.onend = () => {
        console.log('[SpeechService] Recognition ended.');
        // If recognition ends by itself (e.g. network issues) without our
        // silence timer having fired, treat whatever we have as the final result.
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
            if (accumulatedFinal.trim()) {
                onSilenceCallback && onSilenceCallback(accumulatedFinal.trim());
            }
        }
        recognitionInstance = null;
    };

    try {
        recognitionInstance.start();
    } catch (err) {
        console.error('[SpeechService] Could not start recognition:', err);
        recognitionInstance = null;
        return false;
    }

    return true;
}

/**
 * stopListening()
 * Stops the active STT session and clears the silence timer.
 */
export function stopListening() {
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    if (recognitionInstance) {
        try {
            recognitionInstance.stop();
        } catch (_) {
            // Already stopped – ignore.
        }
        recognitionInstance = null;
    }
}

/**
 * isSpeechRecognitionSupported()
 * Convenience check for UI components to hide mic button on unsupported browsers.
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
    return Boolean(SpeechRecognition);
}
