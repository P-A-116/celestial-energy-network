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
