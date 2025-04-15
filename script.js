// Initialize the scrollama
const scroller = scrollama();
const chartElement = document.getElementById('chart');
let currentSection = null; // Track the current section
let visibleImages = []; // Track currently visible images
let imagesPreloaded = false; // Track if images have been preloaded
let activeLayer = 1; // Track which background layer is currently active
let lastImageSrc = ''; // Track the last image displayed
let currentStepId = null; // Track the current step ID

// Function to set background image with crossfade
function setBackgroundWithCrossfade(imageSrc) {
  // Avoid unnecessary transitions
  if (imageSrc === lastImageSrc) {
    return;
  }
  
  // Track last image for deduplication
  lastImageSrc = imageSrc;
  
  // Get the background layers
  const layer1 = document.getElementById('bgLayer1');
  const layer2 = document.getElementById('bgLayer2');
  
  // Determine current active/inactive layers
  const activeEl = activeLayer === 1 ? layer1 : layer2;
  const inactiveEl = activeLayer === 1 ? layer2 : layer1;
  
  // Simple approach: set new image on inactive, fade in inactive
  inactiveEl.style.backgroundImage = `url(${imageSrc})`;
  
  // Give time for the browser to apply the background
  requestAnimationFrame(() => {
    // Make sure sticky container has the bg-image class
    document.querySelector('.sticky-thing').classList.add('has-bg-image');
    
    // Update active states
    activeEl.classList.remove('active');
    inactiveEl.classList.add('active');
    
    // Toggle the active layer
    activeLayer = activeLayer === 1 ? 2 : 1;
  });
}

// Preload all images to prevent loading delays
function preloadImages() {
  if (imagesPreloaded) return; // Only preload once
  
  const imagesToPreload = [];
  
  // Collect all image URLs from imageData
  Object.keys(imageData).forEach(section => {
    if (imageData[section]) {
      Object.keys(imageData[section]).forEach(step => {
        if (imageData[section][step] && imageData[section][step].src) {
          imagesToPreload.push(imageData[section][step].src);
        }
      });
    }
  });
  
  // Preload each image
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  imagesPreloaded = true;
}

// Setup visualization placeholder
function setupStickyfill() {
  // Not needed for modern browsers with native sticky support
}

// Generic window resize listener event
function handleResize() {
  // Update chart dimensions here if needed
  scroller.resize();
}

// Scrollama event handlers
function handleStepEnter(response) {
  // response = { element, direction, index }
  const stepData = response.element.dataset.step;
  currentStepId = stepData; // Store the current step ID
  
  console.log('Step entered:', stepData); // Debugging
  
  // Add active class to current step
  response.element.classList.add('is-active');
  
  // Update visualization based on step
  updateChart(stepData);
}

function handleStepExit(response) {
  // response = { element, direction, index }
  
  // Remove active class from current step
  response.element.classList.remove('is-active');
  
  // Clear all progress-based images when exiting a step
  if (response.element.dataset.step === currentStepId) {
    clearProgressImages();
  }
}

// Clear all progress-based images
function clearProgressImages() {
  // Find all elements with progress-image class and remove them
  const progressImages = document.querySelectorAll('.progress-image');
  progressImages.forEach(img => {
    img.classList.add('fade-out');
    setTimeout(() => {
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
    }, 300); // Remove after transition completes
  });
}

// Add a progress handler for smoother animations
function handleStepProgress(response) {
  // response = { element, index, progress }
  const stepData = response.element.dataset.step;
  const progress = response.progress; // Value between 0-1
  
  // Handle progress-based images
  handleProgressImages(stepData, progress);
}

// Handle showing/hiding images based on progress thresholds
function handleProgressImages(stepData, progress) {
  const [section, number] = stepData.split('-');
  const sectionLower = section.toLowerCase();
  
  // Check if we have progress-based images for this step
  if (imageData[sectionLower] && 
      imageData[sectionLower][number] && 
      imageData[sectionLower][number].progressImages) {
    
    const progressImages = imageData[sectionLower][number].progressImages;
    
    // Check each image threshold
    progressImages.forEach(imageInfo => {
      const imageId = `${sectionLower}-${number}-${imageInfo.threshold}`;
      const existingImage = document.getElementById(imageId);
      
      if (progress >= imageInfo.threshold) {
        // Show image if it's not already visible
        if (!existingImage) {
          createProgressImage(imageInfo, imageId, sectionLower, number);
        }
      } else {
        // Hide image if it's visible but progress is below threshold
        if (existingImage) {
          existingImage.classList.add('fade-out');
          setTimeout(() => {
            if (existingImage.parentNode) {
              existingImage.parentNode.removeChild(existingImage);
            }
          }, 300); // Remove after transition completes
        }
      }
    });
  }
}

