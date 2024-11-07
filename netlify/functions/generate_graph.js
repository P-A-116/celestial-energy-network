const graphlib = require('graphlib');

const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const signLords = { "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter" };

function calculateHouseSigns(ascendantSign) {
  const startIndex = zodiacSigns.indexOf(ascendantSign);
  const houseSigns = {};
  for (let i = 0; i < 12; i++) {
    houseSigns[(i + 1).toString()] = zodiacSigns[(startIndex + i) % 12];
  }
  return houseSigns;
}

function createAstrologicalGraph(planetHouseAssignment, ascendantSign) {
  const G = new graphlib.Graph();
  const houseSigns = calculateHouseSigns(ascendantSign);
  planets.forEach(planet => G.setNode(planet));
  Object.entries(planetHouseAssignment).forEach(([planet, house]) => G.setEdge(planet, house.toString(), { relation: "occupies" }));
  return G;
}

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const ascendantSign = zodiacSigns[data.ascendant - 1];
  const G = createAstrologicalGraph(data.planets, ascendantSign);
  return { statusCode: 200, body: JSON.stringify({ graph: graphlib.json.write(G) }) };
};
