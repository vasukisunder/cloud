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
    this.loading = true;
    this.startTime = Date.now();
    
    // DOM Elements
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingProgress = document.querySelector('.loading-progress');
    
    // Loading state
    this.assetsLoaded = {
      modules: false,
      content: false
    };
    
    // Event listeners
    window.addEventListener('contentLoaded', this.handleContentLoaded.bind(this));
    window.addEventListener('contentClosed', this.handleContentClosed.bind(this));
  }
  
  initialize() {
    // Begin loading assets
    this.loadModules();
    this.loadContent();
    
    // Start progress animation
    this.updateLoadingProgress();
  }
  
  loadModules() {
    // All necessary modules are loaded
    setTimeout(() => {
      this.assetsLoaded.modules = true;
      this.checkAllAssetsLoaded();
    }, 500); // Simulate module loading delay
  }
  
  loadContent() {
    // Initialize content handler - will trigger contentLoaded event when done
    this.contentHandler = new ContentHandler();
  }
  
  handleContentLoaded(event) {
    // Content is loaded, this is triggered from the ContentHandler
    this.assetsLoaded.content = true;
    this.checkAllAssetsLoaded();
  }
  
  checkAllAssetsLoaded() {
    // Check if all assets are loaded
    const allLoaded = Object.values(this.assetsLoaded).every(status => status === true);
    
    if (allLoaded && !this.initialized) {
      // Ensure minimum loading time for UX
      const loadTime = Date.now() - this.startTime;
      const minLoadTime = 2000; // Minimum 2 seconds loading screen
      
      if (loadTime >= minLoadTime) {
        this.initializeApplication();
      } else {
        setTimeout(() => {
          this.initializeApplication();
        }, minLoadTime - loadTime);
      }
    }
  }
  
  updateLoadingProgress() {
    // Update loading progress animation
    let progress = 0;
    
    const updateProgress = () => {
      // Calculate progress based on assets loaded
      const assetsLoaded = Object.values(this.assetsLoaded).filter(status => status === true).length;
      const totalAssets = Object.keys(this.assetsLoaded).length;
      const targetProgress = (assetsLoaded / totalAssets) * 100;
      
      // Smoothly approach target progress
      progress += (targetProgress - progress) * 0.1;
      
      // Update the loading bar
      if (this.loadingProgress) {
        this.loadingProgress.style.width = `${progress}%`;
      }
      
      // Continue updating until initialized
      if (this.loading) {
        requestAnimationFrame(updateProgress);
      } else if (progress > 99.5) {
        // Ensure we reach 100% when fully loaded
        this.loadingProgress.style.width = '100%';
      }
    };
    
    requestAnimationFrame(updateProgress);
  }
  
  initializeApplication() {
    this.initialized = true;
    
    // Create the grid-based navigation space
    this.navigationSpace = new NavigationSpace();
    
    // Hide loading screen
    this.hideLoadingScreen();
    
    // Show navigation
    this.navigationSpace.show();
  }
  
  hideLoadingScreen() {
    // Fade out loading screen
    this.loadingScreen.style.opacity = 0;
    this.loading = false;
    
    // Remove loading screen after animation
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 1000); // Match the CSS transition duration
  }
  
  handleContentClosed() {
    // Show navigation space when content is closed
    this.navigationSpace.show();
  }
} 