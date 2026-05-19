import { ReactElement, createElement } from "react";

import { ChartJSPieInput, ChartJSPieInputProps } from "./components/ChartJSPieInput";
import { ChartJSPiePreviewProps } from "../typings/ChartJSPieProps";

function parentInline(node?: HTMLElement | null): void {
    // Temporary fix, the web modeler add a containing div, to render inline we need to change it.
    if (node && node.parentElement && node.parentElement.parentElement) {
        node.parentElement.parentElement.style.display = "inline-block";
    }
}

function transformProps(
    props: ChartJSPiePreviewProps
): ChartJSPieInputProps {
    const labelName = "Label";

    // ✅ Ensure series list exists
    const series =
        props.seriesList && props.seriesList.length > 0
            ? props.seriesList
            : [
                  {
                      seriesLabel: "Series 1",
                      colorKey: "#4dc9f6"
                  },
                  {
                      seriesLabel: "Series 2",
                      colorKey: "#f67019"
                  }
              ];

    // ✅ Labels
    const labels = [
        `${labelName} 1`,
        `${labelName} 2`,
        `${labelName} 3`
    ];

    return {
        labelValue: labels,

        // ✅ Each series = its own dataset
        datasetValue: series.map((s, index) => ({
            label:
                s.seriesLabel ||
                `Series ${index + 1}`,

            // 🔹 Generate mock data per series
            data: labels.map(
                (_, i) =>
                    (i + 1) * 10 * (index + 1)
            ),

            // ✅ FIXED
            backgroundColor: labels.map(
                () =>
                    s.colorKey ||
                    getPreviewColor(index)
            ),

            borderWidth: 1
        }))
    };
}
// 🎨 Preview colors
function getPreviewColor(index: number): string {
    const colors = ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236"];
    return colors[index % colors.length];
}

export function preview(props: ChartJSPiePreviewProps): ReactElement {
    return (
        <div ref={parentInline}>
            <ChartJSPieInput {...transformProps(props)} />
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ChartJSPie.css");
}
