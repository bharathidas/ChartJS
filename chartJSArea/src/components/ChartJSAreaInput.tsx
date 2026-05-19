import {
    ReactElement,
    createElement,
    useMemo,
    useRef,
    useState
} from "react";

import { Line } from "react-chartjs-2";

import {
    Download,
    ZoomIn,
    ZoomOut,
    Maximize
} from "react-feather";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    ChartEvent,
    ActiveElement,
    ChartData
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartDataLabels,
    zoomPlugin
);

// ---------------------------------------------------
// Dataset Config
// ---------------------------------------------------
export interface DatasetConfig {
    label: string;
    data: number[];

    fill?: boolean;

    backgroundColor?: string | string[];
    borderColor?: string | string[];

    borderWidth?: number;

    tension?: number;

    pointRadius?: number;

    hidden?: boolean;
}

// ---------------------------------------------------
// Component Props
// ---------------------------------------------------
export interface ChartJSAreaInputProps {
    // Labels
    labelValue?: string[];

    // Datasets
    datasetValue?: DatasetConfig[];

    // Chart Config
    chartTitle?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showValueOnTop?: boolean;

    // Height
    height?: number;

    // Animation
    enableAnimation?: boolean;

    // Mendix String Variable
    onPointClick?: string;
    onClickAction?: () => void;
    onClickChange?: (value: string) => void;

    // Export
    showExportButton?: boolean;

    // Zoom
    enableZoom?: boolean;
    showResetZoomButton?: boolean;
}

