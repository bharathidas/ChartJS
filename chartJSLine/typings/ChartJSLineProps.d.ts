/**
 * This file was generated from ChartJSLine.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface SeriesListType {
    dataSource: ListValue;
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big | string | boolean | Date>;
    seriesLabel?: EditableValue<string>;
    colorKey?: EditableValue<string>;
}

export interface SeriesListPreviewType {
    dataSource: {} | { caption: string } | { type: string } | null;
    labelAttribute: string;
    valueAttribute: string;
    seriesLabel: string;
    colorKey: string;
}

export interface ChartJSLineContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    seriesList: SeriesListType[];
    chartTitle?: EditableValue<string>;
    height?: EditableValue<Big>;
    showLegend?: EditableValue<boolean>;
    showGrid?: EditableValue<boolean>;
    enableMultiAxis?: EditableValue<boolean>;
    enableAnimation?: EditableValue<boolean>;
    showValueOnTop?: EditableValue<boolean>;
    ShowExportKey?: EditableValue<boolean>;
    ShowZoomKey?: EditableValue<boolean>;
    onClickValueKey?: EditableValue<string>;
    onClickAction?: ActionValue;
}

export interface ChartJSLinePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    seriesList: SeriesListPreviewType[];
    chartTitle: string;
    height: string;
    showLegend: string;
    showGrid: string;
    enableMultiAxis: string;
    enableAnimation: string;
    showValueOnTop: string;
    ShowExportKey: string;
    ShowZoomKey: string;
    onClickValueKey: string;
    onClickAction: {} | null;
}
