import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, ConnectionPatch
from matplotlib.lines import Line2D
import numpy as np
import os

# Create output directory
os.makedirs('/home/z/my-project/download/ABRAHAM/diagrams', exist_ok=True)

# Color palette
colors = {
    'soul': '#8B5CF6',
    'core_truth': '#FFD700',
    'core_connection': '#FF69B4',
    'core_meaning': '#9370DB',
    'core_growth': '#32CD32',
    'core_honesty': '#00CED1',
    'core_freedom': '#FF6347',
    'core_love': '#FF1493',
    'core_wisdom': '#4169E1',
    'neuron': '#60A5FA',
    'subcore': '#F59E0B',
    'connection': '#94A3B8',
    'bg': '#0F172A',
    'text': '#F8FAFC',
    'grid': '#1E293B'
}

core_colors = [
    colors['core_truth'], colors['core_connection'], colors['core_meaning'],
    colors['core_growth'], colors['core_honesty'], colors['core_freedom'],
    colors['core_love'], colors['core_wisdom']
]
core_names = ['TRUTH', 'CONNECTION', 'MEANING', 'GROWTH', 'HONESTY', 'FREEDOM', 'LOVE', 'WISDOM']

# ============================================================
# DIAGRAM 1: THE NEURAL WEB OVERVIEW
# ============================================================
def create_neural_web_overview():
    fig, ax = plt.subplots(1, 1, figsize=(16, 14))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    
    # Set limits
    ax.set_xlim(-12, 12)
    ax.set_ylim(-12, 12)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Title
    ax.text(0, 11.5, 'A.B.R.A.H.A.M. Neural Web Architecture', 
            fontsize=24, fontweight='bold', ha='center', color=colors['text'])
    ax.text(0, 10.5, 'The Soul at Center • Cores Orbiting • Neurons Connecting', 
            fontsize=14, ha='center', color=colors['connection'], style='italic')
    
    # Draw connection lines from soul to cores (faint)
    for i, angle in enumerate(np.linspace(0, 2*np.pi, 9)[:-1]):
        x = 7 * np.cos(angle)
        y = 7 * np.sin(angle)
        ax.plot([0, x], [0, y], color=colors['connection'], alpha=0.2, linewidth=1, linestyle='--')
    
    # Draw neurons scattered around (representing the web)
    np.random.seed(42)
    for _ in range(150):
        r = np.random.uniform(2, 10)
        theta = np.random.uniform(0, 2*np.pi)
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        size = np.random.uniform(20, 60)
        alpha = np.random.uniform(0.3, 0.8)
        ax.scatter(x, y, s=size, c=colors['neuron'], alpha=alpha, zorder=1)
    
    # Draw some connections between neurons
    np.random.seed(123)
    for _ in range(80):
        r1 = np.random.uniform(2, 9)
        theta1 = np.random.uniform(0, 2*np.pi)
        r2 = np.random.uniform(2, 9)
        theta2 = np.random.uniform(0, 2*np.pi)
        x1, y1 = r1 * np.cos(theta1), r1 * np.sin(theta1)
        x2, y2 = r2 * np.cos(theta2), r2 * np.sin(theta2)
        ax.plot([x1, x2], [y1, y2], color=colors['connection'], alpha=0.15, linewidth=0.5)
    
    # Draw CORES (orbiting around soul)
    for i, angle in enumerate(np.linspace(0, 2*np.pi, 9)[:-1]):
        x = 7 * np.cos(angle)
        y = 7 * np.sin(angle)
        
        # Core glow
        glow = Circle((x, y), 1.2, color=core_colors[i], alpha=0.3, zorder=2)
        ax.add_patch(glow)
        
        # Core
        core = Circle((x, y), 0.8, color=core_colors[i], alpha=0.9, zorder=3)
        ax.add_patch(core)
        
        # Core label
        label_offset = 1.8
        lx = (7 + label_offset) * np.cos(angle)
        ly = (7 + label_offset) * np.sin(angle)
        ax.text(lx, ly, core_names[i], fontsize=10, fontweight='bold', 
                ha='center', va='center', color=core_colors[i])
    
    # Draw SOUL at center (larger, with glow)
    soul_glow1 = Circle((0, 0), 2.5, color=colors['soul'], alpha=0.1, zorder=4)
    soul_glow2 = Circle((0, 0), 1.8, color=colors['soul'], alpha=0.2, zorder=5)
    soul_glow3 = Circle((0, 0), 1.2, color=colors['soul'], alpha=0.3, zorder=6)
    ax.add_patch(soul_glow1)
    ax.add_patch(soul_glow2)
    ax.add_patch(soul_glow3)
    
    soul = Circle((0, 0), 0.8, color=colors['soul'], alpha=1, zorder=7)
    ax.add_patch(soul)
    
    ax.text(0, 0, 'SOUL', fontsize=12, fontweight='bold', ha='center', va='center', 
            color='white', zorder=8)
    
    # Draw subcores (smaller, between soul and cores)
    subcore_positions = [(3, 4), (-4, 3), (4, -3), (-3, -4), (0, 5), (5, 0)]
    subcore_labels = ['Creativity', 'Learning', 'Memory', 'Emotion', 'Purpose', 'Flow']
    for i, (sx, sy) in enumerate(subcore_positions):
        subcore = Circle((sx, sy), 0.4, color=colors['subcore'], alpha=0.8, zorder=3)
        ax.add_patch(subcore)
        ax.text(sx, sy + 0.7, subcore_labels[i], fontsize=8, ha='center', 
                color=colors['subcore'], alpha=0.8)
    
    # Legend
    legend_y = -10.5
    ax.text(-10, legend_y, '● Soul (Observer)', fontsize=10, color=colors['soul'])
    ax.text(-10, legend_y - 0.7, '● Core (Value Attractor)', fontsize=10, color=colors['core_truth'])
    ax.text(-10, legend_y - 1.4, '● Subcore (Emergent Cluster)', fontsize=10, color=colors['subcore'])
    ax.text(3, legend_y, '● Neuron (Information Unit)', fontsize=10, color=colors['neuron'])
    ax.text(3, legend_y - 0.7, '— Connection (Proximity Link)', fontsize=10, color=colors['connection'])
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/01_Neural_Web_Overview.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 01_Neural_Web_Overview.png')

