const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const meals = ["Breakfast", "Lunch", "Mid-afternoon", "Supper"];
let allData = [];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("daysContainer");
  weekdays.forEach((day, i) => {
    const section = document.createElement("div");
    section.className = "day-section";
    section.id = `day-${day}`;

    const heading = document.createElement("h2");
    heading.textContent = day;
    section.appendChild(heading);

    meals.forEach(meal => {
      const row = document.createElement("div");
      row.className = "meal-row";

      const label = document.createElement("label");
      label.textContent = meal;

      const desc = document.createElement("input");
      desc.placeholder = `${meal} description`;
      desc.className = "desc";
      desc.dataset.day = day;
      desc.dataset.meal = meal;

      const cost = document.createElement("input");
      cost.placeholder = "Cost (KES)";
      cost.className = "cost";
      cost.type = "number";
      cost.dataset.day = day;
      cost.dataset.meal = meal;

      row.appendChild(label);
      row.appendChild(desc);
      row.appendChild(cost);
      section.appendChild(row);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Meals";
    saveBtn.className = "save-btn";
    saveBtn.onclick = () => saveDay(day);
    section.appendChild(saveBtn);

    container.appendChild(section);
  });
});

function saveDay(day) {
  const descs = document.querySelectorAll(`.desc[data-day="${day}"]`);
  const costs = document.querySelectorAll(`.cost[data-day="${day}"]`);

  const mealsList = [];
  let total = 0;

  for (let i = 0; i < descs.length; i++) {
    const description = descs[i].value.trim();
    const cost = parseFloat(costs[i].value) || 0;
    mealsList.push({
      type: descs[i].dataset.meal,
      description,
      cost
    });
    total += cost;
  }

  allData = allData.filter(d => d.day !== day);
  allData.push({ day, meals: mealsList, total });

  alert(`${day} meals saved ✅`);
}

function exportTXT() {
  let text = "";

  allData.forEach(d => {
    text += `${d.day}:\n`;
    d.meals.forEach(m => {
      text += `  ${m.type}: ${m.description} - ${m.cost} KES\n`;
    });
    text += `  Total: ${d.total} KES\n\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Meal_Report_${new Date().toISOString().slice(0,10)}.txt`;
  link.click();
}

async function exportDOCX() {
  const chart = document.getElementById("spendingChart");
  chart.style.display = "block";
  const ctx = chart.getContext("2d");

  const labels = allData.map(d => d.day);
  const costs = allData.map(d => d.total);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: "Spending (KES)",
        data: costs,
        backgroundColor: "#2980b9"
      }]
    },
    options: {
      responsive: false,
      animation: false
    }
  });

  await new Promise(r => setTimeout(r, 500)); // wait to render

  const chartImg = chart.toDataURL("image/png");
  const doc = new docx.Document();
  const { Paragraph, Packer, Media } = docx;

  const children = [];

  allData.forEach(day => {
    children.push(new Paragraph({ text: day.day, heading: "Heading1" }));
    day.meals.forEach(m => {
      children.push(new Paragraph(`${m.type}: ${m.description} - ${m.cost} KES`));
    });
    children.push(new Paragraph(`Total: ${day.total} KES`));
    children.push(new Paragraph(""));
  });

  const image = Media.addImage(doc, chartImg);
  children.push(new Paragraph("Spending Chart:"));
  children.push(image);

  doc.addSection({ children });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Meal_Report_${new Date().toISOString().slice(0,10)}.docx`;
  link.click();
}
