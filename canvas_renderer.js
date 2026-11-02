/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: Interactive Visual Canvas Renderer (M5, M7, M8, M10)
 *
 * Implements:
 * - HTML5 Canvas graph rendering with tactical dark theme
 * - Interactive node dragging and repositioning
 * - Node selection (Source / Destination / Inspect)
 * - Edge status toggling (OPEN -> RESTRICTED -> BLOCKED) on click
 * - Glowing animated pulses along active rescue routes
 * - Golden highlights for Minimum Spanning Tree (MST)
 * - Step-by-step playback visualization for Dijkstra & Prim relaxations
 * - Interactive hover tooltips with edge & node metrics
 */

class GraphCanvasRenderer {
  constructor(canvasElement, graphInstance) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.graph = graphInstance;

    // Viewport & Interaction State
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDraggingNode = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.hoveredEdge = null;
    this.mousePos = { x: 0, y: 0 };

    // Active Route / Visualization State
    this.activePathEdges = [];
    this.activePathNodes = [];
    this.activeMstEdges = [];
    this.selectedSource = null;
    this.selectedTarget = null;

    // Step-by-step playback state
    this.currentStep = null;
    this.evaluatingNode = null;
    this.relaxingEdge = null;

    // Pulse animation timer
    this.animOffset = 0;
    this.animationFrameId = null;

    // Callbacks
    this.onNodeSelect = null;
    this.onEdgeClick = null;

