# Claude Neural Visual Processing Simulator

A sophisticated web application that uses **Anthropic's Claude AI models** to simulate how the human brain processes visual information, from photon absorption in the retina to conscious perception.

## 🧠 Overview

This application simulates the complete visual processing pathway through 8 sequential brain regions, using Claude's advanced language models to represent the biological functions of each neural area. Based on cutting-edge neuroscience research, it demonstrates the hierarchical nature of visual processing in the human brain.

## ✨ Features

### Claude AI Integration
- **Multiple Claude Models**: Support for Claude 3.5 Sonnet, Claude 3.5 Haiku, and Claude 3 Opus
- **Intelligent Model Selection**: Automatic optimization using different models for different processing steps
- **Real-time API Integration**: Live connection to Anthropic's Claude API
- **Vision-Capable Processing**: Native support for image analysis using Claude's vision models
- **Cost Optimization**: Smart model selection balances performance and cost

### Camera Integration (NEW)
- **Live Camera Feed**: Real-time video capture from device cameras
- **Frame Capture**: High-quality image capture for processing
- **Multi-Camera Support**: Switch between front and rear cameras
- **Permission Handling**: Secure camera access with user consent
- **Real-World Analysis**: Process actual visual scenes from your environment

### Processing Pipeline
1. **Retinal Processing** (Photoreceptors) - Basic light detection and color processing
2. **Retinal Ganglion Cells** - Parallel pathway organization (M, P, K streams)
3. **Lateral Geniculate Nucleus** - Thalamic relay and signal enhancement
4. **Primary Visual Cortex (V1)** - Basic feature extraction (edges, orientations)
5. **Ventral Stream (V2/V4)** - Object identification pathway
6. **Dorsal Stream (MT/MST)** - Spatial and motion processing pathway
7. **Inferotemporal Cortex** - High-level object recognition
8. **Perirhinal Cortex** - Memory integration and conscious perception

### Educational Features
- Interactive step-by-step visualization
- Detailed biological explanations for each brain region
- Real-time processing progress tracking
- Comprehensive result export and analysis

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Python 3.8+ (for backend testing)

### Setup

1. **Clone or download the application files**
2. **Get your Claude API key** from [console.anthropic.com](https://console.anthropic.com/)
3. **Run the application**:
   
   **Option A: Local Web Server (Recommended)**
   ```bash
   # Windows
   start_server.bat
   
   # Or manually with Python
   python start_server.py
   
   # Or with Python 3
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser
   
   **Option B: Direct File Access**
   - Open `index.html` directly in your browser
   - Note: May have CORS limitations for API calls
   
   **Option C: Python Backend**
   - Install requirements and run `script.py`

### Web Application Usage

1. **Configure Claude API**:
   - Select your preferred Claude model or use "Auto-Select Optimal"
   - Enter your Claude API key
   - Test the connection

2. **Choose Input Method**:
   - **Text Description**: Describe a visual scene (traditional method)
   - **Live Camera Feed**: Use your device's camera for real-world visual processing

3. **Camera Mode Setup** (NEW):
   - Click "Enable Camera" to request camera permissions
   - Capture a frame from the live video feed
   - The captured image will be processed using Claude's vision capabilities
   - Switch between front/back cameras if available

4. **Run Simulation**:
   - Click "Start Claude Neural Simulation"
   - Watch as each brain region processes the visual information
   - Observe the hierarchical transformation from raw visual input to conscious perception

5. **Analyze Results**:
   - Review the final conscious perception
   - Download processing results in JSON format
   - Generate detailed analysis reports

### Python Backend Usage

```python
from script import VisualProcessingSimulator

# Initialize simulator
simulator = VisualProcessingSimulator()

# Set Claude API key
simulator.set_claude_api_key("your-claude-api-key")

# Test connection
if simulator.test_claude_connection():
    print("Connected to Claude!")
    
    # Process text description
    results = simulator.process_visual_input(
        "A red rose in a glass vase on a white table",
        use_optimal_models=True,
        input_type="text"
    )
    
    # OR process image file (NEW)
    results = simulator.process_visual_input(
        "path/to/your/image.jpg",
        use_optimal_models=True,
        input_type="image"
    )
    
    # Export results
    json_output = simulator.export_results(results)
    print(json_output)
```

## 🔧 Configuration Options

### Claude Model Selection

| Model | Best For | Cost | Performance |
|-------|----------|------|-------------|
| **Claude 3.5 Haiku** | Basic processing steps (1-3) | Low | Fast |
| **Claude 3.5 Sonnet** | Intermediate processing (4-6) | Medium | Balanced |
| **Claude 3 Opus** | Research & highest accuracy | High | Premium |
| **Auto-Optimal** | Automatic model selection | Optimized | Adaptive |

### Processing Settings
- **Processing Speed**: Adjust delay between steps (500ms - 3000ms)
- **Detailed Logging**: Enable comprehensive processing logs
- **Model Selection**: Manual or automatic optimization

## 📊 Output Formats

### JSON Export
```json
{
  "metadata": {
    "simulator_version": "Claude Neural Processing v2.0",
    "timestamp": "2024-01-15T10:30:00Z",
    "total_processing_time": 15250,
    "model_usage": {
      "claude-3-5-haiku-20241022": 3,
      "claude-3-5-sonnet-20241022": 5
    }
  },
  "processing_steps": [...]
}
```

### Analysis Report
- Processing statistics and performance metrics
- Model usage breakdown
- Step-by-step neural pathway analysis
- Biological accuracy assessment

## 🧪 Scientific Background

The simulator is based on extensive neuroscience research including:

- **Hierarchical Visual Processing**: From basic feature detection to complex object recognition
- **Parallel Processing Streams**: Ventral ("what") and dorsal ("where/how") pathways
- **Predictive Coding**: Top-down feedback and expectation mechanisms
- **Cross-Modal Integration**: Multi-sensory processing capabilities

### Key Research Areas
- Retinal ganglion cell pathway organization
- LGN contrast enhancement and spatial filtering
- V1 hypercolumn organization and feature detection
- Ventral stream object recognition hierarchy
- Dorsal stream motion and spatial processing
- Memory integration in higher cortical areas

## 🔬 Technical Implementation

### Architecture
- **Frontend**: Modern HTML5, CSS3, and vanilla JavaScript
- **AI Integration**: Direct Claude API calls with error handling
- **Camera API**: WebRTC MediaDevices for video capture
- **Image Processing**: Canvas-based frame capture and base64 encoding
- **State Management**: Browser-based session management
- **Security**: Secure API key handling and camera permission management

### API Integration
```javascript
// Claude API call example
const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        system: "You are simulating a brain region...",
        messages: [{ role: 'user', content: prompt }]
    })
});
```

## 📈 Performance & Cost

### Optimization Features
- **Smart Model Selection**: Uses faster/cheaper models for basic processing
- **Error Handling**: Robust API error recovery and retry logic
- **Rate Limiting**: Respects Claude API rate limits
- **Caching**: Efficient state management to minimize API calls

### Typical Usage Costs
- **Educational Demo** (Haiku): ~$0.10-0.20 per simulation
- **Research Quality** (Sonnet): ~$0.50-1.00 per simulation
- **Premium Analysis** (Opus): ~$2.00-4.00 per simulation
- **Auto-Optimal**: ~$0.30-0.80 per simulation

## 🎓 Educational Applications

### For Students
- Understand brain organization and visual processing hierarchy
- Explore how AI can model biological neural processes
- Learn about the complexity of human perception
- Compare artificial and biological information processing

### For Researchers
- Test hypotheses about visual processing mechanisms
- Compare AI model outputs with neuroimaging data
- Develop new approaches to neural simulation
- Validate computational models of vision

### For Educators
- Interactive demonstrations of brain function
- Bridge neuroscience theory with AI applications
- Engaging lessons about perception and consciousness
- Real-time neural processing visualization

## 🔒 Security & Privacy

- **API Key Security**: Keys are never logged or stored permanently
- **Data Privacy**: Processing data remains local to your session
- **Secure Communication**: All API calls use HTTPS encryption
- **No Data Retention**: No personal data is collected or stored

## 🛠️ Installation & Dependencies

### Web Application
No installation required - just open `index.html` in a modern browser.

### Python Backend
```bash
pip install requests

