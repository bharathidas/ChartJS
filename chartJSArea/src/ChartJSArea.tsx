import {
    ReactElement,
    createElement,
    useMemo,
    useCallback
} from "react";

import { ChartJSAreaContainerProps } from "../typings/ChartJSAreaProps";

import { ChartJSAreaInput } from "./components/ChartJSAreaInput";

import "./ui/ChartJSArea.css";

export function ChartJSArea(
    props: ChartJSAreaContainerProps
): ReactElement {
    const {
        seriesList,
        chartTitle,
        showLegend,
        showGrid,
        height,
        enableAnimation,
        showValueOnTop,
        ShowExportKey,
        ShowZoomKey,
        onClickValueKey,
        onClickAction
    } = props;

    // ---------------------------------------------------
    // Handle click action
    // ---------------------------------------------------
    const onClickHandler = useCallback(() => {
        //console.info("on click handler outside:");

        if (onClickAction && onClickAction.canExecute) {
           // console.info("on click handler:");

            onClickAction.execute();
        }
    }, [onClickAction]);

    // ---------------------------------------------------
    // Handle Mendix String Update
    // ---------------------------------------------------
    const handleClickChange = useCallback(
        (onClickValue: string) => {
            if (
                onClickValueKey &&
                onClickValueKey.setValue
            ) {
                onClickValueKey.setValue(onClickValue);

                // console.info(
                //     "Updated onClickValueKey:",
                //     onClickValue
                // );
            }
        },
        [onClickValueKey]
    );

    // ---------------------------------------------------
    // Build Dynamic Area Chart Data
    // ---------------------------------------------------
    const chartData = useMemo(() => {
        const seriesItems = seriesList ?? [];

        // ---------------------------------------------------
        // Global Labels
        // ---------------------------------------------------
        const allLabelsSet = new Set<string>();

        // ---------------------------------------------------
        // Collect Labels
        // ---------------------------------------------------
        seriesItems.forEach(series => {
            const items =
                series.dataSource?.status === "available"
                    ? series.dataSource.items ?? []
                    : [];

            items.forEach(item => {
                const labelValue =
                    series.labelAttribute?.get(item)?.value;

                if (
                    labelValue !== undefined &&
                    labelValue !== null
                ) {
                    allLabelsSet.add(String(labelValue));
                }
            });
        });

        // ---------------------------------------------------
        // Convert Set → Array
        // ---------------------------------------------------
        const labels = Array.from(allLabelsSet);

        // ---------------------------------------------------
        // Build Datasets
        // ---------------------------------------------------
        const datasets = seriesItems.map(
            (series, index) => {
                const items =
                    series.dataSource?.status ===
                    "available"
                        ? series.dataSource.items ?? []
                        : [];

                // ---------------------------------------------------
                // Label → Value Map
                // ---------------------------------------------------
                const dataMap: Record<
                    string,
                    number
                > = {};

                items.forEach(item => {
                    const labelValue =
                        series.labelAttribute?.get(item)
                            ?.value;

                    const rawValue =
                        series.valueAttribute?.get(item)
                            ?.value;

                    if (
                        labelValue !== undefined &&
                        labelValue !== null
                    ) {
                        dataMap[String(labelValue)] =
                            rawValue !== undefined &&
                            rawValue !== null &&
                            rawValue !== ""
                                ? Number(rawValue)
                                : 0;
                    }
                });

                // ---------------------------------------------------
                // Align data to labels
                // ---------------------------------------------------
                const data = labels.map(
                    label => dataMap[label] ?? 0
                );

                // ---------------------------------------------------
                // Dataset Colors
                // ---------------------------------------------------
                const parsedColors =
                    convertStringToColors(
                        series.colorKey?.value || ""
                    );

                const datasetColor =
                    parsedColors.length > 0
                        ? parsedColors[0]
                        : generateRandomColor();

                // ---------------------------------------------------
                // Area Dataset
                // ---------------------------------------------------
                return {
                    label:
                        series.seriesLabel?.value ||
                        `Series ${index + 1}`,

                    data,

                    // AREA CHART CONFIG
                    fill: true,

                    backgroundColor:
                        hexToRGBA(datasetColor, 0.25),

                    borderColor: datasetColor,

                    borderWidth: 3,

                    tension: 0.4,

                    pointRadius: 4,

                    pointHoverRadius: 6
                };
            }
        );

        return {
            labels,
            datasets
        };
    }, [seriesList]);

    // ---------------------------------------------------
    // Height
    // ---------------------------------------------------
    let heightvalue = 350;

    if (
        height?.value !== undefined &&
        height?.value !== null
    ) {
        heightvalue = Number(height.value);
    }

    // ---------------------------------------------------
    // Mendix Values
    // ---------------------------------------------------
    const onclickvalue =
        onClickValueKey?.value || "";

    const showExport =
        ShowExportKey?.value ?? false;

    const showZoom =
        ShowZoomKey?.value ?? false;
    const animationEnabled =
        enableAnimation?.value ?? true;

    // ---------------------------------------------------
    // Render Area Chart
    // ---------------------------------------------------
    return (
        <ChartJSAreaInput
            labelValue={chartData.labels}
            datasetValue={chartData.datasets}
            chartTitle={
                chartTitle?.value ||
                "Dynamic Multi-Series Area Chart"
            }
            showLegend={showLegend?.value ?? true}
            showGrid={showGrid?.value ?? false}
            height={heightvalue}
            showValueOnTop={
                showValueOnTop?.value ?? false
            }
            onPointClick={onclickvalue}
            onClickAction={onClickHandler}
            onClickChange={handleClickChange}
            showExportButton={showExport}
            showResetZoomButton={showZoom}
            enableZoom={showZoom}
            enableAnimation={animationEnabled}
        />
    );
}

// ---------------------------------------------------
// Convert comma-separated colors → array
// Example:
// "#ff0000,#00ff00,#0000ff"
// ---------------------------------------------------
function convertStringToColors(
    colorString: string
): string[] {
    return colorString
        .split(",")
        .map(color => color.trim())
        .filter(color => color.length > 0);
}

// ---------------------------------------------------
// Generate Dataset Color
// ---------------------------------------------------
// function generateRandomColor(
//     index: number
// ): string {
//     const hue = (index * 67) % 360;

//     return `hsl(${hue}, 70%, 60%)`;
// }

function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);

    const saturation =
        60 + Math.floor(Math.random() * 25);

    const lightness =
        45 + Math.floor(Math.random() * 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ---------------------------------------------------
// Convert HEX/HSL/RGB → RGBA
// ---------------------------------------------------
function hexToRGBA(
    color: string,
    opacity: number
): string {
    // HEX
    if (color.startsWith("#")) {
        let hex = color.replace("#", "");

        if (hex.length === 3) {
            hex =
                hex[0] +
                hex[0] +
                hex[1] +
                hex[1] +
                hex[2] +
                hex[2];
        }

        const bigint = parseInt(hex, 16);

        const r = (bigint >> 16) & 255;

        const g = (bigint >> 8) & 255;

        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // RGB
    if (color.startsWith("rgb(")) {
        return color.replace(
            "rgb(",
            "rgba("
        ).replace(")", `, ${opacity})`);
    }

    // HSL
    if (color.startsWith("hsl(")) {
        return color.replace(
            "hsl(",
            "hsla("
        ).replace(")", `, ${opacity})`);
    }

    // fallback
    return color;
}