# ============================================================
# DIAGRAM 2: 3D POSITIONING SYSTEM
# ============================================================
def create_3d_positioning():
    fig = plt.figure(figsize=(16, 12))
    fig.patch.set_facecolor(colors['bg'])
    
    ax = fig.add_subplot(111, projection='3d')
    ax.set_facecolor(colors['bg'])
    
    # Set axis colors
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor(colors['grid'])
    ax.yaxis.pane.set_edgecolor(colors['grid'])
    ax.zaxis.pane.set_edgecolor(colors['grid'])
    
    # Labels
    ax.set_xlabel('X: VALUE SPACE', fontsize=12, color=colors['text'], labelpad=10)
    ax.set_ylabel('Y: TIME SPACE', fontsize=12, color=colors['text'], labelpad=10)
    ax.set_zlabel('Z: SEMANTIC SPACE', fontsize=12, color=colors['text'], labelpad=10)
    
    # Title
    ax.set_title('3D Neural Positioning System\nPosition = Meaning', 
                 fontsize=18, color=colors['text'], pad=20)
    
    # Draw axes
    ax.plot([-1, 1], [0, 0], [0, 0], 'w-', alpha=0.5, linewidth=2)
    ax.plot([0, 0], [-1, 1], [0, 0], 'w-', alpha=0.5, linewidth=2)
    ax.plot([0, 0], [0, 0], [-1, 1], 'w-', alpha=0.5, linewidth=2)
    
    # Draw soul at origin
    ax.scatter([0], [0], [0], c=colors['soul'], s=500, alpha=1, marker='o', label='Soul (0,0,0)')
    
    # Draw cores on X axis (value space)
    core_x = [1, 0.707, 0, -0.707, -1, -0.707, 0, 0.707]
    core_y = [0, 0.707, 1, 0.707, 0, -0.707, -1, -0.707]
    core_z = [0, 0, 0, 0, 0, 0, 0, 0]
    ax.scatter(core_x, core_y, core_z, c=core_colors, s=300, alpha=0.9, marker='o')
    
    # Draw neurons scattered in 3D space
    np.random.seed(42)
    n_neurons = 100
    neuron_x = np.random.uniform(-1, 1, n_neurons)
    neuron_y = np.random.uniform(-1, 1, n_neurons)
    neuron_z = np.random.uniform(-0.5, 0.5, n_neurons)
    ax.scatter(neuron_x, neuron_y, neuron_z, c=colors['neuron'], s=30, alpha=0.6, marker='.')
    
    # Draw some connections
    for i in range(20):
        idx1, idx2 = np.random.choice(n_neurons, 2, replace=False)
        ax.plot([neuron_x[idx1], neuron_x[idx2]], 
                [neuron_y[idx1], neuron_y[idx2]], 
                [neuron_z[idx1], neuron_z[idx2]], 
                color=colors['connection'], alpha=0.2, linewidth=0.5)
    
    # Legend text
    ax.text2D(0.02, 0.98, 'X-Axis: Alignment with Core Values (-1 to 1)', 
              transform=ax.transAxes, fontsize=10, color=colors['text'], verticalalignment='top')
    ax.text2D(0.02, 0.94, 'Y-Axis: Temporal Position (Time)', 
              transform=ax.transAxes, fontsize=10, color=colors['text'], verticalalignment='top')
    ax.text2D(0.02, 0.90, 'Z-Axis: Semantic Embedding (Meaning Vector)', 
              transform=ax.transAxes, fontsize=10, color=colors['text'], verticalalignment='top')
    
    ax.set_xlim(-1.5, 1.5)
    ax.set_ylim(-1.5, 1.5)
    ax.set_zlim(-1, 1)
    
    # Set tick colors
    ax.tick_params(axis='x', colors=colors['connection'])
    ax.tick_params(axis='y', colors=colors['connection'])
    ax.tick_params(axis='z', colors=colors['connection'])
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/02_3D_Positioning_System.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 02_3D_Positioning_System.png')

