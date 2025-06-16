function generatePrompt(inputText) {
    return `
  You are an analyst tasked with creating a comprehensive report on a digital service or product.
  
  Input:
  ${inputText}
  
  Please generate a markdown report that includes:
  1. **Brief History**
  2. **Target Audience**
  3. **Core Features**
  4. **Unique Selling Points**
  5. **Business Model**
  6. **Tech Stack Insights**
  7. **Perceived Strengths**
  8. **Perceived Weaknesses**
  
  Format your response using clear Markdown syntax with headings and bullet points.
  `;
  }
  
  module.exports = { generatePrompt };
  