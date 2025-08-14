import plotly.graph_objects as go
import pandas as pd
import numpy as np

# Create the data
data = [
    {"brain_region": "Retina", "text_generation": 3, "multimodal": 4, "reasoning": 2, "memory": 1, "pattern_recognition": 5, "recommended_model": "GPT-4o Vision"},
    {"brain_region": "Retinal Ganglion", "text_generation": 4, "multimodal": 3, "reasoning": 3, "memory": 1, "pattern_recognition": 4, "recommended_model": "Claude-3.5-Sonnet"},
    {"brain_region": "LGN", "text_generation": 4, "multimodal": 3, "reasoning": 4, "memory": 2, "pattern_recognition": 4, "recommended_model": "GPT-4o"},
    {"brain_region": "V1", "text_generation": 3, "multimodal": 5, "reasoning": 3, "memory": 1, "pattern_recognition": 5, "recommended_model": "Gemini-Pro Vision"},
    {"brain_region": "V2/V4", "text_generation": 4, "multimodal": 5, "reasoning": 4, "memory": 2, "pattern_recognition": 5, "recommended_model": "GPT-4o Vision"},
    {"brain_region": "MT/MST", "text_generation": 3, "multimodal": 4, "reasoning": 5, "memory": 2, "pattern_recognition": 4, "recommended_model": "Claude-3.5-Sonnet"},
    {"brain_region": "IT Cortex", "text_generation": 5, "multimodal": 4, "reasoning": 5, "memory": 3, "pattern_recognition": 5, "recommended_model": "GPT-4o"},
    {"brain_region": "Perirhinal", "text_generation": 5, "multimodal": 3, "reasoning": 5, "memory": 5, "pattern_recognition": 3, "recommended_model": "Claude-3.5-Sonnet"}
]

# Convert to DataFrame
df = pd.DataFrame(data)

# Create the matrix for heatmap
brain_regions = df['brain_region'].tolist()
capabilities = ['text_generation', 'multimodal', 'reasoning', 'memory', 'pattern_recognition']
capability_labels = ['Text Gen', 'Multimodal', 'Reasoning', 'Memory', 'Pattern Rec']

# Create the heatmap matrix
heatmap_data = []
for capability in capabilities:
    heatmap_data.append(df[capability].tolist())

# Transpose to have brain regions as rows and capabilities as columns
heatmap_data = np.array(heatmap_data).T

# Create text annotations for the cells
text_data = []
for i, region in enumerate(brain_regions):
    row_text = []
    for j, capability in enumerate(capabilities):
        value = heatmap_data[i, j]
        row_text.append(str(value))
    text_data.append(row_text)

# Create the heatmap with improved color scale
fig = go.Figure(data=go.Heatmap(
    z=heatmap_data,
    x=capability_labels,
    y=brain_regions,
    text=text_data,
    texttemplate="%{text}",
    textfont={"size": 14},
    colorscale=[
        [0.0, '#ffffff'],    # White for 1
        [0.25, '#e6f3ff'],   # Very light blue for 2
        [0.5, '#87ceeb'],    # Light blue for 3
        [0.75, '#4682b4'],   # Steel blue for 4
        [1.0, '#1e3a8a']     # Dark blue for 5
    ],
    zmin=1,
    zmax=5,
    colorbar=dict(
        title="Suitability",
        tickvals=[1, 2, 3, 4, 5],
        ticktext=['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    ),
    hoverongaps=False,
    hovertemplate='%{y}<br>%{x}: %{z}<br>Model: %{customdata}<extra></extra>',
    customdata=[[df.iloc[i]['recommended_model'] for j in range(len(capabilities))] for i in range(len(brain_regions))]
))

# Update layout
fig.update_layout(
    title='AI Model Suitability for Brain Regions',
    xaxis_title='AI Capabilities',
    yaxis_title='Brain Regions'
)

# Save the chart
fig.write_image('brain_ai_heatmap.png')