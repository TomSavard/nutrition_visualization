const ctx = {
    w: 1200,
    h: 900,
    GREY_NULL: "#333",
    DOUBLE_CLICK_THRESHOLD: 320,
};

// The categories of food to be extracted from the column alim_ssssgrp_nom_fr
const FOOD_CATEGORIES = ["fruits, légumes, légumineuses et oléagineux", "produits céréaliers", "viandes, œufs, poissons et assimilés", "produits laitiers et assimilés", "eaux et autres boissons", "matières grasses", "aides culinaires et ingrédients divers"];
const FOOD_ITEMS = [];
let transformedData =[];



// Initialize references to the input field and autocomplete list
const inputField = document.getElementById("myInput");
const autocompleteList = document.getElementById("autocomplete-list");

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


function createViz() {
    console.log("Using D3 v" + d3.version);
    let svgEl = d3.select("#main").append("svg").attr("id", "mainSVG");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    loadData(svgEl);
}

function loadData(svgEl) {
    d3.csv("data/food_table_new.csv")
        .then(function (data) {
            // Preprocess and pass transformed data
            transformedData = ProcessData(data)
            // createSVGcard(5,5)
            // createSVGcard(310,5)
            ;
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
            alert("An error occurred while loading the data.");
        });
}

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
                DisplayChosenElement(item); // Display the chosen element
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

function DisplayChosenElement(selectedItem) {
    const chosenElement = selectedItem.alim_nom_fr.trim();
    console.log("Chosen Element:", chosenElement);

    if (transformedData && chosenElement) {
        const itemData = transformedData.find(row =>
            row.alim_nom_fr.toLowerCase() === chosenElement.toLowerCase()
        );

        if (itemData) {
            // Call the function to create a card displaying selected item's details
            console.log(itemData)
            mainCard(5, 15, itemData)
            vitaminCard(5, 15, itemData)
            mineralCard(5, 15, itemData);
        } else {
            console.log("No matching item found.");
        }
    } else {
        console.log("No data or input element is empty.");
    }
}

function calculateMaxValues(dataset, nutrients) {
    // Calculate max values for each nutrient in the dataset
    const maxValues = {};
    nutrients.forEach(nutrient => {
        maxValues[nutrient.key] = d3.max(dataset, d => parseFloat(d[nutrient.key]) || 0);
    });
    return maxValues;
}


function mainCard(x, y, item) {
    const mainSVG = d3.select("#mainSVG");

    // Create the card's background using a rectangle
    const nestedSvg = mainSVG.append("g")
        .attr("id", "infoCard")
        .attr("transform", `translate(${x}, ${y})`); // Position at top-left corner with some padding

    // Background of the card (rect element)
    nestedSvg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 490)
        .attr("rx", 10)
        .attr("ry",10)
        .style("fill", "#f9f9f9")
        .style("stroke", "#333")
        .style("stroke-width", "2");

    // Add Food Name
    nestedSvg.append("text").attr("x", 10).attr("y", 30).style("font-size", "16px").style("font-weight", "bold").text(item.alim_nom_fr);
    // Add Category
    nestedSvg.append("text").attr("x", 10).attr("y", 60).style("font-size", "14px").style("fill", "#666").text(item.alim_ssssgrp_nom_fr);

    // Nutrient Texts and Bars
    const nutrients = [
        { name: "Énergie", key: "Energie, Règlement UE N° 1169/2011 (kcal/100 g)", max: 200 },
        { name: "Lipides", key: "Lipides (g/100 g)", max: 50 },
        { name: "AG saturés", key: "AG saturés (g/100 g)", max: 50},
        { name: "Glucides", key: "Glucides (g/100 g)", max: 100},
        { name: "Sucres: ", key: "Sucres (g/100 g)", max: 100},
        { name: "Fibres: ", key: "Fibres alimentaires (g/100 g)", max: 100},
        { name: "Protéines", key: "Protéines, N x facteur de Jones (g/100 g)", max: 50 },
        { name: "Sel", key: "Sel chlorure de sodium (g/100 g)", max: 5 }
    ];

nutrients.forEach((nutrient, index) => {
        const value = parseFloat(item[nutrient.key]) || 0; // Default to 0 if the value is missing
        const max = (d3.max(transformedData, d => parseFloat(d[nutrient.key]) || 0) || 1)/3;
        console.log(nutrient.key + max)
        const barWidth = Math.min(280, 280 * (value / max));
        const yOffset = 90 + index * 50; // Position each nutrient block vertically

        // Add nutrient text
        nestedSvg.append("text")
            .attr("x", 10)
            .attr("y", yOffset)
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(`${nutrient.name}: ${value.toFixed(1)} ${nutrient.key.includes("(g/100 g)") ? "g" : "kcal"}`);

        // Add nutrient bar
        nestedSvg.append("rect")
            .attr("x", 10)
            .attr("y", yOffset + 10)
            .attr("width", barWidth)
            .attr("height", 10)
            .style("fill", "#4CAF50") // Green color for the bar
            .style("stroke", "#333")
            .style("stroke-width", "1");
    });
}

