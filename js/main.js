//_________________________ definition of some global variables ______________________________________
const ctx = {
    w: 1800,
    h: 1200,
    GREY_NULL: "#333",
    DOUBLE_CLICK_THRESHOLD: 320,
};

// The categories of food to be extracted from the column alim_ssssgrp_nom_fr
const FOOD_CATEGORIES = ["fruits, légumes, légumineuses et oléagineux", "produits céréaliers", "viandes, œufs, poissons et assimilés", "produits laitiers et assimilés", "eaux et autres boissons", "matières grasses", "aides culinaires et ingrédients divers"];
const FOOD_ITEMS = [];
let transformedData =[];


// object to store the macro data of the selected iterm list
let macroData = {
    Calories: 0,
    Glucides: 0,
    Proteines: 0,
    Lipides: 0
};
// object to store the vitamin data of the selected iterm list
let vitaminData = [
    { axis: "Beta-Carotène", value: 0 },
    { axis: "Vitamine B1 (Thiamine)", value: 0 },
    { axis: "Vitamine B5", value: 0 },
    { axis: "Vitamine B6", value: 0 },
    { axis: "Vitamine C", value: 0 },
    { axis: "Vitamine D", value: 0 },
    { axis: "Vitamine E", value: 0 },
    { axis: "Vitamine K1", value: 0 }
];
// object to store the micro data of the selected iterm list
let microData = [
    { axis: "Calcium", value: 0 },
    { axis: "Magnésium", value: 0 },
    { axis: "Fer", value: 0 },
    { axis: "Potassium", value: 0 },
    { axis: "Zinc", value: 0 },
    { axis: "Sélénium", value: 0 },
    { axis: "Phosphore", value: 0 },
    { axis: "Iode", value: 0 }
];


// Bubble chart. An other approach to update the chart.
let updateChart;

// Array to hold the list of selected items with their quantities
let selectedItems = [];

// Info for the mapping of macro
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
// Info for the mapping of micro
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
// Info for the mapping of vitamins
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



//_________________________ definition of functions ______________________________________



/**
 * Called at the opening of the HTML
 * 
 * Creates the svg element
 * 
 * Calls DisplayHeaders to display the 2 rectangles with the titles
 * 
 * Calls CreateCard 3 times to have an empty card for macro, micro and vitamins
 * 
 * Calls loadData(svgEl) to retrieve the database.
 * 
 * Calls createCalorieViz pour la visualization du total macro + calorie de la liste
 * 
 * Calls the radar chart for micro and vitamins
 * 
 * Calls the bubble chart
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

    DisplayHeaders();

    // Create empty cards with zero values initially
    createCard(null, "Macro-Nutriments", 20, 70);
    createCard(null, "Micro-Nutriments", 20 + 320, 70);
    createCard(null, "Vitamines", 20 + 640, 70);
    
    loadData();
    
    const totalCalories = 2600;
    createCaloriesViz(totalCalories, macroData);

    // dirty call but it is working
    const testitem = {
        "Calcium": 0,
        "Magnésium": 0,
        "Fer": 0,
        "Potassium": 0,
        "Zinc": 0,
        "Sélénium": 0,
        "Phosphore": 0,
        "Iode": 0
    };
    createRadarChart({
        id: "radarChartMicro",
        x: 20,
        y: 580,
        width: 460,
        height: 450,
        title: "Macro-Nutriments",
        attributes: [
            { axis: "Calcium" },
            { axis: "Magnésium" },
            { axis: "Fer" },
            { axis: "Potassium" },
            { axis: "Zinc" },
            { axis: "Sélénium" },
            { axis: "Phosphore" },
            { axis: "Iode" }
        ],
        item: testitem
    });

    const testitemVitamins = {
        "Beta-Carotène": 0,
        "Vitamine B1 (Thiamine)": 0,
        "Vitamine B5": 0,
        "Vitamine B6": 0,
        "Vitamine C": 0,
        "Vitamine D": 0,
        "Vitamine E": 0,
        "Vitamine K1": 0
    };
    createRadarChart({
        id: "radarChartVitamins",
        x: 500,
        y: 580,
        width: 460,
        height: 450,
        title: "Vitamines",
        attributes: [
            { axis: "Beta-Carotène" },
            { axis: "Vitamine B1 (Thiamine)" },
            { axis: "Vitamine B5" },
            { axis: "Vitamine B6" },
            { axis: "Vitamine C" },
            { axis: "Vitamine D" },
            { axis: "Vitamine E" },
            { axis: "Vitamine K1" }
        ],
        item: testitemVitamins
    });


    updateChart = createBubbleChart(macroData, vitaminData, microData);

};





/**
 * Called by createViz()
 * 
 * Accesses the data from "data/food_table_new.csv"
 * 
 * Calls ProcessData(data) for specific extraction and processing
 * 
 * The data is stored inside the global variable transformedData
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
 * @returns filteredData which contains the data with the desired format ready for use. In particular we extract only some categories of food
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
 * calls updateCardValues(item,category) for macro, micro and vitamins
 * 
 * calls updateRadarChartWithData for micro and vitamins 
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
                updateRadarChartWithData(item,"radarChartMicro", "Micro-Nutriments");
                updateRadarChartWithData(item,"radarChartVitamins", "Vitamins");
            });

            autocompleteList.appendChild(suggestionDiv);
        });
    }
}






/**
 * Called by the HTML when there is a click.
 * 
 * Clears the suggestion bar
 */
