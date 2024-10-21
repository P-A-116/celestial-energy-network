function drawGraph(graphData) {
    // Clear any existing SVG
    d3.select("#graph-container").select("svg").remove();

    const width = 800;
    const height = 600;

    const svg = d3.select("#graph-container")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const g = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])  // Allow zooming between 50% and 500%
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.edges).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(graphData.edges)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.weight * 5));

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(graphData.nodes)
        .join("circle")
        .attr("r", 15)
        .attr("fill", d => (["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"].includes(d.id) ? "lightblue" : "lightgreen"));

    const label = g.append("g")
        .selectAll("text")
        .data(graphData.nodes)
        .join("text")
        .attr("font-size", "12px")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(d => d.id);

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
