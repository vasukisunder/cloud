// Grid-based Navigation System

class NavigationSpace {
  constructor() {
    // Configuration
    this.config = {
      gridSize: 100,
      gridDivisions: 50,
      gridColor: '#333333',
      secondaryGridColor: '#222222',
      hoverColor: '#ffffff',
      activeColor: '#ffffff',
      transitionDuration: 0.3
    };

    // Scene setup
    this.container = document.getElementById('navigation-space');
    this.chapters = {};
    this.currentHover = null;
    
    // Initialize
    this.createEnvironment();
    this.loadChapters();
    
    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  createEnvironment() {
    // Create the grid background
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';
    this.container.appendChild(this.gridContainer);
    
    // Create SVG patterns
    this.createSvgPatterns();
    
    // Create the chapter container
    this.chapterContainer = document.createElement('div');
    this.chapterContainer.className = 'chapter-container';
    this.container.appendChild(this.chapterContainer);
  }
  
  createSvgPatterns() {
    // Create SVG container
    const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('class', 'grid-svg');
    svgContainer.setAttribute('width', '100%');
    svgContainer.setAttribute('height', '100%');
    svgContainer.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svgContainer.setAttribute('viewBox', '0 0 200 200');
    this.gridContainer.appendChild(svgContainer);
    
    // Create patterns for each chapter
    this.createTunnelGrid(svgContainer, 'default-grid');
    this.createWavyGrid(svgContainer, 'surveillance-grid');
    this.createFlowingLines(svgContainer, 'algorithms-grid');
    this.createPerspectiveGrid(svgContainer, 'war-grid');
    this.createDistortedGrid(svgContainer, 'corporations-grid');
    this.createTerrainGrid(svgContainer, 'extraction-grid');
    
    // Set default grid as visible
    document.getElementById('default-grid').classList.add('visible');
  }
  
  createTunnelGrid(container, id) {
    // Create simple graph paper grid pattern
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    // Create horizontal lines
    const spacing = 10; // Grid spacing
    for (let y = 0; y <= 200; y += spacing) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', '200');
      line.setAttribute('y2', `${y}`);
      line.setAttribute('stroke', 'rgba(180, 180, 180, 0.1)');
      line.setAttribute('stroke-width', '0.2');
      group.appendChild(line);
    }
    
    // Create vertical lines
    for (let x = 0; x <= 200; x += spacing) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${x}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${x}`);
      line.setAttribute('y2', '200');
      line.setAttribute('stroke', 'rgba(180, 180, 180, 0.1)');
      line.setAttribute('stroke-width', '0.2');
      group.appendChild(line);
    }
  }
  
  createWavyGrid(container, id) {
    // Create wavy grid pattern (like the second image)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    // Horizontal wavy lines
    for (let i = 0; i < 40; i++) {
      const y = i * 5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      let d = `M 0 ${y}`;
      for (let x = 0; x <= 200; x += 4) {
        const waveHeight = Math.sin(x / 20 + i) * (2 + i % 3);
        d += ` L ${x} ${y + waveHeight}`;
      }
      
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'rgba(100, 150, 220, 0.15)');
      path.setAttribute('stroke-width', '0.3');
      path.setAttribute('fill', 'none');
      group.appendChild(path);
    }
    
    // Vertical wavy lines
    for (let i = 0; i < 40; i++) {
      const x = i * 5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      let d = `M ${x} 0`;
      for (let y = 0; y <= 200; y += 4) {
        const waveWidth = Math.sin(y / 20 + i) * (1 + i % 3);
        d += ` L ${x + waveWidth} ${y}`;
      }
      
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'rgba(100, 150, 220, 0.15)');
      path.setAttribute('stroke-width', '0.3');
      path.setAttribute('fill', 'none');
      group.appendChild(path);
    }
  }
  
  createFlowingLines(container, id) {
    // Create flowing lines pattern (like the third image)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    for (let i = 0; i < 60; i++) {
      const y = i * 3.5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      let d = `M 0 ${y}`;
      let prevY = y;
      
      for (let x = 4; x <= 200; x += 4) {
        // Create a wave pattern with increasing amplitude in the middle
        const centerEffect = Math.sin((x - 100) / 200 * Math.PI) * 10;
        const noise = Math.sin(x / 10 + i) * (1 + centerEffect);
        const newY = prevY + noise;
        d += ` L ${x} ${newY}`;
        prevY = newY;
      }
      
      path.setAttribute('d', d);
      
      // Gradient color effect from dark to light green in the middle
      const brightness = Math.sin((i / 60) * Math.PI) * 0.6 + 0.3;
      path.setAttribute('stroke', `rgba(${50 + brightness * 100}, ${200 + brightness * 55}, ${50 + brightness * 50}, 0.2)`);
      path.setAttribute('stroke-width', '0.3');
      path.setAttribute('fill', 'none');
      group.appendChild(path);
    }
  }
  
  createPerspectiveGrid(container, id) {
    // Create perspective grid (like the fourth image)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    // Horizontal lines receding to horizon
    for (let i = 0; i < 30; i++) {
      const y = 60 + i * (140 / 30); // Start from 30% down the canvas
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', '200');
      line.setAttribute('y2', `${y}`);
      line.setAttribute('stroke', 'rgba(180, 80, 80, 0.15)');
      line.setAttribute('stroke-width', '0.3');
      group.appendChild(line);
    }
    
    // Vertical lines for perspective
    const vanishingPointX = 100; // Center of the canvas
    const vanishingPointY = 60; // 30% down from the top
    
    for (let i = 0; i <= 40; i++) {
      const x = i * 5;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${vanishingPointX}`);
      line.setAttribute('y1', `${vanishingPointY}`);
      line.setAttribute('x2', `${x}`);
      line.setAttribute('y2', '200');
      line.setAttribute('stroke', 'rgba(180, 80, 80, 0.15)');
      line.setAttribute('stroke-width', '0.3');
      group.appendChild(line);
    }
  }
  
  createDistortedGrid(container, id) {
    // Create distorted grid for corporations
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    // Create a grid with vertical building-like structures
    for (let i = 0; i < 25; i++) {
      const x = 20 + i * 6.5;
      
      // Building height varies
      const height = 120 + Math.random() * 60;
      const y = 200 - height;
      
      // Building
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${x}`);
      rect.setAttribute('y', `${y}`);
      rect.setAttribute('width', '3');
      rect.setAttribute('height', `${height}`);
      rect.setAttribute('stroke', 'rgba(80, 200, 180, 0.15)');
      rect.setAttribute('stroke-width', '0.3');
      rect.setAttribute('fill', 'none');
      group.appendChild(rect);
      
      // Windows
      for (let j = 0; j < 6; j++) {
        for (let k = 0; k < Math.floor(height / 20); k++) {
          const windowWidth = 0.5;
          const windowX = x + j * 0.5;
          const windowY = y + k * 20 + 2;
          
          if (Math.random() > 0.3) { // Some windows are lit
            const windowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            windowRect.setAttribute('x', `${windowX}`);
            windowRect.setAttribute('y', `${windowY}`);
            windowRect.setAttribute('width', `${windowWidth}`);
            windowRect.setAttribute('height', '0.5');
            windowRect.setAttribute('fill', 'rgba(80, 200, 180, 0.2)');
            group.appendChild(windowRect);
          }
        }
      }
    }
    
    // Grid lines
    for (let i = 0; i < 40; i++) {
      const y = i * 5;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', '200');
      line.setAttribute('y2', `${y}`);
      line.setAttribute('stroke', 'rgba(80, 200, 180, 0.08)');
      line.setAttribute('stroke-width', '0.3');
      group.appendChild(line);
    }
  }
  
  createTerrainGrid(container, id) {
    // Create terrain pattern for extraction
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', id);
    group.setAttribute('class', 'grid-pattern');
    container.appendChild(group);
    
    // Generate terrain layers
    for (let i = 0; i < 25; i++) {
      const baseY = 60 + i * 5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      let d = `M 0 ${baseY}`;
      
      for (let x = 0; x <= 200; x += 2) {
        // Create jagged terrain-like lines
        const noise = Math.sin(x / 20) * 2 + Math.cos(x / 10) * 1.5 + Math.sin(x / 40 + i) * 3;
        const y = baseY + noise;
        d += ` L ${x} ${y}`;
      }
      
      // Add vertical line at the end
      d += ` L 200 200 L 0 200 Z`;
      
      path.setAttribute('d', d);
      
      // Brown gradient for ground layers
      const opacity = 0.01 + (i / 25) * 0.01;
      path.setAttribute('fill', `rgba(120, 80, 30, ${opacity})`);
      path.setAttribute('stroke', 'rgba(120, 80, 30, 0.15)');
      path.setAttribute('stroke-width', '0.3');
      group.appendChild(path);
    }
    
    // Add some "ore veins"
    for (let i = 0; i < 15; i++) {
      const x = 10 + Math.random() * 180;
      const y = 60 + Math.random() * 120;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M ${x} ${y}`;
      
      // Create random vein path
      for (let j = 0; j < 5; j++) {
        const newX = x + (Math.random() * 20 - 10);
        const newY = y + (Math.random() * 20);
        d += ` L ${newX} ${newY}`;
      }
      
    
    }
  }
  
  loadChapters() {
    // Fetch chapter data from content.json
    fetch('content.json')
      .then(response => response.json())
      .then(data => {
        this.chapters = data.sections[0];
        this.createChapterNodes();
      })
      .catch(error => {
        console.error('Error loading chapters:', error);
      });
  }
  
  createChapterNodes() {
    // Clear existing nodes
    this.chapterContainer.innerHTML = '';
    
    // Create nodes for each chapter
    Object.entries(this.chapters).forEach(([key, data], index) => {
      // Skip introduction and conclusion for now
      if (key === 'introduction' || key === 'conclusion') return;
      
      // Create chapter node
      const node = document.createElement('div');
      node.className = 'chapter-node';
      node.dataset.key = key;
      
      // Create chapter pattern
      const pattern = document.createElement('div');
      pattern.className = `chapter-pattern ${key}-pattern`;
      node.appendChild(pattern);
      
      // Create chapter title
      const title = document.createElement('div');
      title.className = 'chapter-title';
      title.textContent = data[0].title || this.capitalizeFirstLetter(key);
      node.appendChild(title);
      
      // Add hover and click events
      node.addEventListener('mouseenter', () => this.onNodeHover(node, key));
      node.addEventListener('mouseleave', () => this.onNodeLeave(node, key));
      node.addEventListener('click', () => this.selectChapter(key));
      
      // Add to container
      this.chapterContainer.appendChild(node);
      
      // Store reference
      this.chapters[key].node = node;
    });
  }
  
  onNodeHover(node, key) {
    // Reset previous hover
    if (this.currentHover) {
      this.currentHover.classList.remove('hover');
    }
    
    // Set new hover
    node.classList.add('hover');
    this.currentHover = node;
    
    // Update grid pattern - hide current and show new
    document.querySelectorAll('.grid-pattern').forEach(pattern => {
      pattern.classList.remove('visible');
    });
    
    // Show the grid pattern that matches the chapter
    const patternId = `${key}-grid`;
    const pattern = document.getElementById(patternId);
    if (pattern) {
      pattern.classList.add('visible');
    } else {
      document.getElementById('default-grid').classList.add('visible');
    }
  }
  
  onNodeLeave(node, key) {
    // Remove hover
    node.classList.remove('hover');
    this.currentHover = null;
    
    // Reset grid pattern
    document.querySelectorAll('.grid-pattern').forEach(pattern => {
      pattern.classList.remove('visible');
    });
    document.getElementById('default-grid').classList.add('visible');
  }
  
  selectChapter(key) {
    // Hide navigation
    this.container.classList.add('hidden');
    
    // Show content container
    const contentContainer = document.getElementById('content-container');
    contentContainer.classList.remove('hidden');
    contentContainer.classList.add('visible');
    
    // Trigger chapter selection event
    const event = new CustomEvent('chapterSelected', { detail: { key } });
    window.dispatchEvent(event);
  }
  
  // Capitalize first letter helper
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  onWindowResize() {
    // Update grid size if needed
    this.updateGridSize();
  }
  
  updateGridSize() {
    // Set container to fill the entire screen
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.gridContainer.classList.add('dynamic-grid-container');
  }
  
  show() {
    this.container.classList.remove('hidden');
    // Ensure grid is sized correctly when shown
    this.updateGridSize();
  }
  
  hide() {
    this.container.classList.add('hidden');
  }
}

// Export the navigation space class
if (typeof module !== 'undefined') {
  module.exports = NavigationSpace;
} 