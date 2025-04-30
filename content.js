// Content handler for scrollytelling experience

class ContentHandler {
  constructor() {
    // DOM Elements
    this.container = document.getElementById('content-container');
    this.scrollContainer = document.getElementById('scroll-container');
    this.returnButton = document.querySelector('.return-button');
    
    // Scrollama instance
    this.scroller = scrollama();
    
    // State
    this.currentChapter = null;
    this.contentData = null;
    this.backgroundImages = {
      // Default images per chapter - can be customized
      introduction: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000',
      war: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?q=80&w=2000',
      surveillance: 'https://images.unsplash.com/photo-1547499681-28dece7dba00?q=80&w=2000',
      corporations: 'https://images.unsplash.com/photo-1515456072058-57afaed06bf9?q=80&w=2000',
      extraction: 'https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?q=80&w=2000',
      algorithms: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000',
      conclusion: 'https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?q=80&w=2000'
    };
    
    // Event Listeners
    this.returnButton.addEventListener('click', this.closeContent.bind(this));
    window.addEventListener('chapterSelected', this.handleChapterSelection.bind(this));
    
    // Initialize
    this.loadContent();
  }
  
  async loadContent() {
    try {
      // Fetch content data
      const response = await fetch('content.json');
      if (!response.ok) throw new Error('Failed to load content');
      
      this.contentData = await response.json();
      
      // Debug the content structure
      console.log('Content loaded:', Object.keys(this.contentData.sections[0]));
      
      // Trigger content loaded event
      const event = new CustomEvent('contentLoaded', { 
        detail: { content: this.contentData }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error loading content:', error);
      this.showLoadingError();
    }
  }
  
  showLoadingError() {
    if (this.scrollContainer) {
      this.scrollContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load content. Please check your internet connection and try again.</p>
        </div>
      `;
    }
  }
  
  handleChapterSelection(event) {
    const { key } = event.detail;
    console.log(`Chapter selected: ${key}`);
    this.showChapter(key);
  }
  
  showChapter(key) {
    if (!this.contentData) {
      // If content isn't loaded yet, try to load it first
      this.loadContent().then(() => {
        if (this.contentData) {
          this.showChapter(key);
        }
      });
      return;
    }
    
    // Find chapter in content data
    const chapter = this.contentData.sections[0][key];
    if (!chapter) {
      console.error(`Chapter "${key}" not found in content data`);
      return;
    }
    
    console.log(`Showing chapter ${key} with ${chapter.length} segments`);
    
    // Store current chapter
    this.currentChapter = key;
    
    // Clear existing content
    this.scrollContainer.innerHTML = '';
    
    // Create structured content for sticky scrollytelling
    const scrollContent = document.createElement('div');
    scrollContent.className = 'scroll-content';
    
    // Create sticky graphic container (will remain fixed)
    const stickyGraphic = document.createElement('div');
    stickyGraphic.className = 'sticky-graphic';
    
    // Create container for steps (will scroll)
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';
    
    // Create chapter heading elements
    const segment = chapter[0];
    
    // Create title
    const titleSection = document.createElement('div');
    titleSection.className = 'chapter-intro';
    
    if (segment.kicker) {
      const kicker = document.createElement('div');
      kicker.className = 'chapter-kicker';
      kicker.textContent = segment.kicker;
      titleSection.appendChild(kicker);
    }
    
    const title = document.createElement('h1');
    title.className = 'chapter-title';
    title.textContent = segment.title || this.capitalizeFirstLetter(key);
    titleSection.appendChild(title);
    
    stepsContainer.appendChild(titleSection);
    
    console.log(`Creating content steps for chapter: ${key}`);
    console.log('Chapter data:', JSON.stringify(segment));
    
    // Extract and create steps from the numbered keys in the first segment
    const numericKeys = Object.keys(segment)
      .filter(k => !isNaN(parseInt(k)))
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    console.log(`Found ${numericKeys.length} numeric keys in segment`);
    
    // Create background images for each step
    numericKeys.forEach((key, index) => {
      // Create a background div for each step
      const bgImage = document.createElement('div');
      bgImage.className = 'graphic-background';
      bgImage.id = `bg-${key}`;
      
      // Set background image - either from explicit mapping or fallback to chapter image
      // This could be extended to use specific images per paragraph/step
      const bgImageUrl = this.getBackgroundImage(key, index) || this.backgroundImages[this.currentChapter];
      bgImage.dataset.bgImage = bgImageUrl;
      
      stickyGraphic.appendChild(bgImage);
    });
    
    // Create a step for each numeric key
    numericKeys.forEach(key => {
      const text = segment[key];
      if (!text) return;
      
      const step = document.createElement('div');
      step.className = 'step';
      step.setAttribute('data-step', key);
      step.setAttribute('data-background', `bg-${key}`);
      
      const p = document.createElement('p');
      p.textContent = text;
      step.appendChild(p);
      
      stepsContainer.appendChild(step);
      console.log(`Added step ${key} with text: ${text.substring(0, 50)}...`);
    });
    
    // Add chapter navigation buttons
    this.addChapterNavigation(stepsContainer, key);
    
    // Add components to the DOM
    scrollContent.appendChild(stickyGraphic);
    scrollContent.appendChild(stepsContainer);
    this.scrollContainer.appendChild(scrollContent);
    
    // Debug: check if any steps were added
    const stepCount = this.scrollContainer.querySelectorAll('.step').length;
    console.log(`Total steps added: ${stepCount}`);
    
    if (stepCount === 0) {
      console.warn('No steps created, adding fallback content');
      stepsContainer.innerHTML = '';
      
      const fallbackStep = document.createElement('div');
      fallbackStep.className = 'step';
      fallbackStep.setAttribute('data-step', '1');
      
      const fallbackContent = document.createElement('p');
      fallbackContent.textContent = 'No content found for this chapter. This might be a data format issue.';
      fallbackStep.appendChild(fallbackContent);
      
      // Add debug info
      const debugInfo = document.createElement('div');
      debugInfo.className = 'debug-info';
      debugInfo.innerHTML = `
        <p>Debug: Segment structure for first item:</p>
        <pre>${JSON.stringify(segment, null, 2)}</pre>
      `;
      fallbackStep.appendChild(debugInfo);
      
      stepsContainer.appendChild(fallbackStep);
    }
    
    // Show content container
    console.log('Showing content container');
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
    
    // Show return button
    if (this.returnButton) {
      this.returnButton.classList.remove('hidden');
    }
    
    // Initialize scrollama after a short delay
    setTimeout(() => {
      this.initScrollama();
      
      // Force scroll to top
      this.container.scrollTop = 0;
      
      // Activate first background and step
      const firstBg = document.querySelector('.graphic-background');
      const firstStep = document.querySelector('.step');
      if (firstBg) firstBg.classList.add('is-active');
      if (firstStep) {
        firstStep.classList.add('is-active');
        console.log('First step activated');
      } else {
        console.error('No steps found to activate');
      }
      
      // Make sure content is scrollable
      this.ensureContentScrollable();
      
    }, 1000);
  }
  
  // Get a background image for a specific step
  getBackgroundImage(stepKey, index) {
    // Specific image mapping for each paragraph/step in each chapter
    // Format: chapterName -> stepKey (paragraph number) -> image URL
    const specificImageMapping = {
      'introduction': {
        '1': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1534996858221-380b92700493?q=80&w=2000',
        '3': 'https://images.unsplash.com/photo-1532966656091-603eecc33772?q=80&w=2000',
        '4': 'https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?q=80&w=2000',
        // Add mappings for all paragraph numbers in introduction
      },
      'war': {
        '1': 'assets/images/B-24Ds_fly_over_Polesti_during_World_War_II.jpg',  
        '2': 'assets/images/computer-Colossus-Bletchley-Park-Buckinghamshire-England-Funding-1943.jpg',
        '3': 'assets/images/Hanford_N_Reactor_adjusted_2022-06-13-203721_uodb.jpg',
        '4': 'assets/images/Hanford_N_Reactor_adjusted_2022-06-13-203721_uodb.jpg',
        '5': 'assets/images/Gadget2.jpg',
        '6': 'assets/images/atomic-cloud-over-hiroshima-from-matsuyama-.jpg',
        '7': 'assets/images/atomic-cloud-over-hiroshima-from-matsuyama-.jpg',
        '8': 'assets/images/hiroshima-bombing-article-about-atomic-bomb.jpg',
        // Add mappings for all paragraph numbers in war
      },
      'surveillance': {
        '1': 'https://images.unsplash.com/photo-1521342475957-8db764a86913?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1632690084078-5f536e0e1ee4?q=80&w=2000',
        '3': 'https://images.unsplash.com/photo-1496368077930-c1e31b4e5b44?q=80&w=2000',
        '4': 'https://images.unsplash.com/photo-1547499681-28dece7dba00?q=80&w=2000',
        '5': 'https://images.unsplash.com/photo-1563294723-cef6a652b7e3?q=80&w=2000',
        '6': 'https://images.unsplash.com/photo-1614064696528-06a0963f8951?q=80&w=2000',
        '7': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2000',
        '8': 'https://images.unsplash.com/photo-1638867269318-34052882af5a?q=80&w=2000',
        // Add mappings for all paragraph numbers in surveillance
      },
      'corporations': {
        '1': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1515456072058-57afaed06bf9?q=80&w=2000', 
        '3': 'https://images.unsplash.com/photo-1583191040708-a3cf5ce539a0?q=80&w=2000',
        '4': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2000',
        '5': 'https://images.unsplash.com/photo-1542744173-8e7e53415f60?q=80&w=2000',
        '6': 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?q=80&w=2000',
        // Add mappings for all paragraph numbers in corporations
      },
      'extraction': {
        '1': 'https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1576087071495-f5a3ab5190d0?q=80&w=2000',
        '3': 'https://images.unsplash.com/photo-1626163015474-342638ecce36?q=80&w=2000',
        '4': 'https://images.unsplash.com/photo-1575555657425-0a4fff2fff84?q=80&w=2000',
        '5': 'https://images.unsplash.com/photo-1588611900331-49842d1a8b3c?q=80&w=2000',
        '6': 'https://images.unsplash.com/photo-1558492426-df14e290aefa?q=80&w=2000',
        '7': 'https://images.unsplash.com/photo-1615666216352-0be4cfb70a4a?q=80&w=2000',
        // Add mappings for all paragraph numbers in extraction
      },
      'algorithms': {
        '1': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1539683255143-73a6b838b106?q=80&w=2000',
        '3': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2000',
        '4': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000',
        '5': 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?q=80&w=2000',
        '6': 'https://images.unsplash.com/photo-1511075675422-c8e008f749d7?q=80&w=2000',
        '7': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2000',
        // Add mappings for all paragraph numbers in algorithms
      },
      'conclusion': {
        '1': 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=2000',
        '2': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000',
        // Add mappings for all paragraph numbers in conclusion
      }
    };

    // Try to get the specific image mapping for this chapter and step
    if (this.currentChapter && 
        specificImageMapping[this.currentChapter] && 
        specificImageMapping[this.currentChapter][stepKey]) {
      return specificImageMapping[this.currentChapter][stepKey];
    }
    
    // Fallback to default chapter image if no specific mapping exists
    return this.backgroundImages[this.currentChapter];
  }
  
  ensureContentScrollable() {
    // Check if content needs to be scrollable
    const contentHeight = this.scrollContainer.scrollHeight;
    const viewportHeight = this.container.clientHeight;
    
    console.log(`Content height: ${contentHeight}px, Viewport height: ${viewportHeight}px`);
    
    if (contentHeight <= viewportHeight) {
      console.warn('Content may not be scrollable - adding padding');
      // Add padding to ensure content can scroll but with less empty space
      const stepsContainer = document.querySelector('.steps-container');
      if (stepsContainer) {
        stepsContainer.classList.add('needs-scrolling');
      }
    }
    
    // Add additional padding to last step to ensure it can be properly highlighted
    const lastStep = this.scrollContainer.querySelector('.step:last-child');
    if (lastStep) {
      lastStep.classList.add('last-step');
    }
    
    // Manually check if each step is visible
    const steps = this.scrollContainer.querySelectorAll('.step');
    steps.forEach((step, i) => {
      console.log(`Step ${i} - Height: ${step.offsetHeight}px, Content: ${step.textContent.substring(0, 50)}...`);
    });
  }
  
  initScrollama() {
    // Initialize or destroy + reinitialize scrollama
    if (this.scroller) {
      try {
        this.scroller.destroy();
      } catch (e) {
        console.warn('Error destroying previous scrollama instance:', e);
      }
    }
    
    // Verify elements exist
    const steps = document.querySelectorAll('.step');
    if (steps.length === 0) {
      console.error('No step elements found for scrollama');
      return;
    }
    
    console.log(`Initializing scrollama with ${steps.length} steps`);
    
    this.scroller = scrollama();
    
    // Setup scrollama
    try {
      this.scroller
        .setup({
          step: '.step',
          offset: 0.4,
          debug: false
        })
        .onStepEnter(this.handleStepEnter.bind(this))
        .onStepExit(this.handleStepExit.bind(this));
      
      // Setup resize event
      window.addEventListener('resize', this.scroller.resize);
      
      console.log('Scrollama setup complete');
      
    } catch (error) {
      console.error('Error setting up scrollama:', error);
    }
  }
  
  handleStepEnter(response) {
    console.log(`Step ${response.index} entered, direction: ${response.direction}`);
    
    // Add active class to current step
    response.element.classList.add('is-active');
    
    // Update background image
    const bgId = response.element.dataset.background;
    if (bgId) {
      // Hide all backgrounds
      document.querySelectorAll('.graphic-background').forEach(bg => {
        bg.classList.remove('is-active');
      });
      
      // Show current background
      const currentBg = document.getElementById(bgId);
      if (currentBg) {
        currentBg.classList.add('is-active');
        // Set background image from data attribute using CSS custom property
        if (currentBg.dataset.bgImage) {
          currentBg.style.setProperty('--bg-image', `url(${currentBg.dataset.bgImage})`);
        }
      }
    }
    
    // Trigger step enter event for visualization updates
    const event = new CustomEvent('stepEnter', {
      detail: {
        index: parseInt(response.element.getAttribute('data-step')),
        direction: response.direction,
        chapter: this.currentChapter
      }
    });
    window.dispatchEvent(event);
  }
  
  handleStepExit(response) {
    console.log(`Step ${response.index} exited, direction: ${response.direction}`);
    
    // Remove active class from exited step
    response.element.classList.remove('is-active');
  }
  
  closeContent() {
    console.log('Closing content');
    
    // Hide content container
    this.container.classList.remove('visible');
    
    // After animation completes, hide completely
    setTimeout(() => {
      this.container.classList.add('hidden');
      
      // Hide return button
      if (this.returnButton) {
        this.returnButton.classList.add('hidden');
      }
      
      // Trigger content closed event
      const event = new CustomEvent('contentClosed');
      window.dispatchEvent(event);
    }, 1000);
  }
  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Add a new method to add chapter navigation buttons
  addChapterNavigation(stepsContainer, currentChapter) {
    // Get the ordered list of chapters
    const chapters = Object.keys(this.contentData.sections[0])
      .filter(key => key !== 'sections');
    
    // Find the index of the current chapter
    const currentIndex = chapters.indexOf(currentChapter);
    if (currentIndex === -1) return;
    
    // Create navigation container
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'chapter-navigation';
    
    // Previous chapter or back to navigation button
    const prevButton = document.createElement('button');
    prevButton.className = 'chapter-navigation-button prev-chapter';
    
    if (currentIndex > 0) {
      // There is a previous chapter
      const prevChapter = chapters[currentIndex - 1];
      const prevChapterTitle = this.getChapterTitle(prevChapter);
      prevButton.innerHTML = `← ${prevChapterTitle}`;
      prevButton.addEventListener('click', () => this.showChapter(prevChapter));
    } else {
      // First chapter, show back to navigation
      prevButton.innerHTML = '← Back to Navigation';
      prevButton.addEventListener('click', this.closeContent.bind(this));
    }
    
    // Next chapter or back to navigation button
    const nextButton = document.createElement('button');
    nextButton.className = 'chapter-navigation-button next-chapter';
    
    if (currentIndex < chapters.length - 1) {
      // There is a next chapter
      const nextChapter = chapters[currentIndex + 1];
      const nextChapterTitle = this.getChapterTitle(nextChapter);
      nextButton.innerHTML = `${nextChapterTitle} →`;
      nextButton.addEventListener('click', () => this.showChapter(nextChapter));
    } else {
      // Last chapter, show back to navigation
      nextButton.innerHTML = 'Back to Navigation →';
      nextButton.addEventListener('click', this.closeContent.bind(this));
    }
    
    // Add buttons to container
    navigationContainer.appendChild(prevButton);
    navigationContainer.appendChild(nextButton);
    
    // Add navigation container to steps container
    stepsContainer.appendChild(navigationContainer);
  }
  
  // Helper method to get chapter title
  getChapterTitle(chapterKey) {
    try {
      const chapter = this.contentData.sections[0][chapterKey];
      if (chapter && chapter[0] && chapter[0].title) {
        return chapter[0].title;
      }
    } catch (error) {
      console.error('Error getting chapter title:', error);
    }
    
    // Fallback to capitalized key
    return this.capitalizeFirstLetter(chapterKey);
  }
}

// Export the content handler
if (typeof module !== 'undefined') {
  module.exports = ContentHandler;
} 