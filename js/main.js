const ctx = {
    w: 1800,
    h: 900,
    GREY_NULL: "#333",
    DOUBLE_CLICK_THRESHOLD: 320,
};

// The categories of food to be extracted from the column alim_ssssgrp_nom_fr
const FOOD_CATEGORIES = ["fruits, légumes, légumineuses et oléagineux", "produits céréaliers", "viandes, œufs, poissons et assimilés", "produits laitiers et assimilés", "eaux et autres boissons", "matières grasses", "aides culinaires et ingrédients divers"];
const FOOD_ITEMS = [];
let transformedData =[];
let macroData = {
    Calories: 0,
    Glucides: 0,
    Proteines: 0,
    Lipides: 0
};


const macro_nutrients = [
    { name: "Énergie", key: "Energie, Règlement UE N° 1169/2011 (kcal/100 g)", max: 200 },
    { name: "Lipides", key: "Lipides (g/100 g)", max: 50 },
    { name: "AG saturés", key: "AG saturés (g/100 g)", max: 50},
    { name: "Glucides", key: "Glucides (g/100 g)", max: 100},
    { name: "Sucres: ", key: "Sucres (g/100 g)", max: 100},
    { name: "Fibres: ", key: "Fibres alimentaires (g/100 g)", max: 100},
    { name: "Protéines", key: "Protéines, N x facteur de Jones (g/100 g)", max: 50 },
    { name: "Sel", key: "Sel chlorure de sodium (g/100 g)", max: 5 }
];

const micro_nutrients = [
    { name: "Calcium", key: "Calcium (mg/100 g)", max: 1200 },
    { name: "Magnésium", key: "Magnésium (mg/100 g)", max: 400 },
    { name: "Fer", key: "Fer (mg/100 g)", max: 18 },
    { name: "Potassium", key: "Potassium (mg/100 g)", max: 3500 },
    { name: "Zinc", key: "Zinc (mg/100 g)", max: 11 },
    { name: "Sélénium", key: "Sélénium (μg/100 g)", max: 70 },
    { name: "Phosphore", key: "Phosphore (mg/100 g)", max: 700 },
    { name: "Iode", key: "Iode (μg/100 g)", max: 150 }
];

const vitamins = [
    { name: "Beta-Carotène", key: "Beta-Carotène (µg/100 g)" },
    { name: "Vitamine B1 (Thiamine)", key: "Vitamine B1 ou Thiamine (mg/100 g)" },
    { name: "Vitamine B5", key: "Vitamine B5 ou Acide pantothénique (mg/100 g)" },
    { name: "Vitamine B6", key: "Vitamine B6 (mg/100 g)" },
    { name: "Vitamine C", key: "Vitamine C (mg/100 g)" },
    { name: "Vitamine D", key: "Vitamine D (µg/100 g)" },
    { name: "Vitamine E", key: "Vitamine E (mg/100 g)" },
    { name: "Vitamine K1", key: "Vitamine K1 (µg/100 g)" },
];


// Initialize references to the input field and autocomplete list
const inputField = document.getElementById("myInput");
const autocompleteList = document.getElementById("autocomplete-list");



/**
 * Called at the opening of the HTML
 * 
 * Creates the svg element
 * 
 * Calls CreateCard to have the empty cards
 * 
 * Calls loadData(svgEl) to retrieve the database.
 */
function createViz() {
    console.log("Using D3 v" + d3.version);
    let svgEl = d3.select("#main").append("svg").attr("id", "mainSVG")
    .style("position", "relative") // Set absolute positioning
    .style("left", "450px")
    .style("top", "0px");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    svgEl.append("svg").attr("id", "CardSVG");

    // Create empty cards with zero values initially
    createCard(null, "Macro-Nutriments", 40, 15);
    createCard(null, "Micro-Nutriments", 40 + 320, 15);
    createCard(null, "Vitamines", 40 + 640, 15);

    loadData();
    
    const totalCalories = 2600;
    const eatenCalories = 2000;

    createCaloriesViz(totalCalories, eatenCalories, macroData);
}



