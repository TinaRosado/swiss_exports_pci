// Add event listener for window resize
d3.select(window).on('resize', Chemicals);
Chemicals();

function Chemicals() {
    // Remove existing SVG
    d3.select("#svg2").remove();

    // Define margins and dimensions
    const margin = { top: 10, right: 30, bottom: 50, left: 30 };
    const columnWidth = (window.innerWidth - 40) / 4;
    const width = columnWidth * 2 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append SVG to the container
    const svg2 = d3.select("#scatterplotChemicals")
        .append("svg")
        .attr("id", "svg2")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Function to filter data based on toggle state
    function filterData(data) {
        const toggleChecked = document.getElementById("filterToggle2").checked;
        return toggleChecked ? data.filter(d => d.valueRCA >= 1) : data;
    }

    // Function to filter data by sector
    function filterDataBySector(data, sector) {
        return data.filter(d => d.sector === sector);
    }

    // Load the data
    d3.csv("data/swiss_exportsPCI.csv").then(function(dataExports) {
        // Data preprocessing
        dataExports = dataExports.map(function(d) {
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

        // Log the dataExports to the console
        console.log(dataExports);

        // Find the extent of year
        const yearExtent = d3.extent(dataExports, d => +d.year);
        console.log("Year Extent:", yearExtent);

        // Define the maximum and minimum trade values
        const maxTradeValue = d3.max(dataExports, d => +d.countryTrade_M);
        const minTradeValue = d3.min(dataExports, d => +d.countryTrade_M);

        // Define a radius scale
        const radiusScale = d3.scaleLinear()
            .domain([Math.sqrt(minTradeValue), Math.sqrt(maxTradeValue)])
            .range([1, 35]);

        // Filter data for the chemical sector
        const dataChemicals = filterDataBySector(dataExports, "Chemicals");
        // Log the dataChemicals to the console
        console.log(dataChemicals);

        // Filter data based on toggle state
        const filteredData = filterData(dataChemicals);

        // Define PCI Min and Max
        const PCIExtent = [-3.5, 3.5]; //Based on the valuePCIExtent to have it uniformly distributed

        // Add X axis
        const xScale = d3.scaleLinear()
            .domain(yearExtent)
            .range([0, width]);

        // Customize the tick values for the x-axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d")) // Format ticks as integers without commas
            .ticks(Math.min((yearExtent[1] - yearExtent[0]), 10)); // Show up to 20 ticks, or fewer if the range is smaller

        svg2.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove()); // Remove the axis line

        // Y axis
        const yScale = d3.scaleLinear()
            .domain(PCIExtent)
            .range([height, 0]);

        // Define the color scale
        const colorScale = d3.scaleLinear()
            .domain([d3.min(dataExports, d => +d.valuePCI), d3.max(dataExports, d => +d.valuePCI)])
            .range(["#E29578", "#21295C"]);

        // Add circles
        svg2.selectAll("circle")
            .data(dataChemicals)
            .enter()
            .append("circle")
            .attr('cx', d => xScale(+d.year))
            .attr('cy', d => yScale(+d.valuePCI))
            .attr("r", d => radiusScale(Math.sqrt(+d.countryTrade_M)))
            .style("fill", d => colorScale(+d.valuePCI))
            .style("fill-opacity", 0.7) // Setting opacity to 70%
            .on('mousemove', function(event, d) {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html("Product: " + d.productName + "<br>Country Trade: " + d.countryTrade + "<br>World Trade: " + d.worldTrade)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('opacity', 0);
            });

        // Toggle event listener
        document.getElementById("filterToggle2").addEventListener("change", function() {
            svg2.selectAll("circle").remove(); // Remove existing circles
            const filteredData = filterData(dataChemicals); // Filter data based on toggle state
            svg2.selectAll("circle")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr('cx', d => xScale(+d.year))
                .attr('cy', d => yScale(+d.valuePCI))
                .attr("r", d => radiusScale(Math.sqrt(+d.countryTrade_M)))
                .style("fill", d => colorScale(+d.valuePCI))
                .style("fill-opacity", 0.7)
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
        });
    }).catch(function(error) {
        // Handle any errors that occur during loading export data
        console.error("Error loading export data: " + error);
    });
}