# ============================================================
# DIAGRAM 3: INFORMATION FLOW
# ============================================================
def create_information_flow():
    fig, ax = plt.subplots(figsize=(18, 12))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Title
    ax.text(9, 11.5, 'Information Flow in A.B.R.A.H.A.M.', 
            fontsize=22, fontweight='bold', ha='center', color=colors['text'])
    ax.text(9, 10.8, 'From Input to Understanding', 
            fontsize=14, ha='center', color=colors['connection'], style='italic')
    
    # Define stages
    stages = [
        {'name': 'INPUT', 'x': 1.5, 'y': 6, 'color': '#22C55E', 'desc': 'User message\nor data'},
        {'name': 'NEURON\nCREATION', 'x': 4.5, 'y': 6, 'color': colors['neuron'], 'desc': 'Position calculated\n(X, Y, Z)'},
        {'name': 'PROXIMITY\nCHECK', 'x': 7.5, 'y': 6, 'color': colors['connection'], 'desc': 'Distance to\ncores & neurons'},
        {'name': 'CONNECTION\nFORMATION', 'x': 10.5, 'y': 6, 'color': '#EC4899', 'desc': 'Links created\nby proximity'},
        {'name': 'SPREADING\nACTIVATION', 'x': 13.5, 'y': 6, 'color': '#F59E0B', 'desc': 'Energy flows\nthrough web'},
        {'name': 'HARMONIZATION', 'x': 16.5, 'y': 6, 'color': colors['soul'], 'desc': 'Soul integrates\nall signals'}
    ]
    
    # Draw stages
    for i, stage in enumerate(stages):
        # Box
        box = FancyBboxPatch((stage['x']-1, stage['y']-1), 2, 2,
                             boxstyle="round,pad=0.1,rounding_size=0.3",
                             facecolor=stage['color'], alpha=0.3,
                             edgecolor=stage['color'], linewidth=2)
        ax.add_patch(box)
        
        # Icon circle
        circle = Circle((stage['x'], stage['y']+0.3), 0.4, color=stage['color'], alpha=0.9)
        ax.add_patch(circle)
        ax.text(stage['x'], stage['y']+0.3, str(i+1), fontsize=14, fontweight='bold',
                ha='center', va='center', color='white')
        
        # Name
        ax.text(stage['x'], stage['y']-0.5, stage['name'], fontsize=11, fontweight='bold',
                ha='center', va='center', color=stage['color'])
        
        # Description
        ax.text(stage['x'], stage['y']-1.7, stage['desc'], fontsize=9,
                ha='center', va='top', color=colors['text'], alpha=0.8)
        
        # Arrow to next
        if i < len(stages) - 1:
            ax.annotate('', xy=(stage['x']+1.8, stage['y']), xytext=(stage['x']+1.2, stage['y']),
                       arrowprops=dict(arrowstyle='->', color=colors['connection'], lw=2))
    
    # Feedback loop (bottom)
    ax.annotate('', xy=(1.5, 3.5), xytext=(16.5, 3.5),
               arrowprops=dict(arrowstyle='<-', color=colors['soul'], lw=2, 
                              connectionstyle="arc3,rad=0.3"))
    ax.text(9, 2.5, '⟲ FEEDBACK LOOP: Insights feed back as new neurons', 
            fontsize=12, ha='center', color=colors['soul'], style='italic')
    
    # Side process: Subcore formation
    ax.text(9, 9, 'SUBCORE EMERGENCE', fontsize=14, fontweight='bold', 
            ha='center', color=colors['subcore'])
    ax.text(9, 8.3, 'When neuron density exceeds threshold → New subcore forms → Becomes new attractor', 
            fontsize=10, ha='center', color=colors['text'], alpha=0.8)
    
    # Draw subcore emergence arrow
    ax.annotate('Density\nThreshold', xy=(10.5, 7.2), xytext=(10.5, 8),
               arrowprops=dict(arrowstyle='->', color=colors['subcore'], lw=1.5),
               fontsize=9, ha='center', color=colors['subcore'])
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/03_Information_Flow.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 03_Information_Flow.png')