/**
 * Called by createViz()
 * 
 * Accesses the data from "data/food_table_new.csv"
 * 
 * Calls ProcessData(data) for specific extraction and processing
 */
function loadData() {
    d3.csv("data/food_table_new.csv")
        .then(function (data) {
            // Preprocess and pass transformed data
            transformedData = ProcessData(data);
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
            alert("An error occurred while loading the data.");
        });
}



/**
 * Called by loadData()
 * 
 * @param {*} data contains the raw data that needs to be processed to be ready to use.
 * 
 * @returns filteredData which contains the data with the desired format ready for use.
 */
function ProcessData(data) {
    console.log("Column headers:", data.columns);

    // Filter rows based on FOOD_CATEGORIES and then include the entire row in the filteredData
    const filteredData = data
        .filter(row => FOOD_CATEGORIES.includes(row.alim_grp_nom_fr)); // Filter rows based on condition

    filteredData.forEach(row => {
        FOOD_ITEMS.push(row); // Add the entire row to the FOOD_ITEMS array
    });

    return filteredData; // Return the full rows (not just alim_nom_fr)
}




/**
 * called by the HTML when the search bar is used.
 * 
 * updates the selected item and modify the display by calling updateCardValues(item,category)
 * 
 * calls updateCardValues(item,category)
 */
function filterSuggestions() {
    const query = inputField.value.toLowerCase();
    autocompleteList.innerHTML = ""; // Clear previous suggestions
    
    if (query) {
        const filteredItems = FOOD_ITEMS.filter(item =>
            item.alim_nom_fr.toLowerCase().startsWith(query) // Compare against alim_nom_fr of each row
        );

        filteredItems.forEach(item => {
            const suggestionDiv = document.createElement("div");
            // Highlight matching part
            const highlightedText = `<strong>${item.alim_nom_fr.substring(0, query.length)}</strong>${item.alim_nom_fr.substring(query.length)}`;
            suggestionDiv.innerHTML = highlightedText;

            suggestionDiv.addEventListener("click", () => {
                inputField.value = item.alim_nom_fr; // Set input to selected suggestion
                autocompleteList.innerHTML = ""; // Clear suggestions
                updateCardValues(item,"Macro-Nutriments");
                updateCardValues(item,"Micro-Nutriments");
                updateCardValues(item,"Vitamines");
            });

            autocompleteList.appendChild(suggestionDiv);
        });
    }
}



document.addEventListener("click", (event) => {
    if (event.target !== inputField) {
        autocompleteList.innerHTML = "";
    }
});





function createCard(item, category, x, y) {
    const CardSVG = d3.select("#CardSVG");
    const myCard = CardSVG.append("g")
        .attr("id", category)
        .attr("transform", `translate(${x}, ${y})`); // Position at top-left corner with some padding

    // Background of the card (rect element)
    myCard.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 490)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("fill", "#2D2C52")
        .style("stroke", "#2F323A")
        .style("stroke-width", "2");

    // Card title
    myCard.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(category)
        .style("fill", "white");

    let nutrients = [];
    if (category === "Macro-Nutriments") {
        nutrients = macro_nutrients;
    } else if (category === "Micro-Nutriments") {
        nutrients = micro_nutrients;
    } else if (category === "Vitamines") {
        nutrients = vitamins;
    }
    // Default behavior when no item is provided (empty state with zeros)
    if (!item) {
        // Loop over nutrient categories and show them with zero values and bars with zero width
        nutrients.forEach((nutrient, index) => {
            const value = 0; // Set value to 0
            const max = 1; // Max value is 1 (to avoid division by zero in the bar calculation)
            const barWidth = Math.min(280, 280 * (value / max)); // This will be 0 since value is 0
            const yOffset = 90 + index * 50; // Position each nutrient block vertically

            // Extract the unit from the key (µg or mg)
            const unit = nutrient.key.match(/\(([^)]+)\)/);
            const nutrientUnit = unit ? unit[1] : "test";

            // Add nutrient text (name and zero value)
            myCard.append("text")
                .attr("x", 10)
                .attr("y", yOffset)
                .style("font-size", "12px")
                .style("fill", "white")
                .text(`${nutrient.name}: ${value} ${nutrientUnit}`);

            // Add nutrient bar (will be width 0)
            myCard.append("rect")
                .attr("x", 10)
                .attr("y", yOffset + 10)
                .attr("width", barWidth)
                .attr("height", 10)
                .attr("rx", 5) // Horizontal corner radius
                .attr("ry", 5) // Vertical corner radius
                .style("fill", "#52E08D") // Green color for the bar
                .style("stroke", "#333")
                .style("stroke-width", "1");
        });
    }
}



