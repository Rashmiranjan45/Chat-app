import React from 'react'
import {Line , Doughnut} from "react-chartjs-2"
import {
  Chart as ChartJS,
  Tooltip,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Legend,
  LineElement,
} from "chart.js"
import { orange, orangeLight, purple, purpleLight } from '../constants/color'
import { getLast7Days } from '../../lib/features'

ChartJS.register(
  Tooltip,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  Legend
)

const labels = getLast7Days() 


// Line-options...
const lineChartOptions = {
  responsive: true,
  plugins:{
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
    },
}

const LineChart = ({ value = [] }) => {

  const data = {
    labels,
    datasets: [
      {
        data: value,
        label: "Revenue",
        fill: true,
        backgroundColor: purpleLight,
        borderColor: purple
      }
    ]
  }
  return <Line data={data} options={lineChartOptions}/>
}


// doughnut-options...
const doughnutChartOptions = {
  response: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  cutout: 110,
}

const DoughnutChart = ({value = [],labels = []}) => {
  const data = {
    labels,
    datasets: [
      {
        data: value,
        backgroundColor: [purpleLight,orange],
        hoverBackgroundColor: [purple,orangeLight],
        borderColor: [purple,orange],
        offset: 40 
      }
    ]
  }

  return <Doughnut
            style={{
              zIndex: 10
            }}
            data={data} 
            options={doughnutChartOptions}
          />
}

export {
    LineChart,
    DoughnutChart
}