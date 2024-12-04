// Mapping of qualitative relationships to numerical values
const mapping = {
    "Extreme Friend": 2,
    "Friend": 1,
    "Neutral": 0,
    "Enemy": -1,
    "Extreme Enemy": -2,
    "-": null
};

// Fetch the ascendant matrices from a JSON file
async function fetchAscendantMatrices() {
    try {
        const response = await fetch('ascendant_matrices.json'); // Ensure the path is correct
        if (!response.ok) throw new Error("Failed to fetch ascendant matrices.");
        return await response.json();
    } catch (error) {
        console.error("Error fetching ascendant matrices:", error);
        alert("Failed to load ascendant matrices. Please try again.");
        return null;
    }
}

// Convert qualitative relationship matrix to numerical
function convertToNumerical(qualitativeMatrix) {
    return qualitativeMatrix.map(row =>
        row.map(cell => mapping[cell] ?? null) // Handle unexpected entries gracefully
    );
}

// Calculate the total sum of absolute differences
function calculateSumOfDifferences(ascendantMatrix, userMatrixNumerical) {
    let totalDifference = 0;
    const planets = Object.keys(ascendantMatrix);

    planets.forEach((planet1, i) => {
        planets.forEach((planet2, j) => {
            const ascendantValue = mapping[ascendantMatrix[planet1][planet2]] ?? null;
            const userValue = userMatrixNumerical[i][j] ?? null;
            if (ascendantValue === null || userValue === null) return;
            totalDifference += Math.abs(ascendantValue - userValue);
        });
    });

    return totalDifference;
}

// Handle form submission
document.getElementById('horoscope-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const ascendant = document.getElementById('ascendant').value.trim();
    const qualitativeMatrixText = document.getElementById('qualitative-matrix').value.trim();

    if (!ascendant) {
        alert("Please select an ascendant.");
        return;
    }

    if (!qualitativeMatrixText) {
        alert("Please enter the qualitative matrix data.");
        return;
    }

    try {
        const ascendantMatrices = await fetchAscendantMatrices();
        if (!ascendantMatrices) return;

        const ascendantMatrix = ascendantMatrices[ascendant];
        if (!ascendantMatrix) {
            alert(`Matrix for ${ascendant} not found.`);
            return;
        }

        const userMatrixQualitative = qualitativeMatrixText.split("\n").map(row =>
            row.split(",").map(cell => cell.trim())
        );

        const userMatrixNumerical = convertToNumerical(userMatrixQualitative);
        const totalDifference = calculateSumOfDifferences(ascendantMatrix, userMatrixNumerical);

        // Display the result
        document.getElementById('benefic-score-display').innerText =
            `The total sum of absolute differences is: ${totalDifference}`;

        // Show the hidden containers after calculations
        document.getElementById('relationship-matrix').removeAttribute('hidden');
        document.getElementById('score-distribution-container').removeAttribute('hidden');
    } catch (error) {
        console.error("Error processing form:", error);
        alert("An error occurred while processing your data. Please try again.");
    }
});

// Dynamically load relationship dictionaries
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const ascendantMatrices = await fetchAscendantMatrices();
        if (!ascendantMatrices) return;

        const container = document.querySelector("#relationship-dictionaries");
        container.innerHTML = ""; // Clear existing content

        Object.entries(ascendantMatrices).forEach(([ascendant, relationships]) => {
            // Create a section for each Ascendant
            const section = document.createElement("div");
            section.className = "mb-6";

            // Add Ascendant title
            const title = document.createElement("h3");
            title.className = "text-xl font-bold text-gray-600 mt-4";
            title.textContent = `${ascendant} Ascendant`;
            section.appendChild(title);

            // Create table
            const table = document.createElement("table");
            table.className = "min-w-full bg-white border border-gray-300 rounded-lg shadow-md mb-6";

            // Create table header
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th class="py-2 px-4 border-b text-left font-semibold text-gray-700 bg-gray-100">Planet 1</th>
                    <th class="py-2 px-4 border-b text-left font-semibold text-gray-700 bg-gray-100">Planet 2</th>
                    <th class="py-2 px-4 border-b text-left font-semibold text-gray-700 bg-gray-100">Relationship</th>
                </tr>`;
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement("tbody");

            Object.entries(relationships).forEach(([planet1, planetRelationships]) => {
                Object.entries(planetRelationships).forEach(([planet2, relationship]) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="py-2 px-4 border-b">${planet1}</td>
                        <td class="py-2 px-4 border-b">${planet2}</td>
                        <td class="py-2 px-4 border-b">${relationship}</td>`;
                    tbody.appendChild(row);
                });
            });

            table.appendChild(tbody);
            section.appendChild(table);
            container.appendChild(section);
        });
    } catch (error) {
        console.error("Error loading relationship dictionaries:", error);
        alert("Failed to load relationship dictionaries. Please try again.");
    }
});
