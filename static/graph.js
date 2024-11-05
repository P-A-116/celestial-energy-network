// Percentile mapping for each possible total friendliness score
const percentileMapping = {
    "-65": 0.000502,
    "-61": 0.000979,
    "-57": 0.00339,
    "-53": 0.00803,
    "-49": 0.0136,
    "-45": 0.02753,
    "-41": 0.04082,
    "-37": 0.11306,
    "-33": 0.2297,
    "-29": 0.4299,
    "-25": 0.7619,
    "-21": 1.5336,
    "-17": 2.358,
    "-13": 4.449,
    "-9": 7.015,
    "-5": 11.219,
    "-1": 16.953,
    "3": 25.811,
    "7": 35.941,
    "11": 49.5,
    "15": 62.511,
    "19": 75.475,
    "23": 84.877,
    "27": 91.713,
    "31": 95.8,
    "35": 98.166,
    "39": 99.315,
    "43": 99.757,
    "47": 99.974,
    "51": 100
};

// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    try {
        const { graph, relationshipMatrix, totalScore, planetsList } = graphData;

        // Display the relationship matrix and total score
        displayRelationshipMatrix(relationshipMatrix, totalScore, planetsList);

        // Clear existing SVG
        d3.select("#graph-container").select("svg").remove();

        const width = 1500;
        const height = 600;

        const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

        const svg = d3.select("#graph-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g");

        // Zoom and pan
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

        // Process graph data
        const nodes = graph.nodes.map(node => ({
            id: node.v.toString(),
            group: planets.includes(node.v) ? 'planet' : 'house',
        }));

        const links = graph.edges.map(edge => ({
            source: edge.v.toString(),
            target: edge.w.toString(),
            relation: edge.value.relation,
        }));

        // Simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(200))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(25));

        // Draw links with color coding
        const link = g.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 2)
            .attr("stroke", d => {
                if (d.relation === 'lords') {
                    return 'red'; // Color for lordship edges
                } else if (d.relation === 'aspect') {
                    return 'blue';
                } else if (d.relation === 'same_house') {
                    return 'green';
                } else if (d.relation === 'occupies') {
                    return '#aaa';
                } else {
                    return '#ccc';
                }
            });

        // Draw nodes
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 15)
            .attr("fill", d => d.group === 'planet' ? "lightblue" : "lightgreen");

        // Add labels
        const label = g.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("font-size", "12px")
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(d => d.id);

        // Simulation tick
        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label.attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        // Add the legend
        addLegend(svg, width, height);

    } catch (error) {
        console.error('Error in drawGraph:', error);
    }
}

// Function to add a legend to the SVG
function addLegend(svg, width, height) {
    const legendData = [
        { color: 'red', label: 'Lordship (Planet → House it lords over)' },
        { color: 'blue', label: 'Aspect (Planet → Planet it aspects)' },
        { color: 'green', label: 'Same House (Planets in the same house)' },
        { color: '#aaa', label: 'Occupies (Planet → House it occupies)' }
    ];

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 250}, ${20})`);

    const legendItem = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItem.append('line')
        .attr('x1', 0)
        .attr('y1', 10)
        .attr('x2', 30)
        .attr('y2', 10)
        .attr('stroke', d => d.color)
        .attr('stroke-width', 4);

    legendItem.append('text')
        .attr('x', 40)
        .attr('y', 15)
        .text(d => d.label)
        .attr('font-size', '12px')
        .attr('fill', '#000');
}

// Updated function to display the relationship matrix, adjusted score, and percentile using the table in index.html
function displayRelationshipMatrix(matrix, totalScore, planetsList) {
    try {
        const table = document.getElementById('relationship-table');

        // Clear existing table content
        table.innerHTML = "";

        // Create table header row
        const headerRow = document.createElement('tr');
        const emptyHeader = document.createElement('th');
        emptyHeader.className = "border border-gray-400 p-2";
        headerRow.appendChild(emptyHeader); // Empty top-left cell for alignment

        planetsList.forEach(planet => {
            const th = document.createElement('th');
            th.innerText = planet;
            th.className = "border border-gray-400 p-2";
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows for each planet
        planetsList.forEach((planet1, i) => {
            const row = document.createElement('tr');
            
            // Planet name in the first cell
            const th = document.createElement('th');
            th.innerText = planet1;
            th.className = "border border-gray-400 p-2";
            row.appendChild(th);

            // Add data cells for each relationship in the matrix
            matrix[i].forEach((value) => {
                const td = document.createElement('td');
                td.innerText = value;
                td.className = "border border-gray-400 p-2";
                row.appendChild(td);
            });

            table.appendChild(row);
        });

        // Calculate adjusted score and fetch percentile
        const adjustedScore = ((totalScore + 65) / 116) * 100;
        const percentile = percentileMapping[totalScore.toString()] || "N/A";

        // Display total score, adjusted score, and percentile
        const scoreDisplay = document.createElement('p');
        scoreDisplay.innerText = `Total Friendliness Score: ${totalScore} (Adjusted Score: ${adjustedScore.toFixed(2)}%)\nPercentile: ${percentile}%`;
        scoreDisplay.className = "text-center font-bold mt-4";

        // Add score display to the relationship container
        const container = document.getElementById('relationship-container');
        container.appendChild(scoreDisplay);
        
    } catch (error) {
        console.error('Error in displayRelationshipMatrix:', error);
    }
}


// Handle form submission
document.getElementById('horoscope-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = {
        ascendant: formData.get('ascendant'),
        planets: {
            Sun: formData.get('sun'),
            Moon: formData.get('moon'),
            Mars: formData.get('mars'),
            Rahu: formData.get('rahu'),
            Mercury: formData.get('mercury'),
            Venus: formData.get('venus'),
            Jupiter: formData.get('jupiter'),
            Saturn: formData.get('saturn'),
            Ketu: formData.get('ketu'),
        }
    };

    for (let planet in data.planets) {
        data.planets[planet] = data.planets[planet].toString();
    }

    fetch('/.netlify/functions/generate_graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(graphData => {
        if (graphData.error) {
            alert(graphData.error);
        } else {
            drawGraph(graphData);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
