d3.select(window).on('resize', Stone);
Stone();

function Stone() {
    d3.select("#svg4").remove();

    const margin = { top: 10, right: 30, bottom: 50, left: 30 }; 
    const columnWidth = (window.innerWidth - 40) / 4; 
    const width = columnWidth * 2 - margin.left - margin.right; 
    const height = 400 - margin.top - margin.bottom; 

    const svg4 = d3.select("#scatterplotStone")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);   

    function filterData(data) {
        const toggleChecked = document.getElementById("filterToggle3").checked;
        return toggleChecked ? data.filter(d => d.valueRCA >= 1) : data;
    }

    function filterDataBySector(data, sector) {
        return data.filter(d => d.sector === sector);
    }

    d3.csv("data/swiss_exportsPCI.csv")
        .then(function(dataExports) { 
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

            console.log(dataExports);

            const yearExtent = d3.extent(dataExports, d => +d.year);

            const maxTradeValue = d3.max(dataExports, d => +d.countryTrade_M);
            const minTradeValue = d3.min(dataExports, d => +d.countryTrade_M);
            
            const radiusScale = d3.scaleLinear()
                .domain([Math.sqrt(minTradeValue), Math.sqrt(maxTradeValue)])
                .range([1, 35]); 

            const dataStone = filterDataBySector(dataExports, "Stone");

            const filteredData = filterData(dataStone);

            const PCIExtent = [-3.5, 3.5]; 

            const xScale = d3.scaleLinear()
                .domain(yearExtent)
                .range([0, width]);

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
                .ticks(Math.min((yearExtent[1] - yearExtent[0]), 10));

            svg4.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .call(g => g.select(".domain").remove());

            const yScale = d3.scaleLinear()
                .domain(PCIExtent)
                .range([height, 0]);

            const colorScale = d3.scaleLinear()
                .domain([d3.min(dataExports, d => +d.valuePCI), d3.max(dataExports, d => +d.valuePCI)])
                .range(["#E29578", "#21295C"]);

            svg4.selectAll("circle")
                .data(dataStone)
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

            document.getElementById("filterToggle3").addEventListener("change", function() {
                svg4.selectAll("circle").remove();
                const filteredData = filterData(dataStone);
                svg4.selectAll("circle")
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
        })
        .catch(function(error) {
            console.error("Error loading export data: " + error);
        });
}