// ---------------------------------------------------
// Component
// ---------------------------------------------------
export function ChartJSAreaInput(
    props: ChartJSAreaInputProps
): ReactElement {
    const {
        labelValue,
        datasetValue,
        chartTitle = "Dynamic Area Chart",
        showLegend = true,
        showGrid = true,
        showValueOnTop = false,
        height = 350,
        enableAnimation = true,
        onPointClick,
        onClickAction,
        onClickChange,
        showExportButton = false,
        enableZoom = true,
        showResetZoomButton = true
    } = props;

    const [onPointClickValue, setOnPointClickValue] =
        useState<string>(onPointClick || "");

    console.log("onPointClickValue", onPointClickValue);

    const chartRef = useRef<any>(null);

    // ---------------------------------------------------
    // Toolbar Button Style
    // ---------------------------------------------------
    const toolbarButtonStyle = {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    } as const;

    // ---------------------------------------------------
    // Dynamic Color Generator
    // ---------------------------------------------------
    // const generateColor = (
    //     index: number,
    //     opacity = 1
    // ): string => {
    //     const hue = (index * 57) % 360;

    //     return `hsla(${hue}, 70%, 55%, ${opacity})`;
    // };

    function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);

    const saturation =
        60 + Math.floor(Math.random() * 25);

    const lightness =
        45 + Math.floor(Math.random() * 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

    // ---------------------------------------------------
    // Labels
    // ---------------------------------------------------
    const labels = useMemo(() => {
        return labelValue?.length ? labelValue : [];
    }, [labelValue]);

    // ---------------------------------------------------
    // Datasets
    // ---------------------------------------------------
    const datasets = useMemo(() => {
        if (!datasetValue?.length) {
            return [];
        }

        return datasetValue.map((dataset, index) => ({
            label: dataset.label || `Series ${index + 1}`,

            data: dataset.data || [],

            // IMPORTANT FOR AREA CHART
            fill: dataset.fill ?? true,

            backgroundColor:
                dataset.backgroundColor ||
                generateRandomColor(),

            borderColor:
                dataset.borderColor ||
                generateRandomColor(),

            borderWidth: dataset.borderWidth ?? 3,

            tension: dataset.tension ?? 0.4,

            pointRadius: dataset.pointRadius ?? 4,

            pointHoverRadius: 6,

            hidden: dataset.hidden ?? false
        }));
    }, [datasetValue]);

    // ---------------------------------------------------
    // Chart Data
    // ---------------------------------------------------
    const data: ChartData<"line"> = {
        labels,
        datasets
    };

    // ---------------------------------------------------
    // Export Chart
    // ---------------------------------------------------
    const exportChart = (): void => {
        const chart = chartRef.current;

        if (!chart) {
            return;
        }

        const base64Image = chart.toBase64Image();

        const link = document.createElement("a");

        link.href = base64Image;

        link.download = `${chartTitle}.png`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    // ---------------------------------------------------
    // Zoom Controls
    // ---------------------------------------------------
    const zoomIn = (): void => {
        if (chartRef.current) {
            chartRef.current.zoom(1.2);
        }
    };

    const zoomOut = (): void => {
        if (chartRef.current) {
            chartRef.current.zoom(0.8);
        }
    };

    const resetZoom = (): void => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };

    // ---------------------------------------------------
    // Chart Options
    // ---------------------------------------------------
    const options: ChartOptions<"line"> = {
        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "nearest",
            intersect: true
        },

        plugins: {
            legend: {
                display: showLegend,

                position: "top",

                labels: {
                    usePointStyle: true,

                    padding: 20,

                    font: {
                        size: 12
                    }
                }
            },

            title: {
                display: !!chartTitle,

                text: chartTitle,

                font: {
                    size: 18
                },

                padding: {
                    top: 10,
                    bottom: 20
                }
            },

            // ---------------------------------------------------
            // Tooltip
            // ---------------------------------------------------
            tooltip: {
                enabled: true,

                callbacks: {
                    title: items => {
                        return items[0]?.label || "";
                    },

                    label: context => {
                        const datasetLabel =
                            context.dataset.label || "";

                        const value = context.raw as number;

                        return `${datasetLabel}: ${value}`;
                    }
                }
            },

            // ---------------------------------------------------
            // Data Labels
            // ---------------------------------------------------
            datalabels: {
                display: showValueOnTop,

                align: "top",

                anchor: "end",

                offset: 4,

                color: "#000",

                font: {
                    weight: "bold",
                    size: 12
                },

                formatter: (value: number) => {
                    return value;
                }
            },

            // ---------------------------------------------------
            // Zoom Plugin
            // ---------------------------------------------------
            zoom: {
                pan: {
                    enabled: enableZoom,
                    mode: "x"
                },

                zoom: {
                    wheel: {
                        enabled: enableZoom
                    },

                    pinch: {
                        enabled: enableZoom
                    },

                    drag: {
                        enabled: true
                    },

                    mode: "x"
                }
            }
        },

        // ---------------------------------------------------
        // Axis
        // ---------------------------------------------------
        scales: {
            x: {
                grid: {
                    display: showGrid
                },

                ticks: {
                    autoSkip: false,

                    maxRotation: 45,

                    minRotation: 0
                }
            },

            y: {
                beginAtZero: true,

                grid: {
                    display: showGrid
                },

                ticks: {
                    callback: value => `${value}`
                }
            }
        },

        // ---------------------------------------------------
        // Animation
        // ---------------------------------------------------
        animation: enableAnimation
            ? {
                  duration: 1000,

                  easing: "easeInOutQuart"
              }
            : false,

        // ---------------------------------------------------
        // On Click Event
        // ---------------------------------------------------
        onClick: (
            event: ChartEvent,
            elements: ActiveElement[]
        ) => {
            if (!elements.length) {
                return;
            }

            const { index, datasetIndex } = elements[0];

            const label = labels[index];

            const dataset = datasets[datasetIndex];

            const value = Number(dataset?.data[index]);

            const clickedData =
                `Label=${label}; ` +
                `Value=${value}; ` +
                `Dataset=${dataset?.label};`;

            console.log("Clicked Data:", clickedData);
            console.log("event:", event);

            onClickChange?.(clickedData);

            setOnPointClickValue(clickedData);

            onClickAction?.();
        }
    };

    // ---------------------------------------------------
    // Render
    // ---------------------------------------------------
    return (
        <div
            style={{
                width: "100%"
            }}
        >
            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginBottom: "10px"
                }}
            >
                {/* Export Button */}
                {showExportButton && (
                    <button
                        onClick={exportChart}
                        title="Export Chart"
                        style={toolbarButtonStyle}
                    >
                        <Download size={20} />
                    </button>
                )}

                {/* Zoom In */}
                {enableZoom && (
                    <button
                        onClick={zoomIn}
                        title="Zoom In"
                        style={toolbarButtonStyle}
                    >
                        <ZoomIn size={20} />
                    </button>
                )}

                {/* Zoom Out */}
                {enableZoom && (
                    <button
                        onClick={zoomOut}
                        title="Zoom Out"
                        style={toolbarButtonStyle}
                    >
                        <ZoomOut size={20} />
                    </button>
                )}

                {/* Reset Zoom */}
                {showResetZoomButton && enableZoom && (
                    <button
                        onClick={resetZoom}
                        title="Reset Zoom"
                        style={toolbarButtonStyle}
                    >
                        <Maximize size={20} />
                    </button>
                )}
            </div>

            {/* Chart */}
            <div
                style={{
                    height: `${height}px`,
                    width: "100%",
                    padding: "10px"
                }}
            >
                <Line
                    ref={chartRef}
                    data={data}
                    options={options}
                    plugins={[ChartDataLabels]}
                />
            </div>
        </div>
    );
}