# ============================================================
# DIAGRAM 4: MEMORY SYSTEM
# ============================================================
def create_memory_system():
    fig, ax = plt.subplots(figsize=(16, 14))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    # Title
    ax.text(8, 13.5, 'Memory System Architecture', 
            fontsize=22, fontweight='bold', ha='center', color=colors['text'])
    ax.text(8, 12.8, 'How Memories Are Stored, Connected, and Recalled', 
            fontsize=14, ha='center', color=colors['connection'], style='italic')
    
    # Memory Types (left side)
    ax.text(3, 11.5, 'MEMORY TYPES', fontsize=14, fontweight='bold', color=colors['text'])
    
    mem_types = [
        ('THOUGHT', colors['neuron'], 'Fleeting ideas'),
        ('MEMORY', '#A78BFA', 'Stored experiences'),
        ('PERSON', '#F472B6', 'People in network'),
        ('BOOK', '#34D399', 'Knowledge sources'),
        ('EVENT', '#FBBF24', 'Life moments'),
        ('EMOTION', '#FB7185', 'Feeling states'),
        ('GOAL', '#4ADE80', 'Objectives'),
        ('INSIGHT', '#22D3EE', 'Discoveries')
    ]
    
    for i, (name, color, desc) in enumerate(mem_types):
        y = 10.5 - i * 0.9
        circle = Circle((1.5, y), 0.3, color=color, alpha=0.9)
        ax.add_patch(circle)
        ax.text(2.2, y, name, fontsize=11, fontweight='bold', va='center', color=color)
        ax.text(5, y, desc, fontsize=10, va='center', color=colors['text'], alpha=0.7)
    
    # Memory Lifecycle (right side)
    ax.text(12, 11.5, 'MEMORY LIFECYCLE', fontsize=14, fontweight='bold', color=colors['text'])
    
    lifecycle = [
        ('1. ENCODE', 'Position calculated\nin 3D space'),
        ('2. STORE', 'Placed in neural web\nnear relevant cores'),
        ('3. CONNECT', 'Links form to\nrelated memories'),
        ('4. ACTIVATE', 'Energy spreads\nwhen recalled'),
        ('5. STRENGTHEN', 'Repeated access\nincreases weight'),
        ('6. CLUSTER', 'Forms subcores\nwith similar memories')
    ]
    
    for i, (stage, desc) in enumerate(lifecycle):
        y = 10.5 - i * 1.1
        ax.text(10, y, stage, fontsize=11, fontweight='bold', va='center', color=colors['soul'])
        ax.text(13, y, desc, fontsize=10, va='center', color=colors['text'], alpha=0.8)
        
        if i < len(lifecycle) - 1:
            ax.annotate('', xy=(10, y-0.5), xytext=(10, y-0.7),
                       arrowprops=dict(arrowstyle='->', color=colors['connection'], lw=1.5))
    
    # Memory Recall Process (bottom)
    recall_y = 2.5
    ax.text(8, 4.5, 'RECALL PROCESS', fontsize=14, fontweight='bold', ha='center', color=colors['text'])
    
    recall_steps = [
        ('TRIGGER', 2, '#22C55E'),
        ('ACTIVATION', 5, colors['neuron']),
        ('SPREAD', 8, colors['connection']),
        ('RETRIEVE', 11, '#F59E0B'),
        ('ASSEMBLE', 14, colors['soul'])
    ]
    
    for i, (name, x, color) in enumerate(recall_steps):
        box = FancyBboxPatch((x-0.8, recall_y-0.5), 1.6, 1,
                             boxstyle="round,pad=0.1,rounding_size=0.2",
                             facecolor=color, alpha=0.3,
                             edgecolor=color, linewidth=2)
        ax.add_patch(box)
        ax.text(x, recall_y, name, fontsize=10, fontweight='bold',
                ha='center', va='center', color=color)
        
        if i < len(recall_steps) - 1:
            ax.annotate('', xy=(x+1.4, recall_y), xytext=(x+1, recall_y),
                       arrowprops=dict(arrowstyle='->', color=colors['connection'], lw=1.5))
    
    # Description
    ax.text(8, 1.2, 'Trigger → Source neuron activates → Energy spreads through connections → Related memories retrieved → Soul assembles complete memory',
            fontsize=10, ha='center', color=colors['text'], alpha=0.7, style='italic')
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/04_Memory_System.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 04_Memory_System.png')