document.addEventListener("click", (event) => {
    if (event.target !== inputField) {
        autocompleteList.innerHTML = "";
    }
});






/**
 * Called by createViz
 * 
 * Displays the two top rectangles with their title.
 */
function DisplayHeaders(){
    // we select our main svg
    const mainG = d3.select("#mainSVG");

    // then we populate it with a new Group which we place
    const headerG = mainG.append("svg")
        .attr("id", "headerG")
        .attr("x", 20)   // Horizontal position
        .attr("y", 0)   // Vertical position
        .style("border-radius", "12px")
        .style("overflow", "hidden"); // Pour la gestion des débordements


    // We add a rectanlge for the background of the group
    headerG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 940)
        .attr("height", 50)
        .attr("fill", "#2D2C52")
        .attr("rx", 12) 
        .attr("ry", 12)
        .append("text");
    // same for the other title
    headerG.append("rect")
        .attr("x", 1020)
        .attr("y", 0)
        .attr("width", 600)
        .attr("height", 50)
        .attr("fill", "#2D2C52")
        .attr("rx", 12) 
        .attr("ry", 12);

    // Add title text on top of the left rect
    headerG.append("text")
    .attr("x", 470)  // Horizontal position of the title
    .attr("y", 35)   // Vertical position
    .attr("text-anchor", "middle")  // Center the text horizontally
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .style("fill", "#FFF")
    .style("stroke", "white")
    .text("Valeur nutritionelle de l'aliment sélectionné");

    // Add title text on top of the right rect
    headerG.append("text")
    .attr("x", 1320)  // Horizontal position of the title
    .attr("y", 35)   // Vertical position
    .attr("text-anchor", "middle")  // Center the text horizontally
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .style("fill", "#FFF") 
    .style("stroke", "white")  
    .text("Valeur nutritionelle globale du repas");
}






/**
 * 
 * @param {*} item : au final on ne donne que la value null car on utilise une autre fonction pour la maj
 * @param {*} category : Macro-Nutriments, Micro-Nutriments ou Vitamines. Allows to select the correct attributes and names
 * @param {*} x : x position of the top left corner
 * @param {*} y : y position of the top left corner
 * 
 * It creates the 3 empty cars (macro, micro, vitamins)
 */
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



/**
 * 
 * @param {*} item : reference to the food item selected
 * @param {*} category : what type of attribute do we want (macro, mirco or vitamin)
 * @returns nothing, simply update the display of the cards by transitionning the values
 */
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








/**
 * called by the HTML when the add button is clicked on.
 * 
 * extracts the item and the quantity
 * 
 * calls displaySelectedItems to show it's nutritional values
 */
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



/**
 * called by addToList
 * 
 * after the adding of the item, we recompute the values for the total list of item
 * 
 * Calls updateMacroData, updateMicroData and updateVitaminsData
 * 
 * also calls updateCaloriesViz and updateChart.
 */
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
    microData = updateMicroData();
    vitaminData = updateVitaminsData();
    updateCaloriesViz(2600, macroData);
    updateChart(macroData, vitaminData, microData);

    
}



