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
    ChartDataLabels,
    zoomPlugin
);

// ---------------------------------------------------
// Dataset Config
// ---------------------------------------------------
export interface DatasetConfig {
    label: string;

    data: number[];

    backgroundColor?: string | string[];

    borderColor?: string | string[];

    borderWidth?: number;

    tension?: number;

    pointRadius?: number;

    hidden?: boolean;

    // Multi Axis
    yAxisID?: "y" | "y1";
}

// ---------------------------------------------------
// Component Props
// ---------------------------------------------------
export interface ChartJSLineInputProps {
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

    // Multi Axis
    enableMultiAxis?: boolean;

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
export function ChartJSLineInput(
    props: ChartJSLineInputProps
): ReactElement {
    const {
        labelValue,
        datasetValue,
        chartTitle = "Dynamic Line Chart",
        showLegend = true,
        showGrid = true,
        showValueOnTop = false,
        height = 350,
        enableAnimation = true,
        enableMultiAxis = false,
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
    // Random Color Generator
    // ---------------------------------------------------
    function generateRandomColor(opacity = 1): string {
        const hue = Math.floor(Math.random() * 360);

        const saturation =
            60 + Math.floor(Math.random() * 25);

        const lightness =
            45 + Math.floor(Math.random() * 20);

        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
    }

    // ---------------------------------------------------
    // Labels
    // ---------------------------------------------------
    const labels = useMemo(() => {
        return labelValue?.length ? labelValue : [];
    }, [labelValue]);

    // ---------------------------------------------------
    // Calculate Dynamic Max Value
    // ---------------------------------------------------
    const maxValue = useMemo(() => {
        const allValues =
            datasetValue?.flatMap(dataset => dataset.data) || [];

        const max = Math.max(...allValues, 0);

        return Math.ceil(max);
    }, [datasetValue]);

    // ---------------------------------------------------
    // Datasets
    // ---------------------------------------------------
    const datasets = useMemo(() => {
        if (!datasetValue?.length) {
            return [];
        }

        return datasetValue.map((dataset, index) => {
            const border =
                dataset.borderColor ||
                generateRandomColor(1);

            return {
                label: dataset.label || `Series ${index + 1}`,

                data: dataset.data || [],

                fill: false,

                backgroundColor:
                    dataset.backgroundColor ||
                    generateRandomColor(0.5),

                borderColor: border,

                borderWidth: dataset.borderWidth ?? 3,

                tension: dataset.tension ?? 0.4,

                pointRadius: dataset.pointRadius ?? 4,

                pointHoverRadius: 6,

                pointBackgroundColor: border,

                pointBorderColor: "#fff",

                pointHoverBackgroundColor: border,

                hidden: dataset.hidden ?? false,

                // Multi Axis Support
                yAxisID: enableMultiAxis
                    ? dataset.yAxisID || "y"
                    : "y"
            };
        });
    }, [datasetValue, enableMultiAxis]);

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
            mode: "index",
            intersect: false
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

                text: enableMultiAxis
                    ? `${chartTitle} - Multi Axis`
                    : chartTitle,

                font: {
                    size: 18
                },

                padding: {
                    top: 10,
                    bottom: 20
                }
            },

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

            // LEFT AXIS
            y: {
                type: "linear",

                display: true,

                position: "left",

                beginAtZero: true,

                min: 0,

                max: maxValue,

                grid: {
                    display: showGrid
                },

                ticks: {
                    stepSize:
                        maxValue > 10
                            ? Math.ceil(maxValue / 5)
                            : 1,

                    callback: value => `${value}`
                }
            },

            // RIGHT AXIS
            ...(enableMultiAxis && {
                y1: {
                    type: "linear",

                    display: true,

                    position: "right",

                    beginAtZero: true,

                    // IMPORTANT
                    min: 0,

                    max: maxValue,

                    grid: {
                        drawOnChartArea: false
                    },

                    ticks: {
                        stepSize:
                            maxValue > 10
                                ? Math.ceil(maxValue / 5)
                                : 1,

                        callback: value => `${value}`
                    }
                }
            })
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