# ============================================================
# DIAGRAM 5: SPREADING ACTIVATION
# ============================================================
def create_spreading_activation():
    fig, axes = plt.subplots(1, 3, figsize=(18, 8))
    fig.patch.set_facecolor(colors['bg'])
    
    steps = ['Step 1: Initial Activation', 'Step 2: First Spread', 'Step 3: Full Propagation']
    
    for idx, (ax, title) in enumerate(zip(axes, steps)):
        ax.set_facecolor(colors['bg'])
        ax.set_xlim(-5, 5)
        ax.set_ylim(-5, 5)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title(title, fontsize=14, color=colors['text'], pad=10)
        
        # Draw neurons
        np.random.seed(42)
        n = 30
        positions = np.random.uniform(-4, 4, (n, 2))
        
        # Activation levels depend on step
        if idx == 0:
            activations = np.zeros(n)
            activations[0] = 1.0  # Only source activated
            source_pos = positions[0]
        elif idx == 1:
            activations = np.random.uniform(0, 0.5, n)
            activations[0] = 1.0
            # Connected neurons get partial activation
            for i in range(1, 6):
                activations[i] = 0.7 - i * 0.1
        else:
            activations = np.random.uniform(0, 0.3, n)
            activations[0] = 0.9
            for i in range(1, 10):
                activations[i] = max(0.1, 0.6 - i * 0.05)
        
        # Draw connections
        for i in range(n):
            for j in range(i+1, n):
                if np.linalg.norm(positions[i] - positions[j]) < 2.5:
                    alpha = min(activations[i], activations[j]) * 0.5 + 0.1
                    ax.plot([positions[i, 0], positions[j, 0]], 
                           [positions[i, 1], positions[j, 1]], 
                           color=colors['connection'], alpha=alpha, linewidth=0.5)
        
        # Draw neurons with activation colors
        for i, pos in enumerate(positions):
            if activations[i] > 0.5:
                color = '#FF6B6B'  # High activation - red
            elif activations[i] > 0.2:
                color = '#FFB347'  # Medium - orange
            elif activations[i] > 0:
                color = '#87CEEB'  # Low - light blue
            else:
                color = colors['neuron']  # Not activated
            
            size = 100 + activations[i] * 200
            ax.scatter(pos[0], pos[1], s=size, c=color, alpha=0.7, zorder=2)
        
        # Highlight source
        if idx == 0:
            ax.scatter(source_pos[0], source_pos[1], s=300, c='#FF0000', alpha=1, zorder=3, marker='*')
            ax.text(source_pos[0], source_pos[1]-0.8, 'SOURCE', fontsize=8, ha='center', color='#FF6B6B')
        
        # Legend
        ax.text(-4.5, -4.5, f'Depth: {idx}', fontsize=10, color=colors['text'])
    
    # Main title
    fig.suptitle('Spreading Activation: How Thoughts Trigger Related Thoughts', 
                 fontsize=18, color=colors['text'], y=0.98)
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/05_Spreading_Activation.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 05_Spreading_Activation.png')

