// Claude Neural Visual Processing Simulator
let simulator; // Global reference

// Claude model configurations
const CLAUDE_MODELS = {
    "claude-3-5-sonnet-20241022": {
        "name": "Claude 3.5 Sonnet",
        "description": "Balanced performance for most processing steps",
        "optimal_for": ["complex_reasoning", "object_recognition", "memory_integration"],
        "max_tokens": 8192,
        "cost_tier": "medium"
    },
    "claude-3-5-haiku-20241022": {
        "name": "Claude 3.5 Haiku", 
        "description": "Fast and cost-effective for basic processing",
        "optimal_for": ["basic_processing", "feature_extraction", "motion_analysis"],
        "max_tokens": 8192,
        "cost_tier": "low"
    },
    "claude-3-opus-20240229": {
        "name": "Claude 3 Opus",
        "description": "Premium quality for research applications",
        "optimal_for": ["highest_accuracy", "research_analysis"],
        "max_tokens": 4096,
        "cost_tier": "high"
    },
    "auto-optimal": {
        "name": "Auto-Select Optimal",
        "description": "Automatically selects best model for each step",
        "optimal_for": ["automatic_optimization"],
        "max_tokens": "variable",
        "cost_tier": "optimized"
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
    currentModel: "auto-optimal",
    apiKey: null,
    processingSpeed: 1500,
    detailedLogging: true,
    isProcessing: false,
    results: {},
    claudeConnection: false,
    modelUsage: {},
    totalProcessingTime: 0,
    // Camera state
    inputMethod: "text",
    cameraStream: null,
    cameraEnabled: false,
    capturedFrame: null,
    continuousProcessing: false,
    // Visual memory system
    visualMemories: [],
    memoryEnabled: true,
    memoryInfluence: 0.7, // How much memory affects recognition (0-1)
    maxMemories: 50, // Maximum number of memories to store
    currentMemoryContext: null
};

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getElement(id) {
    return document.getElementById(id);
}

// Visual Memory System Functions
function createVisualMemory(imageData, recognizedObjects, processingResults, timestamp) {
    return {
        id: Date.now() + Math.random(),
        timestamp: timestamp || new Date().toISOString(),
        imageData: imageData, // Base64 image data
        recognizedObjects: recognizedObjects, // Array of objects found
        processingResults: processingResults, // Full step-by-step results
        accessCount: 0, // How often this memory was accessed
        confidence: 0.8, // Initial confidence score
        tags: extractImageTags(recognizedObjects) // For similarity matching
    };
}

function extractImageTags(recognizedObjects) {
    // Extract semantic tags from recognized objects for similarity matching
    const tags = new Set();
    recognizedObjects.forEach(obj => {
        // Add object name
        tags.add(obj.name.toLowerCase());
        // Add category
        if (obj.category) tags.add(obj.category.toLowerCase());
        // Add properties
        if (obj.properties) {
            obj.properties.forEach(prop => tags.add(prop.toLowerCase()));
        }
    });
    return Array.from(tags);
}

async function storeVisualMemory(imageData, recognizedObjects, processingResults) {
    if (!appState.memoryEnabled) {
        console.log('🧠 Memory storage disabled');
        return;
    }
    
    console.log('🧠 Creating visual memory with objects:', recognizedObjects.map(o => o.name));
    const memory = createVisualMemory(imageData, recognizedObjects, processingResults);
    console.log('🧠 Created memory with tags:', memory.tags);
    
    appState.visualMemories.push(memory);
    
    // Maintain memory limit
    if (appState.visualMemories.length > appState.maxMemories) {
        // Remove oldest memory with lowest access count
        appState.visualMemories.sort((a, b) => (a.accessCount + a.confidence) - (b.accessCount + b.confidence));
        const removedMemory = appState.visualMemories.shift();
        console.log('🧠 Removed old memory:', removedMemory.recognizedObjects.map(o => o.name));
    }
    
    console.log(`🧠 Successfully stored visual memory: ${recognizedObjects.map(o => o.name).join(', ')}`);
    console.log(`🧠 Total memories: ${appState.visualMemories.length}`);
    updateMemoryDisplay();
    
    // Save to persistent storage
    await saveMemoriesToFile();
}

function findSimilarMemories(currentTags, maxResults = 5) {
    if (!appState.memoryEnabled || appState.visualMemories.length === 0) {
        return [];
    }
    
    // Calculate similarity scores
    const scoredMemories = appState.visualMemories.map(memory => {
        const commonTags = memory.tags.filter(tag => currentTags.includes(tag));
        const similarity = commonTags.length / Math.max(memory.tags.length, currentTags.length);
        return {
            memory,
            similarity,
            commonTags
        };
    });
    
    // Sort by similarity and return top results
    return scoredMemories
        .filter(scored => scored.similarity > 0.1) // Minimum similarity threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults)
        .map(scored => {
            scored.memory.accessCount++;
            return scored;
        });
}

function generateMemoryContext(similarMemories) {
    if (!similarMemories || similarMemories.length === 0) {
        return null;
    }
    
    const context = {
        memories: similarMemories.length,
        objects: new Map(),
        experiences: []
    };
    
    // Aggregate object recognition patterns
    similarMemories.forEach(scored => {
        scored.memory.recognizedObjects.forEach(obj => {
            const key = obj.name.toLowerCase();
            if (!context.objects.has(key)) {
                context.objects.set(key, {
                    name: obj.name,
                    frequency: 0,
                    properties: new Set(),
                    contexts: new Set()
                });
            }
            
            const objData = context.objects.get(key);
            objData.frequency++;
            
            if (obj.properties) {
                obj.properties.forEach(prop => objData.properties.add(prop));
            }
            if (obj.context) {
                objData.contexts.add(obj.context);
            }
        });
        
        // Add experience summary
        if (scored.memory.processingResults.step_8) {
            context.experiences.push({
                summary: scored.memory.processingResults.step_8.output.substring(0, 200),
                similarity: scored.similarity
            });
        }
    });
    
    return context;
}

async function clearVisualMemory() {
    appState.visualMemories = [];
    appState.currentMemoryContext = null;
    updateMemoryDisplay();
    console.log('🧠 Visual memory cleared');
    
    // Save cleared state to persistent storage
    await saveMemoriesToFile();
}

function updateMemoryDisplay() {
    const memoryCount = getElement('memory-count');
    const memoryList = getElement('memory-list');
    
    if (memoryCount) {
        memoryCount.textContent = appState.visualMemories.length;
    }
    
    if (memoryList) {
        memoryList.innerHTML = '';
        appState.visualMemories
            .slice(-10) // Show last 10 memories
            .reverse()
            .forEach(memory => {
                const memoryItem = document.createElement('div');
                memoryItem.className = 'memory-item';
                memoryItem.innerHTML = `
                    <div class="memory-timestamp">${new Date(memory.timestamp).toLocaleTimeString()}</div>
                    <div class="memory-objects">${memory.recognizedObjects.map(o => o.name).join(', ')}</div>
                    <div class="memory-stats">Used: ${memory.accessCount}x | Confidence: ${(memory.confidence * 100).toFixed(0)}%</div>
                `;
                memoryList.appendChild(memoryItem);
            });
    }
}

// Persistent Memory Storage Functions
async function saveMemoriesToFile() {
    try {
        const memoryData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            memories: appState.visualMemories.map(memory => ({
                ...memory,
                // Don't save the full base64 image data to keep file size manageable
                // Keep only a thumbnail or hash for identification
                imageData: memory.imageData ? memory.imageData.substring(0, 100) + '...' : null
            })),
            settings: {
                memoryEnabled: appState.memoryEnabled,
                memoryInfluence: appState.memoryInfluence,
                maxMemories: appState.maxMemories
            }
        };
        
        const response = await fetch('/save-memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memoryData)
        });
        
        if (response.ok) {
            console.log('💾 Visual memories saved to file');
        } else {
            console.error('❌ Failed to save memories:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Error saving memories:', error);
        // Fallback to localStorage if server save fails
        try {
            localStorage.setItem('claudeVisualMemories', JSON.stringify(appState.visualMemories));
            console.log('💾 Memories saved to localStorage as fallback');
        } catch (storageError) {
            console.error('❌ LocalStorage save also failed:', storageError);
        }
    }
}

