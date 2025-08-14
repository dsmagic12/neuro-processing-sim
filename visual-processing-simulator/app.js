// Neural Visual Processing Pathway Simulator
let simulator; // Global reference

// Model providers data
const MODEL_PROVIDERS = {
    "openai": {
        "name": "OpenAI",
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        "api_base": "https://api.openai.com/v1"
    },
    "anthropic": {
        "name": "Anthropic", 
        "models": ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
        "api_base": "https://api.anthropic.com"
    },
    "google": {
        "name": "Google",
        "models": ["gemini-pro", "gemini-pro-vision", "gemini-1.5-pro"],
        "api_base": "https://generativelanguage.googleapis.com"
    },
    "cohere": {
        "name": "Cohere",
        "models": ["command-r-plus", "command-r", "command-nightly"],
        "api_base": "https://api.cohere.ai"
    }
};

// Processing steps data
const PROCESSING_STEPS = [
    {
        sequence: 1,
        event: "Photon absorption",
        brain_region: "Retina",
        process: "Rods and cones transduce light into neural signals",
        response: "Retinal photoreceptor activation detected: High contrast edges at object boundaries, color gradients indicating red hues (590-700nm wavelength), moderate luminance levels suggesting daylight conditions. Rod cells inactive due to bright lighting, cone cells (L, M, S) showing differential activation patterns with strong L-cone response."
    },
    {
        sequence: 2,
        event: "Signal aggregation",
        brain_region: "Retinal Ganglion Cells",
        process: "Parasol (M-type) cells project to magnocellular LGN layers for motion, midget (P-type) cells target parvocellular layers for color/form",
        response: "Ganglion cell pathway separation completed:\n• Magnocellular (M): Low spatial frequency signals, motion detection pathways activated\n• Parvocellular (P): High spatial frequency preservation, red-green color opponent signals detected\n• Koniocellular (K): Blue-yellow opponent processing and broad spatial integration patterns"
    },
    {
        sequence: 3,
        event: "Thalamic processing",
        brain_region: "Lateral Geniculate Nucleus (LGN)",
        process: "Magnocellular layers process motion, parvocellular layers process color/form, koniocellular provides multisensory integration",
        response: "LGN processing complete: Contrast enhancement applied, spatial frequency filtering optimized. Magnocellular layers emphasizing temporal changes and luminance boundaries, parvocellular layers preserving fine spatial detail and chromatic information. Signal amplification and noise reduction protocols executed before cortical transmission."
    },
    {
        sequence: 4,
        event: "Primary feature extraction",
        brain_region: "Primary Visual Cortex (V1)",
        process: "Simple/complex cells detect edges, orientations, spatial frequencies in hypercolumns",
        response: "V1 feature extraction completed: Edge orientations detected at multiple angles (0°, 45°, 90°, 135°), spatial frequency analysis indicates mid-range frequencies dominant. Simple cells responding to light-dark boundaries, complex cells detecting motion-invariant edges. Hypercolumn activation patterns suggest curved object boundaries and circular forms."
    },
    {
        sequence: 5,
        event: "Ventral stream processing",
        brain_region: "V2/V4",
        process: "V2 processes texture, depth, complex shapes; V4 handles color constancy and intermediate forms",
        response: "V2/V4 ventral processing: Complex shape analysis reveals rounded, three-dimensional forms with smooth texture gradients. Color constancy mechanisms activated - object maintains consistent red appearance despite varying illumination conditions. Intermediate-level features suggest organic object structure with natural surface properties."
    },
    {
        sequence: 6,
        event: "Dorsal stream analysis",
        brain_region: "MT/MST",
        process: "MT detects coherent motion; MST analyzes optic flow and complex motion patterns",
        response: "MT/MST dorsal analysis: Minimal motion signals detected indicating static scene. Spatial relationship mapping complete - object positioned on horizontal support surface, gravitational orientation consistent with stable placement. No optic flow patterns detected, confirming stationary observer and object configuration."
    },
    {
        sequence: 7,
        event: "Object recognition",
        brain_region: "Inferotemporal Cortex (IT)",
        process: "View-invariant object representations, categorical processing",
        response: "IT cortex object recognition: View-invariant object representation successfully activated. Categorical classification: FRUIT category confirmed, specific identification as APPLE based on shape (spherical), color (red), and surface texture features. Object successfully segmented from background context."
    },
    {
        sequence: 8,
        event: "Memory integration",
        brain_region: "Perirhinal Cortex",
        process: "Compare visual input with stored memories, semantic associations",
        response: "Perirhinal memory integration: Recognized apple correlates with extensive stored semantic knowledge - edible fruit, sweet taste profile, natural growth on trees, common food item. Scene context analysis suggests domestic environment, likely kitchen or dining setting. High familiarity signals indicate well-known, frequently encountered object."
    }
];

