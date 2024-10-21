exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const { ascendant, planets } = data;
  const { sun, moon, mars, rahu, mercury, venus, jupiter, saturn, ketu } = planets;

  const graphData = {
    nodes: [
      { id: "Sun", house: sun },
      { id: "Moon", house: moon },
      { id: "Mars", house: mars },
      { id: "Mercury", house: mercury },
      { id: "Venus", house: venus },
      { id: "Jupiter", house: jupiter },
      { id: "Saturn", house: saturn },
      { id: "Rahu", house: rahu },
      { id: "Ketu", house: ketu },
    ],
    edges: [
      { source: "Sun", target: "Moon", relation: "example" },
      { source: "Mars", target: "Venus", relation: "example" },
    ],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(graphData),
  };
};
