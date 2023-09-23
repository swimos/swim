// Copyright 2015-2023 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";

/** @public */
export type AlignContent = "baseline"
                         | "center"
                         | "end"
                         | "first baseline"
                         | "flex-end"
                         | "flex-start"
                         | "last baseline"
                         | "left"
                         | "right"
                         | "safe center"
                         | "space-around"
                         | "space-between"
                         | "space-evenly"
                         | "start"
                         | "stretch"
                         | "unsafe center";

/** @public */
export type AlignItems = "baseline"
                       | "center"
                       | "end"
                       | "first baseline"
                       | "flex-end"
                       | "flex-start"
                       | "last baseline"
                       | "left"
                       | "normal"
                       | "right"
                       | "safe center"
                       | "self-end"
                       | "self-start"
                       | "start"
                       | "stretch"
                       | "unsafe center";

/** @public */
export type AlignSelf = "auto"
                      | "baseline"
                      | "center"
                      | "end"
                      | "first baseline"
                      | "flex-end"
                      | "flex-start"
                      | "last baseline"
                      | "left"
                      | "normal"
                      | "right"
                      | "safe center"
                      | "self-end"
                      | "self-start"
                      | "start"
                      | "stretch"
                      | "unsafe center";

/** @public */
export type AlignmentBaseline = "after-edge"
                              | "alphabetic"
                              | "auto"
                              | "baseline"
                              | "before-edge"
                              | "central"
                              | "hanging"
                              | "ideographic"
                              | "inherit"
                              | "mathematical"
                              | "middle"
                              | "text-after-edge"
                              | "text-before-edge";

/** @public */
export type Appearance = "button"
                       | "checkbox"
                       | "none"
                       | "scrollbarbutton-up";

/** @public */
export type BackgroundClip = "border-box"
                           | "padding-box"
                           | "content-box"
                           | "text";

/** @public */
export type BorderCollapse = "collapse"
                           | "separate";

/** @public */
export type BorderStyle = "dashed"
                        | "dotted"
                        | "double"
                        | "groove"
                        | "hidden"
                        | "inset"
                        | "none"
                        | "outset"
                        | "ridge"
                        | "solid";

/** @public */
export type BorderWidth = Length
                        | "medium"
                        | "thick"
                        | "thin";

/** @public */
export type BoxSizing = "border-box"
                      | "content-box";

/** @public */
export type CssCursor = "alias"
                      | "all-scroll"
                      | "auto"
                      | "cell"
                      | "col-resize"
                      | "context-menu"
                      | "copy"
                      | "crosshair"
                      | "default"
                      | "e-resize"
                      | "ew-resize"
                      | "grab"
                      | "grabbing"
                      | "help"
                      | "move"
                      | "n-resize"
                      | "ne-resize"
                      | "nesw-resize"
                      | "no-drop"
                      | "none"
                      | "not-allowed"
                      | "ns-resize"
                      | "nw-resize"
                      | "nwse-resize"
                      | "pointer"
                      | "progress"
                      | "row-resize"
                      | "s-resize"
                      | "se-resize"
                      | "sw-resize"
                      | "text"
                      | "vertical-text"
                      | "w-resize"
                      | "wait"
                      | "zoom-in"
                      | "zoom-out";

/** @public */
export type CssDisplay = "block"
                       | "contents"
                       | "flex"
                       | "flow"
                       | "flow-root"
                       | "grid"
                       | "inline"
                       | "inline-block"
                       | "inline-flex"
                       | "inline-grid"
                       | "inline-table"
                       | "list-item"
                       | "none"
                       | "ruby"
                       | "ruby-base"
                       | "ruby-base-container"
                       | "ruby-text"
                       | "ruby-text-container"
                       | "run-in"
                       | "table"
                       | "table-caption"
                       | "table-cell"
                       | "table-column"
                       | "table-column-group"
                       | "table-footer-group"
                       | "table-header-group"
                       | "table-row"
                       | "table-row-group";

/** @public */
export type FlexBasis = Length
                      | "auto"
                      | "content"
                      | "fill"
                      | "fit-content"
                      | "max-content"
                      | "min-content";

/** @public */
export type FlexDirection = "column"
                          | "column-reverse"
                          | "row"
                          | "row-reverse";

/** @public */
export type FlexWrap = "nowrap"
                     | "wrap"
                     | "wrap-reverse";

/** @public */
export type FillRule = "nonzero"
                     | "evenodd"
                     | "inherit";

/** @public */
export type Height = Length
                   | string
                   | "auto";