/**
 * called by the displaySelectedItems only when the cross button is clicked
 * 
 * @param {*} foodItem : reference to the item selected
 * 
 * removes the food item from the list 
 * 
 * calls displaySelectedItems 
 */
function removeItem(foodItem) {
    // Remove the item from the selectedItems array
    selectedItems = selectedItems.filter(item => item.foodItem !== foodItem);
    // Update the list display
    displaySelectedItems();
}





/**
 * Fonction utilitaire utilisé pour le prétraitement du dataset et le choix des échelles de valeur
 */
function calculateMaxValues(dataset, nutrients) {
    // Calculate max values for each nutrient in the dataset
    const maxValues = {};
    nutrients.forEach(nutrient => {
        maxValues[nutrient.key] = d3.max(dataset, d => parseFloat(d[nutrient.key]) || 0);
    });
    return maxValues;
}






/**
 * called by displaySelectedItems
 * 
 * updates the the global variable macroData based on the global variable selectedItems. Selected items contains the name and quantity. The data is then retrieved from transformed data 
 */
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


/**
 * called by displaySelectedItems
 * 
 * updates the the global variable microData based on the global variable selectedItems. Selected items contains the name and quantity. The data is then retrieved from transformed data 
 */
function updateMicroData() {
    // Initialize the microData object
    const microData = {
        Calcium: 0,
        Magnésium: 0,
        Fer: 0,
        Potassium: 0,
        Zinc: 0,
        Sélénium: 0,
        Phosphore: 0,
        Iode: 0
    };

    // Loop through selected items and calculate totals
    selectedItems.forEach(selected => {
        const { foodItem, quantity } = selected;

        // Find matching row in transformedData
        const matchingRow = transformedData.find(item => item.alim_nom_fr == foodItem);

        if (matchingRow) {
            // Update micro-nutrient totals
            micro_nutrients.forEach(nutrient => {
                const value = parseFloat(matchingRow[nutrient.key]) || 0;
                microData[nutrient.name] += (value * quantity) / 100;
            });
        }
    });

    console.log("Updated micro data:", microData);
    return microData;
}


/**
 * called by displaySelectedItems
 * 
 * updates the the global variable vitaminsData based on the global variable selectedItems. Selected items contains the name and quantity. The data is then retrieved from transformed data 
 */
function updateVitaminsData() {
    // Initialize the vitaminsData object
    const vitaminsData = {
        "Beta-Carotène": 0,
        "Vitamine B1 (Thiamine)": 0,
        "Vitamine B5": 0,
        "Vitamine B6": 0,
        "Vitamine C": 0,
        "Vitamine D": 0,
        "Vitamine E": 0,
        "Vitamine K1": 0
    };

    // Loop through selected items and calculate totals
    selectedItems.forEach(selected => {
        const { foodItem, quantity } = selected;

        // Find matching row in transformedData
        const matchingRow = transformedData.find(item => item.alim_nom_fr == foodItem);

        if (matchingRow) {
            // Update vitamin totals
            vitamins.forEach(vitamin => {
                const value = parseFloat(matchingRow[vitamin.key]) || 0;
                vitaminsData[vitamin.name] += (value * quantity) / 100;
            });
        }
    });

    console.log("Updated vitamins data:", vitaminsData);
    return vitaminsData;
}







/**
 * called by createViz
 * 
 * @param {*} totalCalories : goal amount of calories to be eaten in a day
 * @param {*} macroData : just the categories + instanced at 0
 */
