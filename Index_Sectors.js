d3.select(window).on('resize', Sectors);
Sectors();

function Sectors() {
  d3.select("svg3").remove();

  // Define margins and dimensions
  const margin = { top: 20, right: 25, bottom: 20, left: 20};
  const width = 760 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg3 = d3.select("#graphSectors")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define your custom color range
  const customColorRange = ['#21295C', '#A4243B', '#006D77', '#83C5BE', '#E29578', '#A4243B','#413C58','#83C5BE','#21295C'];
  
  
  // Load the data
  d3.csv("data/swiss_exportsPCI.csv")
    .then(function (dataExports) {
      // Convert data types and prepare data structure
      dataExports = dataExports.map(function (d) {
        return {
          productName: d.productName,
          year: +d.year,
          countryTrade: d.countryTrade,
          worldTrade: d.worldTrade,
          valueRCA: +d.valueRCA,
          sector: d.sector,
          countryTrade_M: +d.countryTrade_M,
          worldTrade_M: +d.worldTrade_M,
          worldTrade_B: +d.worldTrade_B,
          code: d.code,
          valuePCI: +d.valuePCI
        };
      });

      // Define the x scale using a linear scale
      const yearExtent = d3.extent(dataExports, d => +d.year);

      const xScale = d3.scaleLinear()
        .domain(yearExtent)
        .range([0, width]);

      // Customize the tick values for the x-axis
      const xAxis = d3.axisBottom(xScale)
          .tickFormat(d3.format("d")) // Format ticks as integers without commas
          .ticks(Math.min((yearExtent[1] - yearExtent[0]), 10)); 

      svg3.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxis)
          .call(g => g.select(".domain").remove()); // Remove the axis line

      // Define the y scale using a band scale
      const sectors = Array.from(new Set(dataExports.map((d) => d.sector)));
      const yScale = d3.scaleBand()
        .domain(sectors)
        .range([height, 0])
        .padding(0.2);

        // Append labels for sector categories
        /*svg3.selectAll(".sector-label")
          .data(sectors) 
          .enter()
          .append("text")
          .attr("class", "sector-label")
          .attr("x", -20) // Adjust position as needed
          .attr("y", d => yScale(d) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .style("text-anchor", "end")
          .text(d => d);*/

      // Define categorical color scale by sector
      const color = d3.scaleOrdinal()
        .domain(sectors)
        .range(customColorRange); // Use the custom color range here

      // Define size scale based on trade value
      const tradeDomain = d3.extent(dataExports, d => d.countryTrade_M);
      const size = d3.scaleSqrt()
        .domain(tradeDomain)
        .range([0.5, 25]);

      // Add circle for each data point with jitter
        svg3.selectAll(".circ")
          .data(dataExports)
          .enter()
          .append("circle")
          .attr("class", "circ") // Added class for selection
          //.attr("stroke", "black")
          .attr("fill", (d) => color(d.sector))
          .attr("opacity", 0.8)
          .attr("r", (d) => size(d.countryTrade_M))
          .attr("cx", (d) => xScale(d.year)) 
          .attr("cy", (d)  => yScale(d.sector))
          //.on("mouseover", (event, d) => showTooltip(d, event))
          //.on("mouseout", hideTooltip);

      // Define the force simulation
      const simulation = d3.forceSimulation(dataExports) //this is what slow the code. Take the this .forceSimulation, run it once and export the result as csv > then read from the csv the same way we read from the other data.
        .force("x", d3.forceX().x(d => xScale(d.year)).strength(4))
        .force("y", d3.forceY().y(d => yScale(d.sector)).strength(0.5))
        .force("collide", d3.forceCollide().radius(d => size(d.countryTrade_M) + 1).iterations(2))
        .stop();

      // Run the simulation for a few iterations to stabilize the layout
      for (let i = 0; i < 150; ++i) simulation.tick();

      // Update circle positions based on simulation results
      svg3.selectAll(".circ")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .on('mousemove', function(event, d) {
          d3.select('#tooltip')
              .style('opacity', 1)
              .html(`Product: ${d.productName}<br>Country Trade: ${d.countryTrade}<br>World Trade: ${d.worldTrade}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
          d3.select('#tooltip').style('opacity', 0);
      });
    })
    .catch(function (error) {
      console.error("Error loading data:", error);
    });
  } // This is the end of the .then() function
