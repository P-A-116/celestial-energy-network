// Percentile mapping for each possible total friendliness score
const percentileMapping = {
    "-65": 0.000502, "-61": 0.000979, "-57": 0.00339, "-53": 0.00803, "-49": 0.0136,
    "-45": 0.02753, "-41": 0.04082, "-37": 0.11306, "-33": 0.2297, "-29": 0.4299,
    "-25": 0.7619, "-21": 1.5336, "-17": 2.358, "-13": 4.449, "-9": 7.015,
    "-5": 11.219, "-1": 16.953, "3": 25.811, "7": 35.941, "11": 49.5,
    "15": 62.511, "19": 75.475, "23": 84.877, "27": 91.713, "31": 95.8,
    "35": 98.166, "39": 99.315, "43": 99.757, "47": 99.974, "51": 100
};

// Natural friendships and enmities
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
    if ([1, 2, 3, 9, 10, 11].includes(difference)) return 'Friend';
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

// Calculate friendliness score matrix
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

// Display relationship matrix and scores
function displayRelationshipMatrix(matrix, totalScore, planets) {
    const table = document.getElementById("relationship-table");
    table.innerHTML = ""; // Clear previous content

    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty top-left cell
    planets.forEach(planet => {
        const th = document.createElement('th');
        th.innerText = planet;
        th.className = "border border-gray-400 text-center";
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    matrix.forEach((row, i) => {
        const tableRow = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.innerText = planets[i];
        rowHeader.className = "border border-gray-400 text-center";
        tableRow.appendChild(rowHeader);

        row.forEach(cell => {
            const td = document.createElement('td');
            td.innerText = cell;
            td.className = "border border-gray-400 text-center";
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    });

    // Display friendliness score
    const adjustedScore = ((totalScore + 65) / 116) * 100;
    const percentile = percentileMapping[totalScore.toString()] || "N/A";
    document.getElementById('percentile-display').innerText = 
        `Total Friendliness Score: ${totalScore}\nNormalized Score: ${adjustedScore.toFixed(2)}%\nPercentile: ${percentile}%`;

    // Render distribution histogram
    const nonCumulativeData = Object.keys(percentileMapping).map(score => ({
        score: parseInt(score, 10),
        frequency: percentileMapping[score]
    }));
    renderDistributionHistogram(nonCumulativeData, totalScore);
}

function renderDistributionHistogram(nonCumulativeData, totalScore) {
    console.log("Rendering histogram with data:", nonCumulativeData);
    console.log("Highlighting total score:", totalScore);

    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const container = document.getElementById('distribution-chart');

    // Ensure container exists and clear previous content
    if (!container) {
        console.error("Error: Distribution chart container not found.");
        return;
    }

    const containerWidth = container.offsetWidth;
    const width = Math.min(containerWidth - margin.left - margin.right, 800);
    const height = 400 - margin.top - margin.bottom;

    // Clear previous content
    container.innerHTML = '';

    // Create SVG
    const svg = d3.select("#distribution-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(nonCumulativeData.map(d => d.score))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(nonCumulativeData, d => d.frequency)])
        .range([height, 0]);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#333")
        .style("text-anchor", "middle")
        .text("Friendliness Score");

    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -35)
        .attr("fill", "#333")
        .style("text-anchor", "middle")
        .text("Frequency (%)");

    // Draw bars
    svg.selectAll(".bar")
        .data(nonCumulativeData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.score))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.frequency))
        .attr("height", d => height - yScale(d.frequency))
        .attr("fill", d => d.score === totalScore ? "red" : "steelblue");

    // Highlight total score
    const scoreData = nonCumulativeData.find(d => d.score === totalScore);
    if (scoreData) {
        svg.append("text")
            .attr("x", xScale(totalScore) + xScale.bandwidth() / 2)
            .attr("y", yScale(scoreData.frequency))
            .attr("dy", -5)
            .attr("fill", "red")
            .style("text-anchor", "middle")
            .text(`Your Score: ${totalScore}`);
    }
}




// Form submission handler
document.getElementById('horoscope-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const planetPositions = {};
    const inputs = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    let isValid = true;

    inputs.forEach(id => {
        const value = parseInt(document.getElementById(id).value);
        if (isNaN(value) || value < 1 || value > 12) {
            document.getElementById(id).classList.add('border-red-500');
            isValid = false;
        } else {
            document.getElementById(id).classList.remove('border-red-500');
            planetPositions[id.charAt(0).toUpperCase() + id.slice(1)] = value;
        }
    });

    if (!isValid) {
        alert('Please ensure all inputs are valid (1-12).');
        return;
    }

    const { matrix, totalScore, planets } = calculateFriendlinessScore(planetPositions);
	displayRelationshipMatrix(matrix, totalScore, planets);

    document.getElementById('relationship-matrix').removeAttribute('hidden');
    document.getElementById('score-distribution-container').removeAttribute('hidden');
});
