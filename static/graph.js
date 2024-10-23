// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    try {
        const { graph, relationshipMatrix, totalScore, planetsList } = graphData;

        // Display the relationship matrix and total score
        displayRelationshipMatrix(relationshipMatrix, totalScore, planetsList);

        // Clear existing SVG
        d3.select("#graph-container").select("svg").remove();

        const width = 800;
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
    } catch (error) {
        console.error('Error in drawGraph:', error);
    }
}

// Function to display the relationship matrix and total score
function displayRelationshipMatrix(matrix, totalScore, planetsList) {
    try {
        // Clear any existing matrix
        const existingContainer = document.getElementById('relationship-table-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.getElementById('relationship-container');

        // Create a container div for the table and score
        const tableContainer = document.createElement('div');
        tableContainer.id = 'relationship-table-container';

        const table = document.createElement('table');
        table.style.margin = '0 auto';
        table.style.borderCollapse = 'collapse';

        // Create table header
        const headerRow = document.createElement('tr');
        const emptyHeader = document.createElement('th');
        emptyHeader.style.border = '1px solid #ccc';
        emptyHeader.style.padding = '5px';
        headerRow.appendChild(emptyHeader); // Empty top-left cell
        planetsList.forEach(planet => {
            const th = document.createElement('th');
            th.innerText = planet;
            th.style.border = '1px solid #ccc';
            th.style.padding = '5px';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows
        for (let i = 0; i < planetsList.length; i++) {
            const row = document.createElement('tr');
            const planet1 = planetsList[i];

            const th = document.createElement('th');
            th.innerText = planet1;
            th.style.border = '1px solid #ccc';
            th.style.padding = '5px';
            row.appendChild(th);

            for (let j = 0; j < planetsList.length; j++) {
                const td = document.createElement('td');
                td.innerText = matrix[i][j];
                td.style.border = '1px solid #ccc';
                td.style.padding = '5px';
                td.style.textAlign = 'center';
                row.appendChild(td);
            }
            table.appendChild(row);
        }

        // Append table and total score
        tableContainer.appendChild(table);

        // Display total score
        const scoreElement = document.createElement('p');
        scoreElement.innerText = `Total Friendliness Score: ${totalScore}`;
        scoreElement.style.fontWeight = 'bold';
        scoreElement.style.textAlign = 'center';
        tableContainer.appendChild(scoreElement);

        // Append the container to the relationship-container div
        container.appendChild(tableContainer);
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

    // Convert house numbers to strings
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
        console.log('Graph Data:', graphData);
        drawGraph(graphData);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
