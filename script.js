const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekContainer = document.getElementById("weekContainer");
const dailyTotals = {};

days.forEach(day => {
  const section = document.createElement("div");
  section.className = "day-section";
  section.innerHTML = `
    <h2>${day}</h2>
    <input type="text" placeholder="Meal description" id="${day}-meal">
    <input type="number" placeholder="Cost" id="${day}-cost">
    <button onclick="addMeal('${day}')">Add Meal</button>
    <div id="${day}-meals"></div>
  `;
  weekContainer.appendChild(section);
  dailyTotals[day] = 0;
});

function addMeal(day) {
  const descInput = document.getElementById(`${day}-meal`);
  const costInput = document.getElementById(`${day}-cost`);
  const mealContainer = document.getElementById(`${day}-meals`);

  const description = descInput.value.trim();
  const cost = parseFloat(costInput.value);

  if (!description || isNaN(cost)) return;

  const mealDiv = document.createElement("div");
  mealDiv.className = "meal";
  const time = new Date().toLocaleTimeString();
  mealDiv.textContent = `${time} - ${description} ($${cost.toFixed(2)})`;
  mealContainer.appendChild(mealDiv);

  dailyTotals[day] += cost;

  descInput.value = "";
  costInput.value = "";
}

function exportToTXT() {
  let content = `Meal Tracker - ${new Date().toLocaleString()}\n\n`;
  days.forEach(day => {
    content += `${day}:\n`;
    const meals = document.getElementById(`${day}-meals`).children;
    for (let meal of meals) {
      content += `  - ${meal.textContent}\n`;
    }
    content += `  Total: $${dailyTotals[day].toFixed(2)}\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meal-tracker-${Date.now()}.txt`;
  a.click();
}

function exportToDOCX() {
  const { Document, Packer, Paragraph, TextRun } = window.docx;
  const doc = new Document();

  doc.addSection({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `Meal Tracker - ${new Date().toLocaleString()}`, bold: true, size: 28 }),
        ],
      }),
      ...days.map(day => new Paragraph({
        children: [
          new TextRun({ text: `\n${day}`, bold: true, size: 24 }),
          ...Array.from(document.getElementById(`${day}-meals`).children).map(meal => 
            new TextRun({ text: `\n - ${meal.textContent}`, size: 20 })
          ),
          new TextRun({ text: `\n Total: $${dailyTotals[day].toFixed(2)}\n`, italics: true, size: 20 }),
        ],
      }))
    ],
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meal-tracker-${Date.now()}.docx`;
    a.click();
  });
}

function renderChart() {
  const ctx = document.getElementById('spendingChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Daily Meal Cost',
        data: days.map(day => dailyTotals[day]),
        backgroundColor: '#4CAF50',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Weekly Spending Overview',
          font: { size: 18 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `$${value}`
          }
        }
      }
    }
  });
}

setInterval(renderChart, 5000);