// Array to hold the list of selected items with their quantities
let selectedItems = [];

// This function gets called when the "Add to List" button is clicked
function addToList() {
    // Get the value of the selected item and quantity
    const selectedItem = document.getElementById("myInput").value;
    const quantity = document.getElementById("quantityInput").value;

    // Check if both the item and quantity are selected
    if (selectedItem && quantity) {
        // add the element to the list of selected items with its quantity
        let newItem = { foodItem: selectedItem, quantity: quantity };
        selectedItems.push(newItem)

        displaySelectedItems();


    } else {
        // Optionally, show an alert or error message if the input is invalid
        alert("Please enter a valid food item and quantity.");
    }
    console.log("selectedItems :", selectedItems)
}




// Function to display the selected items and their quantities
function displaySelectedItems() {
    const selectedItemsList = document.getElementById('selectedItemsList');
    
    // Clear the current list
    selectedItemsList.innerHTML = '';

    // Loop through the selected items and display each one
    selectedItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.foodItem}: ${item.quantity} grams`;
        listItem.classList.add('white-text');
        // create a remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = `x`;
        removeButton.className = 'remove-btn';
        removeButton.onclick = () => removeItem(item.foodItem);

        listItem.appendChild(removeButton);

        selectedItemsList.appendChild(listItem);
    });
    updateMacroData();
    updateCaloriesViz(2600, macroData);
    
}



// Function to remove an item from the list
function removeItem(foodItem) {
    // Remove the item from the selectedItems array
    selectedItems = selectedItems.filter(item => item.foodItem !== foodItem);
    // Update the list display
    displaySelectedItems();

}




function calculateMaxValues(dataset, nutrients) {
    // Calculate max values for each nutrient in the dataset
    const maxValues = {};
    nutrients.forEach(nutrient => {
        maxValues[nutrient.key] = d3.max(dataset, d => parseFloat(d[nutrient.key]) || 0);
    });
    return maxValues;
}





function updateCardValues(item, category) {
    const cardGroup = d3.select(`#${category}`);

    // Check if the card exists
    if (cardGroup.empty()) {
        console.log(`Card for ${category} not found.`);
        return;
    }

    let nutrients = [];
    if (category === "Macro-Nutriments") {
        nutrients = macro_nutrients;
    } else if (category === "Micro-Nutriments") {
        nutrients = micro_nutrients;
    } else if (category === "Vitamines") {
        nutrients = vitamins;
    }

    // Iterate over each nutrient and update the values
    nutrients.forEach((nutrient, index) => {
        const value = parseFloat(item[nutrient.key]) || 0; // Default to 0 if the value is missing
        const max = (d3.max(transformedData, d => parseFloat(d[nutrient.key]) || 0) || 1) / 3; // Max value for bar scaling
        const barWidth = Math.min(280, 280 * (value / max)); // Bar width based on the value

        const yOffset = 90 + index * 50; // Position each nutrient block vertically

        // Extract the unit from the key (µg or mg)
        const unit = nutrient.key.match(/\(([^)]+)\)/);
        const nutrientUnit = unit ? unit[1] : "unit"; // Extracted unit or default to "unit" if no match

        // Select the text and update its content
        cardGroup.selectAll("text")
            .filter(function (d, i) { return i !== 0 && i === index + 1; }) 
            .text(`${nutrient.name}: ${value.toFixed(1)} ${nutrientUnit}`)
            .transition() // Apply transition to text
            .duration(1000)
            .style("fill", "white");

        // Select the bar and transition the width
        cardGroup.selectAll("rect")
            .filter(function(d, i) { return i === index + 1; }) // Select the bar rect
            .transition() // Apply transition to the bar
            .duration(1000)
            .attr("width", barWidth);
    });
}