    this.initEvents();
    this.startAnimationLoop();
  }

  setGraph(newGraph) {
    this.graph = newGraph;
    this.activePathEdges = [];
    this.activePathNodes = [];
    this.activeMstEdges = [];
    this.currentStep = null;
    this.fitGraphToView();
    this.render();
  }

  fitGraphToView() {
    const locs = this.graph.getAllLocations();
    if (locs.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const l of locs) {
      if (l.x < minX) minX = l.x;
      if (l.x > maxX) maxX = l.x;
      if (l.y < minY) minY = l.y;
      if (l.y > maxY) maxY = l.y;
    }

    const padding = 80;
    const width = maxX - minX || 400;
    const height = maxY - minY || 300;

    const scaleX = (this.canvas.width - padding * 2) / width;
    const scaleY = (this.canvas.height - padding * 2) / height;
    this.scale = Math.min(1.2, Math.max(0.65, Math.min(scaleX, scaleY)));

    this.panX = (this.canvas.width - (minX + maxX) * this.scale) / 2;
    this.panY = (this.canvas.height - (minY + maxY) * this.scale) / 2;
  }

  initEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

    // Window resize observer
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.render();
    }
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left - this.panX) / this.scale;
    const y = (clientY - rect.top - this.panY) / this.scale;
    return { x, y };
  }

  handleMouseMove(e) {
    const { x, y } = this.screenToWorld(e.clientX, e.clientY);
    this.mousePos = { x, y };

    if (this.isDraggingNode && this.draggedNode) {
      this.draggedNode.x = Math.round(x);
      this.draggedNode.y = Math.round(y);
      this.render();
      return;
    }

    // Hit test node
    let foundNode = null;
    const locs = this.graph.getAllLocations();
    for (const l of locs) {
      const dist = Math.hypot(l.x - x, l.y - y);
      if (dist <= 26) {
        foundNode = l;
        break;
      }
    }

    // Hit test edge
    let foundEdge = null;
    if (!foundNode) {
      for (const edge of this.graph.edges) {
        const u = this.graph.getLocation(edge.from);
        const v = this.graph.getLocation(edge.to);
        if (u && v && this.distToSegment({ x, y }, u, v) < 8) {
          foundEdge = edge;
          break;
        }
      }
    }

    if (this.hoveredNode !== foundNode || this.hoveredEdge !== foundEdge) {
      this.hoveredNode = foundNode;
      this.hoveredEdge = foundEdge;
      this.canvas.style.cursor = foundNode ? 'grab' : (foundEdge ? 'pointer' : 'default');
      this.render();
    }
  }

  handleMouseDown(e) {
    if (this.hoveredNode) {
      this.isDraggingNode = true;
      this.draggedNode = this.hoveredNode;
      this.canvas.style.cursor = 'grabbing';
    }
  }

  handleMouseUp() {
    if (this.isDraggingNode) {
      this.isDraggingNode = false;
      this.draggedNode = null;
      this.canvas.style.cursor = this.hoveredNode ? 'grab' : 'default';
      this.render();
    }
  }

  handleClick(e) {
    if (this.hoveredNode) {
      if (this.onNodeSelect) {
        this.onNodeSelect(this.hoveredNode);
      }
    } else if (this.hoveredEdge) {
      // Toggle edge status on click
      const current = this.hoveredEdge.status;
      const nextStatus = current === 'OPEN' ? 'RESTRICTED' : (current === 'RESTRICTED' ? 'BLOCKED' : 'OPEN');
      this.hoveredEdge.status = nextStatus;
      if (this.onEdgeClick) {
        this.onEdgeClick(this.hoveredEdge);
      }
      this.render();
    }
  }

  handleDoubleClick(e) {
    if (this.hoveredEdge) {
      // Cycle edge status
      this.handleClick(e);
    }
  }

  distToSegment(p, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // --- Highlighting APIs ---
  setActivePath(pathNodeIds, edges = []) {
    this.activePathNodes = pathNodeIds || [];
    this.activePathEdges = edges || [];
    this.activeMstEdges = [];
    this.render();
  }

  setMstResult(mstEdges) {
    this.activeMstEdges = mstEdges || [];
    this.activePathNodes = [];
    this.activePathEdges = [];
    this.render();
  }

  setStepHighlight(step) {
    this.currentStep = step;
    this.evaluatingNode = step?.node || step?.from || null;
    this.relaxingEdge = step?.to ? { from: step.from, to: step.to } : null;
    this.render();
  }

  clearHighlights() {
    this.activePathEdges = [];
    this.activePathNodes = [];
    this.activeMstEdges = [];
    this.currentStep = null;
    this.evaluatingNode = null;
    this.relaxingEdge = null;
    this.render();
  }

  startAnimationLoop() {
    const animate = () => {
      this.animOffset = (this.animOffset + 0.8) % 30;
      if (this.activePathEdges.length > 0) {
        this.render();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save viewport state
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // 1. Draw subtle tactical grid
    this.drawGrid(ctx);

    // 2. Draw Edges
    for (const edge of this.graph.edges) {
      this.drawEdge(ctx, edge);
    }

    // 3. Draw Active Route overlay (if any)
    if (this.activePathEdges.length > 0) {
      this.drawActiveRouteOverlay(ctx);
    }

    // 4. Draw MST overlay (if any)
    if (this.activeMstEdges.length > 0) {
      this.drawMstOverlay(ctx);
    }

    // 5. Draw Nodes
    for (const loc of this.graph.getAllLocations()) {
      this.drawNode(ctx, loc);
    }

    // 6. Draw Step-by-Step active relaxation markers
    if (this.relaxingEdge) {
      this.drawRelaxingMarker(ctx, this.relaxingEdge);
    }

    // Restore viewport state
    ctx.restore();

    // 7. Draw Tooltips in screen coordinates
    this.drawTooltip(ctx);
  }

  drawGrid(ctx) {
    const w = this.canvas.width / this.scale + 1000;
    const h = this.canvas.height / this.scale + 1000;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    const gridSize = 40;
    const startX = -this.panX / this.scale - 200;
    const startY = -this.panY / this.scale - 200;

    ctx.beginPath();
    for (let x = startX - (startX % gridSize); x < startX + w; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + h);
    }
    for (let y = startY - (startY % gridSize); y < startY + h; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + w, y);
    }
    ctx.stroke();
  }

  drawEdge(ctx, edge) {
    const u = this.graph.getLocation(edge.from);
    const v = this.graph.getLocation(edge.to);
    if (!u || !v) return;

    const isHovered = this.hoveredEdge === edge;
    const cost = this.graph.calculateEdgeCost(edge);

    ctx.save();

    // Status styling
    if (edge.status === 'BLOCKED') {
      ctx.strokeStyle = isHovered ? '#ef4444' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = isHovered ? 3.5 : 2.5;
      ctx.setLineDash([8, 6]);
    } else if (edge.status === 'RESTRICTED') {
      ctx.strokeStyle = isHovered ? '#f59e0b' : 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = isHovered ? 4 : 2.5;
      ctx.setLineDash([6, 4]);
    } else {
      ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = isHovered ? 3.5 : 2;
      ctx.setLineDash([]);
    }

    // Line
    ctx.beginPath();
    ctx.moveTo(u.x, u.y);
    ctx.lineTo(v.x, v.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Edge Arrow if directed
    if (edge.isDirected) {
      this.drawArrowhead(ctx, u.x, u.y, v.x, v.y, ctx.strokeStyle);
    }

    // Midpoint Badge with Weight & Status Indicator
    const midX = (u.x + v.x) / 2;
    const midY = (u.y + v.y) / 2;

    this.drawEdgeBadge(ctx, midX, midY, edge, cost, isHovered);

    ctx.restore();
  }

  drawEdgeBadge(ctx, x, y, edge, cost, isHovered) {
    ctx.save();
    let text = `${edge.distance}km / ${edge.time}m`;
    if (edge.status === 'BLOCKED') {
      text = 'BLOCKED ✖';
    } else if (edge.status === 'RESTRICTED') {
      text = `! Cost:${cost.toFixed(1)}`;
    } else {
      text = `W:${cost.toFixed(1)}`;
    }

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const pad = 6;

    // Badge background
    ctx.fillStyle = edge.status === 'BLOCKED' 
      ? 'rgba(185, 28, 28, 0.9)'
      : (edge.status === 'RESTRICTED' ? 'rgba(180, 83, 9, 0.9)' : (isHovered ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.85)'));
    
    ctx.strokeStyle = edge.status === 'BLOCKED' ? '#f87171' : (edge.status === 'RESTRICTED' ? '#fbbf24' : '#475569');
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2 - pad, y - 9, textWidth + pad * 2, 18, 6);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = edge.status === 'BLOCKED' ? '#fecaca' : (edge.status === 'RESTRICTED' ? '#fef08a' : '#e2e8f0');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawArrowhead(ctx, fromX, fromY, toX, toY, color) {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const targetX = toX - 25 * Math.cos(angle);
    const targetY = toY - 25 * Math.sin(angle);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(targetX - headlen * Math.cos(angle - Math.PI / 6), targetY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(targetX - headlen * Math.cos(angle + Math.PI / 6), targetY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawActiveRouteOverlay(ctx) {
    ctx.save();
    for (let i = 0; i < this.activePathNodes.length - 1; i++) {
      const u = this.graph.getLocation(this.activePathNodes[i]);
      const v = this.graph.getLocation(this.activePathNodes[i + 1]);
      if (!u || !v) continue;

      // Glowing underlayer
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();

      // Main glowing rescue track
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();

      // Animated energy dash pulses
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 16]);
      ctx.lineDashOffset = -this.animOffset;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMstOverlay(ctx) {
    ctx.save();
    ctx.strokeStyle = '#fbbf24'; // Golden amber
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    for (const edge of this.activeMstEdges) {
      const u = this.graph.getLocation(edge.from);
      const v = this.graph.getLocation(edge.to);
      if (!u || !v) continue;

      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRelaxingMarker(ctx, edgePair) {
    const u = this.graph.getLocation(edgePair.from);
    const v = this.graph.getLocation(edgePair.to);
    if (!u || !v) return;

    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(u.x, u.y);
    ctx.lineTo(v.x, v.y);
    ctx.stroke();
    ctx.restore();
  }

  drawNode(ctx, loc) {
    const isHovered = this.hoveredNode === loc;
    const isSource = this.selectedSource === loc.id;
    const isTarget = this.selectedTarget === loc.id;
    const isInPath = this.activePathNodes.includes(loc.id);
    const isEvaluating = this.evaluatingNode === loc.id;

    ctx.save();

    // Node Type Theme Configuration
    const styles = {
      base: { bg: '#2563eb', border: '#60a5fa', icon: '🏠', label: 'BASE' },
      hospital: { bg: '#059669', border: '#34d399', icon: '🏥', label: 'HOSP' },
      incident: { bg: '#dc2626', border: '#f87171', icon: '⚠️', label: 'INCIDENT' },
      shelter: { bg: '#7c3aed', border: '#a78bfa', icon: '⛺', label: 'SHELTER' },
      supply: { bg: '#d97706', border: '#fbbf24', icon: '📦', label: 'SUPPLY' },
      junction: { bg: '#334155', border: '#94a3b8', icon: '⚪', label: 'JUNCTION' }
    };
    const style = styles[loc.type] || styles.junction;

    const radius = isHovered ? 24 : 20;

    // Glowing halo if in path, evaluating, or selected
    if (isInPath || isSource || isTarget || isEvaluating) {
      ctx.save();
      const haloColor = isSource ? 'rgba(59, 130, 246, 0.5)' :
                        (isTarget ? 'rgba(16, 185, 129, 0.5)' :
                        (isEvaluating ? 'rgba(244, 63, 94, 0.6)' : 'rgba(52, 211, 153, 0.4)'));
      ctx.fillStyle = haloColor;
      ctx.beginPath();
      ctx.arc(loc.x, loc.y, radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Node body circle
    ctx.fillStyle = style.bg;
    ctx.strokeStyle = isSource ? '#60a5fa' : (isTarget ? '#34d399' : (isEvaluating ? '#f43f5e' : style.border));
    ctx.lineWidth = (isSource || isTarget || isEvaluating) ? 3.5 : 2;

    ctx.beginPath();
    ctx.arc(loc.x, loc.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icon in center
    ctx.font = `${radius * 0.9}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style.icon, loc.x, loc.y);

    // Node ID / Name Label
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(loc.name || loc.id, loc.x, loc.y + radius + 6);

    // Badge for Source/Target
    if (isSource || isTarget) {
      const badgeText = isSource ? 'START (S)' : 'DEST (T)';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = isSource ? '#3b82f6' : '#10b981';
      ctx.beginPath();
      ctx.roundRect(loc.x - 26, loc.y - radius - 16, 52, 14, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, loc.x, loc.y - radius - 9);
    }

    ctx.restore();
  }

  drawTooltip(ctx) {
    if (!this.hoveredNode && !this.hoveredEdge) return;

    ctx.save();
    let title = '';
    let rows = [];

    if (this.hoveredNode) {
      const n = this.hoveredNode;
      title = `${n.name} [ID: ${n.id}]`;
      rows.push(`Type: ${n.type.toUpperCase()}`);
      rows.push(`Status: ${n.status}`);
      if (n.notes) rows.push(`Note: ${n.notes}`);
      rows.push(`Click to Select | Drag to Reposition`);
    } else if (this.hoveredEdge) {
      const e = this.hoveredEdge;
      const cost = this.graph.calculateEdgeCost(e);
      title = `Route Link: ${e.from} ↔ ${e.to}`;
      rows.push(`Status: ${e.status} (Click to toggle)`);
      rows.push(`Travel Time: ${e.time} mins | Distance: ${e.distance} km`);
      rows.push(`Hazard/Risk Score: ${e.risk}/10 | Capacity: ${e.capacity} veh/h`);
      rows.push(`Calculated Operational Cost: ${cost.toFixed(2)}`);
    }

    // Measure dimensions
    ctx.font = 'bold 12px sans-serif';
    let maxWidth = ctx.measureText(title).width;
    ctx.font = '11px sans-serif';
    for (const r of rows) {
      maxWidth = Math.max(maxWidth, ctx.measureText(r).width);
    }

    const padding = 10;
    const boxW = maxWidth + padding * 2;
    const boxH = 26 + rows.length * 16 + padding;

    // Convert mouse world pos to screen pos
    const screenX = this.mousePos.x * this.scale + this.panX + 15;
    const screenY = this.mousePos.y * this.scale + this.panY + 15;

    // Clamp inside canvas
    const drawX = Math.min(this.canvas.width - boxW - 10, Math.max(10, screenX));
    const drawY = Math.min(this.canvas.height - boxH - 10, Math.max(10, screenY));

    // Box background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Render title
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, drawX + padding, drawY + padding);

    // Render rows
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    rows.forEach((r, idx) => {
      ctx.fillText(r, drawX + padding, drawY + padding + 18 + idx * 16);
    });

    ctx.restore();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GraphCanvasRenderer };
} else {
  window.GraphCanvasRenderer = GraphCanvasRenderer;
}
