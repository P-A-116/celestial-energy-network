const graphlib = require('graphlib');

// Define planets and aspect strengths
const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

// House lords
const houseLords = {
    "1": "Mars", "2": "Venus", "3": "Mercury", "4": "Moon", "5": "Sun", "6": "Mercury",
    "7": "Venus", "8": "Mars", "9": "Jupiter", "10": "Saturn", "11": "Saturn", "12": "Jupiter"
};

// Aspect strengths (won't affect edge widths now)
const aspectStrengths = {
    "Mars": { "4": 0.75, "8": 0.75 },
    "Jupiter": { "5": 1.0, "9": 1.0 },
    "Saturn": { "3": 0.5, "10": 0.5 }
};

function createAstrologicalGraph(planetHouseAssignment) {
    const G = new graphlib.Graph();

    // Add nodes for planets and houses
    planets.forEach(planet => G.setNode(planet));
    for (let i = 1; i <= 12; i++) {
        G.setNode(i.toString()); // House nodes as strings
    }

    // Add edges: Planet-House relationships
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        G.setEdge(planet, house.toString(), { relation: "occupies" });
    }

    // Add edges: Planet-House lords
    for (const [house, lord] of Object.entries(houseLords)) {
        G.setEdge(lord, house, { relation: "lords" });
    }

    // Planet-Planet relationships in the same house
    const housePlanets = {};
    for (let i = 1; i <= 12; i++) {
        housePlanets[i.toString()] = [];
    }
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        housePlanets[house.toString()].push(planet);
    }

    for (const house in housePlanets) {
        const occupants = housePlanets[house];
        for (let i = 0; i < occupants.length; i++) {
            for (let j = i + 1; j < occupants.length; j++) {
                G.setEdge(occupants[i], occupants[j], { relation: "same_house" });
            }
        }
    }

    // Planet-Planet aspects
    for (const [planet, house] of Object.entries(planetHouseAssignment)) {
        if (planet in aspectStrengths) {
            for (const aspectOffset of Object.keys(aspectStrengths[planet])) {
                const aspectedHouse = ((parseInt(house) + parseInt(aspectOffset) - 1) % 12 + 1).toString();
                const occupants = housePlanets[aspectedHouse];
                occupants.forEach(occupant => {
                    G.setEdge(planet, occupant, { relation: "aspect" });
                });
            }
        }
    }

    return G;
}

// Netlify function handler
exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const planetHouseAssignment = data.planets;

    // Generate the graph
    const G = createAstrologicalGraph(planetHouseAssignment);

    // Convert the graph to JSON
    const graphJson = graphlib.json.write(G);

    return {
        statusCode: 200,
        body: JSON.stringify(graphJson),
    };
};