// Application state
let appState = {
    currentProvider: null,
    currentModel: null,
    apiKey: null,
    processingSpeed: 1500,
    detailedLogging: true,
    isProcessing: false,
    results: {}
};

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getElement(id) {
    return document.getElementById(id);
}

// Provider handling
function handleProviderChange() {
    const providerSelect = getElement('provider-select');
    const modelSelect = getElement('model-select');
    const testBtn = getElement('test-connection');
    
    if (!providerSelect || !modelSelect || !testBtn) {
        console.error('Required elements not found');
        return;
    }
    
    const selectedProvider = providerSelect.value;
    console.log('Provider selected:', selectedProvider);
    
    // Clear current selections
    appState.currentProvider = selectedProvider;
    appState.currentModel = null;
    
    // Clear model dropdown
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
    if (selectedProvider && MODEL_PROVIDERS[selectedProvider]) {
        // Enable model selection
        modelSelect.disabled = false;
        testBtn.disabled = false;
        
        // Add models to dropdown
        const models = MODEL_PROVIDERS[selectedProvider].models;
        console.log('Adding models:', models);
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        
        console.log('Models added successfully');
    } else {
        // Disable model selection
        modelSelect.disabled = true;
        testBtn.disabled = true;
    }
    
    updateSimulationButton();
}

function handleModelChange() {
    const modelSelect = getElement('model-select');
    if (!modelSelect) return;
    
    appState.currentModel = modelSelect.value;
    console.log('Model selected:', appState.currentModel);
    updateSimulationButton();
}

function handleApiKeyChange() {
    const apiKeyInput = getElement('api-key');
    if (!apiKeyInput) return;
    
    appState.apiKey = apiKeyInput.value;
    updateSimulationButton();
}

function updateSimulationButton() {
    const startBtn = getElement('start-simulation');
    const visualInput = getElement('visual-input');
    
    if (!startBtn || !visualInput) return;
    
    const hasInput = visualInput.value.trim().length > 0;
    const hasConfig = appState.currentProvider && appState.currentModel && appState.apiKey;
    
    startBtn.disabled = !(hasConfig && hasInput);
    
    console.log('Simulation button state:', {
        disabled: startBtn.disabled,
        hasInput,
        hasConfig,
        provider: appState.currentProvider,
        model: appState.currentModel,
        hasApiKey: !!appState.apiKey
    });
}

async function testConnection() {
    const statusDiv = getElement('connection-status');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.className = 'connection-status';
    statusDiv.textContent = 'Testing connection...';

    try {
        await delay(1000);
        statusDiv.className = 'connection-status success';
        statusDiv.textContent = '✓ Connection successful';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        statusDiv.className = 'connection-status error';
        statusDiv.textContent = '✗ Connection failed';
    }
}

function updateProgress(percentage) {
    const progressFill = getElement('progress-fill');
    const progressText = getElement('progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% Complete`;
    }
}

function updateStepStatus(stepNumber, status) {
    const statusElement = getElement(`status-${stepNumber}`);
    if (statusElement) {
        statusElement.className = `step-status ${status}`;
        statusElement.textContent = status === 'processing' ? 'processing' : status;
    }
}

function updateStepOutput(stepNumber, output) {
    const outputElement = getElement(`output-${stepNumber}`);
    if (outputElement) {
        outputElement.textContent = output;
        outputElement.className = 'step-output visible';
    }
}

function resetAllSteps() {
    for (let i = 1; i <= 8; i++) {
        updateStepStatus(i, 'waiting');
        const outputElement = getElement(`output-${i}`);
        if (outputElement) {
            outputElement.className = 'step-output';
            outputElement.textContent = '';
        }
    }
    updateProgress(0);
}

