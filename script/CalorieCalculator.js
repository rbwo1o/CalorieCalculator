/* 
 * Author: Blaine Wilson
 * 
 * Synopsis: This file contains functions essential for the Calorie Calculator application. 
 * 
 * Description:
 * 
 * The Calorie Calculator application utilizes the Mifflin-St Jeor Equation to accurately
 * calculate the Basal Metabolic Rate (BMR). Introduced in 1990, the Mifflin-St Jeor Equation 
 * is considered more accurate than older methods like the Harris-Benedict Equation for determining
 * BMR. This equation helps in assessing daily caloric needs based on various factors such as weight, 
 * height, age, and gender. 
 * 
 * The Mifflin-St Jeor Equation calculates BMR as follows:
 * 
 * For Males:
 *   BMR = 10 * Weight (kg) + 6.25 * Height (cm) - 5 * Age (years) + 5
 * 
 * For Females:
 *   BMR = 10 * Weight (kg) + 6.25 * Height (cm) - 5 * Age (years) - 161
 * 
 * This file includes functions for calculating BMR, determining caloric intake for weight 
 * maintenance, weight loss, or weight gain, and managing user input for a personalized 
 * calorie tracking experience.
 */


/* window.onload()
 *
 * This function is used when the window loads to restore persistent data from local storage.
 */
window.onload = function()
{
  let gender = localStorage.getItem('gender')
  if(gender != null)
  {
    document.querySelector(`input[name="genderRadioButton"][value="${gender}"]`).checked = true;
  }

  document.getElementById('age').value = localStorage.getItem('age') || null;
  document.getElementById('heightFeet').value = localStorage.getItem('heightFeet') || null;
  document.getElementById('heightInches').value = localStorage.getItem('heightInches') || null;
  document.getElementById('currentWeight').value = localStorage.getItem('currentWeight') || null;
  document.getElementById('goalWeight').value = localStorage.getItem('goalWeight') || null;
  document.getElementById('activityLevel').value = localStorage.getItem('activityLevel');
}



/* SaveDetails()
 *
 * This function saves user input data to the browser's local storage to ensure
 * data persistence across user sessions. This allows the user to retain their
 * input values even after they leave or refresh the page.
*/
function SaveDetails()
{
  localStorage.setItem('gender', document.querySelector('input[name="genderRadioButton"]:checked').value);
  localStorage.setItem('age', parseInt(document.getElementById('age').value));
  localStorage.setItem('heightFeet', parseInt(document.getElementById('heightFeet').value));
  localStorage.setItem('heightInches', parseInt(document.getElementById('heightInches').value));
  localStorage.setItem('currentWeight', parseFloat(document.getElementById('currentWeight').value));
  localStorage.setItem('goalWeight', parseFloat(document.getElementById('goalWeight').value));
  localStorage.setItem('activityLevel', parseFloat(document.getElementById('activityLevel').value));
}


/* detailsForm submit event listener
 *
 * This function drives the Calorie Calculation when the detailsForm has been submitted.
*/
const form = document.getElementById('detailsForm');
form.addEventListener('submit', (event) =>
{
    event.preventDefault(); // Prevents the form from submitting the traditional way
    
    // close the modal
    bootstrap.Modal.getInstance( document.getElementById('formModal') ).hide();

    // calculate 
    let gender = document.querySelector('input[name="genderRadioButton"]:checked').value;
    let age = parseInt(document.getElementById('age').value);
    let heightFeet = parseInt(document.getElementById('heightFeet').value);
    let heightInches = parseInt(document.getElementById('heightInches').value);
    let currentWeight = parseFloat(document.getElementById('currentWeight').value);
    let goalWeight = parseFloat(document.getElementById('goalWeight').value);
    let activityLevel = parseFloat(document.getElementById('activityLevel').value);

    // validate form parameters
    if( validateParameters(gender, age, heightFeet, heightInches, currentWeight, goalWeight, activityLevel) == false )
    {
      return;
    }

    let weightData = calculateWeightData(gender, age, heightFeet, heightInches, currentWeight, goalWeight, activityLevel);

    // chart weight data set
    addChart(weightData);

    // display weight data details
    displayDataDetails(weightData);

    // Save Details
    SaveDetails();

});



