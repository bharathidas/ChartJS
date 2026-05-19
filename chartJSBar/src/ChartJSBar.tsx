import { ReactElement, createElement, useMemo,useCallback } from "react";
import { ChartJSBarContainerProps } from "../typings/ChartJSBarProps";
import { ChartJSBarInput } from "./components/ChartJSBarInput";
import "./ui/ChartJSBar.css";

export function ChartJSBar(props: ChartJSBarContainerProps): ReactElement {
    const {
        seriesList,
        chartTitle,
        showLegend,
        showGrid,
        horizontal,
        stacked,
        height,
        showValueOnTop,
        ShowExportKey,
        ShowZoomKey,
        onClickValueKey,
        onClickAction
    } = props;
    // Handle click action
    const onClickHandler = useCallback(() => {
        //console.info('on click handler outside:');
        if (onClickAction && onClickAction.canExecute) {
            //console.info('on click handler:');
            onClickAction.execute();
        }
    }, [onClickAction]);

    const handleClickChange = useCallback(
        (onClickValue: string) => {
            if (onClickValueKey && onClickValueKey.setValue) {
                
                onClickValueKey.setValue(onClickValue);
                    //console.info('Updated onClickValueKey:', onClickValue);
            }
        },
        [onClickValueKey]
    );

    // ---------------------------------------------------
    // Build Dynamic Chart Data
    // ---------------------------------------------------
    const chartData = useMemo(() => {
        const seriesItems = seriesList ?? [];

        // Global unique labels
        const allLabelsSet = new Set<string>();

        // ---------------------------------------------------
        // Collect all labels from all series
        // ---------------------------------------------------
        seriesItems.forEach(series => {
            const items =
                series.dataSource?.status === "available"
                    ? series.dataSource.items ?? []
                    : [];

            items.forEach(item => {
                const labelValue = series.labelAttribute?.get(item)?.value;

                if (labelValue !== undefined && labelValue !== null) {
                    allLabelsSet.add(String(labelValue));
                }
            });
        });

        // Convert Set → Array
        const labels = Array.from(allLabelsSet);

        // ---------------------------------------------------
        // Build datasets dynamically
        // ---------------------------------------------------
        const datasets = seriesItems.map((series, index) => {
            const items =
                series.dataSource?.status === "available"
                    ? series.dataSource.items ?? []
                    : [];

            // Store values by label
            const dataMap: Record<string, number> = {};

            items.forEach(item => {
                const labelValue = series.labelAttribute?.get(item)?.value;

                const rawValue = series.valueAttribute?.get(item)?.value;

                if (labelValue !== undefined && labelValue !== null) {
                    dataMap[String(labelValue)] =
                        rawValue !== undefined &&
                        rawValue !== null &&
                        rawValue !== ""
                            ? Number(rawValue)
                            : 0;
                }
            });

            // ---------------------------------------------------
            // Align values to global labels
            // ---------------------------------------------------
            const data = labels.map(label => dataMap[label] ?? 0);

            // ---------------------------------------------------
            // Dataset-level Colors
            // ---------------------------------------------------
            const parsedColors = convertStringToColors(
                series.colorKey?.value || ""
            );

            const datasetColor =
                parsedColors.length > 0
                    ? parsedColors[0]
                    : generateRandomColor();

            return {
                label: series.seriesLabel?.value || `Series ${index + 1}`,

                data,

                backgroundColor: datasetColor,

                borderColor: datasetColor,

                borderWidth: 1,

                borderRadius: 6,

                barPercentage: 0.7,

                categoryPercentage: 0.6
            };
        });

        return {
            labels,
            datasets
        };
    }, [seriesList]);

    // ---------------------------------------------------
    // Debug Logs
    // ---------------------------------------------------
    //console.info("Chart Labels:", chartData.labels);
    //console.info("Chart Datasets:", chartData.datasets);

    // ---------------------------------------------------
    // Height
    // ---------------------------------------------------
    let heightvalue = 350;

    if (height?.value !== undefined && height?.value !== null) {
        heightvalue = Number(height.value);
    }
    let onclickvalue = onClickValueKey?.value||"";
    let showExport = ShowExportKey?.value ?? false;
    let showZoom = ShowZoomKey?.value ?? false;

    // ---------------------------------------------------
    // Render Chart
    // ---------------------------------------------------
    return (
        <ChartJSBarInput
            labelValue={chartData.labels}
            datasetValue={chartData.datasets}
            chartTitle={chartTitle?.value || "Dynamic Multi-Series Chart"}
            showLegend={showLegend?.value ?? true}
            showGrid={showGrid?.value ?? false}
            horizontal={horizontal?.value ?? false}
            stacked={stacked?.value ?? false}
            height={heightvalue}
            showValueOnTop={showValueOnTop?.value ?? false}
            onBarClick={onclickvalue}
            onClickAction={onClickHandler}
            onClickChange={handleClickChange}
            showExportButton={showExport}
            showResetZoomButton={showZoom}
            enableZoom={showZoom}
        />
    );
}



// ---------------------------------------------------
// Convert comma-separated colors → array
// Example:
// "#ff0000,#00ff00,#0000ff"
// ---------------------------------------------------
function convertStringToColors(colorString: string): string[] {
    return colorString
        .split(",")
        .map(color => color.trim())
        .filter(color => color.length > 0);
}

// ---------------------------------------------------
// Generate Dataset Color
// One color per dataset
// ---------------------------------------------------
// function getDatasetColor(index: number): string {
//     const colors = [
//         "#537bc4",
//         "#f67019",
//         "#f53794",
//         "#4dc9f6",
//         "#acc236",
//         "#166a8f",
//         "#00a950",
//         "#58595b",
//         "#8549ba"
//     ];

//     return colors[index % colors.length];
// }

function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);

    const saturation =
        60 + Math.floor(Math.random() * 25);

    const lightness =
        45 + Math.floor(Math.random() * 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}