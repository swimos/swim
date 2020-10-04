// Copyright 2015-2020 Swim inc.
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

import {Objects} from "@swim/util";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {
  FontStyle,
  FontVariant,
  FontWeight,
  FontStretch,
  AnyFontSize,
  FontSize,
  AnyLineHeight,
  LineHeight,
  FontFamily,
  AnyFont,
  Font,
} from "@swim/font";
import {AnyBoxShadow, BoxShadow} from "@swim/shadow";
import {AnyLinearGradient, LinearGradient} from "@swim/gradient";
import {AnyTransform, Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {
  AlignContent,
  AlignItems,
  AlignSelf,
  Appearance,
  BackgroundClip,
  BorderCollapse,
  BorderStyle,
  BorderWidth,
  BoxSizing,
  CssCursor,
  CssDisplay,
  FlexBasis,
  FlexDirection,
  FlexWrap,
  Height,
  JustifyContent,
  MaxHeight,
  MaxWidth,
  MinHeight,
  MinWidth,
  Overflow,
  OverscrollBehavior,
  PointerEvents,
  Position,
  TextAlign,
  TextDecorationStyle,
  TextTransform,
  TouchAction,
  UserSelect,
  VerticalAlign,
  Visibility,
  WhiteSpace,
  Width,
} from "../css";
import {StyleAnimatorMemberInit, StyleAnimator} from "../animator/StyleAnimator";
import {StyleContext} from "./StyleContext";

export interface StyleMapInit {
  alignContent?: StyleAnimatorMemberInit<StyleMap, "alignContent">;
  alignItems?: StyleAnimatorMemberInit<StyleMap, "alignItems">;
  alignSelf?: StyleAnimatorMemberInit<StyleMap, "alignSelf">;
  appearance?: StyleAnimatorMemberInit<StyleMap, "appearance">;
  backdropFilter?: StyleAnimatorMemberInit<StyleMap, "backdropFilter">;
  backgroundClip?: StyleAnimatorMemberInit<StyleMap, "backgroundClip">;
  backgroundColor?: StyleAnimatorMemberInit<StyleMap, "backgroundColor">;
  backgroundImage?: StyleAnimatorMemberInit<StyleMap, "backgroundImage">;
  borderCollapse?: StyleAnimatorMemberInit<StyleMap, "borderCollapse">;
  borderColor?: [AnyColor | "currentColor" | undefined,
                 AnyColor | "currentColor" | undefined,
                 AnyColor | "currentColor" | undefined,
                 AnyColor | "currentColor" | undefined] |
                AnyColor | "currentColor";
  borderTopColor?: StyleAnimatorMemberInit<StyleMap, "borderTopColor">;
  borderRightColor?: StyleAnimatorMemberInit<StyleMap, "borderRightColor">;
  borderBottomColor?: StyleAnimatorMemberInit<StyleMap, "borderBottomColor">;
  borderLeftColor?: StyleAnimatorMemberInit<StyleMap, "borderLeftColor">;
  borderRadius?: [AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined] |
                 AnyLength;
  borderTopLeftRadius?: StyleAnimatorMemberInit<StyleMap, "borderTopLeftRadius">;
  borderTopRightRadius?: StyleAnimatorMemberInit<StyleMap, "borderTopRightRadius">;
  borderBottomRightRadius?: StyleAnimatorMemberInit<StyleMap, "borderBottomRightRadius">;
  borderBottomLeftRadius?: StyleAnimatorMemberInit<StyleMap, "borderBottomLeftRadius">;
  borderSpacing?: StyleAnimatorMemberInit<StyleMap, "borderSpacing">;
  borderStyle?: [BorderStyle | undefined,
                 BorderStyle | undefined,
                 BorderStyle | undefined,
                 BorderStyle | undefined] |
                BorderStyle;
  borderTopStyle?: StyleAnimatorMemberInit<StyleMap, "borderTopStyle">;
  borderRightStyle?: StyleAnimatorMemberInit<StyleMap, "borderRightStyle">;
  borderBottomStyle?: StyleAnimatorMemberInit<StyleMap, "borderBottomStyle">;
  borderLeftStyle?: StyleAnimatorMemberInit<StyleMap, "borderLeftStyle">;
  borderWidth?: [BorderWidth | AnyLength | undefined,
                 BorderWidth | AnyLength | undefined,
                 BorderWidth | AnyLength | undefined,
                 BorderWidth | AnyLength | undefined] |
                BorderWidth | AnyLength;
  borderTopWidth?: StyleAnimatorMemberInit<StyleMap, "borderTopWidth">;
  borderRightWidth?: StyleAnimatorMemberInit<StyleMap, "borderRightWidth">;
  borderBottomWidth?: StyleAnimatorMemberInit<StyleMap, "borderBottomWidth">;
  borderLeftWidth?: StyleAnimatorMemberInit<StyleMap, "borderLeftWidth">;
  bottom?: StyleAnimatorMemberInit<StyleMap, "bottom">;
  boxShadow?: StyleAnimatorMemberInit<StyleMap, "boxShadow">;
  boxSizing?: StyleAnimatorMemberInit<StyleMap, "boxSizing">;
  color?: StyleAnimatorMemberInit<StyleMap, "color">;
  cursor?: StyleAnimatorMemberInit<StyleMap, "cursor">;
  display?: StyleAnimatorMemberInit<StyleMap, "display">;
  filter?: StyleAnimatorMemberInit<StyleMap, "filter">;
  flexBasis?: StyleAnimatorMemberInit<StyleMap, "flexBasis">;
  flexDirection?: StyleAnimatorMemberInit<StyleMap, "flexDirection">;
  flexGrow?: StyleAnimatorMemberInit<StyleMap, "flexGrow">;
  flexShrink?: StyleAnimatorMemberInit<StyleMap, "flexShrink">;
  flexWrap?: StyleAnimatorMemberInit<StyleMap, "flexWrap">;
  font?: AnyFont;
  fontFamily?: StyleAnimatorMemberInit<StyleMap, "fontFamily">;
  fontSize?: StyleAnimatorMemberInit<StyleMap, "fontSize">;
  fontStretch?: StyleAnimatorMemberInit<StyleMap, "fontStretch">;
  fontStyle?: StyleAnimatorMemberInit<StyleMap, "fontStyle">;
  fontVariant?: StyleAnimatorMemberInit<StyleMap, "fontVariant">;
  fontWeight?: StyleAnimatorMemberInit<StyleMap, "fontWeight">;
  height?: StyleAnimatorMemberInit<StyleMap, "height">;
  justifyContent?: StyleAnimatorMemberInit<StyleMap, "justifyContent">;
  left?: StyleAnimatorMemberInit<StyleMap, "left">;
  lineHeight?: StyleAnimatorMemberInit<StyleMap, "lineHeight">;
  margin?: [AnyLength | "auto" | undefined,
            AnyLength | "auto" | undefined,
            AnyLength | "auto" | undefined,
            AnyLength | "auto" | undefined] |
           AnyLength | "auto";
  marginTop?: StyleAnimatorMemberInit<StyleMap, "marginTop">;
  marginRight?: StyleAnimatorMemberInit<StyleMap, "marginRight">;
  marginBottom?: StyleAnimatorMemberInit<StyleMap, "marginBottom">;
  marginLeft?: StyleAnimatorMemberInit<StyleMap, "marginLeft">;
  maxHeight?: StyleAnimatorMemberInit<StyleMap, "maxHeight">;
  maxWidth?: StyleAnimatorMemberInit<StyleMap, "maxWidth">;
  minHeight?: StyleAnimatorMemberInit<StyleMap, "minHeight">;
  minWidth?: StyleAnimatorMemberInit<StyleMap, "minWidth">;
  opacity?: StyleAnimatorMemberInit<StyleMap, "opacity">;
  order?: StyleAnimatorMemberInit<StyleMap, "order">;
  outlineColor?: StyleAnimatorMemberInit<StyleMap, "outlineColor">;
  outlineStyle?: StyleAnimatorMemberInit<StyleMap, "outlineStyle">;
  outlineWidth?: StyleAnimatorMemberInit<StyleMap, "outlineWidth">;
  overflow?: [Overflow | undefined,
              Overflow | undefined] |
             Overflow;
  overflowX?: StyleAnimatorMemberInit<StyleMap, "overflowX">;
  overflowY?: StyleAnimatorMemberInit<StyleMap, "overflowY">;
  overflowScrolling?: StyleAnimatorMemberInit<StyleMap, "overflowScrolling">;
  overscrollBehavior?: [OverscrollBehavior | undefined,
                        OverscrollBehavior | undefined] |
                       OverscrollBehavior;
  overscrollBehaviorX?: StyleAnimatorMemberInit<StyleMap, "overscrollBehaviorX">;
  overscrollBehaviorY?: StyleAnimatorMemberInit<StyleMap, "overscrollBehaviorY">;
  padding?: [AnyLength | undefined,
             AnyLength | undefined,
             AnyLength | undefined,
             AnyLength | undefined] |
            AnyLength;
  paddingTop?: StyleAnimatorMemberInit<StyleMap, "paddingTop">;
  paddingRight?: StyleAnimatorMemberInit<StyleMap, "paddingRight">;
  paddingBottom?: StyleAnimatorMemberInit<StyleMap, "paddingBottom">;
  paddingLeft?: StyleAnimatorMemberInit<StyleMap, "paddingLeft">;
  pointerEvents?: StyleAnimatorMemberInit<StyleMap, "pointerEvents">;
  position?: StyleAnimatorMemberInit<StyleMap, "position">;
  right?: StyleAnimatorMemberInit<StyleMap, "right">;
  textAlign?: StyleAnimatorMemberInit<StyleMap, "textAlign">;
  textDecorationColor?: StyleAnimatorMemberInit<StyleMap, "textDecorationColor">;
  textDecorationLine?: StyleAnimatorMemberInit<StyleMap, "textDecorationLine">;
  textDecorationStyle?: StyleAnimatorMemberInit<StyleMap, "textDecorationStyle">;
  textOverflow?: StyleAnimatorMemberInit<StyleMap, "textOverflow">;
  textTransform?: StyleAnimatorMemberInit<StyleMap, "textTransform">;
  top?: StyleAnimatorMemberInit<StyleMap, "top">;
  touchAction?: StyleAnimatorMemberInit<StyleMap, "touchAction">;
  transform?: StyleAnimatorMemberInit<StyleMap, "transform">;
  userSelect?: StyleAnimatorMemberInit<StyleMap, "userSelect">;
  verticalAlign?: StyleAnimatorMemberInit<StyleMap, "verticalAlign">;
  visibility?: StyleAnimatorMemberInit<StyleMap, "visibility">;
  whiteSpace?: StyleAnimatorMemberInit<StyleMap, "whiteSpace">;
  width?: StyleAnimatorMemberInit<StyleMap, "width">;
  zIndex?: StyleAnimatorMemberInit<StyleMap, "zIndex">;
}

export interface StyleMap extends StyleContext {
  alignContent: StyleAnimator<this, AlignContent>;

  alignItems: StyleAnimator<this, AlignItems>;

  alignSelf: StyleAnimator<this, AlignSelf>;

  appearance: StyleAnimator<this, Appearance>;

  backdropFilter: StyleAnimator<this, string>;

  backgroundClip: StyleAnimator<this, BackgroundClip>;

  backgroundColor: StyleAnimator<this, Color, AnyColor>;

  backgroundImage: StyleAnimator<this, LinearGradient | string, AnyLinearGradient | string>;

  borderCollapse: StyleAnimator<this, BorderCollapse>;

  borderColor(): [Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined] |
                 Color | "currentColor" | undefined;
  borderColor(value: [AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined] |
                     AnyColor | "currentColor" | undefined,
              tween?: Tween<Color | "currentColor">,
              priority?: string): this;

  borderTopColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  borderRightColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  borderBottomColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  borderLeftColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  borderRadius(): [Length | undefined,
                   Length | undefined,
                   Length | undefined,
                   Length | undefined] |
                  Length | undefined;
  borderRadius(value: [AnyLength | undefined,
                       AnyLength | undefined,
                       AnyLength | undefined,
                       AnyLength | undefined] |
                      AnyLength | undefined,
               tween?: Tween<Length>,
               priority?: string): this;

  borderTopLeftRadius: StyleAnimator<this, Length, AnyLength>;

  borderTopRightRadius: StyleAnimator<this, Length, AnyLength>;

  borderBottomRightRadius: StyleAnimator<this, Length, AnyLength>;

  borderBottomLeftRadius: StyleAnimator<this, Length, AnyLength>;

  borderSpacing: StyleAnimator<this, string>;

  borderStyle(): [BorderStyle | undefined,
                  BorderStyle | undefined,
                  BorderStyle | undefined,
                  BorderStyle | undefined] |
                 BorderStyle | undefined;
  borderStyle(value: [BorderStyle | undefined,
                      BorderStyle | undefined,
                      BorderStyle | undefined,
                      BorderStyle | undefined] |
                     BorderStyle | undefined,
              tween?: Tween<BorderStyle>,
              priority?: string ): this;

  borderTopStyle: StyleAnimator<this, BorderStyle>;

  borderRightStyle: StyleAnimator<this, BorderStyle>;

  borderBottomStyle: StyleAnimator<this, BorderStyle>;

  borderLeftStyle: StyleAnimator<this, BorderStyle>;

  borderWidth(): [BorderWidth | undefined,
                  BorderWidth | undefined,
                  BorderWidth | undefined,
                  BorderWidth | undefined] |
                 BorderWidth | undefined;
  borderWidth(value: [BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined] |
                     BorderWidth | AnyLength | undefined,
              tween?: Tween<BorderWidth>,
              priority?: string): this;

  borderTopWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  borderRightWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  borderBottomWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  borderLeftWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  bottom: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  boxShadow: StyleAnimator<this, BoxShadow, AnyBoxShadow>;

  boxSizing: StyleAnimator<this, BoxSizing>;

  color: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  cursor: StyleAnimator<this, CssCursor>;

  display: StyleAnimator<this, CssDisplay>;

  filter: StyleAnimator<this, string>;

  flexBasis: StyleAnimator<this, Length | FlexBasis, AnyLength | FlexBasis>;

  flexDirection: StyleAnimator<this, FlexDirection>;

  flexGrow: StyleAnimator<this, number, number | string>;

  flexShrink: StyleAnimator<this, number, number | string>;

  flexWrap: StyleAnimator<this, FlexWrap>;

  font(): Font | undefined;
  font(value: AnyFont | undefined, tween?: Tween<any>, priority?: string): this;

  fontFamily: StyleAnimator<this, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>>;

  fontSize: StyleAnimator<this, FontSize, AnyFontSize>;

  fontStretch: StyleAnimator<this, FontStretch>;

  fontStyle: StyleAnimator<this, FontStyle>;

  fontVariant: StyleAnimator<this, FontVariant>;

  fontWeight: StyleAnimator<this, FontWeight>;

  height: StyleAnimator<this, Height, AnyLength | Height>;

  justifyContent: StyleAnimator<this, JustifyContent>;

  left: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  lineHeight: StyleAnimator<this, LineHeight, AnyLineHeight>;

  margin(): [Length | "auto" | undefined,
             Length | "auto" | undefined,
             Length | "auto" | undefined,
             Length | "auto" | undefined] |
            Length | "auto" | undefined;
  margin(value: [AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined] |
                AnyLength | "auto" | undefined,
         tween?: Tween<Length | "auto">,
         priority?: string): this;

  marginTop: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  marginRight: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  marginBottom: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  marginLeft: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  maxHeight: StyleAnimator<this, MaxHeight, AnyLength | MaxHeight>;

  maxWidth: StyleAnimator<this, MaxWidth, AnyLength | MaxWidth>;

  minHeight: StyleAnimator<this, MinHeight, AnyLength | MinHeight>;

  minWidth: StyleAnimator<this, MinWidth, AnyLength | MinWidth>;

  opacity: StyleAnimator<this, number, number | string>;

  order: StyleAnimator<this, number, number | string>;

  outlineColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  outlineStyle: StyleAnimator<this, BorderStyle>;

  outlineWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  overflow(): [Overflow | undefined,
               Overflow | undefined] |
              Overflow | undefined;
  overflow(value: [Overflow | undefined,
                   Overflow | undefined] |
                  Overflow | undefined,
          tween?: Tween<Overflow>,
          priority?: string): this;

  overflowX: StyleAnimator<this, Overflow>;

  overflowY: StyleAnimator<this, Overflow>;

  overflowScrolling: StyleAnimator<this, "auto" | "touch">;

  overscrollBehavior(): [OverscrollBehavior | undefined,
                         OverscrollBehavior | undefined] |
                        OverscrollBehavior | undefined;
  overscrollBehavior(value: [OverscrollBehavior | undefined,
                             OverscrollBehavior | undefined] |
                            OverscrollBehavior | undefined,
          tween?: Tween<OverscrollBehavior>,
          priority?: string): this;

  overscrollBehaviorX: StyleAnimator<this, OverscrollBehavior>;

  overscrollBehaviorY: StyleAnimator<this, OverscrollBehavior>;

  padding(): [Length | undefined,
              Length | undefined,
              Length | undefined,
              Length | undefined] |
             Length | undefined;
  padding(value: [AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined] |
                 AnyLength | undefined,
          tween?: Tween<Length>,
          priority?: string): this;

  paddingTop: StyleAnimator<this, Length, AnyLength>;

  paddingRight: StyleAnimator<this, Length, AnyLength>;

  paddingBottom: StyleAnimator<this, Length, AnyLength>;

  paddingLeft: StyleAnimator<this, Length, AnyLength>;

  pointerEvents: StyleAnimator<this, PointerEvents>;

  position: StyleAnimator<this, Position>;

  right: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  textAlign: StyleAnimator<this, TextAlign>;

  textDecorationColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  textDecorationLine: StyleAnimator<this, string>;

  textDecorationStyle: StyleAnimator<this, TextDecorationStyle>;

  textOverflow: StyleAnimator<this, string>;

  textTransform: StyleAnimator<this, TextTransform>;

  top: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  touchAction: StyleAnimator<this, TouchAction>;

  transform: StyleAnimator<this, Transform, AnyTransform>;

  userSelect: StyleAnimator<this, UserSelect>;

  verticalAlign: StyleAnimator<this, VerticalAlign, AnyLength | VerticalAlign>;

  visibility: StyleAnimator<this, Visibility>;

  whiteSpace: StyleAnimator<this, WhiteSpace>;

  width: StyleAnimator<this, Width, AnyLength | Width>;

  zIndex: StyleAnimator<this, number | string>;
}

/** @hidden */
export const StyleMap: {
  init(map: StyleMap, init: StyleMapInit): void;
  define(prototype: StyleMap): void;
} = {} as any;

StyleMap.init = function (map: StyleMap, init: StyleMapInit): void {
  if (init.alignContent !== void 0) {
    map.alignContent(init.alignContent);
  }
  if (init.alignItems !== void 0) {
    map.alignItems(init.alignItems);
  }
  if (init.alignSelf !== void 0) {
    map.alignSelf(init.alignSelf);
  }
  if (init.appearance !== void 0) {
    map.appearance(init.appearance);
  }
  if (init.backdropFilter !== void 0) {
    map.backdropFilter(init.backdropFilter);
  }
  if (init.backgroundClip !== void 0) {
    map.backgroundClip(init.backgroundClip);
  }
  if (init.backgroundColor !== void 0) {
    map.backgroundColor(init.backgroundColor);
  }
  if (init.backgroundImage !== void 0) {
    map.backgroundImage(init.backgroundImage);
  }
  if (init.borderCollapse !== void 0) {
    map.borderCollapse(init.borderCollapse);
  }
  if (init.borderColor !== void 0) {
    map.borderColor(init.borderColor);
  }
  if (init.borderTopColor !== void 0) {
    map.borderTopColor(init.borderTopColor);
  }
  if (init.borderRightColor !== void 0) {
    map.borderRightColor(init.borderRightColor);
  }
  if (init.borderBottomColor !== void 0) {
    map.borderBottomColor(init.borderBottomColor);
  }
  if (init.borderLeftColor !== void 0) {
    map.borderLeftColor(init.borderLeftColor);
  }
  if (init.borderRadius !== void 0) {
    map.borderRadius(init.borderRadius);
  }
  if (init.borderTopLeftRadius !== void 0) {
    map.borderTopLeftRadius(init.borderTopLeftRadius);
  }
  if (init.borderTopRightRadius !== void 0) {
    map.borderTopRightRadius(init.borderTopRightRadius);
  }
  if (init.borderBottomRightRadius !== void 0) {
    map.borderBottomRightRadius(init.borderBottomRightRadius);
  }
  if (init.borderBottomLeftRadius !== void 0) {
    map.borderBottomLeftRadius(init.borderBottomLeftRadius);
  }
  if (init.borderSpacing !== void 0) {
    map.borderSpacing(init.borderSpacing);
  }
  if (init.borderStyle !== void 0) {
    map.borderStyle(init.borderStyle);
  }
  if (init.borderTopStyle !== void 0) {
    map.borderTopStyle(init.borderTopStyle);
  }
  if (init.borderRightStyle !== void 0) {
    map.borderRightStyle(init.borderRightStyle);
  }
  if (init.borderBottomStyle !== void 0) {
    map.borderBottomStyle(init.borderBottomStyle);
  }
  if (init.borderLeftStyle !== void 0) {
    map.borderLeftStyle(init.borderLeftStyle);
  }
  if (init.borderWidth !== void 0) {
    map.borderWidth(init.borderWidth);
  }
  if (init.borderTopWidth !== void 0) {
    map.borderTopWidth(init.borderTopWidth);
  }
  if (init.borderRightWidth !== void 0) {
    map.borderRightWidth(init.borderRightWidth);
  }
  if (init.borderBottomWidth !== void 0) {
    map.borderBottomWidth(init.borderBottomWidth);
  }
  if (init.borderLeftWidth !== void 0) {
    map.borderLeftWidth(init.borderLeftWidth);
  }
  if (init.bottom !== void 0) {
    map.bottom(init.bottom);
  }
  if (init.boxShadow !== void 0) {
    map.boxShadow(init.boxShadow);
  }
  if (init.boxSizing !== void 0) {
    map.boxSizing(init.boxSizing);
  }
  if (init.color !== void 0) {
    map.color(init.color);
  }
  if (init.cursor !== void 0) {
    map.cursor(init.cursor);
  }
  if (init.display !== void 0) {
    map.display(init.display);
  }
  if (init.filter !== void 0) {
    map.filter(init.filter);
  }
  if (init.flexBasis !== void 0) {
    map.flexBasis(init.flexBasis);
  }
  if (init.flexDirection !== void 0) {
    map.flexDirection(init.flexDirection);
  }
  if (init.flexGrow !== void 0) {
    map.flexGrow(init.flexGrow);
  }
  if (init.flexShrink !== void 0) {
    map.flexShrink(init.flexShrink);
  }
  if (init.flexWrap !== void 0) {
    map.flexWrap(init.flexWrap);
  }
  if (init.font !== void 0) {
    map.font(init.font);
  }
  if (init.fontFamily !== void 0) {
    map.fontFamily(init.fontFamily);
  }
  if (init.fontSize !== void 0) {
    map.fontSize(init.fontSize);
  }
  if (init.fontStretch !== void 0) {
    map.fontStretch(init.fontStretch);
  }
  if (init.fontStyle !== void 0) {
    map.fontStyle(init.fontStyle);
  }
  if (init.fontVariant !== void 0) {
    map.fontVariant(init.fontVariant);
  }
  if (init.fontWeight !== void 0) {
    map.fontWeight(init.fontWeight);
  }
  if (init.height !== void 0) {
    map.height(init.height);
  }
  if (init.justifyContent !== void 0) {
    map.justifyContent(init.justifyContent);
  }
  if (init.left !== void 0) {
    map.left(init.left);
  }
  if (init.lineHeight !== void 0) {
    map.lineHeight(init.lineHeight);
  }
  if (init.margin !== void 0) {
    map.margin(init.margin);
  }
  if (init.marginTop !== void 0) {
    map.marginTop(init.marginTop);
  }
  if (init.marginRight !== void 0) {
    map.marginRight(init.marginRight);
  }
  if (init.marginBottom !== void 0) {
    map.marginBottom(init.marginBottom);
  }
  if (init.marginLeft !== void 0) {
    map.marginLeft(init.marginLeft);
  }
  if (init.maxHeight !== void 0) {
    map.maxHeight(init.maxHeight);
  }
  if (init.maxWidth !== void 0) {
    map.maxWidth(init.maxWidth);
  }
  if (init.minHeight !== void 0) {
    map.minHeight(init.minHeight);
  }
  if (init.minWidth !== void 0) {
    map.minWidth(init.minWidth);
  }
  if (init.opacity !== void 0) {
    map.opacity(init.opacity);
  }
  if (init.order !== void 0) {
    map.order(init.order);
  }
  if (init.outlineColor !== void 0) {
    map.outlineColor(init.outlineColor);
  }
  if (init.outlineStyle !== void 0) {
    map.outlineStyle(init.outlineStyle);
  }
  if (init.outlineWidth !== void 0) {
    map.outlineWidth(init.outlineWidth);
  }
  if (init.overflow !== void 0) {
    map.overflow(init.overflow);
  }
  if (init.overflowX !== void 0) {
    map.overflowX(init.overflowX);
  }
  if (init.overflowY !== void 0) {
    map.overflowY(init.overflowY);
  }
  if (init.overflowScrolling !== void 0) {
    map.overflowScrolling(init.overflowScrolling);
  }
  if (init.overscrollBehavior !== void 0) {
    map.overscrollBehavior(init.overscrollBehavior);
  }
  if (init.overscrollBehaviorX !== void 0) {
    map.overscrollBehaviorX(init.overscrollBehaviorX);
  }
  if (init.overscrollBehaviorY !== void 0) {
    map.overscrollBehaviorY(init.overscrollBehaviorY);
  }
  if (init.padding !== void 0) {
    map.padding(init.padding);
  }
  if (init.paddingTop !== void 0) {
    map.paddingTop(init.paddingTop);
  }
  if (init.paddingRight !== void 0) {
    map.paddingRight(init.paddingRight);
  }
  if (init.paddingBottom !== void 0) {
    map.paddingBottom(init.paddingBottom);
  }
  if (init.paddingLeft !== void 0) {
    map.paddingLeft(init.paddingLeft);
  }
  if (init.pointerEvents !== void 0) {
    map.pointerEvents(init.pointerEvents);
  }
  if (init.position !== void 0) {
    map.position(init.position);
  }
  if (init.right !== void 0) {
    map.right(init.right);
  }
  if (init.textAlign !== void 0) {
    map.textAlign(init.textAlign);
  }
  if (init.textDecorationColor !== void 0) {
    map.textDecorationColor(init.textDecorationColor);
  }
  if (init.textDecorationLine !== void 0) {
    map.textDecorationLine(init.textDecorationLine);
  }
  if (init.textDecorationStyle !== void 0) {
    map.textDecorationStyle(init.textDecorationStyle);
  }
  if (init.textOverflow !== void 0) {
    map.textOverflow(init.textOverflow);
  }
  if (init.textTransform !== void 0) {
    map.textTransform(init.textTransform);
  }
  if (init.top !== void 0) {
    map.top(init.top);
  }
  if (init.touchAction !== void 0) {
    map.touchAction(init.touchAction);
  }
  if (init.transform !== void 0) {
    map.transform(init.transform);
  }
  if (init.userSelect !== void 0) {
    map.userSelect(init.userSelect);
  }
  if (init.verticalAlign !== void 0) {
    map.verticalAlign(init.verticalAlign);
  }
  if (init.visibility !== void 0) {
    map.visibility(init.visibility);
  }
  if (init.whiteSpace !== void 0) {
    map.whiteSpace(init.whiteSpace);
  }
  if (init.width !== void 0) {
    map.width(init.width);
  }
  if (init.zIndex !== void 0) {
    map.zIndex(init.zIndex);
  }
};

StyleMap.define = function (prototype: StyleMap): void {
  StyleAnimator({propertyNames: "align-content", type: String})(prototype, "alignContent");

  StyleAnimator({propertyNames: "align-items", type: String})(prototype, "alignItems");

  StyleAnimator({propertyNames: "align-self", type: String})(prototype, "alignSelf");

  StyleAnimator({propertyNames: ["appearance", "-webkit-appearance"], type: String})(prototype, "appearance");

  StyleAnimator({propertyNames: ["backdrop-filter", "-webkit-backdrop-filter"], type: String})(prototype, "backdropFilter");

  StyleAnimator({propertyNames: ["background-clip", "-webkit-background-clip"], type: String})(prototype, "backgroundClip");

  StyleAnimator({propertyNames: "background-color", type: Color})(prototype, "backgroundColor");

  StyleAnimator({
    propertyNames: "background-image",
    type: Color,
    parse(value: string): LinearGradient | string | undefined {
      try {
        return LinearGradient.parse(value);
      } catch (swallow) {
        return value;
      }
    },
    fromAny(value: AnyLinearGradient | string): LinearGradient | string | undefined {
      if (typeof value === "string") {
        try {
          return LinearGradient.parse(value);
        } catch (swallow) {
          return value;
        }
      } else {
        return LinearGradient.fromAny(value);
      }
    },
  })(prototype, "backgroundImage");

  StyleAnimator({propertyNames: "border-collapse", type: String})(prototype, "borderCollapse");

  prototype.borderColor = borderColor;

  StyleAnimator({propertyNames: "border-top-color", type: [Color, String]})(prototype, "borderTopColor");

  StyleAnimator({propertyNames: "border-right-color", type: [Color, String]})(prototype, "borderRightColor");

  StyleAnimator({propertyNames: "border-bottom-color", type: [Color, String]})(prototype, "borderBottomColor");

  StyleAnimator({propertyNames: "border-left-color", type: [Color, String]})(prototype, "borderLeftColor");

  prototype.borderRadius = borderRadius;

  StyleAnimator({propertyNames: "border-top-left-radius", type: Length})(prototype, "borderTopLeftRadius");

  StyleAnimator({propertyNames: "border-top-right-radius", type: Length})(prototype, "borderTopRightRadius");

  StyleAnimator({propertyNames: "border-bottom-right-radius", type: Length})(prototype, "borderBottomRightRadius");

  StyleAnimator({propertyNames: "border-bottom-left-radius", type: Length})(prototype, "borderBottomLeftRadius");

  StyleAnimator({propertyNames: "border-spacing", type: String})(prototype, "borderSpacing");

  prototype.borderStyle = borderStyle;

  StyleAnimator({propertyNames: "border-top-style", type: String})(prototype, "borderTopStyle");

  StyleAnimator({propertyNames: "border-right-style", type: String})(prototype, "borderRightStyle");

  StyleAnimator({propertyNames: "border-bottom-style", type: String})(prototype, "borderBottomStyle");

  StyleAnimator({propertyNames: "border-left-style", type: String})(prototype, "borderLeftStyle");

  prototype.borderWidth = borderWidth;

  StyleAnimator({propertyNames: "border-top-width", type: [Length, String]})(prototype, "borderTopWidth");

  StyleAnimator({propertyNames: "border-right-width", type: [Length, String]})(prototype, "borderRightWidth");

  StyleAnimator({propertyNames: "border-bottom-width", type: [Length, String]})(prototype, "borderBottomWidth");

  StyleAnimator({propertyNames: "border-left-width", type: [Length, String]})(prototype, "borderLeftWidth");

  StyleAnimator({propertyNames: "bottom", type: [Length, String]})(prototype, "bottom");

  StyleAnimator({propertyNames: "box-shadow", type: BoxShadow})(prototype, "boxShadow");

  StyleAnimator({propertyNames: "box-sizing", type: String})(prototype, "boxSizing");

  StyleAnimator({propertyNames: "color", type: [Color, String]})(prototype, "color");

  StyleAnimator({propertyNames: "cursor", type: String})(prototype, "cursor");

  StyleAnimator({propertyNames: "display", type: String})(prototype, "display");

  StyleAnimator({propertyNames: "filter", type: String})(prototype, "filter");

  StyleAnimator({propertyNames: "flex-basis", type: [Length, String]})(prototype, "flexBasis");

  StyleAnimator({propertyNames: "flex-direction", type: String})(prototype, "flexDirection");

  StyleAnimator({propertyNames: "flex-grow", type: Number})(prototype, "flexGrow");

  StyleAnimator({propertyNames: "flex-shrink", type: Number})(prototype, "flexShrink");

  StyleAnimator({propertyNames: "flex-wrap", type: String})(prototype, "flexWrap");

  prototype.font = font;

  StyleAnimator({propertyNames: "font-family", type: FontFamily})(prototype, "fontFamily");

  StyleAnimator({propertyNames: "font-size", type: [Length, String]})(prototype, "fontSize");

  StyleAnimator({propertyNames: "font-stretch", type: String})(prototype, "fontStretch");

  StyleAnimator({propertyNames: "font-style", type: String})(prototype, "fontStyle");

  StyleAnimator({propertyNames: "font-variant", type: String})(prototype, "fontVariant");

  StyleAnimator({propertyNames: "font-weight", type: String})(prototype, "fontWeight");

  StyleAnimator({propertyNames: "height", type: [Length, String]})(prototype, "height");

  StyleAnimator({propertyNames: "justify-content", type: String})(prototype, "justifyContent");

  StyleAnimator({propertyNames: "left", type: [Length, String]})(prototype, "left");

  StyleAnimator({propertyNames: "line-height", type: LineHeight})(prototype, "lineHeight");

  prototype.margin = margin;

  StyleAnimator({propertyNames: "margin-top", type: [Length, String]})(prototype, "marginTop");

  StyleAnimator({propertyNames: "margin-right", type: [Length, String]})(prototype, "marginRight");

  StyleAnimator({propertyNames: "margin-bottom", type: [Length, String]})(prototype, "marginBottom");

  StyleAnimator({propertyNames: "margin-left", type: [Length, String]})(prototype, "marginLeft");

  StyleAnimator({propertyNames: "max-height", type: [Length, String]})(prototype, "maxHeight");

  StyleAnimator({propertyNames: "max-width", type: [Length, String]})(prototype, "maxWidth");

  StyleAnimator({propertyNames: "min-height", type: [Length, String]})(prototype, "minHeight");

  StyleAnimator({propertyNames: "min-width", type: [Length, String]})(prototype, "minWidth");

  StyleAnimator({propertyNames: "opacity", type: Number})(prototype, "opacity");

  StyleAnimator({propertyNames: "order", type: Number})(prototype, "order");

  StyleAnimator({propertyNames: "outline-color", type: [Color, String]})(prototype, "outlineColor");

  StyleAnimator({propertyNames: "outline-style", type: String})(prototype, "outlineStyle");

  StyleAnimator({propertyNames: "outline-width", type: [Length, String]})(prototype, "outlineWidth");

  prototype.overflow = overflow;

  StyleAnimator({propertyNames: "overflow-x", type: String})(prototype, "overflowX");

  StyleAnimator({propertyNames: "overflow-y", type: String})(prototype, "overflowY");

  StyleAnimator({propertyNames: "-webkit-overflow-scrolling", type: String})(prototype, "overflowScrolling");

  prototype.overscrollBehavior = overscrollBehavior;

  StyleAnimator({propertyNames: "overscroll-behavior-x", type: String})(prototype, "overscrollBehaviorX");

  StyleAnimator({propertyNames: "overscroll-behavior-y", type: String})(prototype, "overscrollBehaviorY");

  prototype.padding = padding;

  StyleAnimator({propertyNames: "padding-top", type: Length})(prototype, "paddingTop");

  StyleAnimator({propertyNames: "padding-right", type: Length})(prototype, "paddingRight");

  StyleAnimator({propertyNames: "padding-bottom", type: Length})(prototype, "paddingBottom");

  StyleAnimator({propertyNames: "padding-left", type: Length})(prototype, "paddingLeft");

  StyleAnimator({propertyNames: "pointer-events", type: String})(prototype, "pointerEvents");

  StyleAnimator({propertyNames: "position", type: String})(prototype, "position");

  StyleAnimator({propertyNames: "right", type: [Length, String]})(prototype, "right");

  StyleAnimator({propertyNames: "text-align", type: String})(prototype, "textAlign");

  StyleAnimator({propertyNames: "text-decoration-color", type: [Color, String]})(prototype, "textDecorationColor");

  StyleAnimator({propertyNames: "text-decoration-line", type: String})(prototype, "textDecorationLine");

  StyleAnimator({propertyNames: "text-decoration-style", type: String})(prototype, "textDecorationStyle");

  StyleAnimator({propertyNames: "text-overflow", type: String})(prototype, "textOverflow");

  StyleAnimator({propertyNames: "text-transform", type: String})(prototype, "textTransform");

  StyleAnimator({propertyNames: "top", type: [Length, String]})(prototype, "top");

  StyleAnimator({propertyNames: "touch-action", type: String})(prototype, "touchAction");

  StyleAnimator({propertyNames: "transform", type: Transform})(prototype, "transform");

  StyleAnimator({propertyNames: ["user-select", "-webkit-user-select", "-moz-user-select", "-ms-user-select"], type: String})(prototype, "userSelect");

  StyleAnimator({propertyNames: "vertical-align", type: [Length, String]})(prototype, "verticalAlign");

  StyleAnimator({propertyNames: "visibility", type: String})(prototype, "visibility");

  StyleAnimator({propertyNames: "white-space", type: String})(prototype, "whiteSpace");

  StyleAnimator({propertyNames: "width", type: [Length, String]})(prototype, "width");

  StyleAnimator({propertyNames: "z-index", type: [Number, String]})(prototype, "zIndex");
};

function borderColor(this: StyleMap): [Color | "currentColor" | undefined,
                                       Color | "currentColor" | undefined,
                                       Color | "currentColor" | undefined,
                                       Color | "currentColor" | undefined] |
                                      Color | "currentColor" | undefined;
function borderColor(this: StyleMap,
                     value: [AnyColor | "currentColor" | undefined,
                             AnyColor | "currentColor" | undefined,
                             AnyColor | "currentColor" | undefined,
                             AnyColor | "currentColor" | undefined] |
                            AnyColor | "currentColor" | undefined,
                     tween?: Tween<Color | "currentColor">,
                     priority?: string): StyleMap;
function borderColor(this: StyleMap,
                     value?: [AnyColor | "currentColor" | undefined,
                              AnyColor | "currentColor" | undefined,
                              AnyColor | "currentColor" | undefined,
                              AnyColor | "currentColor" | undefined] |
                             AnyColor | "currentColor" | undefined,
                     tween?: Tween<Color | "currentColor">,
                     priority?: string): [Color | "currentColor" | undefined,
                                          Color | "currentColor" | undefined,
                                          Color | "currentColor" | undefined,
                                          Color | "currentColor" | undefined] |
                                         Color | "currentColor" | undefined | StyleMap {
  if (value === void 0) {
    const borderTopColor = this.borderTopColor();
    const borderRightColor = this.borderRightColor();
    const borderBottomColor = this.borderBottomColor();
    const borderLeftColor = this.borderLeftColor();
    if (Objects.equal(borderTopColor, borderRightColor)
        && Objects.equal(borderRightColor, borderBottomColor)
        && Objects.equal(borderBottomColor, borderLeftColor)) {
      return borderTopColor;
    } else {
      return [borderTopColor, borderRightColor, borderBottomColor, borderLeftColor];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.borderTopColor(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.borderRightColor(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.borderBottomColor(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.borderLeftColor(value[3], tween, priority);
      }
    } else {
      this.borderTopColor(value, tween, priority);
      this.borderRightColor(value, tween, priority);
      this.borderBottomColor(value, tween, priority);
      this.borderLeftColor(value, tween, priority);
    }
    return this;
  }
}

function borderRadius(this: StyleMap): [Length | undefined,
                                        Length | undefined,
                                        Length | undefined,
                                        Length | undefined] |
                                       Length | undefined;
function borderRadius(this: StyleMap,
                      value: [AnyLength | undefined,
                              AnyLength | undefined,
                              AnyLength | undefined,
                              AnyLength | undefined] |
                             AnyLength | undefined,
                      tween?: Tween<Length>,
                      priority?: string): StyleMap;
function borderRadius(this: StyleMap,
                      value?: [AnyLength | undefined,
                               AnyLength | undefined,
                               AnyLength | undefined,
                               AnyLength | undefined] |
                              AnyLength | undefined,
                      tween?: Tween<Length>,
                      priority?: string): [Length | undefined,
                                           Length | undefined,
                                           Length | undefined,
                                           Length | undefined] |
                                          Length | undefined | StyleMap {
  if (value === void 0) {
    const borderTopLeftRadius = this.borderTopLeftRadius();
    const borderTopRightRadius = this.borderTopRightRadius();
    const borderBottomRightRadius = this.borderBottomRightRadius();
    const borderBottomLeftRadius = this.borderBottomLeftRadius();
    if (Objects.equal(borderTopLeftRadius, borderTopRightRadius)
        && Objects.equal(borderTopRightRadius, borderBottomRightRadius)
        && Objects.equal(borderBottomRightRadius, borderBottomLeftRadius)) {
      return borderTopLeftRadius;
    } else {
      return [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.borderTopLeftRadius(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.borderTopRightRadius(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.borderBottomRightRadius(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.borderBottomLeftRadius(value[3], tween, priority);
      }
    } else {
      this.borderTopLeftRadius(value, tween, priority);
      this.borderTopRightRadius(value, tween, priority);
      this.borderBottomRightRadius(value, tween, priority);
      this.borderBottomLeftRadius(value, tween, priority);
    }
    return this;
  }
}

function borderStyle(this: StyleMap): [BorderStyle | undefined,
                                       BorderStyle | undefined,
                                       BorderStyle | undefined,
                                       BorderStyle | undefined] |
                                      BorderStyle | undefined;
function borderStyle(this: StyleMap,
                     value: [BorderStyle | undefined,
                             BorderStyle | undefined,
                             BorderStyle | undefined,
                             BorderStyle | undefined] |
                            BorderStyle | undefined,
                     tween?: Tween<BorderStyle>,
                     priority?: string ): StyleMap;
function borderStyle(this: StyleMap,
                     value?: [BorderStyle | undefined,
                              BorderStyle | undefined,
                              BorderStyle | undefined,
                              BorderStyle | undefined] |
                             BorderStyle | undefined,
                     tween?: Tween<BorderStyle>,
                     priority?: string): [BorderStyle | undefined,
                                          BorderStyle | undefined,
                                          BorderStyle | undefined,
                                          BorderStyle | undefined] |
                                         BorderStyle | undefined | StyleMap {
  if (value === void 0) {
    const borderTopStyle = this.borderTopStyle();
    const borderRightStyle = this.borderRightStyle();
    const borderBottomStyle = this.borderBottomStyle();
    const borderLeftStyle = this.borderLeftStyle();
    if (Objects.equal(borderTopStyle, borderRightStyle)
        && Objects.equal(borderRightStyle, borderBottomStyle)
        && Objects.equal(borderBottomStyle, borderLeftStyle)) {
      return borderTopStyle;
    } else {
      return [borderTopStyle, borderRightStyle, borderBottomStyle, borderLeftStyle];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.borderTopStyle(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.borderRightStyle(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.borderBottomStyle(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.borderLeftStyle(value[3], tween, priority);
      }
    } else {
      this.borderTopStyle(value, tween, priority);
      this.borderRightStyle(value, tween, priority);
      this.borderBottomStyle(value, tween, priority);
      this.borderLeftStyle(value, tween, priority);
    }
    return this;
  }
}

function borderWidth(this: StyleMap): [BorderWidth | undefined,
                                       BorderWidth | undefined,
                                       BorderWidth | undefined,
                                       BorderWidth | undefined] |
                                      BorderWidth | undefined;
function borderWidth(this: StyleMap,
                     value: [BorderWidth | AnyLength | undefined,
                             BorderWidth | AnyLength | undefined,
                             BorderWidth | AnyLength | undefined,
                             BorderWidth | AnyLength | undefined] |
                            BorderWidth | AnyLength | undefined,
                     tween?: Tween<BorderWidth>,
                     priority?: string): StyleMap;
function borderWidth(this: StyleMap,
                     value?: [BorderWidth | AnyLength | undefined,
                              BorderWidth | AnyLength | undefined,
                              BorderWidth | AnyLength | undefined,
                              BorderWidth | AnyLength | undefined] |
                             BorderWidth | AnyLength | undefined,
                     tween?: Tween<BorderWidth>,
                     priority?: string): [BorderWidth | undefined,
                                          BorderWidth | undefined,
                                          BorderWidth | undefined,
                                          BorderWidth | undefined] |
                                         BorderWidth | undefined | StyleMap {
  if (value === void 0) {
    const borderTopWidth = this.borderTopWidth();
    const borderRightWidth = this.borderRightWidth();
    const borderBottomWidth = this.borderBottomWidth();
    const borderLeftWidth = this.borderLeftWidth();
    if (Objects.equal(borderTopWidth, borderRightWidth)
        && Objects.equal(borderRightWidth, borderBottomWidth)
        && Objects.equal(borderBottomWidth, borderLeftWidth)) {
      return borderTopWidth;
    } else {
      return [borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.borderTopWidth(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.borderRightWidth(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.borderBottomWidth(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.borderLeftWidth(value[3], tween, priority);
      }
    } else {
      this.borderTopWidth(value, tween, priority);
      this.borderRightWidth(value, tween, priority);
      this.borderBottomWidth(value, tween, priority);
      this.borderLeftWidth(value, tween, priority);
    }
    return this;
  }
}

function font(this: StyleMap, ): Font | undefined;
function font(this: StyleMap, value: AnyFont | undefined, tween?: Tween<any>, priority?: string): StyleMap;
function font(this: StyleMap, value?: AnyFont, tween?: Tween<any>, priority?: string): Font | undefined | StyleMap {
  if (value === void 0) {
    const style = this.fontStyle();
    const variant = this.fontVariant();
    const weight = this.fontWeight();
    const stretch = this.fontStretch();
    const size = this.fontSize();
    const height = this.lineHeight();
    const family = this.fontFamily();
    if (family !== void 0) {
      return Font.from(style, variant, weight, stretch, size, height, family);
    } else {
      return void 0;
    }
  } else {
    value = Font.fromAny(value);
    if (value._style !== void 0) {
      this.fontStyle(value._style, tween, priority);
    }
    if (value._variant !== void 0) {
      this.fontVariant(value._variant, tween, priority);
    }
    if (value._weight !== void 0) {
      this.fontWeight(value._weight, tween, priority);
    }
    if (value._stretch !== void 0) {
      this.fontStretch(value._stretch, tween, priority);
    }
    if (value._size !== void 0) {
      this.fontSize(value._size, tween, priority);
    }
    if (value._height !== void 0) {
      this.lineHeight(value._height, tween, priority);
    }
    this.fontFamily(value._family, tween, priority);
    return this;
  }
}

function margin(this: StyleMap): [Length | "auto" | undefined,
                                  Length | "auto" | undefined,
                                  Length | "auto" | undefined,
                                  Length | "auto" | undefined] |
                                 Length | "auto" | undefined;
function margin(this: StyleMap,
                value: [AnyLength | "auto" | undefined,
                        AnyLength | "auto" | undefined,
                        AnyLength | "auto" | undefined,
                        AnyLength | "auto" | undefined] |
                       AnyLength | "auto" | undefined,
                tween?: Tween<Length | "auto">,
                priority?: string): StyleMap;
function margin(this: StyleMap,
                value?: [AnyLength | "auto" |undefined,
                         AnyLength | "auto" |undefined,
                         AnyLength | "auto" |undefined,
                         AnyLength | "auto" |undefined] |
                        AnyLength | "auto" | undefined,
                tween?: Tween<Length | "auto">,
                priority?: string): [Length | "auto" | undefined,
                                     Length | "auto" | undefined,
                                     Length | "auto" | undefined,
                                     Length | "auto" | undefined] |
                                    Length | "auto" | undefined | StyleMap {
  if (value === void 0) {
    const marginTop = this.marginTop();
    const marginRight = this.marginRight();
    const marginBottom = this.marginBottom();
    const marginLeft = this.marginLeft();
    if (Objects.equal(marginTop, marginRight)
        && Objects.equal(marginRight, marginBottom)
        && Objects.equal(marginBottom, marginLeft)) {
      return marginTop;
    } else {
      return [marginTop, marginRight, marginBottom, marginLeft];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.marginTop(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.marginRight(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.marginBottom(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.marginLeft(value[3], tween, priority);
      }
    } else {
      this.marginTop(value, tween, priority);
      this.marginRight(value, tween, priority);
      this.marginBottom(value, tween, priority);
      this.marginLeft(value, tween, priority);
    }
    return this;
  }
}

function overflow(this: StyleMap): [Overflow | undefined,
                                    Overflow | undefined] |
                                   Overflow | undefined;
function overflow(this: StyleMap,
                  value: [Overflow | undefined,
                          Overflow | undefined] |
                         Overflow | undefined,
                  tween?: Tween<Overflow>,
                  priority?: string): StyleMap;
function overflow(this: StyleMap,
                  value?: [Overflow | undefined,
                           Overflow | undefined] |
                          Overflow | undefined,
                  tween?: Tween<Overflow>,
                  priority?: string): [Overflow | undefined,
                                       Overflow | undefined] |
                                      Overflow | undefined | StyleMap {
  if (value === void 0) {
    const overflowX = this.overflowX();
    const overflowY = this.overflowY();
    if (Objects.equal(overflowX, overflowY)) {
      return overflowX;
    } else {
      return [overflowX, overflowY];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.overflowX(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.overflowY(value[1], tween, priority);
      }
    } else {
      this.overflowX(value, tween, priority);
      this.overflowY(value, tween, priority);
    }
    return this;
  }
}

function overscrollBehavior(this: StyleMap): [OverscrollBehavior | undefined,
                                              OverscrollBehavior | undefined] |
                                             OverscrollBehavior | undefined;
function overscrollBehavior(this: StyleMap,
                            value: [OverscrollBehavior | undefined,
                                    OverscrollBehavior | undefined] |
                                   OverscrollBehavior | undefined,
                            tween?: Tween<OverscrollBehavior>,
                            priority?: string): StyleMap;
function overscrollBehavior(this: StyleMap,
                            value?: [OverscrollBehavior | undefined,
                                     OverscrollBehavior | undefined] |
                                    OverscrollBehavior | undefined,
                            tween?: Tween<OverscrollBehavior>,
                            priority?: string): [OverscrollBehavior | undefined,
                                                 OverscrollBehavior | undefined] |
                                                OverscrollBehavior | undefined | StyleMap {
  if (value === void 0) {
    const overscrollBehaviorX = this.overscrollBehaviorX();
    const overscrollBehaviorY = this.overscrollBehaviorY();
    if (Objects.equal(overscrollBehaviorX, overscrollBehaviorY)) {
      return overscrollBehaviorX;
    } else {
      return [overscrollBehaviorX, overscrollBehaviorY];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.overscrollBehaviorX(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.overscrollBehaviorY(value[1], tween, priority);
      }
    } else {
      this.overscrollBehaviorX(value, tween, priority);
      this.overscrollBehaviorY(value, tween, priority);
    }
    return this;
  }
}

function padding(this: StyleMap): [Length | undefined,
                                   Length | undefined,
                                   Length | undefined,
                                   Length | undefined] |
                                  Length | undefined;
function padding(this: StyleMap,
                 value: [AnyLength | undefined,
                         AnyLength | undefined,
                         AnyLength | undefined,
                         AnyLength | undefined] |
                        AnyLength | undefined,
                 tween?: Tween<Length>,
                 priority?: string): StyleMap;
function padding(this: StyleMap,
                 value?: [AnyLength | undefined,
                          AnyLength | undefined,
                          AnyLength | undefined,
                          AnyLength | undefined] |
                         AnyLength | undefined,
                 tween?: Tween<Length>,
                 priority?: string): [Length | undefined,
                                      Length | undefined,
                                      Length | undefined,
                                      Length | undefined] |
                                     Length | undefined | StyleMap {
  if (value === void 0) {
    const paddingTop = this.paddingTop();
    const paddingRight = this.paddingRight();
    const paddingBottom = this.paddingBottom();
    const paddingLeft = this.paddingLeft();
    if (Objects.equal(paddingTop, paddingRight)
        && Objects.equal(paddingRight, paddingBottom)
        && Objects.equal(paddingBottom, paddingLeft)) {
      return paddingTop;
    } else {
      return [paddingTop, paddingRight, paddingBottom, paddingLeft];
    }
  } else {
    if (Array.isArray(value)) {
      if (value.length >= 1) {
        this.paddingTop(value[0], tween, priority);
      }
      if (value.length >= 2) {
        this.paddingRight(value[1], tween, priority);
      }
      if (value.length >= 3) {
        this.paddingBottom(value[2], tween, priority);
      }
      if (value.length >= 4) {
        this.paddingLeft(value[3], tween, priority);
      }
    } else {
      this.paddingTop(value, tween, priority);
      this.paddingRight(value, tween, priority);
      this.paddingBottom(value, tween, priority);
      this.paddingLeft(value, tween, priority);
    }
    return this;
  }
}
