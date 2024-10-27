// Function to draw the astrological graph using D3.js
function drawGraph(graphData) {
    try {
        const { graph, relationshipMatrix, totalScore, planetsList } = graphData;

        // Display the relationship matrix and total score
        displayRelationshipMatrix(relationshipMatrix, totalScore, planetsList);

        // Clear any existing SVG
        d3.select("#graph-container").select("svg").remove();

        // Dynamically get container dimensions
        const container = document.getElementById("graph-container");
        const width = container.clientWidth || 800;  // Default to 800 if clientWidth fails
        const height = container.clientHeight || 600; // Default to 600 if clientHeight fails

        // Create SVG with responsive viewBox for scaling
        const svg = d3.select("#graph-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "));

        // Append a group element to position graph elements
        const g = svg.append("g");

        // Set up zoom and pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.scale(0.8));  // Adjust scale to fit graph within view

        // Process graph data for nodes and links
        const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
        const nodes = graph.nodes.map(node => ({
            id: node.v.toString(),
            group: planets.includes(node.v) ? 'planet' : 'house',
        }));

        const links = graph.edges.map(edge => ({
            source: edge.v.toString(),
            target: edge.w.toString(),
            relation: edge.value.relation,
        }));

        // Set up force simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(0, 0))  // Center within viewBox
            .force("collision", d3.forceCollide().radius(30));

        // Draw links with color coding
        const link = g.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 2)
            .attr("stroke", d => {
                if (d.relation === 'lords') return 'red';
                if (d.relation === 'aspect') return 'blue';
                if (d.relation === 'same_house') return 'green';
                if (d.relation === 'occupies') return '#aaa';
                return '#ccc';
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

        // Update positions on each simulation tick
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

        // Add the legend if necessary
        addLegend(svg, width, height);
    } catch (error) {
        console.error('Error in drawGraph:', error);
    }
}
