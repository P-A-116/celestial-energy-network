function drawGraph(graphData) {
    // Clear existing SVG
    d3.select("#graph-container").select("svg").remove();

    const width = 800;
    const height = 600;

    // Define planets array
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
    const nodes = graphData.nodes.map(node => ({
        id: node.v,
        group: planets.includes(node.v) ? 'planet' : 'house'
    }));

    const links = graphData.edges.map(edge => ({
        source: edge.v,
        target: edge.w,
        relation: edge.value.relation,
    }));

    // Simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = g.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2);

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