async function loadMemoriesFromFile() {
    try {
        const response = await fetch('/load-memory');
        
        if (response.ok) {
            const data = await response.json();
            if (data.memories && Array.isArray(data.memories)) {
                // Restore memories but without full image data
                appState.visualMemories = data.memories.map(memory => ({
                    ...memory,
                    imageData: null // Clear truncated image data
                }));
                
                // Restore settings if available
                if (data.settings) {
                    appState.memoryEnabled = data.settings.memoryEnabled !== false; // default true
                    appState.memoryInfluence = data.settings.memoryInfluence || 0.7;
                    appState.maxMemories = data.settings.maxMemories || 50;
                }
                
                console.log(`📂 Loaded ${appState.visualMemories.length} visual memories from file`);
                updateMemoryDisplay();
                updateMemoryControls();
                return true;
            }
        } else if (response.status === 404) {
            console.log('📂 No existing memory file found, starting fresh');
        } else {
            throw new Error(`Server responded with ${response.status}`);
        }
    } catch (error) {
        console.log('📂 Server memory loading failed, trying localStorage:', error.message);
        // Fallback to localStorage
        try {
            const saved = localStorage.getItem('claudeVisualMemories');
            if (saved) {
                appState.visualMemories = JSON.parse(saved);
                console.log(`📂 Loaded ${appState.visualMemories.length} memories from localStorage`);
                updateMemoryDisplay();
                return true;
            }
        } catch (storageError) {
            console.error('❌ LocalStorage load failed:', storageError);
        }
    }
    
    console.log('📂 No memories loaded, starting with empty memory');
    return false;
}

function updateMemoryControls() {
    // Update UI controls to match loaded settings
    const memoryEnabledCheckbox = getElement('memory-enabled');
    const memoryInfluenceSlider = getElement('memory-influence');
    const memoryInfluenceValue = getElement('memory-influence-value');
    
    if (memoryEnabledCheckbox) {
        memoryEnabledCheckbox.checked = appState.memoryEnabled;
    }
    
    if (memoryInfluenceSlider) {
        memoryInfluenceSlider.value = appState.memoryInfluence;
    }
    
    if (memoryInfluenceValue) {
        memoryInfluenceValue.textContent = `${Math.round(appState.memoryInfluence * 100)}%`;
    }
}

// Camera functionality
async function initializeCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'environment' // Try to use back camera if available
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        appState.cameraStream = stream;
        
        const videoElement = getElement('camera-feed');
        const placeholder = getElement('camera-placeholder');
        const controls = getElement('camera-controls');
        
        if (videoElement && placeholder && controls) {
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            placeholder.style.display = 'none';
            controls.style.display = 'flex';
            
            appState.cameraEnabled = true;
            updateCameraStatus('Camera enabled successfully', 'success');
            updateSimulationButton();
        }
        
        return true;
    } catch (error) {
        console.error('Camera initialization failed:', error);
        updateCameraStatus(`Camera access denied: ${error.message}`, 'error');
        return false;
    }
}

