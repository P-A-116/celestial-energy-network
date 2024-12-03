const mapping = {
    "E. Fn.": 2,
    "Friend": 1,
    "Neutral": 0,
    "Enemy": -1,
    "E. En.": -2,
    "-": null
};

async function fetchMatrix(ascendant) {
    const response = await fetch('ascendant_matrices.txt'); // Adjust this path as necessary
    const text = await response.text();

    const regex = new RegExp(`Relationship Matrix for ${ascendant} Ascendant:[\\s\\S]*?(\\+[-+\\s=]+\\+\\s+)`, 'g');
    const match = regex.exec(text);
    if (!match) throw new Error("Matrix not found!");

    const rows = match[0].split("\n").filter(row => row.startsWith("|"));
    return rows.map(row => 
        row.split("|").slice(1, -1).map(cell => mapping[cell.trim()])
    );
}

function convertToNumerical(userMatrixQualitative) {
    return userMatrixQualitative.map(row => 
        row.map(cell => mapping[cell])
    );
}

function calculateSumOfDifferences(ascendantMatrix, userMatrixNumerical) {
    let totalDifference = 0;
    for (let i = 0; i < ascendantMatrix.length; i++) {
        for (let j = 0; j < ascendantMatrix[i].length; j++) {
            if (ascendantMatrix[i][j] === null || userMatrixNumerical[i][j] === null) continue;
            totalDifference += Math.abs(ascendantMatrix[i][j] - userMatrixNumerical[i][j]);
        }
    }
    return totalDifference;
}

document.getElementById('horoscope-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const ascendant = document.getElementById('ascendant').value;
    const qualitativeMatrixText = document.getElementById('qualitative-matrix').value;

    const userMatrixQualitative = qualitativeMatrixText.split("\n").map(row => 
        row.split(",").map(cell => cell.trim())
    );

    const ascendantMatrix = await fetchMatrix(ascendant);
    const userMatrixNumerical = convertToNumerical(userMatrixQualitative);
    const totalDifference = calculateSumOfDifferences(ascendantMatrix, userMatrixNumerical);

    document.getElementById('benefic-score-display').innerText = 
        `The total sum of absolute differences is: ${totalDifference}`;
});

document.addEventListener("DOMContentLoaded", () => {
    const dictionaries = {
        "Aries Ascendant": {
            'Sun, Moon': 'Neutral',
            'Sun, Mars': 'Neutral',
            'Sun, Mercury': 'Extreme Enemy',
            'Sun, Jupiter': 'Extreme Friend',
            // Add remaining relationships for Aries
        },
        "Taurus Ascendant": {
            'Sun, Moon': 'Extreme Enemy',
            'Sun, Mars': 'Neutral',
            'Sun, Mercury': 'Neutral',
            'Sun, Jupiter': 'Extreme Enemy',
            // Add remaining relationships for Taurus
        },
        // Add other Ascendants...
    };

    const container = document.querySelector("#relationship-dictionaries");

    Object.entries(dictionaries).forEach(([ascendant, relationships]) => {
        // Create a section for each Ascendant
        const section = document.createElement("div");
        section.className = "mb-6";

        // Add Ascendant title
        const title = document.createElement("h3");
        title.className = "text-xl font-bold text-gray-600 mt-4";
        title.textContent = ascendant;
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

        Object.entries(relationships).forEach(([planets, relationship]) => {
            const [planet1, planet2] = planets.split(", ");

            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${planet1}</td>
                <td class="py-2 px-4 border-b">${planet2}</td>
                <td class="py-2 px-4 border-b">${relationship}</td>`;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        container.appendChild(section);
    });
});
