import React from "react";
import ReactApexChart from "react-apexcharts";

const ArtistChart = ({ data }) => {
    const series = [{
        name: 'Number of Appearances',
        data: data.map(item => item[1])
    }];
    const options = {
        theme: {
            palette: 'palette1'
        },
        chart: {
            type: 'bar'
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: data.map(item => item[0])
        }
    };

    return (
        <ReactApexChart options={options} series={series} type="bar" height={350} />
    );
};

export default ArtistChart;