// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    try {
        const { graph, relationshipMatrix, totalScore, planetsList } = graphData;

        // Display the relationship matrix and total score
        displayRelationshipMatrix(relationshipMatrix, totalScore, planetsList);

        // Clear any existing SVG
        d3.select("#graph-container").select("svg").remove();

        // Dynamically calculate container dimensions
        const container = document.getElementById("graph-container");
        const width = container.clientWidth;
        const height = container.clientHeight;

        const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

        // Create SVG element with dynamic width and height
        const svg = d3.select("#graph-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Append a group element for graph positioning
        const g = svg.append("g");

        // Set up zoom and pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

        // Process graph data into nodes and links
        const nodes = graph.nodes.map(node => ({
            id: node.v.toString(),
            group: planets.includes(node.v) ? 'planet' : 'house',
        }));

        const links = graph.edges.map(edge => ({
            source: edge.v.toString(),
            target: edge.w.toString(),
            relation: edge.value.relation,
        }));

        // Set up force simulation with dynamic center
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
                    return 'red';
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

        // Draw nodes with color coding based on group
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 15)
            .attr("fill", d => d.group === 'planet' ? "lightblue" : "lightgreen");

        // Add labels for nodes
        const label = g.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("font-size", "12px")
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(d => d.id);

        // Simulation tick for continuous positioning updates
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
