import plotly.graph_objects as go
import pandas as pd

# Data for the neural processing pathway
data = [
    {"step": 1, "region": "Retina", "function": "Photon Absorption", "x": 400, "y": 50},
    {"step": 2, "region": "Retinal Ganglion", "function": "Signal Aggregation", "x": 400, "y": 120},
    {"step": 3, "region": "LGN", "function": "Thalamic Processing", "x": 400, "y": 190},
    {"step": 4, "region": "V1", "function": "Feature Extraction", "x": 400, "y": 260},
    {"step": "5A", "region": "V2/V4", "function": "Object Processing", "x": 250, "y": 330},
    {"step": "5B", "region": "MT/MST", "function": "Motion Analysis", "x": 550, "y": 330},
    {"step": 6, "region": "IT Cortex", "function": "Object Recognition", "x": 400, "y": 400},
    {"step": 7, "region": "Perirhinal", "function": "Memory Integration", "x": 400, "y": 470},
    {"step": 8, "region": "Consciousness", "function": "Final Perception", "x": 400, "y": 540}
]

df = pd.DataFrame(data)

# Create the base figure
fig = go.Figure()

# More distinct professional blue/green color scheme
colors = ['#1e40af', '#2563eb', '#3b82f6', '#0891b2', '#059669', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4']

# Add boxes for each step
box_width = 130
box_height = 55

for i, row in df.iterrows():
    x_center = row['x']
    y_center = row['y']
    
    # Add rectangle shape for the box
    fig.add_shape(
        type="rect",
        x0=x_center - box_width/2,
        y0=y_center - box_height/2,
        x1=x_center + box_width/2,
        y1=y_center + box_height/2,
        fillcolor=colors[i],
        line=dict(color="white", width=3)
    )
    
    # Add step number and region text (top line)
    fig.add_annotation(
        x=x_center,
        y=y_center + 10,
        text=f"<b>{row['step']}. {row['region']}</b>",
        showarrow=False,
        font=dict(color="white", size=13),
        xanchor="center",
        yanchor="middle"
    )
    
    # Add function text (bottom line)
    fig.add_annotation(
        x=x_center,
        y=y_center - 10,
        text=row['function'],
        showarrow=False,
        font=dict(color="white", size=11),
        xanchor="center",
        yanchor="middle"
    )

# Add main pathway arrows (linear sequence)
main_arrows = [
    (400, 77, 400, 93),     # Retina to Ganglion
    (400, 147, 400, 163),   # Ganglion to LGN
    (400, 217, 400, 233),   # LGN to V1
]

for x1, y1, x2, y2 in main_arrows:
    fig.add_annotation(
        x=x2, y=y2,
        ax=x1, ay=y1,
        xref="x", yref="y",
        axref="x", ayref="y",
        arrowhead=3,
        arrowsize=1.8,
        arrowwidth=4,
        arrowcolor="#1f2937",
        showarrow=True
    )

# Add split arrows from V1 to both streams
fig.add_annotation(
    x=315, y=302,
    ax=385, ay=287,
    xref="x", yref="y",
    axref="x", ayref="y",
    arrowhead=3,
    arrowsize=1.8,
    arrowwidth=4,
    arrowcolor="#059669",  # Green for ventral
    showarrow=True
)

fig.add_annotation(
    x=485, y=302,
    ax=415, ay=287,
    xref="x", yref="y",
    axref="x", ayref="y",
    arrowhead=3,
    arrowsize=1.8,
    arrowwidth=4,
    arrowcolor="#0d9488",  # Teal for dorsal
    showarrow=True
)

# Add convergence arrows from both streams to IT Cortex
fig.add_annotation(
    x=335, y=373,
    ax=285, ay=357,
    xref="x", yref="y",
    axref="x", ayref="y",
    arrowhead=3,
    arrowsize=1.8,
    arrowwidth=4,
    arrowcolor="#059669",  # Green for ventral convergence
    showarrow=True
)

fig.add_annotation(
    x=465, y=373,
    ax=515, ay=357,
    xref="x", yref="y",
    axref="x", ayref="y",
    arrowhead=3,
    arrowsize=1.8,
    arrowwidth=4,
    arrowcolor="#0d9488",  # Teal for dorsal convergence
    showarrow=True
)

# Add final pathway arrows
final_arrows = [
    (400, 427, 400, 443),   # IT to Perirhinal
    (400, 497, 400, 513)    # Perirhinal to Consciousness
]

for x1, y1, x2, y2 in final_arrows:
    fig.add_annotation(
        x=x2, y=y2,
        ax=x1, ay=y1,
        xref="x", yref="y",
        axref="x", ayref="y",
        arrowhead=3,
        arrowsize=1.8,
        arrowwidth=4,
        arrowcolor="#1f2937",
        showarrow=True
    )

# Add stream pathway labels with better integration
fig.add_annotation(
    x=170, y=330,
    text="<b>Ventral Stream</b><br><i>(What pathway)</i>",
    showarrow=False,
    font=dict(color="#059669", size=11),
    xanchor="center",
    bgcolor="rgba(255,255,255,0.9)",
    bordercolor="#059669",
    borderwidth=2,
    borderpad=4
)

fig.add_annotation(
    x=630, y=330,
    text="<b>Dorsal Stream</b><br><i>(Where pathway)</i>",
    showarrow=False,
    font=dict(color="#0d9488", size=11),
    xanchor="center",
    bgcolor="rgba(255,255,255,0.9)",
    bordercolor="#0d9488",
    borderwidth=2,
    borderpad=4
)

# Add convergence label
fig.add_annotation(
    x=400, y=365,
    text="<i>Streams converge</i>",
    showarrow=False,
    font=dict(color="#374151", size=10),
    xanchor="center",
    bgcolor="rgba(255,255,255,0.8)"
)

# Update layout
fig.update_layout(
    title="Neural Visual Processing Pathway",
    xaxis=dict(
        showgrid=False,
        showticklabels=False,
        zeroline=False,
        range=[80, 720]
    ),
    yaxis=dict(
        showgrid=False,
        showticklabels=False,
        zeroline=False,
        range=[0, 580]
    ),
    plot_bgcolor='#f8fafc',
    paper_bgcolor='white',
    showlegend=False
)

# Save the chart
fig.write_image("neural_processing_flowchart.png")
fig.show()