/* validateParemeters(gender, age, heightFeet, heightInches, currentWeight, goalWeight, activityLevel)
 *
 * This function is used to validate form paremeters to help prevent users from injecting custom data.
 */
function validateParameters(gender, age, heightFeet, heightInches, currentWeight, goalWeight, activityLevel)
{
  let errorMessage = '';
  let isValid = true;

  // validate gender
  if(gender != 'male' && gender != 'female')
  {
    errorMessage += "Please enter a valid gender: male or female\n";
    isValid = false;
  }

  // validate age
  if(isNaN(age) || age < 10 || age > 110)
  {
    errorMessage += "Please enter a valid age between 10 and 110.\n";
    isValid = false;
  }

  // validate height in feet
  if(isNaN(heightFeet) || heightFeet < 3 || heightFeet > 9)
  {
    errorMessage += "Please enter a valid height in feet (3 to 9).\n";
    isValid = false;
  }

  // validate height in inches
  if(isNaN(heightInches || heightInches < 0 || heightInches > 11))
  {
    errorMessage += "Please enter a valid height in inches (0 to 11).\n"
    isValid = false;
  }

  // validate current weight
  if(isNaN(currentWeight) || currentWeight < 75 || currentWeight > 650)
  {
    errorMessage += "Please enter a valid current weight between 75lbs and 650lbs.\n";
    isValid = false;
  }

  // validate goal weight
  if(isNaN(goalWeight) || goalWeight < 75 || goalWeight > 650)
  {
    errorMessage += "Please enter a valid goal weight between 75lbs and 650lbs.\n";
    isValid = false;
  }

  // validate activity level
  validActivityLevels = [1, 1.2, 1.375, 1.465, 1.55, 1.725, 1.9];
  if(isNaN(activityLevel) || !validActivityLevels.includes(activityLevel))
  {
    errorMessage += "Please enter a valid activity level.\n"
    isValid = false;
  }

  if(!isValid)
  {
    alert(errorMessage);
  }
}





/* 
 *
 * 
*/
function calculateWeightData(gender, age, heightFeet, heightInches, currentWeight, goalWeight, activityLevel)
{
  const heightCm = (heightFeet * 30.48) + (heightInches * 2.54); // convert to cm

  return currentWeight >= goalWeight ? calculateDeficitData(gender, age, heightCm, currentWeight, goalWeight, activityLevel) : calculateSurplusData(gender, age, heightCm, currentWeight, goalWeight, activityLevel);
}





/* calculateBMR(gender, w, h, a)
 *
 * This function calculates BMR based on the Mifflin-St Jeor Equation.
*/
function calculateBMR(gender, w, h, a)
{
  w *= 0.453592; // convert to Kg

  return gender == 'female' ? (10 * w) + (6.25 * h) - (5 * a) - 161 : (10 * w) + (6.25 * h) - (5 * a) + 5;
}





function calculateSurplusData(gender, age, heightCm, currentWeight, goalWeight, activityLevel)
{
  console.log("hi");
  let weightData = [];
  const goalBMR = calculateBMR(gender, goalWeight, heightCm, age);
  const goalTDEE = goalBMR * activityLevel;

  // record goal statistics
  weightData.push(
    {
      goalBMR: goalBMR,
      goalTDEE: goalTDEE
    }
  );

  let weekCounter = 0;

  while(Math.floor(currentWeight) < Math.floor(goalWeight))
  {
    console.log("meow");
    let currentTDEE = (calculateBMR(gender, currentWeight, heightCm, age) * activityLevel);
    let surplusTDEE = currentTDEE + 1000;
    surplusTDEE = Math.floor(surplusTDEE);

    let dailySurplus = surplusTDEE - currentTDEE;
    let weeklySurplus = dailySurplus * 7;

    currentWeight += weeklySurplus.toFixed(2) / 3500; // 3500cal = 1lbs
    currentWeight = parseFloat(currentWeight.toFixed(2));

    weekCounter++;

    // record week statistics
    weightData.push(
      {
        week: weekCounter,
        weight: currentWeight,
        recommendedCalories: surplusTDEE
      }
    );
  }

  return weightData;
}