function createCaloriesViz(totalCalories = 2600, eatenCalories = 0, macroData = {}) {
    // we select our main svg
    const mainG = d3.select("#mainSVG");

    // then we populate it with a new Group which we place
    const CalorieCountG = mainG.append("g")
        .attr("id", "CalorieCountG")
        .attr("transform", "translate(1050, 15)")
        .style("border-radius", "12px")
        .style("overflow", "hidden");


    // We add a rectanlge for the background of the group and better visualization of this element
    CalorieCountG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 600)
        .attr("height", 300)
        .attr("fill", "#2D2C52")
        .attr("rx", 12) 
        .attr("ry", 12);

    // Add title text to the top of the group
    CalorieCountG.append("text")
    .attr("x", 300)  // Horizontal position of the title
    .attr("y", 50)   // Vertical position (a little above the content)
    .attr("text-anchor", "middle")  // Center the text horizontally
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .style("fill", "#FFF")  // White color
    .style("stroke", "white")  // Optional for clarity
    .text("Apports du jour");

    // We make a circular progress bar for the calories 
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const progressGroup = CalorieCountG.append("g")
        .attr("transform", "translate(100, 150)");

    // Background circle
    progressGroup.append("circle")
        .attr("r", radius)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 10)
        .attr("opacity", 0.1)
        .attr("fill", "none");

    // Progress circle
    const progressCircle = progressGroup.append("circle")
        .attr("id", "progressCircle")
        .attr("r", radius)
        .attr("stroke", "#52E08D")
        .attr("stroke-width", 10)
        .attr("fill", "none")
        .attr("stroke-dasharray", circumference)
        .attr("stroke-dashoffset", circumference)
        .attr("stroke-linecap", "round") // Makes the ends rounded
        .attr("transform", "rotate(-90)"); // Adjusts the start point to the north

    // Text in the center of the circle (Empty values)
    progressGroup.append("text")
        .attr("id", "CaloriesCount")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#333")
        .style("font-size", "16px")
        .style("stroke", "white")
        .text(`${0} kcal`);

    progressGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "2em")
        .attr("fill", "#666")
        .style("font-size", "12px")
        .style("stroke", "white")
        .text("Total calorique");

        
    // Macro Nutrient Bars
    const macroGroup = CalorieCountG.append("g")
        .attr("id", "macroGroup")
        .attr("transform", "translate(250, 100)");

    const barsGroup = macroGroup.append("g").attr("id", "barsGroup");
    const percentGroup = macroGroup.append("g").attr("id", "percentGroup");

    const total_Carbs = 325;
    const total_Protein = 100;
    const total_Fats = 70;
    const macros = Object.entries(macroData); // Empty data for now
    macros.slice(1).forEach((macro, i) => {
        const [name, value] = macro;
        const yOffset = i * 50;

        // Macro title
        macroGroup.append("text")
            .attr("x", 0)
            .attr("y", yOffset)
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("fill", "#333")
            .style("stroke", "white")
            .text(name);


        // Background bar
        macroGroup.append("rect")
            .attr("x", 100)
            .attr("y", yOffset)
            .attr("width", 200)
            .attr("height", 10)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("opacity", 0.1)
            .attr("fill", "#e0e0e0");

        // Progress bar (Empty for now)
        barsGroup.append("rect")
            .attr("x", 100)
            .attr("y", yOffset)
            .attr("width", 0) // Empty bar
            .attr("height", 10)
            .attr("fill", "#52E08D")
            .attr("rx", 5)
            .attr("ry", 5);

        // Percentage text (Empty for now)
        percentGroup.append("text")
            .attr("x", 310)
            .attr("y", yOffset)
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("fill", "#333")
            .style("stroke", "white")
            .text(`0%`);
    });
}



