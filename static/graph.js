// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    // Clear any existing SVG
    d3.select("#graph-container").select("svg").remove();

    const width = 800;
    const height = 600;

    // Create an SVG element within the graph-container with width and height
    const svg = d3.select("#graph-container")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const g = svg.append("g");

    // Add zoom and pan behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])  // Allow zooming between 50% and 500%
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    // Apply the zoom behavior to the SVG
    svg.call(zoom);

    // Set initial zoom level to 0.7 (zoomed out by 30%)
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

    // Convert the graphData from JSON to a usable D3 format
    const nodes = graphData.nodes.map(node => ({
        id: node.v,  // Using the "v" property of the graphlib JSON format
        group: planets.includes(node.v) ? 'planet' : 'house'
    }));

    const links = graphData.edges.map(edge => ({
        source: edge.v,  // Using the "v" property for the source
        target: edge.w,  // Using the "w" property for the target
        relation: edge.value.relation,
        weight: edge.value.weight || 1  // Default weight if not provided
    }));

    // Create a D3 force simulation for positioning the nodes
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw the links (edges)
    const link = g.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.weight * 5));

    // Draw the nodes (planets and houses)
    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 15)
        .attr("fill", d => d.group === 'planet' ? "lightblue" : "lightgreen");

    // Add labels to nodes (planet/house names)
    const label = g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("font-size", "12px")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(d => d.id);

    // Update the simulation positions during the tick event
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

// Handle form submission and load the graph
document.getElementById('horoscope-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form from submitting normally

    const formData = new FormData(event.target);
    
    // Create an object with the form data
    const data = {
        ascendant: formData.get('ascendant'),
        planets: {
            sun: formData.get('sun'),
            moon: formData.get('moon'),
            mars: formData.get('mars'),
            rahu: formData.get('rahu'),
            mercury: formData.get('mercury'),
            venus: formData.get('venus'),
            jupiter: formData.get('jupiter'),
            saturn: formData.get('saturn'),
            ketu: formData.get('ketu'),
        }
    };

    // Send the form data to the Netlify function
    fetch('/.netlify/functions/generate_graph', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(graphData => {
        console.log('Graph Data:', graphData);
        drawGraph(graphData);  // Call the function to draw the graph
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