/** @public */
export type JustifyContent = "baseline"
                           | "center"
                           | "end"
                           | "first baseline"
                           | "flex-end"
                           | "flex-start"
                           | "last baseline"
                           | "left"
                           | "right"
                           | "safe center"
                           | "space-around"
                           | "space-between"
                           | "space-evenly"
                           | "start"
                           | "stretch"
                           | "unsafe center";

/** @public */
export type MaxHeight = Length
                      | string
                      | "fill-available"
                      | "fit-content"
                      | "max-content"
                      | "min-content"
                      | "none";

/** @public */
export type MaxWidth = Length
                     | string
                     | "fill-available"
                     | "fit-content"
                     | "max-content"
                     | "min-content"
                     | "none";

/** @public */
export type MinHeight = Length
                      | string
                      | "fill-available"
                      | "fit-content"
                      | "max-content"
                      | "min-content";

/** @public */
export type MinWidth = Length
                     | string
                     | "fill-available"
                     | "fit-content"
                     | "max-content"
                     | "min-content";

/** @public */
export type Overflow = "auto"
                     | "hidden"
                     | "scroll"
                     | "visible";

/** @public */
export type OverscrollBehavior = "auto" | "contain" | "none";

/** @public */
export type Paint = Color
                  | "none"
                  | "context-fill"
                  | "context-stroke"
                  | "currentColor";

/** @public */
export type PointerEvents = "all"
                          | "auto"
                          | "fill"
                          | "none"
                          | "painted"
                          | "stroke"
                          | "visible"
                          | "visibleFill"
                          | "visiblePainted"
                          | "visibleStroke";

/** @public */
export type SvgPointerEvents = "all"
                             | "auto"
                             | "bounding-box"
                             | "fill"
                             | "none"
                             | "painted"
                             | "stroke"
                             | "visible"
                             | "visibleFill"
                             | "visiblePainted"
                             | "visibleStroke";

/** @public */
export type Position = "absolute"
                     | "fixed"
                     | "relative"
                     | "static"
                     | "sticky";

/** @public */
export type StrokeLinecap = "butt" | "round" | "square";

/** @public */
export type StrokeLinejoin = "arcs" | "bevel" | "miter" | "miter-clip" | "round";

/** @public */
export type TextAlign = "center"
                      | "end"
                      | "justify"
                      | "justify-all"
                      | "left"
                      | "match-parent"
                      | "right"
                      | "start";

/** @public */
export type TextAnchor = "end"
                       | "inherit"
                       | "middle"
                       | "start";

/** @public */
export type TextDecorationStyle = "dashed"
                                | "dotted"
                                | "double"
                                | "solid"
                                | "wavy";

/** @public */
export type TextTransform = "capitalize"
                          | "full-width"
                          | "lowercase"
                          | "none"
                          | "uppercase";

/** @public */
export type TouchAction = "auto"
                        | "manipulation"
                        | "none"
                        | "pan-down"
                        | "pan-down pinch-zoom"
                        | "pan-left"
                        | "pan-left pan-down"
                        | "pan-left pan-down pinch-zoom"
                        | "pan-left pan-up"
                        | "pan-left pan-up pinch-zoom"
                        | "pan-left pan-y"
                        | "pan-left pan-y pinch-zoom"
                        | "pan-left pinch-zoom"
                        | "pan-right"
                        | "pan-right pan-down"
                        | "pan-right pan-down pinch-zoom"
                        | "pan-right pan-up"
                        | "pan-right pan-up pinch-zoom"
                        | "pan-right pan-y"
                        | "pan-right pan-y pinch-zoom"
                        | "pan-right pinch-zoom"
                        | "pan-up"
                        | "pan-up pinch-zoom"
                        | "pan-x"
                        | "pan-x pan-down"
                        | "pan-x pan-down pinch-zoom"
                        | "pan-x pan-up"
                        | "pan-x pan-up pinch-zoom"
                        | "pan-x pan-y"
                        | "pan-x pan-y pinch-zoom"
                        | "pan-x pinch-zoom"
                        | "pan-y"
                        | "pan-y pinch-zoom"
                        | "pinch-zoom";

/** @public */
export type UserSelect = "all"
                       | "auto"
                       | "contain"
                       | "none"
                       | "text";

/** @public */
export type VerticalAlign = Length
                          | "baseline"
                          | "sub"
                          | "super"
                          | "text-top"
                          | "text-bottom"
                          | "middle"
                          | "top"
                          | "bottom";

/** @public */
export type Visibility = "collapse"
                       | "hidden"
                       | "visible";

/** @public */
export type WhiteSpace = "normal"
                       | "nowrap"
                       | "pre"
                       | "pre-line"
                       | "pre-wrap";

/** @public */
export type Width = Length
                  | string
                  | "auto"
                  | "available"
                  | "fit-content"
                  | "max-content"
                  | "min-content";