# Run the simulator
python script.py
```

### Environment Variables
```bash
export ANTHROPIC_API_KEY="your-claude-api-key"
```

## 📝 Usage Examples

### Basic Visual Processing
```
Input: "A red apple on a wooden table"
→ Retina: Rod/cone activation patterns for red wavelengths
→ Ganglion Cells: M/P/K pathway separation  
→ LGN: Contrast enhancement and spatial filtering
→ V1: Edge detection and orientation mapping
→ V2/V4: Shape and color processing
→ MT/MST: Spatial relationship analysis
→ IT: Object recognition as "apple"
→ Perirhinal: Memory integration and semantic understanding
```

### Complex Scene Analysis
```
Input: "A person walking a dog in a park with trees and sunlight"
→ Multiple object recognition pathways
→ Motion detection and tracking
→ Scene understanding and context
→ Spatial relationship mapping
→ Semantic integration with life experience
```

## 🤝 Contributing

This application demonstrates the integration of AI language models with neuroscience simulation. Contributions welcome for:

- Enhanced biological accuracy
- Additional AI model integrations
- Improved visualization features
- Educational content expansion
- Performance optimizations

## 📚 References

Based on research from leading neuroscience sources including:
- NeuroLogica blog neuroscience articles
- Harvard Brain Initiative findings
- MIT computational neuroscience research
- Anthropic AI safety and capability research

## 📄 License

Educational and research use. Commercial applications require separate licensing.

## 🆘 Troubleshooting

### Connection Issues

**"Network error - check your internet connection"**
- **Cause**: CORS restrictions when opening `index.html` directly
- **Solution**: Use the local web server instead:
  ```bash
  python start_server.py
  # Then open http://localhost:8000
  ```

**"Invalid API key - check your Claude API key"**
- Verify your API key starts with `sk-ant-`
- Get a new key from [console.anthropic.com](https://console.anthropic.com/)
- Ensure no extra spaces or characters

**"API access forbidden"**
- Check your Anthropic account has API access enabled
- Verify your account has sufficient credits
- Check for any account restrictions

### Camera Issues

**Camera access denied**
- Grant camera permissions in your browser
- Check browser security settings
- Ensure you're using HTTPS or localhost

**Frame capture not working**
- Refresh the page and try again
- Check browser compatibility (Chrome/Firefox recommended)
- Verify camera is not being used by another application

## 🆘 Support

For additional issues or questions:
1. Check the browser console for detailed error messages
2. Verify Claude API key and connection using the test button
3. Try running from a local web server instead of opening the file directly
4. Review input format requirements
5. Check the console for setup instructions

---

**Powered by Anthropic's Claude AI** • **Educational Neural Simulation** • **Interactive Neuroscience**