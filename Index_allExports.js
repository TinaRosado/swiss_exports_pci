// Define the main function
function allExports() {
    d3.select("svg").remove();

    const margin = { top: 10, right: 30, bottom: 50, left: 30 };
    const columnWidth = (window.innerWidth - 40) / 4;
    const width = columnWidth * 2 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#scatterplotAllExports")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    function filterData(data) {
        const toggleChecked = document.getElementById("filterToggle").checked;
        if (toggleChecked) {
            return data.filter(d => d.valueRCA >= 1);
        } else {
            return data;
        }
    }

    d3.csv("data/swiss_exportsPCI.csv")
        .then(function (dataExports) {
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

            const yearExtent = d3.extent(dataExports, d => +d.year);
            const valuePCIExtent = d3.extent(dataExports, d => +d.valuePCI);

            const PCIExtent = [-3.5, 3.5];

            const xScale = d3.scaleLinear()
                .domain(yearExtent)
                .range([0, width]);

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
                .ticks(Math.min((yearExtent[1] - yearExtent[0]), 10));
            
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .call(g => g.select(".domain").remove());

            const yScale = d3.scaleLinear()
                .domain(PCIExtent)
                .range([height, 0]);

            const maxTradeValue = d3.max(dataExports, d => +d.countryTrade_M);
            const minTradeValue = d3.min(dataExports, d => +d.countryTrade_M);

            const radiusScale = d3.scaleLinear()
                .domain([Math.sqrt(minTradeValue), Math.sqrt(maxTradeValue)])
                .range([1, 35]);

            const colorScale = d3.scaleLinear()
                .domain([d3.min(dataExports, d => +d.valuePCI), d3.max(dataExports, d => +d.valuePCI)])
                .range(["#E29578", "#21295C"]);

            svg.selectAll("circle")
                .data(dataExports)
                .enter()
                .append("circle")
                .attr('cx', function (d) { return xScale(+d.year); })
                .attr('cy', function (d) { return yScale(+d.valuePCI); })
                .attr("r", function (d) { return radiusScale(Math.sqrt(+d.countryTrade_M)); })
                .style("fill", d => colorScale(+d.valuePCI))
                .style("fill-opacity", 0.7);

            document.getElementById("filterToggle").addEventListener("change", function () {
                svg.selectAll("circle").remove();
                const filteredData = filterData(dataExports);
                svg.selectAll("circle")
                    .data(filteredData)
                    .enter()
                    .append("circle")
                    .attr('cx', function (d) { return xScale(+d.year); })
                    .attr('cy', function (d) { return yScale(+d.valuePCI); })
                    .attr("r", function (d) { return radiusScale(Math.sqrt(+d.countryTrade_M)); })
                    .style("fill", d => colorScale(+d.valuePCI))
                    .style("fill-opacity", 0.7);
            });

            document.querySelectorAll('.form-check-input').forEach(item => {
                item.addEventListener('change', event => {
                    const selectedSectors = getSelectedSectors();
                    updateVisualization(selectedSectors);
                });
            });

            function getSelectedSectors() {
                const selectedSectors = [];
                document.querySelectorAll('.form-check-input').forEach(item => {
                    if (item.checked) {
                        selectedSectors.push(item.value);
                    }
                });
                return selectedSectors;
            }

            function filterDataBySectors(data, selectedSectors) {
                if (selectedSectors.length === 0) {
                    return data;
                } else {
                    return data.filter(d => selectedSectors.includes(d.sector));
                }
            }

            function updateVisualization(selectedSectors) {
                const filteredData = filterDataBySectors(dataExports, selectedSectors);

                const circles = svg.selectAll("circle")
                    .data(filteredData, d => d.productName);

                circles.exit()
                    .transition()
                    .duration(500)
                    .attr("r", 0)
                    .remove();

                circles.enter()
                    .append("circle")
                    .attr('cx', function(d) { return xScale(d.year); })
                    .attr('cy', function(d) { return yScale(d.valuePCI); })
                    .attr("r", 0)
                    .style("fill", d => colorScale(d.valuePCI))
                    .style("fill-opacity", 0.7)
                    .merge(circles)
                    .transition()
                    .duration(500)
                    .attr("r", function (d) { return radiusScale(Math.sqrt(+d.countryTrade_M)); })
            }
        })
        .catch(function (error) {
            console.error("Error loading export data: " + error);
        });
}

// Run the main function
d3.select(window).on('resize', allExports);
allExports();