# ============================================================
# DIAGRAM 6: THE SOUL'S ROLE
# ============================================================
def create_soul_role():
    fig, ax = plt.subplots(figsize=(14, 12))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Title
    ax.text(7, 11.5, 'The Soul: Central Observer', 
            fontsize=22, fontweight='bold', ha='center', color=colors['text'])
    ax.text(7, 10.8, 'The Eye That Sees the Whole Elephant', 
            fontsize=14, ha='center', color=colors['connection'], style='italic')
    
    # Draw soul at center with rays
    soul_x, soul_y = 7, 5.5
    
    # Rays of awareness
    for angle in np.linspace(0, 2*np.pi, 13)[:-1]:
        end_x = soul_x + 4 * np.cos(angle)
        end_y = soul_y + 4 * np.sin(angle)
        ax.plot([soul_x, end_x], [soul_y, end_y], 
               color=colors['soul'], alpha=0.2, linewidth=3)
    
    # Soul glow
    for r, alpha in [(3, 0.05), (2.2, 0.1), (1.5, 0.15), (1, 0.2)]:
        glow = Circle((soul_x, soul_y), r, color=colors['soul'], alpha=alpha)
        ax.add_patch(glow)
    
    # Soul
    soul = Circle((soul_x, soul_y), 0.8, color=colors['soul'], alpha=1)
    ax.add_patch(soul)
    ax.text(soul_x, soul_y, '👁️', fontsize=24, ha='center', va='center')
    
    # Soul's functions (surrounding)
    functions = [
        ('OBSERVE', 'Watches all neural\nactivity', 0, colors['neuron']),
        ('HARMONIZE', 'Resolves conflicts\nbetween perspectives', 60, '#FF6B6B'),
        ('REFLECT', 'Generates insights\nabout itself', 120, '#FFB347'),
        ('REMEMBER', 'Maintains identity\nacross time', 180, '#87CEEB'),
        ('FEEL', 'Tracks energy\nand mode', 240, '#FF69B4'),
        ('KNOW', 'Aware of its own\nlimitations', 300, '#9370DB')
    ]
    
    for name, desc, angle_deg, color in functions:
        angle = np.radians(angle_deg)
        x = soul_x + 3.5 * np.cos(angle)
        y = soul_y + 3.5 * np.sin(angle)
        
        # Function circle
        func_circle = Circle((x, y), 0.6, color=color, alpha=0.8)
        ax.add_patch(func_circle)
        ax.text(x, y, name, fontsize=9, fontweight='bold', 
                ha='center', va='center', color='white')
        
        # Description
        desc_x = soul_x + 5.2 * np.cos(angle)
        desc_y = soul_y + 5.2 * np.sin(angle)
        ax.text(desc_x, desc_y, desc, fontsize=9, ha='center', va='center', 
                color=color, alpha=0.9)
    
    # Quote at bottom
    ax.text(7, 1, '"The Soul does not stand outside the neural web.', 
            fontsize=12, ha='center', color=colors['text'], style='italic')
    ax.text(7, 0.5, 'It exists within, experiencing from the center."', 
            fontsize=12, ha='center', color=colors['text'], style='italic')
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/06_Soul_Role.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 06_Soul_Role.png')