function createCaloriesViz(totalCalories = 2600, macroData = {}) {
    // we select our main svg
    const mainG = d3.select("#mainSVG");

    // then we populate it with a new Group which we place
    const CalorieCountG = mainG.append("g")
        .attr("id", "CalorieCountG")
        .attr("transform", "translate(1040, 70)")
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



/**
 * called by displaySelectedItems
 * 
 * updates the display of the calorie visualization based on the updated values of macroData
 */
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






/**
 * Called by createViz
 * 
 * @param {*} param0 
 * 
 * Creates a radar chart
 * 
 */
function createRadarChart({ id, x, y, width, height, title, attributes, item }) {
    const mainG = d3.select("#mainSVG");

    // Remove any existing radar chart with the same ID
    mainG.select(`#${id}`).remove();

    // Append a group for the radar chart
    const radarChartG = mainG.append("g")
        .attr("id", id)
        .attr("transform", `translate(${x}, ${y})`);

    // Add a background rectangle
    radarChartG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#2D2C52")
        .attr("rx", 12)
        .attr("ry", 12);

    // Add a title
    radarChartG.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .style("fill", "#FFF")
        .text(title);

    // Radar chart setup
    const radarRadius = Math.min(width, height) / 2 - 80;
    const centerX = width / 2;
    const centerY = height / 2 + 10;

    // Number of attributes
    const axisCount = attributes.length;
    const angleSlice = (2 * Math.PI) / axisCount;

    // Scale for values (0 to 1)
    const valueScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radarRadius]);

    // Create the radar axes
    const radarGroup = radarChartG.append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`);

    // Draw the axes and labels
    attributes.forEach((d, index) => {
        const angle = angleSlice * index - Math.PI / 2;

        // Draw axis lines
        radarGroup.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", valueScale(1) * Math.cos(angle))
            .attr("y2", valueScale(1) * Math.sin(angle))
            .attr("stroke", "#FFF")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2");

        // Add labels for each axis
        radarGroup.append("text")
            .attr("x", (valueScale(1) + 10) * Math.cos(angle))
            .attr("y", (valueScale(1) + 10) * Math.sin(angle))
            .attr("text-anchor", angle > Math.PI / 2 || angle < -Math.PI / 2 ? "end" : "start")
            .attr("alignment-baseline", "middle")
            .style("font-size", "12px")
            .style("fill", "#FFF")
            .text(d.axis);
    });

    // Create a smooth line generator for the radar polygon
    const lineGenerator = d3.lineRadial()
        .radius(d => valueScale(d.value))
        .angle((d, i) => i * angleSlice);

    // Prepare the radar data
    const radarData = attributes.map(attribute => {
        // Retrieve the value from the provided item
        const value = item && item[attribute.axis] ? item[attribute.axis] : 0; // Default to 0 if no value found
        return {
            axis: attribute.axis,
            value: value
        };
    });

    // Create radar chart's polygon
    radarGroup.append("path")
        .attr("id","radarPath")
        .datum(radarData)
        .attr("fill", "#52E08D")
        .attr("fill-opacity", 1)
        .attr("stroke", "#52E08D")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

    // Draw circular grid lines
    const gridLevels = 5; // Number of circular grid lines
    for (let level = 1; level <= gridLevels; level++) {
        radarGroup.append("circle")
            .attr("r", valueScale(level / gridLevels))
            .attr("fill", "none")
            .attr("stroke", "#FFF")
            .attr("stroke-opacity", 0.3);
    }
}


/**
 * called by filterSuggestions
 * 
 * @param {*} item : the item food selected
 * @param {*} id : the id of the radarchart because we had conflict between charts
 * @param {*} category : the category of the chart (micro or vitamins)
 * 
 * updates the dispaly of the radar chart based on the food item currently selected
 */
function updateRadarChartWithData(item, id, category) {
    console.log(item);

    // Radar chart setup (same as before)
    const width = 460;
    const height = 450;
    const radarRadius = Math.min(width, height) / 2 - 80;
    const axisCount = 8;
    const angleSlice = (2 * Math.PI) / axisCount;

    // Scale for values (0 to 1)
    const valueScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radarRadius]);

    let nutrients = [];
    let group = d3.select("#radarChartMicro")
    let values = [
        { axis: 'Calcium', value: 0 },
        { axis: 'Magnésium', value: 0 },
        { axis: 'Fer', value: 0 },
        { axis: 'Potassium', value: 0 },
        { axis: 'Zinc', value: 0 },
        { axis: 'Sélénium', value: 0 },
        { axis: 'Phosphore', value: 0 },
        { axis: 'Iode', value: 0 }
    ];

    if (category === "Micro-Nutriments") {
        nutrients = micro_nutrients;
        group = d3.select("#radarChartMicro")
        let values = [
            { axis: 'Calcium', value: 0 },
            { axis: 'Magnésium', value: 0 },
            { axis: 'Fer', value: 0 },
            { axis: 'Potassium', value: 0 },
            { axis: 'Zinc', value: 0 },
            { axis: 'Sélénium', value: 0 },
            { axis: 'Phosphore', value: 0 },
            { axis: 'Iode', value: 0 }
        ];
    }
    else{
        nutrients = vitamins;
        group = d3.select("#radarChartVitamins")
        let values = [
            { axis: 'Beta-Carotène', value: 0 },
            { axis: 'Vitamine B1 (Thiamine)', value: 0 },
            { axis: 'Vitamine B5', value: 0 },
            { axis: 'Vitamine B6', value: 0 },
            { axis: 'Vitamine C', value: 0 },
            { axis: 'Vitamine D', value: 0 },
            { axis: 'Vitamine E', value: 0 },
            { axis: 'Vitamine K1', value: 0 }
        ];
    }

    nutrients.forEach((nutrient, index) => {
        console.log(nutrient, index);
        const value = parseFloat(item[nutrient.key]) || 0; // Default to 0 if the value is missing
        const max = (d3.max(transformedData, d => parseFloat(d[nutrient.key]) || 0) || 1) / 3; // Max value for bar scaling
        const normalizedValue = Math.min(1, (value / max) * 5); //! normalization to change but increased for better visibility
        if (normalizedValue !== undefined) {
            values[index].value = normalizedValue;  // Update the radarData value
        }
    });

    console.log(values);

    // Update the radar chart with the new values
    const radarChartG = group.select(`#${category}`); // Select the radar chart group by category

    // Update the path (the polygon) to represent the new values
    const lineGenerator = d3.lineRadial()
        .radius(d => valueScale(d.value))
        .angle((d, i) => i * angleSlice);

    // Check if the path exists, and if not, create it.
    const path = group.select("#radarPath");
    if (path.empty()) {
        console.log("path not detected");
        radarChartG.append("path")
            .datum(values)
            .attr("id", "radarPath") // Assign an ID for later reference
            .attr("fill", "#52E08D")
            .attr("fill-opacity", 0.6)
            .attr("stroke", "#4CAF50")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);
    } else {
        console.log("path detected");
        // If the path already exists, update it with a smooth transition.
        path.datum(values)
            .transition() // Apply smooth transition
            .duration(1000)
            .attr("d", lineGenerator); // Update the radar chart's polygon path
    }

}





