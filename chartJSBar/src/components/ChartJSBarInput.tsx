import { ReactElement, createElement, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";

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
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartEvent,
    ActiveElement,
    ChartData,
    Filler
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartDataLabels,
    zoomPlugin
);

export interface DatasetConfig {
    label: string;
    data: number[];

    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderRadius?: number;

    stack?: string;
    hidden?: boolean;
}

export interface ChartJSBarInputProps {
    // Labels
    labelValue?: string[];

    // Datasets
    datasetValue?: DatasetConfig[];

    // Chart Config
    chartTitle?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    horizontal?: boolean;
    stacked?: boolean;
    showValueOnTop?: boolean;

    // Height
    height?: number;

    // Animation
    enableAnimation?: boolean;

    // Mendix String Variable
    onBarClick?: string;
    onClickAction?: () => void;
    onClickChange?: (value: string) => void;

    // Export
    showExportButton?: boolean;

    // Zoom
    enableZoom?: boolean;
    showResetZoomButton?: boolean;
}

export function ChartJSBarInput(
    props: ChartJSBarInputProps
): ReactElement {
    const {
        labelValue,
        datasetValue,
        chartTitle = "Dynamic Multi-Series Chart",
        showLegend = true,
        showGrid = true,
        horizontal = false,
        stacked = false,
        height = 350,
        enableAnimation = true,
        showValueOnTop = false,
        onBarClick,
        onClickAction,
        onClickChange,
        showExportButton = false,
        enableZoom = true,
        showResetZoomButton = true
    } = props;

    const [onBarClickValue, setOnBarClickValue] = useState<string>(
        onBarClick || ""
    );

    console.log("onBarClickValue", onBarClickValue);

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
    const generateColor = (
        index: number,
        opacity = 1
    ): string => {
        const hue = (index * 57) % 360;

        return `hsla(${hue}, 70%, 55%, ${opacity})`;
    };

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

            backgroundColor:
                dataset.backgroundColor ||
                generateColor(index, 0.7),

            borderColor:
                dataset.borderColor ||
                generateColor(index, 1),

            borderWidth: dataset.borderWidth ?? 1,

            borderRadius: dataset.borderRadius ?? 6,

            stack: dataset.stack,

            hidden: dataset.hidden ?? false,

            barPercentage: 0.7,

            categoryPercentage: 0.6
        }));
    }, [datasetValue]);

    // ---------------------------------------------------
    // Chart Data
    // ---------------------------------------------------
    const data: ChartData<"bar"> = {
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
    const options: ChartOptions<"bar"> = {
        responsive: true,

        maintainAspectRatio: false,

        indexAxis: horizontal ? "y" : "x",

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

                anchor: "end",

                align: "top",

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
                stacked,

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
                stacked,

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

            setOnBarClickValue(clickedData);

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
                <Bar
                    ref={chartRef}
                    data={data}
                    options={options}
                    plugins={[ChartDataLabels]}
                />
            </div>
        </div>
    );
}