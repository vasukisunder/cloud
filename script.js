// Initialize the scrollama
const scroller = scrollama();
const chartElement = document.getElementById('chart');

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
  
  // Add active class to current step
  response.element.classList.add('is-active');
  
  // Update visualization based on step
  updateChart(stepData);
}

function handleStepExit(response) {
  // response = { element, direction, index }
  
  // Remove active class from current step
  response.element.classList.remove('is-active');
}

// Update the visualization based on step data
function updateChart(stepData) {
  // Parse the section and step number from the data-step attribute
  // Expected format: "section-number" (e.g., "introduction-1", "war-3")
  const [section, number] = stepData.split('-');
  
  // For now, just display what section and step we're on
  chartElement.innerHTML = `
    <h3>Visualization for "${section}" section</h3>
    <p>Step ${number}</p>
  `;
  
  // Here you would implement specific visualizations for each step
  // Example:
  // if (section === "war" && number === "1") {
  //   showWarVisualization1();
  // } else if (section === "surveillance" && number === "3") {
  //   showSurveillanceVisualization3();
  // }
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
}

// Initialize and setup
function init() {
  setupStickyfill();

  // Set up scrollama
  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      debug: false
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  // Setup resize event
  window.addEventListener('resize', handleResize);
  handleResize();
}

// Load content from JSON file and initialize scrollama
document.addEventListener('DOMContentLoaded', function() {
  fetch('content.json')
    .then(response => response.json())
    .then(data => {
      createStepsFromContent(data);
      init();
    })
    .catch(error => {
      console.error('Error loading content:', error);
      // Initialize with existing content as fallback
      init();
    });
}); 