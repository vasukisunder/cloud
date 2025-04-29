// Main application entry point

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  const app = new App();
  app.initialize();
});

// Main application class
class App {
  constructor() {
    // State
    this.initialized = false;
    this.introComplete = false;
    this.contentData = null;
    
    // DOM Elements
    this.introContainer = document.getElementById('intro-container');
    this.introStepsContainer = document.querySelector('.intro-steps-container');
    this.navigationSpace = null;
    this.enterButton = document.getElementById('enter-button');
    
    // Create intro scrollama instance
    this.introScroller = scrollama();
    
    // Event listeners
    window.addEventListener('contentLoaded', this.handleContentLoaded.bind(this));
    window.addEventListener('contentClosed', this.handleContentClosed.bind(this));
    
    if (this.enterButton) {
      this.enterButton.addEventListener('click', this.completeIntro.bind(this));
    }
  }
  
  initialize() {
    // Initialize content handler
    this.contentHandler = new ContentHandler();
    
    // Load content data first
    this.loadContentData().then(() => {
      // Populate intro steps from content data
      this.populateIntroSteps();
      
      // Initialize intro scrollytelling
      this.initIntroScrollytelling();
      
      // Create grid-based navigation (but keep it hidden until intro completes)
      this.navigationSpace = new NavigationSpace();
      
      // Use a timeout to ensure everything is loaded
      setTimeout(() => {
        this.initialized = true;
      }, 500);
    });
  }

  loadContentData() {
    return fetch('content.json')
      .then(response => response.json())
      .then(data => {
        this.contentData = data;
        return data;
      })
      .catch(error => {
        console.error('Error loading content data:', error);
        // Show fallback message if content fails to load
        document.getElementById('fallback-message').style.display = 'block';
      });
  }

  populateIntroSteps() {
    // Clear existing intro steps
    if (this.introStepsContainer) {
      // Keep only the continue button
      const continueButton = document.querySelector('.intro-continue');
      this.introStepsContainer.innerHTML = '';
      
      if (this.contentData && this.contentData.sections && this.contentData.sections[0].introduction) {
        const introData = this.contentData.sections[0].introduction[0];
        
        // Create intro steps from intro data (numbered properties)
        Object.keys(introData)
          .filter(key => !isNaN(parseInt(key))) // Only use numbered properties
          .sort((a, b) => parseInt(a) - parseInt(b)) // Sort numerically
          .forEach((key, index) => {
            const step = document.createElement('div');
            step.className = 'intro-step';
            step.dataset.step = key;
            
            const paragraph = document.createElement('p');
            paragraph.textContent = introData[key];
            
            step.appendChild(paragraph);
            this.introStepsContainer.appendChild(step);
          });
        
        // Re-add the continue button
        if (continueButton) {
          this.introStepsContainer.appendChild(continueButton);
        } else {
          // Create continue button if it doesn't exist
          const newContinueButton = document.createElement('div');
          newContinueButton.className = 'intro-continue';
          newContinueButton.innerHTML = '<button id="enter-button">Enter</button>';
          this.introStepsContainer.appendChild(newContinueButton);
          
          // Re-attach event listener
          const enterButton = document.getElementById('enter-button');
          if (enterButton) {
            enterButton.addEventListener('click', this.completeIntro.bind(this));
          }
        }
      }
    }
  }
  
  initIntroScrollytelling() {
    // Initialize the scrollama for intro
    this.introScroller
      .setup({
        step: '.intro-step',
        offset: 0.6,
        debug: false
      })
      .onStepEnter(response => {
        // Add active class to current step
        response.element.classList.add('is-active');
        
        // Update grid based on step
        this.updateIntroGrid(response.index);
        
        // Show continue button on last step
        const steps = document.querySelectorAll('.intro-step');
        if (response.index === steps.length - 1) { // Last step
          document.querySelector('.intro-continue').classList.add('is-active');
        }
      })
      .onStepExit(response => {
        // Remove active class from exited step
        response.element.classList.remove('is-active');
        
        // Hide continue button if exiting last step upward
        const steps = document.querySelectorAll('.intro-step');
        if (response.index === steps.length - 1 && response.direction === 'up') {
          document.querySelector('.intro-continue').classList.remove('is-active');
        }
      });

    // Create intro grid visualization
    this.createIntroGrid();
  }
  
  createIntroGrid() {
    // Get the grid container
    const gridContainer = document.querySelector('.intro-grid-container');
    if (!gridContainer) return;
    
    // Create SVG for grid
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 200 200');
    gridContainer.appendChild(svg);
    
    // Create simple grid pattern
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grid.setAttribute('class', 'intro-grid');
    svg.appendChild(grid);
    
    // Create horizontal lines
    const spacing = 10;
    for (let y = 0; y <= 200; y += spacing) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', '200');
      line.setAttribute('y2', `${y}`);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
      line.setAttribute('stroke-width', '0.2');
      grid.appendChild(line);
    }
    
    // Create vertical lines
    for (let x = 0; x <= 200; x += spacing) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${x}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${x}`);
      line.setAttribute('y2', '200');
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
      line.setAttribute('stroke-width', '0.2');
      grid.appendChild(line);
    }
  }
  
  updateIntroGrid(stepIndex) {
    // Update grid visualization based on step
    const gridContainer = document.querySelector('.intro-grid-container');
    if (!gridContainer) return;
    
    // Set opacity based on step
    gridContainer.style.opacity = 0.2 + (stepIndex * 0.15);
    
    // Additional grid effects based on step could be added here
  }
  
  completeIntro() {
    // Hide intro container
    this.introContainer.style.opacity = 0;
    
    // After transition, hide intro and show navigation
    setTimeout(() => {
      this.introContainer.classList.add('hidden');
      
      // Show navigation space
      const navigationSpace = document.getElementById('navigation-space');
      if (navigationSpace) {
        navigationSpace.classList.remove('hidden');
      }
      
      // Show the navigation grid
      if (this.navigationSpace) {
        this.navigationSpace.show();
      }
      
      this.introComplete = true;
    }, 1000);
  }
  
  handleContentLoaded(event) {
    console.log('Content loaded:', event.detail);
  }
  
  handleContentClosed() {
    // Show navigation space when content is closed
    if (this.navigationSpace) {
      this.navigationSpace.show();
    }
  }
} 