function stopCamera() {
    if (appState.cameraStream) {
        appState.cameraStream.getTracks().forEach(track => track.stop());
        appState.cameraStream = null;
        appState.cameraEnabled = false;
        
        const videoElement = getElement('camera-feed');
        const placeholder = getElement('camera-placeholder');
        const controls = getElement('camera-controls');
        
        if (videoElement && placeholder && controls) {
            videoElement.style.display = 'none';
            placeholder.style.display = 'flex';
            controls.style.display = 'none';
        }
        
        updateCameraStatus('Camera stopped', 'info');
    }
}

function captureFrame() {
    const videoElement = getElement('camera-feed');
    const canvas = getElement('camera-canvas');
    const capturedImg = getElement('captured-frame');
    const frameContainer = getElement('captured-frame-container');
    const timestamp = getElement('frame-timestamp');
    
    if (!videoElement || !canvas || !capturedImg || !frameContainer) {
        updateCameraStatus('Error: Missing camera elements', 'error');
        return false;
    }
    
    try {
        // Set canvas dimensions to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 JPEG for Claude API
        const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = imageDataURL.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        // Store captured frame
        appState.capturedFrame = base64Data;
        
        // Display captured frame
        capturedImg.src = imageDataURL;
        frameContainer.style.display = 'block';
        
        // Update timestamp
        if (timestamp) {
            timestamp.textContent = `Captured: ${new Date().toLocaleTimeString()}`;
        }
        
        updateCameraStatus('Frame captured successfully', 'success');
        updateSimulationButton();
        
        return true;
    } catch (error) {
        console.error('Frame capture failed:', error);
        updateCameraStatus(`Capture failed: ${error.message}`, 'error');
        return false;
    }
}

async function toggleCamera() {
    if (!appState.cameraStream) {
        updateCameraStatus('No camera stream active', 'error');
        return;
    }
    
    try {
        // Stop current stream
        stopCamera();
        
        // Wait a moment
        await delay(500);
        
        // Try to initialize with different facing mode
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: appState.cameraFacingMode === 'environment' ? 'user' : 'environment'
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        appState.cameraStream = stream;
        appState.cameraFacingMode = constraints.video.facingMode;
        
        const videoElement = getElement('camera-feed');
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            appState.cameraEnabled = true;
            updateCameraStatus('Camera switched successfully', 'success');
        }
    } catch (error) {
        console.error('Camera toggle failed:', error);
        updateCameraStatus(`Camera switch failed: ${error.message}`, 'error');
        // Try to restore original camera
        await initializeCamera();
    }
}

function updateCameraStatus(message, type = 'info') {
    const statusElement = getElement('capture-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `capture-status ${type}`;
        
        // Auto-hide success/info messages after 3 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'capture-status';
            }, 3000);
        }
    }
}

function handleInputMethodChange() {
    const textSection = getElement('text-input-section');
    const cameraSection = getElement('camera-input-section');
    const selectedMethod = document.querySelector('input[name="input-method"]:checked')?.value;
    
    if (!textSection || !cameraSection) return;
    
    appState.inputMethod = selectedMethod;
    
    if (selectedMethod === 'text') {
        textSection.style.display = 'block';
        cameraSection.style.display = 'none';
        stopCamera();
        appState.capturedFrame = null;
    } else if (selectedMethod === 'camera') {
        textSection.style.display = 'none';
        cameraSection.style.display = 'block';
    }
    
    updateSimulationButton();
    console.log('Input method changed to:', selectedMethod);
}

// Model handling for Claude
function updateModelInfo() {
    const modelSelect = getElement('model-select');
    const modelInfo = getElement('model-info');
    
    if (!modelSelect || !modelInfo) return;
    
    const selectedModel = modelSelect.value;
    const modelConfig = CLAUDE_MODELS[selectedModel];
    
    if (modelConfig && selectedModel !== 'auto-optimal') {
        modelInfo.innerHTML = `
            <p class="info-text">
                <strong>${modelConfig.name}:</strong> ${modelConfig.description}<br>
                <em>Cost tier: ${modelConfig.cost_tier} | Max tokens: ${modelConfig.max_tokens}</em>
            </p>
        `;
    } else if (selectedModel === 'auto-optimal') {
        modelInfo.innerHTML = `
            <p class="info-text">
                <strong>Auto-Select:</strong> Uses different Claude models optimized for each processing step:
                <br>• Steps 1-3: Haiku (Basic processing)
                <br>• Steps 4-6: Sonnet (Intermediate)
                <br>• Steps 7-8: Sonnet (High-level cognition)
            </p>
        `;
    }
}

function handleModelChange() {
    const modelSelect = getElement('model-select');
    if (!modelSelect) return;
    
    appState.currentModel = modelSelect.value;
    console.log('Claude model selected:', appState.currentModel);
    updateModelInfo();
    updateSimulationButton();
}