// Create a progress-based image
function createProgressImage(imageInfo, imageId, section, step) {
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container', 'progress-image');
  imageContainer.id = imageId;
  
  // Create and append the image
  const img = document.createElement('img');
  img.src = imageInfo.src;
  img.alt = imageInfo.caption || '';
  
  // Use custom width if provided, otherwise default to 500px
  if (imageInfo.width) {
    img.style.width = imageInfo.width;
  }
  img.loading = "eager";
  
  imageContainer.appendChild(img);
  
  // Create and append the caption if it exists
  if (imageInfo.caption) {
    const caption = document.createElement('p');
    caption.classList.add('image-caption');
    caption.textContent = imageInfo.caption;
    imageContainer.appendChild(caption);
  }
  
  // Position the image based on provided coordinates or use defaults
  let posX = 50; // default center
  let posY = 50; // default center
  
  // If explicit position is provided in the image data, use it
  if (imageInfo.position) {
    posX = imageInfo.position.x;
    posY = imageInfo.position.y;
  } else {
    // Fallback to the old threshold-based positioning
    const positions = [
      { x: 20, y: 30 },    // for lower thresholds (e.g., 0.1)
      { x: 50, y: 50 },    // for middle thresholds (e.g., 0.5)
      { x: 80, y: 70 }     // for higher thresholds (e.g., 0.75)
    ];
    
    let positionIndex = 0;
    if (imageInfo.threshold >= 0.7) positionIndex = 2;
    else if (imageInfo.threshold >= 0.4) positionIndex = 1;
    
    const position = positions[positionIndex];
    posX = position.x;
    posY = position.y;
    
    // Add a small random offset to prevent exact overlapping only if not using custom positionys f
    posX += Math.floor(Math.random() * 10) - 5;
    posY += Math.floor(Math.random() * 10) - 5;
  }
  
  // Apply the positioning
  imageContainer.style.left = `${posX}%`;
  imageContainer.style.top = `${posY}%`;
  
  // Add fade-in class for animation
  imageContainer.classList.add('fade-in');
  
  // Add to the chart
  chartElement.appendChild(imageContainer);
}