function calculateDeficitData(gender, age, heightCm, currentWeight, goalWeight, activityLevel)
{
  let weightData = [];
  const goalBMR = calculateBMR(gender, goalWeight, heightCm, age);
  const goalTDEE = goalBMR * activityLevel;

  // record goal statistics
  weightData.push(
    {
      goalBMR: goalBMR,
      goalTDEE: goalTDEE
    }
  );


  let weekCounter = 0;

  while(Math.floor(currentWeight) > Math.floor(goalWeight))
  {
    let currentTDEE = (calculateBMR(gender, currentWeight, heightCm, age) * activityLevel);
    let deficitTDEE = currentTDEE - 1000;
    deficitTDEE = Math.floor(deficitTDEE);

    let dailyDeficit = currentTDEE - deficitTDEE;
    let weeklyDeficit = dailyDeficit * 7;

    currentWeight -= weeklyDeficit.toFixed(2) / 3500; // 3500cal = 1lbs
    currentWeight = currentWeight.toFixed(2);

    weekCounter++;

    // record week statistics
    weightData.push(
      {
        week: weekCounter,
        weight: currentWeight,
        recommendedCalories: deficitTDEE
      }
    );
  }

  return weightData;
}



/* addChart(weightData)
 *
 * This function adds a new chart to the canvas using the calculated weight data
*/
let chart;
function addChart(weightData)
{
  const ctx = document.getElementById('myChart');
  ctx.style.border = '2px solid #282b30';

  let labels = weightData.slice(1).map(entry => `Week ${entry.week}`);
  let data = weightData.slice(1).map(entry => entry.weight);

  if(chart instanceof Chart){
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weight Timeline Chart',
        data: data,
        borderWidth: 5,
      }]
    },
    options: {
      layout: {
        padding: {
          top: 15, // Top padding
          right: 15, // Right padding
          bottom: 15, // Bottom padding
          left: 15 // Left padding
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            // Define the step size between the tick marks
            stepSize: 10,  // Adjust this value as needed
            color: 'white'
          },
          title: {
            display: true,
            text: 'Weight',  // Y-axis label text
            font: {
              size: 16  // Optional: Adjust the font size of the label
            },
            color: 'white'
          }  
        },
        x: 
        {
          ticks: {
            // Define the step size between the tick marks
            stepSize: 10,  // Adjust this value as needed
            color: 'white'
          },
          title: {
            display: true,
            text: 'Week',  // Y-axis label text
            font: {
              size: 16  // Optional: Adjust the font size of the label
            },
            color: 'white'
          }
        } 
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = 'Weight: ';
              let value = context.parsed.y; // Get the Y-axis value
              let week = context.label; // Get the corresponding week label

              return [` ${label}${value} lbs`];
            }
          }
        }
      }  
    }
  });
}








function displayDataDetails(weightData)
{
  const detailsButton = document.getElementById('detailsButton');
  const tableBody = document.getElementById('dataTableBody');

  detailsButton.style.display = 'block';
  tableBody.innerHTML = ''; // clear existing entries

  weightData.slice(1).forEach(entry => {
    const row = document.createElement('tr');

    // week cell
    const weekCell = document.createElement('td');
    weekCell.textContent = entry.week; // Safe as textContent escapes HTML
    row.appendChild(weekCell);

    // weight cell
    const weightCell = document.createElement('td');
    weightCell.textContent = entry.weight; // Safe as textContent escapes HTML
    row.appendChild(weightCell);

    // calories cell
    const caloriesCell = document.createElement('td');
    caloriesCell.textContent = entry.recommendedCalories; // Safe as textContent escapes HTML
    row.appendChild(caloriesCell);

    tableBody.appendChild(row); // Append the row to the table body
  });
}