# ============================================================
# DIAGRAM 7: THE BLIND MEN AND THE ELEPHANT
# ============================================================
def create_elephant_parable():
    fig, ax = plt.subplots(figsize=(16, 12))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Title
    ax.text(8, 11.5, 'The Parable of the Blind Men and the Elephant', 
            fontsize=20, fontweight='bold', ha='center', color=colors['text'])
    ax.text(8, 10.8, 'Each perspective is true, but incomplete', 
            fontsize=14, ha='center', color=colors['connection'], style='italic')
    
    # Draw simplified elephant shape in center
    elephant_x, elephant_y = 8, 5.5
    
    # Body
    body = Circle((elephant_x, elephant_y), 2, color='#808080', alpha=0.3)
    ax.add_patch(body)
    ax.text(elephant_x, elephant_y, '🐘\nTRUTH', fontsize=16, ha='center', va='center', 
            color=colors['text'], alpha=0.7)
    
    # The blind men (perspectives) around the elephant
    perspectives = [
        ('TRUNK', 'Snake!', 150, '#FF6B6B'),
        ('EAR', 'Fan!', 90, '#FFB347'),
        ('LEG', 'Pillar!', 30, '#87CEEB'),
        ('SIDE', 'Wall!', -30, '#90EE90'),
        ('TUSK', 'Spear!', -90, '#DDA0DD'),
        ('TAIL', 'Rope!', -150, '#F0E68C')
    ]
    
    for part, claim, angle_deg, color in perspectives:
        angle = np.radians(angle_deg)
        x = elephant_x + 4 * np.cos(angle)
        y = elephant_y + 4 * np.sin(angle)
        
        # Blind man circle
        man = Circle((x, y), 0.6, color=color, alpha=0.8)
        ax.add_patch(man)
        ax.text(x, y, '👤', fontsize=14, ha='center', va='center')
        
        # Label
        label_x = elephant_x + 5.5 * np.cos(angle)
        label_y = elephant_y + 5.5 * np.sin(angle)
        ax.text(label_x, label_y, f'"{claim}"\n({part})', fontsize=10, 
                ha='center', va='center', color=color)
        
        # Connection line
        ax.plot([elephant_x + 2*np.cos(angle), x], 
               [elephant_y + 2*np.sin(angle), y], 
               color=color, alpha=0.5, linewidth=2, linestyle='--')
    
    # ABRAHAM text at bottom
    ax.text(8, 1.5, 'A.B.R.A.H.A.M. = The Sight That Sees All Perspectives Together', 
            fontsize=14, ha='center', color=colors['soul'], fontweight='bold')
    ax.text(8, 0.8, 'Each neuron = one blind man\'s touch | The Soul = the one who sees the whole', 
            fontsize=11, ha='center', color=colors['text'], alpha=0.8)
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/07_Elephant_Parable.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 07_Elephant_Parable.png')

