// Percentile mapping for each possible total friendliness score
const percentileMapping = {
    "-65": 0.000502, "-61": 0.000979, "-57": 0.00339, "-53": 0.00803, "-49": 0.0136,
    "-45": 0.02753, "-41": 0.04082, "-37": 0.11306, "-33": 0.2297, "-29": 0.4299,
    "-25": 0.7619, "-21": 1.5336, "-17": 2.358, "-13": 4.449, "-9": 7.015,
    "-5": 11.219, "-1": 16.953, "3": 25.811, "7": 35.941, "11": 49.5,
    "15": 62.511, "19": 75.475, "23": 84.877, "27": 91.713, "31": 95.8,
    "35": 98.166, "39": 99.315, "43": 99.757, "47": 99.974, "51": 100
};

// Define natural relationships
const naturalFriends = {
    'Sun': ['Moon', 'Mars', 'Jupiter'],
    'Moon': ['Sun', 'Mercury'],
    'Mars': ['Sun', 'Moon', 'Jupiter'],
    'Mercury': ['Sun', 'Venus'],
    'Jupiter': ['Sun', 'Moon', 'Mars'],
    'Venus': ['Mercury', 'Saturn'],
    'Saturn': ['Mercury', 'Venus'],
    'Rahu': ['Jupiter', 'Venus', 'Saturn'],
    'Ketu': ['Mars', 'Venus', 'Saturn']
};

const naturalEnemies = {
    'Sun': ['Venus', 'Saturn'],
    'Moon': [],
    'Mars': ['Mercury'],
    'Mercury': ['Moon'],
    'Jupiter': ['Mercury', 'Venus'],
    'Venus': ['Moon', 'Sun'],
    'Saturn': ['Sun', 'Moon', 'Mars'],
    'Rahu': ['Sun', 'Moon', 'Mars'],
    'Ketu': ['Sun', 'Moon']
};

// Determine natural relationship
function determineNaturalRelationship(planet1, planet2) {
    if (naturalFriends[planet1].includes(planet2)) return 'Friend';
    if (naturalEnemies[planet1].includes(planet2)) return 'Enemy';
    return 'Neutral';
}

// Calculate temporary relationship
function calculateTemporaryRelationship(house1, house2) {
    const difference = (house2 - house1 + 12) % 12;
    if ([1, 2, 3, 9, 10, 11].includes(difference) ||
        (house1 === 4 && house2 === 10) ||
        (house1 === 10 && house2 === 4) ||
        (house1 === 2 && house2 === 12) ||
        (house1 === 12 && house2 === 2) ||
        (house1 === 3 && house2 === 11) ||
        (house1 === 11 && house2 === 3)) {
        return 'Friend';
    }
    return 'Enemy';
}

// Calculate compound relationship and score
function calculateCompoundRelationship(natural, temporary) {
    if (natural === 'Friend' && temporary === 'Friend') return { type: 'E. Fr', score: 2 };
    if ((natural === 'Friend' && temporary === 'Neutral') || (natural === 'Neutral' && temporary === 'Friend')) return { type: 'Friend', score: 1 };
    if (natural === 'Enemy' && temporary === 'Enemy') return { type: 'E. En', score: -2 };
    if ((natural === 'Enemy' && temporary === 'Neutral') || (natural === 'Neutral' && temporary === 'Enemy')) return { type: 'Enemy', score: -1 };
    return { type: 'Neutral', score: 0 };
}

// Calculate matrix and total score
function calculateFriendlinessScore(planetPositions) {
    const planets = Object.keys(planetPositions);
    const matrix = [];
    let totalScore = 0;

    planets.forEach(planet1 => {
        const row = [];
        planets.forEach(planet2 => {
            if (planet1 === planet2) {
                row.push('-');
            } else {
                const tempRel = calculateTemporaryRelationship(planetPositions[planet1], planetPositions[planet2]);
                const natRel = determineNaturalRelationship(planet1, planet2);
                const { type, score } = calculateCompoundRelationship(natRel, tempRel);
                row.push(type);
                totalScore += score;
            }
        });
        matrix.push(row);
    });

    return { matrix, totalScore, planets };
}

// Display matrix and score in HTML
// Function to display the relationship matrix and adjusted score
function displayRelationshipMatrix(matrix, totalScore, planets) {
    const table = document.getElementById('relationship-table');
    table.innerHTML = ""; // Clear existing table content

    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th'));  // Empty top-left cell
    planets.forEach(planet => {
        const th = document.createElement('th');
        th.innerText = planet;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows for each planet
    matrix.forEach((row, i) => {
        const tableRow = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.innerText = planets[i];
        tableRow.appendChild(rowHeader);

        row.forEach(cell => {
            const td = document.createElement('td');
            td.innerText = cell;
            td.className = "border border-gray-400 p-2 text-center";
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    });

    // Calculate adjusted score
    const adjustedScore = ((totalScore + 65) / 116) * 100;
    const percentile = percentileMapping[totalScore.toString()] || "N/A";

    // Debugging logs
    console.log("Total Score:", totalScore);
    console.log("Adjusted Score:", adjustedScore);
    console.log("Percentile:", percentile);

    // Display total score, adjusted score, and percentile
    const percentileDisplay = document.getElementById('percentile-display');
    percentileDisplay.innerText = `Total Friendliness Score: ${totalScore} (Adjusted Score: ${adjustedScore.toFixed(2)}%)\nPercentile: ${percentile}%`;
}


// Form submission handler
document.getElementById('horoscope-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Retrieve planet positions from form inputs
    const planetPositions = {
        Sun: parseInt(document.getElementById('sun').value),
        Moon: parseInt(document.getElementById('moon').value),
        Mars: parseInt(document.getElementById('mars').value),
        Mercury: parseInt(document.getElementById('mercury').value),
        Jupiter: parseInt(document.getElementById('jupiter').value),
        Venus: parseInt(document.getElementById('venus').value),
        Saturn: parseInt(document.getElementById('saturn').value),
        Rahu: parseInt(document.getElementById('rahu').value),
        Ketu: parseInt(document.getElementById('ketu').value)
    };

    // Calculate and display matrix and score
    const { matrix, totalScore, planets } = calculateFriendlinessScore(planetPositions);
    displayRelationshipMatrix(matrix, totalScore, planets);
});