// Function to update the macroData object based on the transformed data
function updateMacroData() {
    macroData = {
        Calories: 0,
        Glucides: 0,
        Proteines: 0,
        Lipides: 0
    };

    selectedItems.forEach(selected =>{
        const {foodItem,quantity} = selected;

        const matchingRow = transformedData.find(item => item.alim_nom_fr == foodItem);

        if (matchingRow){
            macroData.Calories += (parseFloat(matchingRow["Energie, Règlement UE N° 1169/2011 (kcal/100 g)"]) || O) * quantity/100
            macroData.Glucides += (parseFloat(matchingRow["Glucides (g/100 g)"]) || 0) * quantity/100;
            macroData.Proteines += (parseFloat(matchingRow["Protéines, N x facteur de Jones (g/100 g)"]) || 0) * quantity/100;
            macroData.Lipides += (parseFloat(matchingRow["Lipides (g/100 g)"]) || 0) * quantity/100;
        }
    }

    )
    console.log("Updated macro data:", macroData);
}


function updateCaloriesViz(totalCalories, macroData) {

    const progressGroup = d3.select("#CalorieCountG").select("g");

    // Update Progress Circle
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const progressCircle = progressGroup.select("#progressCircle");// Progress circle
    const progressPercentage = Math.min(1, macroData.Calories / totalCalories);
    const dashOffset = circumference * (1 - progressPercentage);

    console.log(progressPercentage)
    if (macroData.Calories > 1.1 * totalCalories ) {
        // Shift to red when the percentage is above 100%. We eat too much calories
        progressCircle
            .attr("stroke", "#FF6262") // Change stroke to red
            .transition()
            .duration(1000)
            .attr("stroke-dashoffset", 0); // Set dashOffset to 0 for full circle
    }
    else if (macroData.Calories < 0.8 * totalCalories){
        progressCircle
            .attr("stroke", "#FF6262") // Reset to original color
            .transition()
            .duration(1000)
            .attr("stroke-dashoffset", dashOffset); // Update the progress based on percentage
    }
    else {
        progressCircle
        .attr("stroke", "#52E08D") // Reset to original color
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", dashOffset); // Update the progress based on percentage
    }

    // Update Calories Text
    progressGroup.select("#CaloriesCount") // Text showing kcal
        .text(`${macroData.Calories} kcal`);
    


    // Update Macro Bars and Percentages
    const barsGroup = d3.select("#barsGroup");
    const percentGroup = d3.select("#percentGroup");

    // We get rid of the calorie line
    const macros = Object.entries(macroData).slice(1);

    // Define the total macros for calculation. Just a reference. 
    const total_Carbs = 325;
    const total_Protein = 100;
    const total_Fats = 90;

    macros.forEach((macro, i) => {
        const [name, value] = macro;
        const yOffset = i * 50; // Vertical position for each bar

        // Set the progress bar width based on macro value
        let maxMacroValue = 0;
        if (name === 'Glucides') {
            maxMacroValue = total_Carbs;
        } else if (name === 'Proteines') {
            maxMacroValue = total_Protein;
        } else if (name === 'Lipides') {
            maxMacroValue = total_Fats;
        }

        // Calculate the width of the progress bar based on percentage
        const progressWidth = Math.min(200,(value / maxMacroValue) * 200); // max width 200px

        if (value >= 1.3 * maxMacroValue){
            barsGroup.selectAll("rect")
            .filter((d, index) => index === i)
            .attr("fill", "#FF6262")
            .transition()
            .duration(1000)
            .attr("width", progressWidth);
        }
        else {
            // Update the progress bar width
            barsGroup.selectAll("rect")
            .filter((d, index) => index === i)
            .attr("fill", "#52E08D")
            .transition()
            .duration(1000)
            .attr("width", progressWidth);

        }


        // Update the percentage text
        const percentage = ((value / maxMacroValue) * 100).toFixed(1);
        percentGroup.selectAll("text")
            .filter((d, index) => index === i)
            .transition()
            .duration(1000)
            .text(`${percentage}%`);
    })

};
