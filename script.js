let currentDay = 1;
const meals = ["Breakfast", "Lunch", "Mid-afternoon", "Supper"];
let allData = [];

function addDay() {
  const container = document.getElementById("daysContainer");

  const dayDiv = document.createElement("div");
  dayDiv.className = "day-section";
  dayDiv.id = `day-${currentDay}`;

  const header = document.createElement("h2");
  header.textContent = `Day ${currentDay}`;
  dayDiv.appendChild(header);

  meals.forEach(meal => {
    const mealGroup = document.createElement("div");
    mealGroup.className = "meal-group";

    const label = document.createElement("label");
    label.textContent = `${meal}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Enter ${meal} + cost (e.g. Rice - 120)`;
    input.dataset.meal = meal;
    input.dataset.day = currentDay;

    mealGroup.appendChild(label);
    mealGroup.appendChild(input);
    dayDiv.appendChild(mealGroup);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Meal";
  addBtn.className = "add-btn";
  addBtn.onclick = () => saveDayData(currentDay);
  dayDiv.appendChild(addBtn);

  container.appendChild(dayDiv);
  currentDay++;
}

function saveDayData(day) {
  const inputs = document.querySelectorAll(`input[data-day='${day}']`);
  const dayData = { day: `Day ${day}`, meals: [], total: 0 };

  inputs.forEach(input => {
    const value = input.value.trim();
    if (value) {
      const [desc, cost] = value.split("-").map(str => str.trim());
      const amount = parseFloat(cost) || 0;
      dayData.meals.push({ type: input.dataset.meal, description: desc, cost: amount });
      dayData.total += amount;
    }
  });

  allData = allData.filter(d => d.day !== `Day ${day}`);
  allData.push(dayData);
  alert(`Saved Day ${day} Meals ✅`);
}

function exportTXT() {
  let content = "";
  allData.forEach(day => {
    content += `${day.day}\n`;
    day.meals.forEach(meal => {
      content += `  ${meal.type}: ${meal.description} - ${meal.cost} KES\n`;
    });
    content += `  Total: ${day.total} KES\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Meal_Report_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
}

async function exportDOCX() {
  const chartCanvas = document.getElementById("spendingChart");
  const ctx = chartCanvas.getContext("2d");
  chartCanvas.style.display = "block";

  const labels = allData.map(d => d.day);
  const data = allData.map(d => d.total);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Daily Spending (KES)",
        data: data,
        backgroundColor: "#27ae60",
      }]
    },
    options: {
      responsive: false,
      animation: false
    }
  });

  await new Promise(resolve => setTimeout(resolve, 500)); // wait for chart to render

  const imgData = chartCanvas.toDataURL("image/png");

  const doc = new docx.Document();
  const { Paragraph, TextRun, Packer, Media } = docx;

  const children = [];

  allData.forEach(day => {
    children.push(new Paragraph({ text: day.day, heading: "Heading1" }));
    day.meals.forEach(meal => {
      children.push(new Paragraph(`${meal.type}: ${meal.description} - ${meal.cost} KES`));
    });
    children.push(new Paragraph(`Total: ${day.total} KES`));
    children.push(new Paragraph(""));
  });

  const chartImage = Media.addImage(doc, imgData);
  children.push(new Paragraph("Spending Chart:"));
  children.push(chartImage);

  doc.addSection({ children });

  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Meal_Report_${new Date().toISOString().slice(0,10)}.docx`;
  a.click();
}
