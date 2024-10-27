// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    try {
        const { graph, relationshipMatrix, totalScore, planetsList } = graphData;

        // Display the relationship matrix and total score
        displayRelationshipMatrix(relationshipMatrix, totalScore, planetsList);

        // Clear existing SVG
        d3.select("#graph-container").select("svg").remove();

        const container = document.getElementById("graph-container");
        const width = container.clientWidth;
        const height = container.clientHeight;

        const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

        // Create an SVG element with viewBox for responsive scaling
        const svg = d3.select("#graph-container")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%");

        const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Define zoom behavior and set initial zoom level
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.scale(0.8));  // Set initial zoom level to 0.8

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
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(0, 0))  // Center on the SVG group rather than the entire SVG element
            .force("collision", d3.forceCollide().radius(30));

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
            .attr("r", 20)
            .attr("fill", d => d.group === 'planet' ? "lightblue" : "lightgreen");

        // Add labels
        const label = g.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("font-size", "14px")
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
