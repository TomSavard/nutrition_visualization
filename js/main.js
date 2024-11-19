const ctx = {
    w: 1200,
    h: 900,
    GREY_NULL: "#333",
    DOUBLE_CLICK_THRESHOLD: 320,
};

// The categories of food to be extracted from the column alim_ssssgrp_nom_fr
const FOOD_CATEGORIES = ["légumes crus", "fruits crus"];
const FOOD_ITEMS = [];
let transformedData =[];

// Initialize references to the input field and autocomplete list
const inputField = document.getElementById("myInput");
const autocompleteList = document.getElementById("autocomplete-list");

function ProcessData(data) {
    console.log("Column headers:", data.columns);

    // Filter rows based on FOOD_CATEGORIES and then include the entire row in the filteredData
    const filteredData = data
        .filter(row => FOOD_CATEGORIES.includes(row.alim_ssssgrp_nom_fr)); // Filter rows based on condition

    filteredData.forEach(row => {
        FOOD_ITEMS.push(row); // Add the entire row to the FOOD_ITEMS array
    });

    return filteredData; // Return the full rows (not just alim_nom_fr)
}


function createViz() {
    console.log("Using D3 v" + d3.version);
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    loadData(svgEl);
}

function loadData(svgEl) {
    d3.csv("data/food_table_new.csv")
        .then(function (data) {
            // Preprocess and pass transformed data
            transformedData = ProcessData(data);
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
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
                DisplayChosenElement(); // Display the chosen element
            });

            autocompleteList.appendChild(suggestionDiv);
        });
    }
}


// Close suggestions when clicking outside the input field
document.addEventListener("click", (event) => {
    if (event.target !== inputField) {
        autocompleteList.innerHTML = "";
    }
});

// Assuming `transformedData` is defined globally or passed correctly

function DisplayChosenElement() {
    const chosenElement = inputField.value.trim(); // Access inputField here and trim spaces
    console.log("Chosen Element:", chosenElement);

    // Check if transformedData is available
    if (transformedData && chosenElement) {
        const attributToDisplay = transformedData.filter(row => {
            return row.alim_nom_fr && row.alim_nom_fr.toLowerCase().includes(chosenElement.toLowerCase());
        });
        console.log("Filtered Results:", attributToDisplay);
    } else {
        console.log("No data or input element is empty.");
    }
}



