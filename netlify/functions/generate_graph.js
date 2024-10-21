const graphlib = require('graphlib');

// Define zodiac signs, planets, and aspect strengths
const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

// House lords (simplified Vedic astrology)
const houseLords = {
    1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
    7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// Parashari aspect strengths
const aspectStrengths = {
    "Mars": {4: 0.75, 8: 0.75},
    "Jupiter": {5: 1.0, 9: 1.0},
    "Saturn": {3: 0.5, 10: 0.5}
};

// Function to create the astrological graph
function createAstrologicalGraph(houseSigns, planetHouseAssignment) {
    const G = new graphlib.Graph();

    // Add nodes for planets and houses
    planets.forEach(planet => G.setNode(planet));
    for (let i = 1; i <= 12; i++) {
        G.setNode(i); // House nodes
    }

    // Add edges: Planet-House relationships
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        G.setEdge(planet, house, { relation: "occupies" });
    }

    // Add edges: Planet-House lords
    for (const [house, lord] of Object.entries(houseLords)) {
        G.setEdge(lord, house, { relation: "lords" });
    }

    // Planet-Planet relationships in the same house
    const housePlanets = {};
    for (let i = 1; i <= 12; i++) {
        housePlanets[i] = [];
    }
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        housePlanets[house].push(planet);
    }

    for (const house in housePlanets) {
        const occupants = housePlanets[house];
        for (let i = 0; i < occupants.length; i++) {
            for (let j = i + 1; j < occupants.length; j++) {
                G.setEdge(occupants[i], occupants[j], { relation: "same_house" });
            }
        }
    }

    // Planet-Planet aspects with weighted edges
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        if (planet in aspectStrengths) {
            for (const [aspectOffset, strength] of Object.entries(aspectStrengths[planet])) {
                const aspectedHouse = (house + parseInt(aspectOffset) - 1) % 12 + 1;
                const occupants = housePlanets[aspectedHouse];
                occupants.forEach(occupant => {
                    G.setEdge(planet, occupant, { relation: "aspect", weight: strength });
                });
            }
        }
    }

    return G;
}

// Netlify function handler
exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const { ascendant, planets } = data;

    // Placeholder for house signs and planet-house assignments (this would come from the form data)
    const houseSigns = {};  // Logic to map zodiac signs can be added later
    const planetHouseAssignment = planets;  // Expect planets object in the request

    // Generate the graph
    const G = createAstrologicalGraph(houseSigns, planetHouseAssignment);

    // Convert the graph to a JSON representation for return
    const graphJson = graphlib.json.write(G);

    return {
        statusCode: 200,
        body: JSON.stringify(graphJson),
    };
};
