// Percentile mapping for each possible total friendliness score
const percentileMapping = {
    "-65": 0.000502, "-61": 0.000979, "-57": 0.00339, "-53": 0.00803, "-49": 0.0136,
    "-45": 0.02753, "-41": 0.04082, "-37": 0.11306, "-33": 0.2297, "-29": 0.4299,
    "-25": 0.7619, "-21": 1.5336, "-17": 2.358, "-13": 4.449, "-9": 7.015,
    "-5": 11.219, "-1": 16.953, "3": 25.811, "7": 35.941, "11": 49.5,
    "15": 62.511, "19": 75.475, "23": 84.877, "27": 91.713, "31": 95.8,
    "35": 98.166, "39": 99.315, "43": 99.757, "47": 99.974, "51": 100
};

// Example data structures
const houses = { "House1": ["Sun", "Moon"], "House2": ["Mars"] }; // Define other houses
const lordships = { "Sun": ["House1"], "Moon": ["House4"] }; // Define lordships
const aspects = { "Sun": { "7th": 1, "3rd": 0.25 } }; // Define aspects

// Build graph data based on specified edge types
function buildGraphData(houses, lordships, aspects) {
    const graph = { nodes: [], edges: [] };

    Object.keys(houses).forEach(house => {
        graph.nodes.push({ id: house, type: 'house' });
        houses[house].forEach(planet => {
            graph.nodes.push({ id: planet, type: 'planet' });
            graph.edges.push({ source: planet, target: house, type: 'occupant', directed: false });
        });
    });

    Object.entries(lordships).forEach(([planet, lords]) => {
        lords.forEach(house => {
            graph.edges.push({ source: planet, target: house, type: 'lordship', directed: false });
        });
    });

    Object.keys(houses).forEach(sign => {
        const aspectedSigns = getSignAspects(sign);
        aspectedSigns.forEach(targetSign => {
            graph.edges.push({ source: sign, target: targetSign, type: 'sign_aspect', directed: true });
        });
    });

    Object.entries(aspects).forEach(([planet, targets]) => {
        Object.entries(targets).forEach(([targetHouse, weight]) => {
            graph.edges.push({ source: planet, target: targetHouse, type: 'planet_aspect', directed: true, weight });
        });
    });

    return graph;
}

// Placeholder function to define sign aspects
function getSignAspects(sign) {
    if (sign === "House1") return ["House7"];
    return [];
}

// Display the matrix and score
function displayRelationshipMatrix(matrix, totalScore, planetsList) {
    const table = document.getElementById('relationship-table');
    table.innerHTML = "";

    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    headerRow.appendChild(emptyHeader);

    planetsList.forEach(planet => {
        const th = document.createElement('th');
        th.innerText = planet;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    planetsList.forEach((planet1, i) => {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = planet1;
        row.appendChild(th);

        matrix[i].forEach(value => {
            const td = document.createElement('td');
            td.innerText = value;
            row.appendChild(td);
        });

        table.appendChild(row);
    });

<<<<<<< HEAD
    const adjustedScore = ((totalScore + 65) / 116) * 100;
    const percentile = percentileMapping[totalScore.toString()] || "N/A";
    document.getElementById('percentile-display').innerText = 
        `Total Friendliness Score: ${totalScore} \n(: ${adjustedScore.toFixed(2)}%) \nPercentile: ${percentile}%`;
}
=======
        // Display total score, adjusted score, and percentile
        const scoreDisplay = document.createElement('p');
        scoreDisplay.innerText = `Total Friendliness Score: ${totalScore} (Adjusted Score: ${adjustedScore.toFixed(2)}%)\nPercentile: ${percentile}%`;
        scoreDisplay.className = "text-center font-bold mt-4";
>>>>>>> parent of 7a303b2 (Minor Changes)

// Function to render graph with D3.js
function drawGraph(graphData) {
    const { nodes, edges } = graphData;
    const svg = d3.select("#graph-container").append("svg").attr("width", 900).attr("height", 600);
    const link = svg.selectAll("line").data(edges).enter().append("line")
        .attr("stroke", d => getEdgeColor(d.type))
        .attr("stroke-width", d => d.weight ? d.weight * 2 : 1);

    const node = svg.selectAll("circle").data(nodes).enter().append("circle")
        .attr("r", 10)
        .attr("fill", d => d.type === 'planet' ? "lightblue" : "lightgreen");

    svg.selectAll("text").data(nodes).enter().append("text")
        .attr("dx", 12).attr("dy", ".35em")
        .text(d => d.id);
}

function getEdgeColor(type) {
    switch (type) {
        case 'occupant': return 'gray';
        case 'conjunctor': return 'purple';
        case 'lordship': return 'red';
        case 'sign_aspect': return 'blue';
        case 'planet_aspect': return 'orange';
        default: return 'black';
    }
}

document.getElementById('horoscope-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const graphData = buildGraphData(houses, lordships, aspects);
    drawGraph(graphData);
});