function mineralCard(x, y, item) {
    const mainSVG = d3.select("#mainSVG");

    const microNutrientCard = mainSVG.append("g")
        .attr("id", "microNutrientCard")
        .attr("transform", `translate(${x + 320}, ${y})`); // Position second card next to the first one

    // Background of the micro-nutrient card
    microNutrientCard.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 490)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("fill", "#f9f9f9")
        .style("stroke", "#333")
        .style("stroke-width", "2");

    // Add Micro-Nutrients Info Title
    microNutrientCard.append("text").attr("x", 10).attr("y", 30).style("font-size", "16px").style("font-weight", "bold").text("Micro-Nutrients");

    // Micro-Nutrients Data
    const nutrients = [
        { name: "Calcium", key: "Calcium (mg/100 g)", max: 1200 },
        { name: "Magnésium", key: "Magnésium (mg/100 g)", max: 400 },
        { name: "Fer", key: "Fer (mg/100 g)", max: 18 },
        { name: "Potassium", key: "Potassium (mg/100 g)", max: 3500 },
        { name: "Zinc", key: "Zinc (mg/100 g)", max: 11 },
        { name: "Sélénium", key: "Sélénium (μg/100 g)", max: 70 },
        { name: "Phosphore", key: "Phosphore (mg/100 g)", max: 700 },
        { name: "Iode", key: "Iode (μg/100 g)", max: 150 }
    ];

    nutrients.forEach((nutrient, index) => {
        const value = parseFloat(item[nutrient.key]) || 0; // Default to 0 if the value is missing
        const max = (d3.max(transformedData, d => parseFloat(d[nutrient.key]) || 0) || 1)/3;
        console.log(nutrient.key + max)
        const barWidth = Math.min(280, 280 * (value / max));
        const yOffset = 90 + index * 50; // Position each nutrient block vertically

        // Add nutrient text
        microNutrientCard.append("text")
            .attr("x", 10)
            .attr("y", yOffset)
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(`${nutrient.name}: ${value.toFixed(1)} ${nutrient.key.includes("μg/100 g") ? "μg" : "mg"}`);

        // Add nutrient bar
        microNutrientCard.append("rect")
            .attr("x", 10)
            .attr("y", yOffset + 10)
            .attr("width", Math.min(barWidth, 280)) // Cap the bar at the max width
            .attr("height", 10)
            .style("fill", "#4CAF50") // Green color for the bar
            .style("stroke", "#333")
            .style("stroke-width", "1");
    });
}

function vitaminCard(x, y, item) {
    const mainSVG = d3.select("#mainSVG");

    const vitaminCard = mainSVG.append("g")
        .attr("id", "vitaminCard")
        .attr("transform", `translate(${x + 640}, ${y})`); // Position third card next to the second one

    // Background of the vitamin card (same size as the micro-nutrient card)
    vitaminCard.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 490)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("fill", "#f9f9f9")
        .style("stroke", "#333")
        .style("stroke-width", "2");

    // Add Vitamins Info Title
    vitaminCard.append("text").attr("x", 10).attr("y", 30).style("font-size", "16px").style("font-weight", "bold").text("Vitamines");

    // Vitamins Data
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

    vitamins.forEach((vitamin, index) => {
        const value = parseFloat(item[vitamin.key]) || 0; // Default to 0 if the value is missing
        const max = (d3.max(transformedData, d => parseFloat(d[vitamin.key]) || 0) || 1)/3; // Get dynamic max value for vitamin
        const barWidth = Math.min(280, 280 * (value / max));
        const yOffset = 90 + index * 50; // Position each vitamin block vertically

        // Add vitamin text
        vitaminCard.append("text")
            .attr("x", 10)
            .attr("y", yOffset)
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(`${vitamin.name}: ${value.toFixed(1)} ${vitamin.key.includes("µg/100 g") ? "µg" : "mg"}`);

        // Add vitamin bar
        vitaminCard.append("rect")
            .attr("x", 10)
            .attr("y", yOffset + 10)
            .attr("width", Math.min(barWidth, 280)) // Cap the bar at the max width
            .attr("height", 10)
            .style("fill", "#4CAF50") // Green color for the bar
            .style("stroke", "#333")
            .style("stroke-width", "1");
    });
}




/// The list 

// Array to hold the list of selected items with their quantities
let selectedItems = [];

// Function to handle adding items to the list
function addToList() {
    // Get the selected food item and quantity from the input fields
    const foodItem = document.getElementById('foodItemSelect').value;
    const quantity = parseFloat(document.getElementById('quantityInput').value);

    // Check if the quantity is valid
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity in grams.');
        return;
    }

    // Add the item and quantity to the selectedItems array
    selectedItems.push({ foodItem, quantity });

    // Update the list display
    displaySelectedItems();
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
        
        // Optionally, add a remove button for each item
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeItem(item.foodItem);
        listItem.appendChild(removeButton);

        selectedItemsList.appendChild(listItem);
    });
}

// Function to remove an item from the list
function removeItem(foodItem) {
    // Remove the item from the selectedItems array
    selectedItems = selectedItems.filter(item => item.foodItem !== foodItem);
    
    // Update the list display
    displaySelectedItems();
}