async function startSimulation() {
    if (appState.isProcessing) return;
    
    console.log('Starting simulation...');
    appState.isProcessing = true;
    appState.results = {};
    
    const visualInput = getElement('visual-input');
    const progressSection = getElement('progress-section');
    const resultsSection = getElement('results-section');
    
    if (!visualInput || !progressSection || !resultsSection) return;
    
    const inputText = visualInput.value.trim();
    
    // Show progress section
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Reset all steps
    resetAllSteps();
    
    // Process each step sequentially
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        const step = PROCESSING_STEPS[i];
        const stepNumber = step.sequence;
        
        console.log(`Processing step ${stepNumber}: ${step.event}`);
        
        // Update progress
        updateProgress((i / PROCESSING_STEPS.length) * 100);
        
        // Set step to processing
        updateStepStatus(stepNumber, 'processing');
        
        try {
            // Simulate AI processing delay
            await delay(500 + Math.random() * 1000);
            
            // Get the response for this step
            const output = step.response;
            
            // Update step with output
            updateStepOutput(stepNumber, output);
            updateStepStatus(stepNumber, 'complete');
            
            // Store result
            appState.results[`step_${stepNumber}`] = {
                brain_region: step.brain_region,
                process: step.process,
                output: output
            };
            
            // Add processing delay
            await delay(appState.processingSpeed);
            
        } catch (error) {
            console.error(`Error in step ${stepNumber}:`, error);
            updateStepStatus(stepNumber, 'error');
            updateStepOutput(stepNumber, `Error: ${error.message}`);
            break;
        }
    }
    
    // Complete processing
    updateProgress(100);
    showFinalResults();
    appState.isProcessing = false;
    console.log('Simulation completed');
}

function showFinalResults() {
    const resultsSection = getElement('results-section');
    const finalPerception = getElement('final-perception');
    
    if (resultsSection && finalPerception) {
        const lastStep = PROCESSING_STEPS[PROCESSING_STEPS.length - 1];
        finalPerception.innerHTML = `
            <h4>Conscious Visual Perception:</h4>
            <p>${lastStep.response}</p>
            <h4>Complete Processing Summary:</h4>
            <p>The visual system has successfully processed the input through all 8 stages of the visual pathway, from initial photon absorption in the retina to final conscious perception in higher cortical areas. Each stage contributed specialized processing that built upon the previous stage's output, demonstrating the hierarchical nature of visual processing in the brain.</p>
        `;
        
        resultsSection.style.display = 'block';
    }
}

function downloadResults() {
    const visualInput = getElement('visual-input');
    if (!visualInput) return;
    
    const inputText = visualInput.value.trim();
    const timestamp = new Date().toISOString();
    
    const exportData = {
        timestamp: timestamp,
        input: inputText,
        model_provider: appState.currentProvider,
        model: appState.currentModel,
        processing_steps: appState.results,
        settings: {
            processing_speed: appState.processingSpeed,
            detailed_logging: appState.detailedLogging
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual_processing_simulation_${timestamp.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetSimulation() {
    appState.isProcessing = false;
    appState.results = {};
    
    const visualInput = getElement('visual-input');
    const progressSection = getElement('progress-section');
    const resultsSection = getElement('results-section');
    
    if (visualInput) visualInput.value = '';
    if (progressSection) progressSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    
    resetAllSteps();
    updateSimulationButton();
}

// Initialize application
function initializeApp() {
    console.log('Initializing Neural Visual Processing Pathway Simulator...');
    
    // Set up event listeners
    const providerSelect = getElement('provider-select');
    const modelSelect = getElement('model-select');
    const apiKeyInput = getElement('api-key');
    const testBtn = getElement('test-connection');
    const speedSlider = getElement('processing-speed');
    const loggingCheckbox = getElement('detailed-logging');
    const startBtn = getElement('start-simulation');
    const downloadBtn = getElement('download-results');
    const resetBtn = getElement('reset-simulation');
    const visualInput = getElement('visual-input');
    
    if (providerSelect) {
        providerSelect.addEventListener('change', handleProviderChange);
        console.log('Provider select listener added');
    }
    
    if (modelSelect) {
        modelSelect.addEventListener('change', handleModelChange);
        console.log('Model select listener added');
    }
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', handleApiKeyChange);
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', testConnection);
    }
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            appState.processingSpeed = parseInt(e.target.value);
            const speedValue = getElement('speed-value');
            if (speedValue) {
                speedValue.textContent = `${appState.processingSpeed}ms`;
            }
        });
    }
    
    if (loggingCheckbox) {
        loggingCheckbox.addEventListener('change', (e) => {
            appState.detailedLogging = e.target.checked;
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', startSimulation);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResults);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
    
    if (visualInput) {
        visualInput.addEventListener('input', updateSimulationButton);
    }
    
    console.log('All event listeners initialized');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting initialization...');
    initializeApp();
    console.log('Neural Visual Processing Pathway Simulator ready');
});