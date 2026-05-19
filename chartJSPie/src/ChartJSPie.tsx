import {
    ReactElement,
    createElement,
    useMemo,
    useCallback
} from "react";

import { ChartJSPieContainerProps } from "../typings/ChartJSPieProps";

import { ChartJSPieInput } from "./components/ChartJSPieInput";

import "./ui/ChartJSPie.css";

export function ChartJSPie(
    props: ChartJSPieContainerProps
): ReactElement {
    const {
        seriesList,
        chartTitle,
        showLegend,
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
            //console.info("on click handler:");

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

                //console.info(
                //    "Updated onClickValueKey:",
                //    onClickValue
                //);
            }
        },
        [onClickValueKey]
    );

    // ---------------------------------------------------
    // Build Dynamic Pie Chart Data
    // ---------------------------------------------------
    const chartData = useMemo(() => {
        const seriesItems = seriesList ?? [];

        // ---------------------------------------------------
        // Labels
        // ---------------------------------------------------
        const labels: string[] = [];

        // ---------------------------------------------------
        // Values
        // ---------------------------------------------------
        const values: number[] = [];

        // ---------------------------------------------------
        // Colors
        // ---------------------------------------------------
        const backgroundColors: string[] = [];

        const borderColors: string[] = [];

        // ---------------------------------------------------
        // Use First Series Only
        // Pie chart works best with one dataset
        // ---------------------------------------------------
        const firstSeries = seriesItems[0];

        const items =
            firstSeries?.dataSource?.status ===
            "available"
                ? firstSeries.dataSource.items ?? []
                : [];

        items.forEach(item => {
            const labelValue =
                firstSeries.labelAttribute?.get(item)
                    ?.value;

            const rawValue =
                firstSeries.valueAttribute?.get(item)
                    ?.value;

            if (
                labelValue !== undefined &&
                labelValue !== null
            ) {
                labels.push(String(labelValue));

                values.push(
                    rawValue !== undefined &&
                        rawValue !== null &&
                        rawValue !== ""
                        ? Number(rawValue)
                        : 0
                );

                // ---------------------------------------------------
                // Color Handling
                // ---------------------------------------------------
                const parsedColors =
                    convertStringToColors(
                        firstSeries.colorKey?.value ||
                            ""
                    );

                const color =
                    parsedColors.length > 0
                        ? parsedColors[
                              labels.length %
                                  parsedColors.length
                          ]
                        : generateRandomColor();

                backgroundColors.push(
                    hexToRGBA(color, 0.5)
                );

                borderColors.push(color);
            }
        });

        // ---------------------------------------------------
        // Dataset
        // ---------------------------------------------------
        const datasets = [
            {
                label:
                    firstSeries?.seriesLabel?.value ||
                    "Pie Dataset",

                data: values,

                backgroundColor: backgroundColors,

                borderColor: borderColors,

                borderWidth: 2
            }
        ];

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
    // Render Pie Chart
    // ---------------------------------------------------
    return (
        <ChartJSPieInput
            labelValue={chartData.labels}
            datasetValue={chartData.datasets}
            chartTitle={chartTitle?.value ||"Dynamic Pie Chart"}
            showLegend={showLegend?.value ?? true}
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
// Generate Random Color
// ---------------------------------------------------
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