// Image data mapping sections and steps to images
const imageData = {
  "introduction": {
    "1": { src: "assets/images/clouds.jpg", fullBackground: true },
    "2": { src: "assets/images/clouds2.jpg", fullBackground: true },
    "3": { src: "assets/images/clouds2.jpg", fullBackground: true },
    // Example of progress-based images for a step
    "4": { 
       src: "assets/images/clouds2.jpg", fullBackground: true,
      progressImages: [
        { threshold: 0.1, src: "assets/images/datacenter.jpeg", position: { x: 25, y: 25 }, width: "600px" },
        { threshold: 0.3, src: "assets/images/satellite.jpg", position: { x: 70, y: 40 }, width: "850px" },
        { threshold: 0.6, src: "assets/images/cables.jpg", position: { x: 50, y: 75 }, width: "500px" }
      ]
    },
    "5": { src: "assets/images/virginia.jpg", fullBackground: true },
    "6": { src: "assets/images/virginia.jpg", fullBackground: true }
  },
  "war": {
    "1": { src: "https://images.unsplash.com/photo-1570144410903-6b77c4a1ac89", caption: "Historical wartime coding equipment", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a", caption: "Early encryption technology" },
    "3": { src: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0", caption: "Military telecommunications equipment", fullBackground: true },
    "4": { src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1", caption: "Computing technology developed for wartime use" },
    "5": { src: "https://images.unsplash.com/photo-1551434678-e076c223a692", caption: "Military data processing centers", fullBackground: true },
    "6": { src: "https://images.unsplash.com/photo-1596262583767-7f768c4a9774", caption: "Early algorithm development for strategic operations" },
    "7": { src: "https://images.unsplash.com/photo-1569396116180-210c182bedb8", caption: "Military-industrial computing complex", fullBackground: true }
  },
  "surveillance": {
    "1": { src: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78", caption: "Early surveillance systems", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd", caption: "Network monitoring infrastructure" },
    "3": { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8", caption: "Signal intelligence equipment", fullBackground: true },
    "4": { src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", caption: "Data collection systems" },
    "5": { src: "https://images.unsplash.com/photo-1569144157591-c60f3f82f137", caption: "Communications monitoring technology" },
    "6": { src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c", caption: "Modern surveillance infrastructure", fullBackground: true },
    "7": { src: "https://images.unsplash.com/photo-1563841930606-67e2bce48b78", caption: "Global monitoring networks" },
    "8": { src: "https://images.unsplash.com/photo-1586969593656-8d8b2cdf3b33", caption: "Information gathering systems", fullBackground: true }
  },
  "corporations": {
    "1": { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab", caption: "Corporate computing headquarters", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1573164713988-8665fc963095", caption: "Early networking hardware" },
    "3": { src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa", caption: "Corporate data centers", fullBackground: true },
    "4": { src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", caption: "Software development infrastructure" },
    "5": { src: "https://images.unsplash.com/photo-1588246507464-59f819fee75e", caption: "Mainframe computing environments", fullBackground: true },
    "6": { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", caption: "Corporate programming teams" },
    "7": { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", caption: "Digital corporate infrastructure", fullBackground: true }
  },
  "extraction": {
    "1": { src: "https://images.unsplash.com/photo-1578994462128-845c8f786660", caption: "Mineral extraction for computing hardware", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1581094271901-8022df4466f9", caption: "Rare earth mineral processing" },
    "3": { src: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f", caption: "Hardware component manufacturing", fullBackground: true },
    "4": { src: "https://images.unsplash.com/photo-1581093577421-f561a654a353", caption: "Silicon production facilities" },
    "5": { src: "https://images.unsplash.com/photo-1627163439134-7a8c47e08208", caption: "Data center resource consumption" },
    "6": { src: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6", caption: "Electronic waste processing", fullBackground: true },
    "7": { src: "https://images.unsplash.com/photo-1638913970895-d3df59be1f80", caption: "Environmental impact of computing" },
    "8": { src: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0", caption: "Resource extraction for electronics", fullBackground: true }
  },
  "algorithms": {
    "1": { src: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a", caption: "Early algorithm visualization", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485", caption: "Pattern recognition systems" },
    "3": { src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", caption: "Computational models" },
    "4": { src: "https://images.unsplash.com/photo-1510511233900-1982d92bd835", caption: "Data processing algorithms", fullBackground: true },
    "5": { src: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387", caption: "Machine learning infrastructure" },
    "6": { src: "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1", caption: "Neural network visualization", fullBackground: true },
    "7": { src: "https://images.unsplash.com/photo-1563986768609-322da13575f3", caption: "Algorithmic decision systems" },
    "8": { src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", caption: "Code and algorithms visualization", fullBackground: true }
  },
  "conclusion": {
    "1": { src: "https://images.unsplash.com/photo-1606318313496-dec47680c8cf", caption: "Future of computing", fullBackground: true },
    "2": { src: "https://images.unsplash.com/photo-1624658495151-3f8ba3f55985", caption: "Digital landscape overview" },
    "3": { src: "https://images.unsplash.com/photo-1507668077129-56e32842fceb", caption: "Technological evolution", fullBackground: true },
    "4": { src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", caption: "Computing ethics and future directions" },
    "5": { src: "https://images.unsplash.com/photo-1535223289827-42f1e9919769", caption: "Digital transformation of society", fullBackground: true },
    "6": { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f", caption: "Culmination of computing history" }
  }
};

// Update the visualization based on step data
function updateChart(stepData) {
  // Parse the section and step number from the data-step attribute
  // Expected format: "section-number" (e.g., "introduction-1", "war-3")
  const [section, number] = stepData.split('-');
  
  // Convert section name to lowercase for consistent comparison
  const sectionLower = section.toLowerCase();
  
  console.log('Processing step:', sectionLower, number); // Debugging
  
  // Check if we have an image for this step
  if (imageData[sectionLower] && imageData[sectionLower][number]) {
    const imageInfo = imageData[sectionLower][number];
    
    // Handle full background images
    if (imageInfo.fullBackground) {
      // Apply crossfade for background transition
      setBackgroundWithCrossfade(imageInfo.src);
    } 
    // Create normal positioned images for non-fullBackground images
    else if (!visibleImages.includes(`${sectionLower}-${number}`)) {
      // Only clear previous images if this is a new section
      if (sectionLower !== currentSection) {
        chartElement.innerHTML = '';
        visibleImages = [];
        currentSection = sectionLower;
      }
      
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      imageContainer.dataset.id = `${sectionLower}-${number}`;
      
      // Create and append the image
      const img = document.createElement('img');
      img.src = imageInfo.src;
      img.alt = imageInfo.caption || '';
      img.style.width = '500px';
      
      // Add loading attribute to improve performance
      img.loading = "eager";
      
      imageContainer.appendChild(img);
      
      // Create and append the caption if it exists in the data
      if (imageInfo.caption) {
        const caption = document.createElement('p');
        caption.classList.add('image-caption');
        caption.textContent = imageInfo.caption;
        imageContainer.appendChild(caption);
      }
      
      // Distribute images across the entire space
      const imageCount = visibleImages.length;
      
      // Define different position zones to use the full space
      const zones = [
        { x: 20, y: 30 },    // top left
        { x: 50, y: 30 },    // top center
        { x: 80, y: 30 },    // top right
        { x: 20, y: 50 },    // middle left
        { x: 80, y: 50 },    // middle right
        { x: 20, y: 70 },    // bottom left
        { x: 50, y: 70 },    // bottom center
        { x: 80, y: 70 }     // bottom right
      ];
      
      // Calculate a position that uses more of the available space
      // Use modulo to cycle through the zones
      const zone = zones[imageCount % zones.length];
      
      // Add a small random offset to prevent exact overlapping
      const randomX = Math.floor(Math.random() * 10) - 5;
      const randomY = Math.floor(Math.random() * 10) - 5;
      
      // Apply the positioning - these must remain inline as they're dynamically calculated
      imageContainer.style.left = `${zone.x + randomX}%`;
      imageContainer.style.top = `${zone.y + randomY}%`;
      
      // Add to the chart
      chartElement.appendChild(imageContainer);
      
      // Track this image as visible
      visibleImages.push(`${sectionLower}-${number}`);
    }
  }
}

// Generate HTML elements from content.json
function createStepsFromContent(data) {
  const article = document.querySelector('article');
  article.innerHTML = ''; // Clear existing content
  
  // Access the sections array
  const sections = data.sections[0];
  
  // Iterate through each section
  Object.keys(sections).forEach(sectionName => {
    const sectionContent = sections[sectionName][0];
    
    // Add section header if it has a title and kicker
    if (sectionContent.title) {
      if (sectionContent.kicker) {
        const kicker = document.createElement('h2');
        kicker.classList.add('section-kicker');
        kicker.textContent = sectionContent.kicker;
        article.appendChild(kicker);
      }
      
      const title = document.createElement('h2');
      title.classList.add('section-title');
      title.textContent = sectionContent.title;
      article.appendChild(title);
    }
    
    // Add each paragraph as a step
    // Use the actual section name from content.json for consistency
    Object.entries(sectionContent).forEach(([key, text]) => {
      if (key !== 'title' && key !== 'kicker') {
        const step = document.createElement('div');
        step.classList.add('step');
        step.dataset.step = `${sectionName}-${key}`;
        
        const p = document.createElement('p');
        p.textContent = text;
        step.appendChild(p);
        
        article.appendChild(step);
      }
    });
  });
  
  // Start preloading images right after content is loaded
  preloadImages();
}

// Initialize and setup
function init() {
  setupStickyfill();

  // Set the initial background image for the introduction section
  if (imageData.introduction && imageData.introduction["1"]) {
    const introImage = imageData.introduction["1"];
    if (introImage.fullBackground) {
      // Add the active class to the first layer
      const bgLayer1 = document.getElementById('bgLayer1');
      bgLayer1.style.backgroundImage = `url(${introImage.src})`;
      bgLayer1.classList.add('active');
      
      // Make the container have bg-image class
      document.querySelector('.sticky-thing').classList.add('has-bg-image');
      currentSection = "introduction";
    }
  }

  // Set up scrollama
  scroller
    .setup({
      step: '.step',
      offset: 0.6,
      progress: true, // Enable progress tracking
      debug: false
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
    .onStepProgress(handleStepProgress);

  // Setup resize event
  window.addEventListener('resize', handleResize);
  handleResize();
}

// Load content from JSON file and initialize scrollama
document.addEventListener('DOMContentLoaded', function() {
  // Create a loading message that gets replaced when content loads
  const article = document.querySelector('article');
  const loadingMsg = document.createElement('div');
  loadingMsg.classList.add('loading');
  loadingMsg.textContent = 'Loading content...';
  article.appendChild(loadingMsg);
  
  // Start loading content.json right away
  fetch('content.json')
    .then(response => response.json())
    .then(data => {
      createStepsFromContent(data);
      init();
      
      // Force a resize to ensure scrollama positions correctly
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    })
    .catch(error => {
      console.error('Error loading content:', error);
      // Display error message
      article.innerHTML = '<div class="loading">Error loading content. Please try refreshing the page.</div>';
    });
}); 