/**
 * Scientific Desktop Calculator
 * Features: Basic & Scientific modes, Memory, DEG/RAD support, 2nd function shift,
 * Audio feedback (Web Audio API), Keyboard support, Calculation history.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        expression: '',        // Human readable expression string shown on display
        rawExpression: '',     // JS executable math expression
        result: '0',           // Current calculated result or current number input
        isNewCalculation: true,// Reset display on next number press if true
        justEvaluated: false,  // Set to true after '=' evaluates a result
        mode: 'basic',         // 'basic' or 'scientific'
        angleUnit: 'DEG',      // 'DEG' or 'RAD'
        isSecondF: false,      // 2nd function active
        memory: 0,             // Memory register value
        soundEnabled: true,    // Sound click feedback
        history: [],           // Calculation history list
        isHistoryOpen: true    // History panel visibility
    };

    // --- DOM Elements ---
    const calculatorEl = document.getElementById('calculator');
    const mainDisplay = document.getElementById('mainDisplay');
    const expressionLine = document.getElementById('expressionLine');
    const pillDeg = document.getElementById('pillDeg');
    const pillRad = document.getElementById('pillRad');
    const pillMem = document.getElementById('pillMem');
    const modeBasicBtn = document.getElementById('modeBasicBtn');
    const modeSciBtn = document.getElementById('modeSciBtn');
    const historyToggleBtn = document.getElementById('historyToggleBtn');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyToast = document.getElementById('copyToast');
    const historyDrawer = document.getElementById('historyDrawer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Memory buttons
    const memClearBtn = document.getElementById('memClear');
    const memRecallBtn = document.getElementById('memRecall');

    // --- Web Audio API Synth Clicks ---
    let audioCtx = null;

    function playClickSound(freq = 800, type = 'sine') {
        if (!state.soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) {
            // Audio context disallowed or unsupported
        }
    }

    // --- Helper Functions ---
    function formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) return 'Error';
        
        // Handle floating point precision anomalies (e.g., 0.1 + 0.2 = 0.30000000000000004)
        const parsed = Number(Math.round(Number(num + 'e+12')) + 'e-12');
        
        const str = parsed.toString();
        if (str.length > 14) {
            return parsed.toExponential(7);
        }
        return str;
    }

    function factorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity; // Max integer factorial in double precision float
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    // --- Math Engine Evaluation ---
    function evaluateExpression(exprStr) {
        if (!exprStr.trim()) return 0;
        
        let sanitized = exprStr;

        // Replace constants
        sanitized = sanitized.replace(/π/g, `(${Math.PI})`);
        sanitized = sanitized.replace(/e/g, `(${Math.E})`);
        sanitized = sanitized.replace(/ϕ/g, `(${ (1 + Math.sqrt(5)) / 2 })`);

        // Replace custom operators
        sanitized = sanitized.replace(/×/g, '*');
        sanitized = sanitized.replace(/÷/g, '/');
        sanitized = sanitized.replace(/mod/gi, '%');

        // Factorial replacement n! -> factorial(n)
        sanitized = sanitized.replace(/(\d+(\.\d+)?|\([^\)]+\))!/g, 'factorial($1)');

        // Trigonometric DEG vs RAD handling
        const isDeg = state.angleUnit === 'DEG';
        const toRad = (val) => isDeg ? (val * Math.PI) / 180 : val;
        const fromRad = (val) => isDeg ? (val * 180) / Math.PI : val;

        // Custom function environment for Function constructor
        const context = {
            sin: (x) => Math.sin(toRad(x)),
            cos: (x) => Math.cos(toRad(x)),
            tan: (x) => Math.tan(toRad(x)),
            asin: (x) => fromRad(Math.asin(x)),
            acos: (x) => fromRad(Math.acos(x)),
            atan: (x) => fromRad(Math.atan(x)),

            sinh: (x) => Math.sinh(x),
            cosh: (x) => Math.cosh(x),
            tanh: (x) => Math.tanh(x),

            ln: (x) => Math.log(x),
            log10: (x) => Math.log10(x),
            log2: (x) => Math.log2(x),

            sqrt: (x) => Math.sqrt(x),
            cbrt: (x) => Math.cbrt(x),

            abs: (x) => Math.abs(x),
            factorial: factorial,
            pow: (base, exp) => Math.pow(base, exp)
        };

        // Replace function names to match context keys
        sanitized = sanitized.replace(/\bln\(/g, 'ln(');
        sanitized = sanitized.replace(/\blog\(/g, 'log10(');
        sanitized = sanitized.replace(/\blog2\(/g, 'log2(');
        sanitized = sanitized.replace(/\b√\(/g, 'sqrt(');
        sanitized = sanitized.replace(/\b∛\(/g, 'cbrt(');

        // Replace ^ power with Math.pow syntax or standard JS exponentiation operator **
        sanitized = sanitized.replace(/\^/g, '**');

        try {
            // Safe evaluation using Function with bound context keys
            const keys = Object.keys(context);
            const vals = Object.values(context);
            const evaluator = new Function(...keys, `return (${sanitized});`);
            const res = evaluator(...vals);

            if (res === undefined || isNaN(res) || !isFinite(res)) {
                return NaN;
            }
            return res;
        } catch (e) {
            return NaN;
        }
    }

    // --- UI Update Function ---
    function updateDisplay() {
        mainDisplay.textContent = state.result;
        expressionLine.textContent = state.expression;

        // Auto-scale font size if number is very long
        if (state.result.length > 12) {
            mainDisplay.style.fontSize = '1.5rem';
        } else if (state.result.length > 8) {
            mainDisplay.style.fontSize = '1.8rem';
        } else {
            mainDisplay.style.fontSize = '2.2rem';
        }

        if (state.result === 'Error') {
            mainDisplay.classList.add('error');
        } else {
            mainDisplay.classList.remove('error');
        }

        // Angle unit indicators
        if (state.angleUnit === 'DEG') {
            pillDeg.classList.add('active');
            pillRad.classList.remove('active');
        } else {
            pillRad.classList.add('active');
            pillDeg.classList.remove('active');
        }

        // Memory indicator
        if (state.memory !== 0) {
            pillMem.classList.add('active');
            memClearBtn.disabled = false;
            memRecallBtn.disabled = false;
        } else {
            pillMem.classList.remove('active');
            memClearBtn.disabled = true;
            memRecallBtn.disabled = true;
        }

        // 2nd function keys update
        document.querySelectorAll('.btn-2nd-toggle').forEach(btn => {
            const normalText = btn.getAttribute('data-normal');
            const secondText = btn.getAttribute('data-second');
            const targetAction = state.isSecondF ? btn.getAttribute('data-action-2nd') : btn.getAttribute('data-action-normal');
            btn.innerHTML = state.isSecondF ? secondText : normalText;
            btn.setAttribute('data-action', targetAction);
        });

        // 2nd button highlight
        const secondBtn = document.getElementById('btnSecond');
        if (secondBtn) {
            if (state.isSecondF) secondBtn.classList.add('pressed');
            else secondBtn.classList.remove('pressed');
        }
    }

    // --- App Actions ---
    function handleInput(type, value) {
        playClickSound(type === 'action' ? 1000 : 750);

        if (state.result === 'Error') {
            state.expression = '';
            state.result = '0';
            state.isNewCalculation = true;
            state.justEvaluated = false;
        }

        switch (type) {
            case 'digit':
                if (state.justEvaluated) {
                    // Start a fresh calculation if digit is pressed directly after '='
                    state.expression = '';
                    state.result = (value === '.' ? '0.' : value);
                    state.isNewCalculation = false;
                    state.justEvaluated = false;
                } else if (state.isNewCalculation) {
                    state.result = (value === '.' ? '0.' : value);
                    state.isNewCalculation = false;
                } else {
                    if (state.result === '0' && value !== '.') {
                        state.result = value;
                    } else if (value === '.' && state.result.includes('.')) {
                        return; // Ignore multiple decimals
                    } else {
                        state.result += value;
                    }
                }
                break;

            case 'operator':
                if (state.justEvaluated) {
                    // Pre-fill previous result output into the new operation!
                    state.expression = state.result + ' ' + value + ' ';
                    state.isNewCalculation = true;
                    state.justEvaluated = false;
                } else if (state.expression && state.isNewCalculation) {
                    // Replace trailing operator if user clicks another operator sequentially
                    state.expression = state.expression.trim().replace(/[×÷+\-^%]$/, '') + ' ' + value + ' ';
                } else {
                    state.expression += state.result + ' ' + value + ' ';
                    state.isNewCalculation = true;
                }
                break;

            case 'function':
                // Wrapper functions like sin(, sqrt(, ln(
                if (state.justEvaluated) {
                    if (value.startsWith('^')) {
                        state.expression = state.result + value;
                    } else {
                        state.expression = value + state.result + ')';
                    }
                    state.isNewCalculation = true;
                    state.justEvaluated = false;
                } else if (state.isNewCalculation && state.result !== '0') {
                    if (value.startsWith('^')) {
                        state.expression += state.result + value;
                    } else {
                        state.expression = value + state.result + ')';
                    }
                    state.isNewCalculation = true;
                } else {
                    state.expression += value;
                    state.isNewCalculation = true;
                }
                break;

            case 'constant':
                if (state.justEvaluated) {
                    state.expression = '';
                    state.justEvaluated = false;
                }
                state.result = value;
                state.isNewCalculation = true;
                break;

            case 'parenthesis':
                if (state.justEvaluated) {
                    state.expression = (value === '(' ? value : state.result + value);
                    state.isNewCalculation = true;
                    state.justEvaluated = false;
                } else if (state.isNewCalculation && state.result === '0') {
                    state.expression += value;
                } else {
                    state.expression += (value === '(' ? ' ' + value : state.result + value);
                    state.isNewCalculation = true;
                }
                break;

            case 'clear':
                state.expression = '';
                state.result = '0';
                state.isNewCalculation = true;
                state.justEvaluated = false;
                break;

            case 'clear-entry':
                state.result = '0';
                state.isNewCalculation = true;
                state.justEvaluated = false;
                break;

            case 'backspace':
                if (state.justEvaluated) {
                    state.expression = '';
                    state.justEvaluated = false;
                } else if (!state.isNewCalculation && state.result.length > 0) {
                    state.result = state.result.slice(0, -1);
                    if (state.result === '' || state.result === '-') {
                        state.result = '0';
                        state.isNewCalculation = true;
                    }
                }
                break;

            case 'negate':
                if (state.result !== '0') {
                    if (state.result.startsWith('-')) {
                        state.result = state.result.slice(1);
                    } else {
                        state.result = '-' + state.result;
                    }
                    if (state.justEvaluated) {
                        state.expression = '';
                        state.justEvaluated = false;
                    }
                }
                break;

            case 'equals':
                calculateResult();
                break;

            case 'memory':
                handleMemory(value);
                break;

            case 'toggle-angle':
                state.angleUnit = state.angleUnit === 'DEG' ? 'RAD' : 'DEG';
                break;

            case 'toggle-2nd':
                state.isSecondF = !state.isSecondF;
                break;
        }

        updateDisplay();
    }

    function calculateResult() {
        let fullExpr = state.expression;
        if (!state.isNewCalculation) {
            fullExpr += state.result;
        }

        if (!fullExpr.trim()) return;

        // Auto-close missing trailing parentheses
        const openParenCount = (fullExpr.match(/\(/g) || []).length;
        const closeParenCount = (fullExpr.match(/\)/g) || []).length;
        if (openParenCount > closeParenCount) {
            fullExpr += ')'.repeat(openParenCount - closeParenCount);
        }

        const evaluated = evaluateExpression(fullExpr);

        if (isNaN(evaluated)) {
            state.result = 'Error';
            state.justEvaluated = false;
        } else {
            const formatted = formatNumber(evaluated);
            // Push to calculation history
            addHistoryItem(fullExpr, formatted);
            state.expression = fullExpr + ' =';
            state.result = formatted;
            state.isNewCalculation = true;
            state.justEvaluated = true;
        }
    }

    function handleMemory(action) {
        const currentVal = parseFloat(state.result) || 0;
        switch (action) {
            case 'MC':
                state.memory = 0;
                break;
            case 'MR':
                state.result = formatNumber(state.memory);
                state.isNewCalculation = true;
                state.justEvaluated = true;
                break;
            case 'MS':
                state.memory = currentVal;
                break;
            case 'M+':
                state.memory += currentVal;
                break;
            case 'M-':
                state.memory -= currentVal;
                break;
        }
    }

    // --- Calculation History ---
    function addHistoryItem(expr, res) {
        const item = { expr, res, id: Date.now() };
        state.history.unshift(item);
        if (state.history.length > 30) state.history.pop();
        renderHistory();
    }

    function renderHistory() {
        if (state.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No previous calculations</div>';
            return;
        }

        historyList.innerHTML = state.history.map(item => `
            <div class="history-item" data-res="${item.res}" data-expr="${item.expr}">
                <div class="history-expr">${item.expr}</div>
                <div class="history-res">= ${item.res}</div>
            </div>
        `).join('');

        // Add click listener to recall history item
        historyList.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const resVal = el.getAttribute('data-res');
                state.result = resVal;
                state.isNewCalculation = true;
                state.justEvaluated = true;
                updateDisplay();
                playClickSound(600);
            });
        });
    }

    // --- Mode Switching (Basic / Scientific) ---
    function setMode(mode) {
        state.mode = mode;
        if (mode === 'scientific') {
            calculatorEl.classList.add('scientific');
            modeSciBtn.classList.add('active');
            modeBasicBtn.classList.remove('active');
        } else {
            calculatorEl.classList.remove('scientific');
            modeBasicBtn.classList.add('active');
            modeSciBtn.classList.remove('active');
        }
        playClickSound(900);
    }

    modeBasicBtn.addEventListener('click', () => setMode('basic'));
    modeSciBtn.addEventListener('click', () => setMode('scientific'));

    // --- Drawer & Audio Toggles ---
    historyToggleBtn.addEventListener('click', () => {
        state.isHistoryOpen = !state.isHistoryOpen;
        if (state.isHistoryOpen) {
            historyDrawer.classList.remove('hidden');
            historyToggleBtn.classList.add('active');
        } else {
            historyDrawer.classList.add('hidden');
            historyToggleBtn.classList.remove('active');
        }
        playClickSound(600);
    });

    clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        renderHistory();
        playClickSound(400);
    });

    soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        soundToggleBtn.classList.toggle('active', state.soundEnabled);
        soundToggleBtn.setAttribute('title', state.soundEnabled ? 'Mute Sounds' : 'Enable Sounds');
        playClickSound(700);
    });

    // --- Copy Result to Clipboard ---
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(state.result).then(() => {
            copyToast.classList.add('show');
            setTimeout(() => copyToast.classList.remove('show'), 1500);
        });
    });

    // --- Button Click Event Listener Delegation ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .mem-btn');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const type = btn.getAttribute('data-type');
        const val = btn.getAttribute('data-value');

        if (action) {
            switch (action) {
                case 'digit':
                    handleInput('digit', val);
                    break;
                case 'operator':
                    handleInput('operator', val);
                    break;
                case 'function':
                    handleInput('function', val);
                    break;
                case 'constant':
                    handleInput('constant', val);
                    break;
                case 'parenthesis':
                    handleInput('parenthesis', val);
                    break;
                case 'clear':
                    handleInput('clear');
                    break;
                case 'clear-entry':
                    handleInput('clear-entry');
                    break;
                case 'backspace':
                    handleInput('backspace');
                    break;
                case 'negate':
                    handleInput('negate');
                    break;
                case 'equals':
                    handleInput('equals');
                    break;
                case 'memory':
                    handleInput('memory', val);
                    break;
                case 'toggle-angle':
                    handleInput('toggle-angle');
                    break;
                case 'toggle-2nd':
                    handleInput('toggle-2nd');
                    break;
            }

            // Visual button press ripple
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    });

    // --- Keyboard Shortcuts Support ---
    document.addEventListener('keydown', (e) => {
        // Prevent default scrolling for Space/Arrow keys if focused on calculator
        if (e.key === ' ' && e.target === document.body) e.preventDefault();

        let key = e.key;

        // Map keyboard keys to calculator actions
        if (!isNaN(key)) {
            handleInput('digit', key);
            triggerVisualButton('[data-value="' + key + '"]');
        } else if (key === '.') {
            handleInput('digit', '.');
            triggerVisualButton('[data-value="."]');
        } else if (key === '+' || key === '-') {
            handleInput('operator', key);
            triggerVisualButton('[data-value="' + key + '"]');
        } else if (key === '*') {
            handleInput('operator', '×');
            triggerVisualButton('[data-value="×"]');
        } else if (key === '/') {
            e.preventDefault(); // Avoid search popup in some browsers
            handleInput('operator', '÷');
            triggerVisualButton('[data-value="÷"]');
        } else if (key === '%') {
            handleInput('operator', '%');
            triggerVisualButton('[data-value="%"]');
        } else if (key === '^') {
            handleInput('operator', '^');
            triggerVisualButton('[data-value="^"]');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            handleInput('equals');
            triggerVisualButton('[data-action="equals"]');
        } else if (key === 'Backspace') {
            handleInput('backspace');
            triggerVisualButton('[data-action="backspace"]');
        } else if (key === 'Escape') {
            handleInput('clear');
            triggerVisualButton('[data-action="clear"]');
        } else if (key === '(' || key === ')') {
            handleInput('parenthesis', key);
            triggerVisualButton('[data-value="' + key + '"]');
        } else if (key.toLowerCase() === 'p') {
            handleInput('constant', 'π');
            triggerVisualButton('[data-value="π"]');
        } else if (key.toLowerCase() === 'e' && !state.expression.endsWith('e')) {
            handleInput('constant', 'e');
            triggerVisualButton('[data-value="e"]');
        }
    });

    function triggerVisualButton(selector) {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    }

    // --- Initialize ---
    updateDisplay();
    renderHistory();
});
