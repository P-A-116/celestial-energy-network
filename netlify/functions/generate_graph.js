const graphlib = require('graphlib');

// Define planets
const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];

// Define zodiac signs and their rulers
const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const signLords = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter"
};

// Natural relationships
const naturalFriends = {
    'Sun': ['Moon', 'Mars', 'Jupiter'],
    'Moon': ['Sun', 'Mercury'],
    'Mars': ['Sun', 'Moon', 'Jupiter'],
    'Mercury': ['Sun', 'Venus'],
    'Jupiter': ['Sun', 'Moon', 'Mars'],
    'Venus': ['Mercury', 'Saturn'],
    'Saturn': ['Mercury', 'Venus'],
    'Rahu': ['Jupiter', 'Venus', 'Saturn'],
    'Ketu': ['Mars', 'Venus', 'Saturn']
};

const naturalEnemies = {
    'Sun': ['Venus', 'Saturn'],
    'Moon': [],
    'Mars': ['Mercury'],
    'Mercury': ['Moon'],
    'Jupiter': ['Mercury', 'Venus'],
    'Venus': ['Moon', 'Sun'],
    'Saturn': ['Sun', 'Moon', 'Mars'],
    'Rahu': ['Sun', 'Moon', 'Mars'],
    'Ketu': ['Sun', 'Moon']
};

// Aspect strengths (simplified)
const aspectStrengths = {
    "Mars": { "4": 0.75, "8": 0.75 },
    "Jupiter": { "5": 1.0, "9": 1.0 },
    "Saturn": { "3": 0.5, "10": 0.5 }
};

// Function to calculate house signs based on Ascendant
function calculateHouseSigns(ascendantSign) {
    const startIndex = zodiacSigns.indexOf(ascendantSign);
    const houseSigns = {};

    for (let i = 0; i < 12; i++) {
        const signIndex = (startIndex + i) % 12;
        houseSigns[(i + 1).toString()] = zodiacSigns[signIndex];
    }

    return houseSigns;
}

// Function to assign house lords dynamically
function assignHouseLords(houseSigns) {
    const houseLords = {};

    for (const [house, sign] of Object.entries(houseSigns)) {
        houseLords[house] = signLords[sign];
    }

    return houseLords;
}

// Function to create the astrological graph
function createAstrologicalGraph(planetHouseAssignment, ascendantSign) {
    const G = new graphlib.Graph();

    // Calculate house signs and lords
    const houseSigns = calculateHouseSigns(ascendantSign);
    const houseLords = assignHouseLords(houseSigns);

    // Add nodes for planets and houses
    planets.forEach(planet => G.setNode(planet));
    for (let i = 1; i <= 12; i++) {
        G.setNode(i.toString()); // House nodes as strings
    }

    // Add edges: Planet-House relationships (occupies)
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

// Calculate temporary relationship
function calculateTemporaryRelationship(house1, house2) {
    const difference = (parseInt(house2) - parseInt(house1) + 12) % 12;
    if ([1,2,3,9,10,11].includes(difference)) {
        return 'Friend';
    } else {
        return 'Enemy';
    }
}

// Determine natural relationship
function determineNaturalRelationship(planet1, planet2) {
    if (naturalFriends[planet1].includes(planet2)) {
        return 'Friend';
    } else if (naturalEnemies[planet1].includes(planet2)) {
        return 'Enemy';
    } else {
        return 'Neutral';
    }
}

// Calculate compound relationship and score
function calculateCompoundRelationship(natural, temporary) {
    if (natural === 'Friend' && temporary === 'Friend') {
        return { relationship: 'Extreme Friend', score: 2 };
    } else if ((natural === 'Friend' && temporary === 'Neutral') || (natural === 'Neutral' && temporary === 'Friend')) {
        return { relationship: 'Friend', score: 1 };
    } else if (natural === 'Enemy' && temporary === 'Enemy') {
        return { relationship: 'Extreme Enemy', score: -2 };
    } else if ((natural === 'Enemy' && temporary === 'Neutral') || (natural === 'Neutral' && temporary === 'Enemy')) {
        return { relationship: 'Enemy', score: -1 };
    } else {
        return { relationship: 'Neutral', score: 0 };
    }
}

// Function to calculate the relationship matrix and total score
function calculateRelationshipMatrix(planetHouseAssignment) {
    const planetsList = Object.keys(planetHouseAssignment);
    const matrix = [];
    let totalScore = 0;

    for (let i = 0; i < planetsList.length; i++) {
        const planet1 = planetsList[i];
        const row = [];
        for (let j = 0; j < planetsList.length; j++) {
            const planet2 = planetsList[j];
            if (planet1 === planet2) {
                row.push('-');
            } else {
                const tempRelationship = calculateTemporaryRelationship(
                    planetHouseAssignment[planet1],
                    planetHouseAssignment[planet2]
                );
                const natRelationship = determineNaturalRelationship(planet1, planet2);
                const compound = calculateCompoundRelationship(natRelationship, tempRelationship);
                // Abbreviate for readability
                let relationship = compound.relationship;
                if (relationship === 'Extreme Friend') relationship = 'E. Fr';
                if (relationship === 'Extreme Enemy') relationship = 'E. En';
                row.push(relationship);
                totalScore += compound.score;
            }
        }
        matrix.push(row);
    }

    return { matrix, totalScore, planetsList };
}

// Netlify function handler
exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const planetHouseAssignment = data.planets;
    const ascendantSignIndex = parseInt(data.ascendant);

    // Validate ascendant sign index
    if (isNaN(ascendantSignIndex) || ascendantSignIndex < 1 || ascendantSignIndex > 12) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid Ascendant. Must be a number between 1 and 12." }),
        };
    }

    // Get the Ascendant sign from index
    const ascendantSign = zodiacSigns[ascendantSignIndex - 1];

    // Generate the graph
    const G = createAstrologicalGraph(planetHouseAssignment, ascendantSign);

    // Convert the graph to JSON
    const graphJson = graphlib.json.write(G);

    // Calculate relationship matrix and total score
    const { matrix, totalScore, planetsList } = calculateRelationshipMatrix(planetHouseAssignment);

    // Return all data
    return {
        statusCode: 200,
        body: JSON.stringify({
            graph: graphJson,
            relationshipMatrix: matrix,
            totalScore: totalScore,
            planetsList: planetsList
        }),
    };
};