function handleApiKeyChange() {
    const apiKeyInput = getElement('api-key');
    if (!apiKeyInput) return;
    
    // Trim whitespace and validate basic format
    const apiKey = apiKeyInput.value.trim();
    appState.apiKey = apiKey;
    
    // Reset connection status when API key changes
    appState.claudeConnection = false;
    const statusDiv = getElement('connection-status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
    
    updateSimulationButton();
    
    // Basic API key format validation (Claude keys start with 'sk-ant-')
    if (apiKey && !apiKey.startsWith('sk-ant-')) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.className = 'connection-status error';
            statusDiv.textContent = '⚠ API key should start with "sk-ant-"';
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
}

function updateSimulationButton() {
    const startBtn = getElement('start-simulation');
    const visualInput = getElement('visual-input');
    
    if (!startBtn) return;
    
    let hasInput = false;
    let inputStatus = 'No input';
    
    if (appState.inputMethod === 'text') {
        hasInput = visualInput && visualInput.value.trim().length > 0;
        inputStatus = hasInput ? 'Text input provided' : 'Text input required';
    } else if (appState.inputMethod === 'camera') {
        hasInput = appState.capturedFrame !== null;
        inputStatus = hasInput ? 'Frame captured' : 'Camera frame required';
    }
    
    const hasApiKey = appState.apiKey && appState.apiKey.trim().length > 0;
    const hasModel = appState.currentModel;
    const hasConnection = appState.claudeConnection;
    
    const canStart = hasApiKey && hasModel && hasInput && hasConnection;
    startBtn.disabled = !canStart;
    
    // Update button text to show what's missing
    if (!hasApiKey) {
        startBtn.textContent = 'Enter Claude API Key First';
    } else if (!hasConnection) {
        startBtn.textContent = 'Test Claude Connection First';
    } else if (!hasInput) {
        startBtn.textContent = appState.inputMethod === 'text' ? 'Enter Visual Description' : 'Capture Camera Frame';
    } else {
        startBtn.textContent = 'Start Claude Neural Simulation';
    }
    
    console.log('Simulation button state:', {
        disabled: startBtn.disabled,
        hasInput,
        inputStatus,
        inputMethod: appState.inputMethod,
        model: appState.currentModel,
        hasApiKey: hasApiKey,
        claudeConnected: hasConnection,
        hasCapturedFrame: !!appState.capturedFrame,
        buttonText: startBtn.textContent
    });
}

async function testClaudeConnection() {
    const statusDiv = getElement('connection-status');
    if (!statusDiv || !appState.apiKey) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.className = 'connection-status error';
            statusDiv.textContent = '✗ Please enter Claude API key first';
        }
        return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.className = 'connection-status';
    statusDiv.textContent = 'Testing Claude connection...';

    try {
        console.log('Testing Claude API connection with key:', appState.apiKey.substring(0, 10) + '...');
        
        // Test Claude API connection with a simple request
        const requestBody = {
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 50,
            temperature: 0.3,
            system: "You are testing API connectivity. Respond briefly to confirm connection.",
            messages: [{
                role: 'user',
                content: 'Respond with "Connection successful" if you can process this message.'
            }]
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        // Use local proxy to avoid CORS issues
        const proxyRequestBody = {
            ...requestBody,
            api_key: appState.apiKey.trim()
        };
        
        const response = await fetch('/claude-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proxyRequestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            // Verify we got a proper response
            if (data.content && data.content.length > 0 && data.content[0].text) {
                const responseText = data.content[0].text.toLowerCase();
                console.log('Response text:', responseText);
                
                if (responseText.includes('successful') || responseText.includes('connection') || responseText.length > 0) {
                    appState.claudeConnection = true;
                    statusDiv.className = 'connection-status success';
                    statusDiv.textContent = '✓ Claude connection successful';
                    updateSimulationButton();
                } else {
                    throw new Error('Unexpected response format from Claude API');
                }
            } else {
                throw new Error('No content received from Claude API');
            }
        } else {
            // Get error details from response
            let errorMessage = `API responded with status ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                if (errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData.error && errorData.error.type) {
                    errorMessage = `${errorData.error.type}: ${errorData.error.message || 'Unknown error'}`;
                }
            } catch (e) {
                console.log('Could not parse error response:', e);
            }
            throw new Error(errorMessage);
        }
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('Full error object:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        appState.claudeConnection = false;
        statusDiv.className = 'connection-status error';
        
        // Provide more specific error messages
        let errorMessage = error.message;
        
        if (error.name === 'TypeError') {
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                // Check if we're running from file:// protocol
                if (window.location.protocol === 'file:') {
                    errorMessage = 'CORS Error: Please run from a web server (not file://). See console for setup instructions.';
                    console.log('SETUP INSTRUCTIONS:');
                    console.log('1. Install a simple HTTP server:');
                    console.log('   - Python: python -m http.server 8000');
                    console.log('   - Node.js: npx http-server');
                    console.log('   - VS Code: Install "Live Server" extension');
                    console.log('2. Open http://localhost:8000 instead of opening the file directly');
                } else {
                    errorMessage = 'Network error - check your internet connection';
                }
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'Network error - API request blocked or failed';
            }
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS error - this may require running from a web server instead of opening the file directly';
        } else if (errorMessage.includes('401')) {
            errorMessage = 'Invalid API key - check your Claude API key';
        } else if (errorMessage.includes('403')) {
            errorMessage = 'API access forbidden - check your account permissions';
        } else if (errorMessage.includes('429')) {
            errorMessage = 'Rate limit exceeded - try again in a moment';
        } else if (errorMessage.includes('500')) {
            errorMessage = 'Claude API server error - try again later';
        }
        
        statusDiv.textContent = `✗ Claude connection failed: ${errorMessage}`;
        updateSimulationButton();
        
        // Additional debugging info
        statusDiv.innerHTML += `<br><small>Debug: ${error.name} - See console for details</small>`;
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

async function callClaudeAPI(prompt, model = 'claude-3-5-sonnet-20241022', imageData = null) {
    // Prepare message content
    let content;
    
    if (imageData) {
        // Vision-capable request with image
        content = [
            {
                type: "image",
                source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: imageData
                }
            },
            {
                type: "text",
                text: prompt
            }
        ];
    } else {
        // Text-only request
        content = prompt;
    }
    
    const requestBody = {
        model: model,
        max_tokens: 1000,
        temperature: 0.3,
        system: "You are simulating a specific brain region in the visual processing pathway. Provide detailed, scientifically accurate responses that describe neural processing in that region. Focus on the biological mechanisms and signal transformations occurring.",
        messages: [{
            role: 'user',
            content: content
        }],
        api_key: appState.apiKey
    };

    const response = await fetch('/claude-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
}

function selectOptimalModel(stepNumber) {
    // Implement optimal model selection based on step complexity
    if (stepNumber <= 3) {
        return 'claude-3-5-haiku-20241022';
    } else if (stepNumber <= 6) {
        return 'claude-3-5-sonnet-20241022';
    } else {
        return 'claude-3-5-sonnet-20241022';
    }
}

async function startSimulation() {
    if (appState.isProcessing) return;
    
    console.log('Starting Claude neural simulation...');
    appState.isProcessing = true;
    appState.results = {};
    appState.modelUsage = {};
    appState.totalProcessingTime = 0;
    appState.currentMemoryContext = null;
    
    const visualInput = getElement('visual-input');
    const progressSection = getElement('progress-section');
    const resultsSection = getElement('results-section');
    
    if (!visualInput || !progressSection || !resultsSection) return;
    
    const inputText = visualInput.value.trim();
    let currentInput = inputText;
    
    // Generate memory context if enabled
    if (appState.memoryEnabled && appState.visualMemories.length > 0) {
        // For camera input, analyze initial image features to find similar memories
        if (appState.inputMethod === 'camera' && appState.capturedFrame) {
            console.log('Searching visual memories for similar images...');
            // Create basic tags from text input or use generic image tags
            const searchTags = inputText ? 
                inputText.toLowerCase().split(/\s+/).filter(word => word.length > 2) :
                ['object', 'image', 'visual', 'scene'];
            
            const similarMemories = findSimilarMemories(searchTags);
            appState.currentMemoryContext = generateMemoryContext(similarMemories);
            
            if (appState.currentMemoryContext && appState.currentMemoryContext.memories > 0) {
                console.log(`Found ${appState.currentMemoryContext.memories} similar memories to influence processing`);
            }
        }
    }
    
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
            // Select model for this step
            let selectedModel;
            if (appState.currentModel === 'auto-optimal') {
                selectedModel = selectOptimalModel(stepNumber);
            } else {
                selectedModel = appState.currentModel;
            }
            
            // Track model usage
            appState.modelUsage[selectedModel] = (appState.modelUsage[selectedModel] || 0) + 1;
            
            // Create detailed prompt for this step
            const prompt = createStepPrompt(step, currentInput, stepNumber);
            
            // Call Claude API with image if available
            const startTime = Date.now();
            let output;
            if (stepNumber === 1 && appState.inputMethod === 'camera' && appState.capturedFrame) {
                // First step with camera input - send image to vision model
                output = await callClaudeAPI(prompt, selectedModel, appState.capturedFrame);
            } else {
                // Regular text processing for subsequent steps
                output = await callClaudeAPI(prompt, selectedModel);
            }
            const processingTime = Date.now() - startTime;
            appState.totalProcessingTime += processingTime;
            
            // Update step with output
            updateStepOutput(stepNumber, output);
            updateStepStatus(stepNumber, 'complete');
            
            // Store result
            appState.results[`step_${stepNumber}`] = {
                brain_region: step.brain_region,
                process: step.process,
                output: output,
                model_used: selectedModel,
                processing_time: processingTime
            };
            
            // Chain outputs for next step
            currentInput = output;
            
            // Add user-controlled delay
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
    
    // Extract recognized objects and store in memory
    if (appState.memoryEnabled && appState.inputMethod === 'camera' && appState.capturedFrame) {
        console.log('🧠 Attempting to extract objects for memory storage...');
        const recognizedObjects = extractRecognizedObjects(appState.results);
        console.log('🧠 Extracted objects:', recognizedObjects);
        
        if (recognizedObjects.length > 0) {
            console.log(`🧠 Storing ${recognizedObjects.length} objects in visual memory`);
            await storeVisualMemory(appState.capturedFrame, recognizedObjects, appState.results);
        } else {
            console.log('🧠 No objects found to store in memory');
        }
    } else {
        console.log('🧠 Memory storage skipped:', {
            memoryEnabled: appState.memoryEnabled,
            inputMethod: appState.inputMethod,
            hasCapturedFrame: !!appState.capturedFrame
        });
    }
    
    showFinalResults();
    appState.isProcessing = false;
    console.log('Claude simulation completed');
    console.log('Model usage:', appState.modelUsage);
    console.log('Total processing time:', appState.totalProcessingTime, 'ms');
}

function extractRecognizedObjects(processingResults) {
    const objects = [];
    
    // Extract from IT cortex (step 7) and memory integration (step 8)
    if (processingResults.step_7 && processingResults.step_7.output) {
        const itOutput = processingResults.step_7.output.toLowerCase();
        console.log('Analyzing IT output for object extraction:', itOutput.substring(0, 200) + '...');
        
        // Enhanced object recognition patterns
        const objectPatterns = [
            // Direct recognition statements
            /(?:recognizing|recognize|identified?|see|detect|found?)\s+(?:a|an|the)?\s*([a-zA-Z\s]{3,25}?)(?:\s|$|\.|\,|\;)/gi,
            /(?:object|item|thing)\s+(?:is|appears to be|looks like)\s+(?:a|an|the)?\s*([a-zA-Z\s]{3,25}?)(?:\s|$|\.|\,|\;)/gi,
            /categorized?\s+as\s+(?:a|an|the)?\s*([a-zA-Z\s]{3,25}?)(?:\s|$|\.|\,|\;)/gi,
            // Capital letter patterns (like "GUITAR" in the output)
            /\b([A-Z]{3,})\b/g,
            // "I am recognizing a GUITAR" pattern specifically
            /i am recognizing (?:a|an|the)?\s*([a-zA-Z\s]{3,25}?)(?:\s|$|\.|\,|\;)/gi,
            // Category patterns
            /primary category:\s*([a-zA-Z\s]{3,25}?)(?:\n|$|\.|\,|\;)/gi,
            /subcategory:\s*[^>]*>\s*([a-zA-Z\s]{3,25}?)(?:\n|$|\.|\,|\;)/gi,
            // Common object words followed by descriptors
            /(guitar|piano|violin|drum|car|table|chair|phone|computer|book|bottle|cup|vase|flower|tree|bird|cat|dog|person|face|house|building)(?:s)?\b/gi
        ];
        
        objectPatterns.forEach((pattern, index) => {
            const matches = [...itOutput.matchAll(pattern)];
            console.log(`Pattern ${index + 1} found ${matches.length} matches:`, matches.map(m => m[1] || m[0]));
            
            matches.forEach(match => {
                let objectName = (match[1] || match[0]).trim().toLowerCase();
                
                // Clean up the object name
                objectName = objectName.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
                
                // Filter out processing-related words and too generic terms
                const skipWords = ['processing', 'analysis', 'features', 'information', 'signals', 
                                 'patterns', 'detection', 'recognition', 'response', 'activation',
                                 'integration', 'pathway', 'cortex', 'system', 'region', 'memory',
                                 'visual', 'neural', 'based', 'primary', 'category', 'subcategory',
                                 'report', 'assessment', 'context', 'output', 'high', 'strong'];
                
                if (objectName.length >= 3 && 
                    objectName.length <= 25 &&
                    !skipWords.some(skip => objectName.includes(skip)) &&
                    !objects.find(obj => obj.name.toLowerCase() === objectName.toLowerCase())) {
                    
                    console.log(`✓ Found valid object: "${objectName}"`);
                    objects.push({
                        name: objectName.charAt(0).toUpperCase() + objectName.slice(1), // Capitalize
                        category: determineCategory(objectName),
                        properties: extractProperties(itOutput, objectName),
                        context: extractContext(processingResults),
                        confidence: 0.8
                    });
                }
            });
        });
    }
    
    // Also check memory integration (step 8) for additional context
    if (processingResults.step_8 && processingResults.step_8.output && objects.length > 0) {
        const memoryOutput = processingResults.step_8.output.toLowerCase();
        objects.forEach(obj => {
            obj.context = obj.context || extractContext(processingResults);
            // Update properties from memory integration
            const additionalProps = extractProperties(memoryOutput, obj.name);
            if (additionalProps.length > 0) {
                obj.properties = [...new Set([...(obj.properties || []), ...additionalProps])];
            }
        });
    }
    
    return objects;
}

function determineCategory(objectName) {
    const name = objectName.toLowerCase();
    
    // Basic categorization
    const categories = {
        'musical instrument': ['guitar', 'piano', 'violin', 'drum', 'flute', 'saxophone'],
        'furniture': ['chair', 'table', 'desk', 'sofa', 'bed', 'cabinet'],
        'electronics': ['phone', 'computer', 'tv', 'radio', 'camera', 'laptop'],
        'vehicle': ['car', 'bike', 'truck', 'motorcycle', 'bus', 'airplane'],
        'food': ['apple', 'banana', 'bread', 'cake', 'pizza', 'salad'],
        'clothing': ['shirt', 'pants', 'dress', 'shoes', 'hat', 'jacket'],
        'tool': ['hammer', 'screwdriver', 'knife', 'scissors', 'wrench'],
        'plant': ['flower', 'tree', 'grass', 'bush', 'leaf', 'vine'],
        'container': ['vase', 'bowl', 'cup', 'bottle', 'box', 'jar']
    };
    
    for (const [category, items] of Object.entries(categories)) {
        if (items.some(item => name.includes(item))) {
            return category;
        }
    }
    
    return 'object'; // Default category
}

function extractProperties(text, objectName) {
    const properties = [];
    const lowerText = text.toLowerCase();
    const lowerName = objectName.toLowerCase();
    
    // Look for color mentions
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey'];
    colors.forEach(color => {
        if (lowerText.includes(color)) {
            properties.push(color);
        }
    });
    
    // Look for size/shape descriptors
    const descriptors = ['large', 'small', 'big', 'tiny', 'round', 'square', 'rectangular', 'curved', 'straight', 'smooth', 'rough', 'wooden', 'metal', 'plastic'];
    descriptors.forEach(desc => {
        if (lowerText.includes(desc)) {
            properties.push(desc);
        }
    });
    
    return properties;
}

function extractContext(processingResults) {
    // Analyze early processing steps to determine context
    if (processingResults.step_1 && processingResults.step_1.output) {
        const retinalOutput = processingResults.step_1.output.toLowerCase();
        
        if (retinalOutput.includes('indoor') || retinalOutput.includes('room') || retinalOutput.includes('interior')) {
            return 'indoor';
        } else if (retinalOutput.includes('outdoor') || retinalOutput.includes('outside') || retinalOutput.includes('natural')) {
            return 'outdoor';
        }
    }
    
    return 'unknown';
}

function createStepPrompt(step, previousOutput, stepNumber) {
    // Check if this is the first step with image input
    const hasImage = stepNumber === 1 && appState.inputMethod === 'camera' && appState.capturedFrame;
    
    // Get the base AI prompt for this step
    let basePrompt = getStepPrompt(stepNumber, hasImage);
    
    // Add memory context for top-down processing
    let memoryContext = '';
    if (appState.memoryEnabled && appState.currentMemoryContext && appState.currentMemoryContext.memories > 0) {
        const influence = appState.memoryInfluence;
        
        if (stepNumber >= 4) { // Add memory influence starting from V1
            memoryContext = `\n\nVISUAL MEMORY CONTEXT (${(influence * 100).toFixed(0)}% influence):`;
            memoryContext += `\nYou have ${appState.currentMemoryContext.memories} similar visual memories that may influence recognition:`;
            
            // Add frequently recognized objects
            const frequentObjects = Array.from(appState.currentMemoryContext.objects.entries())
                .sort((a, b) => b[1].frequency - a[1].frequency)
                .slice(0, 3);
            
            if (frequentObjects.length > 0) {
                memoryContext += '\nFrequently recognized objects in similar scenes:';
                frequentObjects.forEach(([name, data]) => {
                    const properties = Array.from(data.properties).join(', ');
                    memoryContext += `\n- ${data.name} (seen ${data.frequency}x): ${properties}`;
                });
            }
            
            // Add experience context for higher-level processing
            if (stepNumber >= 7 && appState.currentMemoryContext.experiences.length > 0) {
                memoryContext += '\nPrevious recognition experiences suggest:';
                appState.currentMemoryContext.experiences
                    .slice(0, 2)
                    .forEach(exp => {
                        memoryContext += `\n- ${exp.summary}... (${(exp.similarity * 100).toFixed(0)}% similar)`;
                    });
            }
            
            memoryContext += `\nConsider this memory context in your processing, but prioritize current sensory input.`;
        }
    }
    
    // Add context from previous steps
    if (stepNumber === 1) {
        if (hasImage) {
            return basePrompt + memoryContext; // Image is sent separately for vision models
        } else {
            return `${basePrompt}${memoryContext} ${previousOutput}`;
        }
    } else {
        return `${basePrompt}${memoryContext}\n\nPrevious processing output: ${previousOutput}`;
    }
}

function getStepPrompt(stepNumber, hasImage = false) {
    const prompts = {
        1: hasImage ? 
            "You are simulating retinal photoreceptors in the human visual system. First, clearly describe what you see in this image, then explain how rods (low-light, achromatic) and cones (color vision, high acuity) would respond to this specific visual input. Include details about the objects, colors, lighting, and spatial arrangement you observe, then describe the light intensity detection, color wavelength processing (L, M, S cones), spatial distribution of activation, and signal conversion from photons to neural impulses based on what you actually see." :
            "You are simulating retinal photoreceptors in the human visual system. Your task is to convert the visual stimulus into neural signal patterns. Describe how rods (low-light, achromatic) and cones (color vision, high acuity) respond to this input. Include details about light intensity detection, color wavelength processing, spatial distribution of activation, and signal conversion from photons to neural impulses. Visual stimulus:",
        2: "You are retinal ganglion cells receiving input from photoreceptors. Your function is to organize visual information into parallel processing streams. Create three distinct pathway outputs: Magnocellular (M) pathway for luminance changes and motion, Parvocellular (P) pathway for color information and fine spatial detail, and Koniocellular (K) pathway for blue-yellow color opponency. Process this retinal input:",
        3: "You are the Lateral Geniculate Nucleus (LGN), the thalamic relay station for visual information. Your role is to receive organized input from retinal ganglion cells, enhance contrast and edge detection, modulate signals based on attention and arousal, organize retinotopic mapping, and prepare information for cortical processing. Process the ganglion cell input:",
        4: "You are the primary visual cortex (V1), the first cortical processing stage. Your function includes simple cells detecting specific edge orientations and spatial frequencies, complex cells combining simple cell outputs for position-invariant edge detection, hypercolumns organizing orientation and color processing, and binocular integration processing depth information. Analyze the LGN input and extract basic visual features:",
        5: "You are the ventral stream areas V2 and V4, part of the 'what' pathway for object identification. V2 processes complex contours, textures, and figure-ground segregation. V4 handles color constancy, intermediate shape complexity, and attention-modulated responses. Integrate multiple feature dimensions and prepare for high-level object recognition. Analyze the V1 feature map:",
        6: "You are the dorsal stream areas MT and MST, part of the 'where/how' pathway. MT detects coherent motion patterns and direction selectivity. MST analyzes complex optic flow patterns and self-motion. Process spatial relationships and integrate with attention and eye movement systems. Analyze motion and spatial information:",
        7: "You are the Inferotemporal (IT) cortex, the final stage of the ventral visual pathway specializing in object recognition. Based on the processed visual features, identify what specific object(s) you are seeing. Your functions include creating view-invariant object representations, categorical processing (faces, objects, scenes), integration of shape, color, and texture information, and high-level visual categorization. Clearly state what object you recognize and provide detailed analysis. Process the ventral stream input:",
        8: "You are the perirhinal cortex and associated memory systems, responsible for integrating visual perception with stored knowledge. Based on the object recognition from IT cortex, provide semantic associations, contextual understanding, and conscious perception of what this object is and its significance. Your functions include comparing visual input with long-term memory representations, semantic association and contextual understanding, familiarity detection, and contributing to conscious visual experience. Integrate the object recognition results:"
    };
    
    return prompts[stepNumber] || "Process the visual information for this brain region:";
}

function showFinalResults() {
    const resultsSection = getElement('results-section');
    const finalPerception = getElement('final-perception');
    
    if (resultsSection && finalPerception) {
        const lastStepResult = appState.results['step_8'];
        const processingTimeSeconds = (appState.totalProcessingTime / 1000).toFixed(2);
        
        finalPerception.innerHTML = `
            <h4>Conscious Visual Perception (Claude Analysis):</h4>
            <p>${lastStepResult ? lastStepResult.output : 'Processing incomplete'}</p>
            <h4>Claude Processing Summary:</h4>
            <p>The visual processing simulation has been completed using Claude AI models. Each brain region was simulated using specialized prompts based on neuroscience research, demonstrating the hierarchical nature of visual processing from retinal photoreceptors to conscious perception.</p>
            <div class="processing-stats">
                <h5>Processing Statistics:</h5>
                <ul>
                    <li>Total processing time: ${processingTimeSeconds}s</li>
                    <li>Models used: ${Object.keys(appState.modelUsage).join(', ')}</li>
                    <li>Model usage: ${JSON.stringify(appState.modelUsage)}</li>
                    <li>Processing steps completed: ${Object.keys(appState.results).length}/8</li>
                </ul>
            </div>
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
        metadata: {
            simulator_version: "Claude Neural Processing v2.0",
            timestamp: timestamp,
            total_steps: Object.keys(appState.results).length,
            total_processing_time: appState.totalProcessingTime,
            model_usage: appState.modelUsage
        },
        input: inputText,
        model_configuration: appState.currentModel,
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
    a.download = `claude_neural_processing_${timestamp.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReport() {
    const visualInput = getElement('visual-input');
    if (!visualInput || Object.keys(appState.results).length === 0) {
        alert('No processing results available to generate report.');
        return;
    }
    
    const inputText = visualInput.value.trim();
    const timestamp = new Date().toISOString();
    
    let report = `Claude Neural Visual Processing Report\nGenerated: ${timestamp}\n\n`;
    report += `SUMMARY:\n`;
    report += `- Input: ${inputText}\n`;
    report += `- Total processing steps: ${Object.keys(appState.results).length}\n`;
    report += `- Total processing time: ${(appState.totalProcessingTime / 1000).toFixed(2)}s\n`;
    report += `- Models used: ${Object.keys(appState.modelUsage).join(', ')}\n`;
    report += `- Model usage: ${JSON.stringify(appState.modelUsage)}\n\n`;
    
    report += `PATHWAY ANALYSIS:\n`;
    
    for (let i = 1; i <= 8; i++) {
        const stepResult = appState.results[`step_${i}`];
        if (stepResult) {
            report += `\nStep ${i}: ${stepResult.brain_region}\n`;
            report += `Model: ${stepResult.model_used}\n`;
            report += `Processing time: ${stepResult.processing_time}ms\n`;
            report += `Output: ${stepResult.output.substring(0, 200)}...\n`;
        }
    }
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claude_processing_report_${timestamp.split('T')[0]}.txt`;
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
async function initializeApp() {
    console.log('Initializing Claude Neural Visual Processing Simulator...');
    
    // Load existing memories first
    await loadMemoriesFromFile();
    
    // Set up event listeners for Claude-focused interface
    const modelSelect = getElement('model-select');
    const apiKeyInput = getElement('api-key');
    const testBtn = getElement('test-connection');
    const speedSlider = getElement('processing-speed');
    const loggingCheckbox = getElement('detailed-logging');
    const startBtn = getElement('start-simulation');
    const downloadBtn = getElement('download-results');
    const resetBtn = getElement('reset-simulation');
    const reportBtn = getElement('generate-report');
    const visualInput = getElement('visual-input');
    
    // Camera elements
    const enableCameraBtn = getElement('enable-camera');
    const captureFrameBtn = getElement('capture-frame');
    const toggleCameraBtn = getElement('toggle-camera');
    const recaptureBtn = getElement('recapture-frame');
    const inputMethodRadios = document.querySelectorAll('input[name=\"input-method\"]');
    
    if (modelSelect) {
        modelSelect.addEventListener('change', handleModelChange);
        updateModelInfo(); // Initialize model info display
        console.log('Claude model select listener added');
    }
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', handleApiKeyChange);
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', testClaudeConnection);
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
    
    if (reportBtn) {
        reportBtn.addEventListener('click', generateReport);
    }
    
    if (visualInput) {
        visualInput.addEventListener('input', updateSimulationButton);
    }
    
    // Camera event listeners
    if (enableCameraBtn) {
        enableCameraBtn.addEventListener('click', initializeCamera);
    }
    
    if (captureFrameBtn) {
        captureFrameBtn.addEventListener('click', captureFrame);
    }
    
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', toggleCamera);
    }
    
    if (recaptureBtn) {
        recaptureBtn.addEventListener('click', () => {
            const frameContainer = getElement('captured-frame-container');
            if (frameContainer) {
                frameContainer.style.display = 'none';
            }
            appState.capturedFrame = null;
            updateSimulationButton();
        });
    }
    
    // Input method change listeners
    inputMethodRadios.forEach(radio => {
        radio.addEventListener('change', handleInputMethodChange);
    });
    
    // Memory system event listeners
    const memoryEnabledCheckbox = getElement('memory-enabled');
    const memoryInfluenceSlider = getElement('memory-influence');
    const clearMemoryBtn = getElement('clear-memory');
    
    if (memoryEnabledCheckbox) {
        memoryEnabledCheckbox.addEventListener('change', (e) => {
            appState.memoryEnabled = e.target.checked;
            console.log('Visual memory:', appState.memoryEnabled ? 'enabled' : 'disabled');
        });
    }
    
    if (memoryInfluenceSlider) {
        memoryInfluenceSlider.addEventListener('input', (e) => {
            appState.memoryInfluence = parseFloat(e.target.value);
            const influenceValue = getElement('memory-influence-value');
            if (influenceValue) {
                influenceValue.textContent = `${Math.round(appState.memoryInfluence * 100)}%`;
            }
            console.log('Memory influence set to:', appState.memoryInfluence);
        });
    }
    
    if (clearMemoryBtn) {
        clearMemoryBtn.addEventListener('click', clearVisualMemory);
    }
    
    // Initialize memory display
    updateMemoryDisplay();
    
    console.log('All event listeners initialized including camera and memory functionality');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting initialization...');
    await initializeApp();
    console.log('Claude Neural Visual Processing Simulator ready');
});