/**
 * called by createViz
 * 
 * @param {*} macroData 
 * @param {*} vitaminData 
 * @param {*} microData 
 * @returns : the update function to modify the display based on the items inside the list 
 * 
 * display an interactive bubble chart that can be updated.
 * 
 * The update is called in displaySelectedItems
 */
function createBubbleChart(macroData, vitaminData, microData) {
    // Select the main SVG
    const mainG = d3.select("#mainSVG");

    // Create a new group for the bubble chart if not already created
    const bubbleChart = mainG.select("#BubbleChart")
        .empty() ? mainG.append("g")
        .attr("id", "BubbleChart")
        .attr("transform", "translate(1040, 390)") : mainG.select("#BubbleChart");

    // Background rectangle
    bubbleChart.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 600)
        .attr("height", 640)
        .attr("fill", "#2D2C52")
        .attr("rx", 12)
        .attr("ry", 12);

    // Add title
    bubbleChart.append("text")
        .attr("x", 300)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .style("fill", "#FFF")
        .text("Dynamic Bubble Chart");

    // Chart dimensions
    const width = 600;
    const height = 580;

    // Combine all data into one array
    const combinedData = [
        ...Object.keys(macroData).map((key, index) => ({
            id: `macro-${index + 1}`,
            value: macroData[key],
            label: key
        })),
        ...vitaminData.map((v, index) => ({
            id: `vitamin-${index + 1}`,
            value: v.value,
            label: v.axis
        })),
        ...microData.map((m, index) => ({
            id: `micro-${index + 1}`,
            value: m.value,
            label: m.axis
        }))
    ];

    // Scale for bubble sizes
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(combinedData, d => d.value)])
        .range([10, 50]); // Adjust size range as needed

    // Create a force simulation
    const simulation = d3.forceSimulation(combinedData)
        .force("center", d3.forceCenter(width / 2, height / 2)) // Center force
        .force("charge", d3.forceManyBody().strength(15))       // Attraction force (positive value attracts)
        .force("collide", d3.forceCollide().radius(d => sizeScale(d.value) + 5).strength(0.7)) // Prevent overlap
        .alpha(3) // Initial alpha value (higher means stronger forces initially)
        .alphaDecay(0.001) // Slower decay keeps forces strong longer
        .on("tick", ticked);

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Add bubbles (circles)
    const bubbles = bubbleChart.selectAll("circle")
        .data(combinedData, d => d.id)
        .enter().append("circle")
        .attr("r", d => sizeScale(d.value))
        .attr("fill", d => d.value === 0 ? "red" : "green") // Set color based on value
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .call(d3.drag() // Enable dragging
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Label: ${d.label}<br>Value: ${d.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");

            d3.select(event.target).attr("fill", "orange");
        })
        .on("mouseout", (event) => {
            tooltip.transition().duration(200).style("opacity", 0);
            d3.select(event.target).attr("fill", d => d.value === 0 ? "red" : "green");
        });

    // Add labels to the bubbles
    const labels = bubbleChart.selectAll("text.bubble-label")
        .data(combinedData)
        .enter().append("text")
        .attr("class", "bubble-label")
        .style("fill", "#FFF")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .text(d => d.label);

    // Update positions on each tick
