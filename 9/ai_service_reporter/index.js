const readline = require("readline-sync");
const fs = require("fs");
const path = require("path");
const { getReport } = require("./generateReport");

async function main() {
  console.log("Welcome to the AI Service Reporter.");
  const input = readline.question("Enter a service name or paste a product description:\n> ");

  if (!input.trim()) {
    console.log("No input provided. Exiting.");
    return;
  }

  console.log("\nGenerating report...\n");

  const report = await getReport(input);
  console.log(report);

  const saveAnswer = readline.question("\nDo you want to save this report to a file? (y/n)\n> ");

  if (saveAnswer.trim().toLowerCase() === 'y') {
    const reportsDir = path.join(__dirname, 'saved_reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const sanitizedInput = input.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${sanitizedInput.substring(0, 20)}_${timestamp}.md`;
    const filePath = path.join(reportsDir, filename);

    fs.writeFileSync(filePath, report);
    console.log(`\nReport saved successfully to: ${filePath}`);
  } else {
    console.log("\nReport not saved. Exiting.");
  }
}

main();
