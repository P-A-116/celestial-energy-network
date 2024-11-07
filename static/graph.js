const percentileMapping = { "-65": 0.0005, "-61": 0.001, "-57": 0.003, "-53": 0.008, "-49": 0.014, "-45": 0.027, "-41": 0.041, "-37": 0.113, "-33": 0.23, "-29": 0.43, "-25": 0.762, "-21": 1.534, "-17": 2.358, "-13": 4.449, "-9": 7.015, "-5": 11.219, "-1": 16.953, "3": 25.811, "7": 35.941, "11": 49.5, "15": 62.511, "19": 75.475, "23": 84.877, "27": 91.713, "31": 95.8, "35": 98.166, "39": 99.315, "43": 99.757, "47": 99.974, "51": 100 };

function drawGraph(graphData) {
  const svg = d3.select("#graph-container").append("svg").attr("width", 900).attr("height", 600);
  svg.selectAll("line").data(graphData.edges).enter().append("line").attr("stroke", d => getEdgeColor(d.type)).attr("stroke-width", d => d.weight ? d.weight * 2 : 1);
  svg.selectAll("circle").data(graphData.nodes).enter().append("circle").attr("r", 10).attr("fill", d => d.type === 'planet' ? "lightblue" : "lightgreen");
  svg.selectAll("text").data(graphData.nodes).enter().append("text").attr("dx", 12).attr("dy", ".35em").text(d => d.id);
}

function getEdgeColor(type) {
  switch (type) { case 'occupant': return 'gray'; case 'conjunctor': return 'purple'; case 'lordship': return 'red'; case 'sign_aspect': return 'blue'; case 'planet_aspect': return 'orange'; default: return 'black'; }
}

document.getElementById('horoscope-form').addEventListener('submit', function(event) {
  event.preventDefault();
  fetch('/.netlify/functions/generateGraph', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planets: {/*planet data*/}, ascendant: /*ascendant sign*/ }) })
    .then(response => response.json())
    .then(data => drawGraph(data.graph));
});