function ticked() {
    // Update bubble positions
    bubbles
        .attr("cx", d => !isNaN(d.x) ? d.x : 0)  // Ensure cx is a number
        .attr("cy", d => !isNaN(d.y) ? d.y : 0); // Ensure cy is a number

    // Update label positions
    labels
        .attr("x", d => !isNaN(d.x) ? d.x : 0)  // Ensure x is a number
        .attr("y", d => !isNaN(d.y) ? d.y + 4 : 0); // Ensure y is a number and offset by 4
}


    // Drag event handlers
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Function to update the chart based on new data
    function updateBubbleChart(newMacroData, newVitaminData, newMicroData) {
        console.log("test entrée")
        console.log(newVitaminData)
        // Convert the objects to an array of objects
        let vitaminDataArray = Object.entries(newVitaminData).map(([axis, value]) => ({
            axis: axis, // Vitamin name
            value: value // Vitamin value
        }));
        let microDataArray = Object.entries(newMicroData).map(([axis, value]) => ({
            axis: axis, // Vitamin name
            value: value // Vitamin value
        }));
        // Update the combined data
        const updatedData = [
            ...Object.keys(newMacroData).map((key, index) => ({
                id: `macro-${index + 1}`,
                value: newMacroData[key],
                label: key
            })),
            ...vitaminDataArray.map((v, index) => ({
                id: `vitamin-${index + 1}`,
                value: v.value,
                label: v.axis
            })),
            ...microDataArray.map((m, index) => ({
                id: `micro-${index + 1}`,
                value: m.value,
                label: m.axis
            }))
        ];

        // Update the size scale
        sizeScale.domain([0, d3.max(updatedData, d => d.value)]);

        // Rebind the updated data to the bubbles
        const updatedBubbles = bubbleChart.selectAll("circle")
            .data(updatedData, d => d.id);

        // Update bubble attributes
        updatedBubbles
            .transition().duration(500) // Animate the update
            .attr("r", d => sizeScale(d.value))
            .attr("fill", d => d.value === 0 ? "red" : "green");

        // Update bubble labels
        const updatedLabels = bubbleChart.selectAll("text.bubble-label")
            .data(updatedData);

        updatedLabels
            .transition().duration(500) // Animate the update
            .attr("x", d => d.x)
            .attr("y", d => d.y + 4)
            .text(d => d.label);

        // Restart the simulation to update positions
        simulation.nodes(updatedData).alpha(1).restart();
    }

    return updateBubbleChart; // Return the update function so you can call it later
}