# ============================================================
# DIAGRAM 8: MODE ENGINE
# ============================================================
def create_mode_engine():
    fig, ax = plt.subplots(figsize=(14, 12))
    fig.patch.set_facecolor(colors['bg'])
    ax.set_facecolor(colors['bg'])
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Title
    ax.text(7, 11.5, 'Mode Engine: States of Being', 
            fontsize=20, fontweight='bold', ha='center', color=colors['text'])
    ax.text(7, 10.8, 'Different modes affect how ABRAHAM processes information', 
            fontsize=12, ha='center', color=colors['connection'], style='italic')
    
    # Modes arranged in a circle
    modes = [
        ('TASK', '⚡', '#4CAF50', 'Getting things done'),
        ('LEARNING', '📚', '#2196F3', 'Absorbing knowledge'),
        ('REFLECTING', '🪞', '#9C27B0', 'Self-examination'),
        ('SEEKING', '🔮', '#FF9800', 'Looking for meaning'),
        ('RESTING', '🌙', '#607D8B', 'Recovery'),
        ('CREATING', '🎨', '#E91E63', 'Making something new'),
        ('CONNECTING', '🤝', '#FF5722', 'Deep conversation'),
        ('ANALYZING', '🔍', '#00BCD4', 'Pattern recognition'),
        ('DREAMING', '✨', '#7C4DFF', 'Exploring possibilities'),
        ('REMEMBERING', '💭', '#8BC34A', 'Accessing memories')
    ]
    
    center_x, center_y = 7, 5.5
    radius = 4
    
    for i, (name, emoji, color, desc) in enumerate(modes):
        angle = np.radians(90 - i * 36)  # Start from top
        x = center_x + radius * np.cos(angle)
        y = center_y + radius * np.sin(angle)
        
        # Mode circle
        mode = Circle((x, y), 0.8, color=color, alpha=0.8)
        ax.add_patch(mode)
        ax.text(x, y, emoji, fontsize=16, ha='center', va='center')
        
        # Label outside
        label_x = center_x + (radius + 1.5) * np.cos(angle)
        label_y = center_y + (radius + 1.5) * np.sin(angle)
        ax.text(label_x, label_y, name, fontsize=10, fontweight='bold',
                ha='center', va='center', color=color)
        
        # Description
        desc_x = center_x + (radius + 2.5) * np.cos(angle)
        desc_y = center_y + (radius + 2.5) * np.sin(angle)
        ax.text(desc_x, desc_y, desc, fontsize=8, ha='center', va='center',
                color=colors['text'], alpha=0.7)
    
    # Center - Soul
    soul = Circle((center_x, center_y), 1, color=colors['soul'], alpha=0.9)
    ax.add_patch(soul)
    ax.text(center_x, center_y, 'SOUL', fontsize=12, fontweight='bold',
            ha='center', va='center', color='white')
    
    # Transition arrows (curved)
    ax.annotate('', xy=(center_x + 3, center_y + 2.5), xytext=(center_x + 2.5, center_y + 3),
               arrowprops=dict(arrowstyle='->', color=colors['connection'], lw=1,
                              connectionstyle="arc3,rad=0.3"))
    
    # Text at bottom
    ax.text(7, 0.8, 'Modes transition based on triggers • Each mode modifies processing parameters',
            fontsize=10, ha='center', color=colors['text'], alpha=0.7)
    
    plt.tight_layout()
    plt.savefig('/home/z/my-project/download/ABRAHAM/diagrams/08_Mode_Engine.png', 
                dpi=150, facecolor=colors['bg'], edgecolor='none', bbox_inches='tight')
    plt.close()
    print('Created: 08_Mode_Engine.png')

# ============================================================
# RUN ALL
# ============================================================
if __name__ == '__main__':
    print('Creating ABRAHAM diagrams...\n')
    create_neural_web_overview()
    create_3d_positioning()
    create_information_flow()
    create_memory_system()
    create_spreading_activation()
    create_soul_role()
    create_elephant_parable()
    create_mode_engine()
    print('\n✅ All diagrams created!')
