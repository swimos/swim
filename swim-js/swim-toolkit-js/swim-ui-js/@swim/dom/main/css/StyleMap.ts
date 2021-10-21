// Copyright 2015-2021 Swim Inc.
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

import {Equals, Values, AnyTiming} from "@swim/util";
import type {MemberAnimatorInit} from "@swim/fastener";
import {AnyLength, Length, AnyTransform, Transform} from "@swim/math";
import {
  FontStyle,
  FontVariant,
  FontWeight,
  FontStretch,
  FontFamily,
  AnyFont,
  Font,
  AnyColor,
  Color,
  AnyLinearGradient,
  LinearGradient,
  AnyBoxShadow,
  BoxShadow,
} from "@swim/style";
import type {
  AlignContent,
  AlignItems,
  AlignSelf,
  Appearance,
  BackgroundClip,
  BorderCollapse,
  BorderStyle,
  BoxSizing,
  CssCursor,
  CssDisplay,
  FlexBasis,
  FlexDirection,
  FlexWrap,
  JustifyContent,
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
} from "../css/types";
import type {StyleContext} from "./StyleContext";
import {StyleAnimator} from "../animator/StyleAnimator";
import {StyleConstraintAnimator} from "../animator/StyleConstraintAnimator";

export interface StyleMapInit {
  alignContent?: MemberAnimatorInit<StyleMap, "alignContent">;
  alignItems?: MemberAnimatorInit<StyleMap, "alignItems">;
  alignSelf?: MemberAnimatorInit<StyleMap, "alignSelf">;
  appearance?: MemberAnimatorInit<StyleMap, "appearance">;
  backdropFilter?: MemberAnimatorInit<StyleMap, "backdropFilter">;
  backgroundClip?: MemberAnimatorInit<StyleMap, "backgroundClip">;
  backgroundColor?: MemberAnimatorInit<StyleMap, "backgroundColor">;
  backgroundImage?: MemberAnimatorInit<StyleMap, "backgroundImage">;
  borderCollapse?: MemberAnimatorInit<StyleMap, "borderCollapse">;
  borderColor?: [AnyColor | null, AnyColor | null, AnyColor | null, AnyColor | null] | AnyColor | null;
  borderTopColor?: MemberAnimatorInit<StyleMap, "borderTopColor">;
  borderRightColor?: MemberAnimatorInit<StyleMap, "borderRightColor">;
  borderBottomColor?: MemberAnimatorInit<StyleMap, "borderBottomColor">;
  borderLeftColor?: MemberAnimatorInit<StyleMap, "borderLeftColor">;
  borderRadius?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null;
  borderTopLeftRadius?: MemberAnimatorInit<StyleMap, "borderTopLeftRadius">;
  borderTopRightRadius?: MemberAnimatorInit<StyleMap, "borderTopRightRadius">;
  borderBottomRightRadius?: MemberAnimatorInit<StyleMap, "borderBottomRightRadius">;
  borderBottomLeftRadius?: MemberAnimatorInit<StyleMap, "borderBottomLeftRadius">;
  borderSpacing?: MemberAnimatorInit<StyleMap, "borderSpacing">;
  borderStyle?: [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined;
  borderTopStyle?: MemberAnimatorInit<StyleMap, "borderTopStyle">;
  borderRightStyle?: MemberAnimatorInit<StyleMap, "borderRightStyle">;
  borderBottomStyle?: MemberAnimatorInit<StyleMap, "borderBottomStyle">;
  borderLeftStyle?: MemberAnimatorInit<StyleMap, "borderLeftStyle">;
  borderWidth?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null;
  borderTopWidth?: MemberAnimatorInit<StyleMap, "borderTopWidth">;
  borderRightWidth?: MemberAnimatorInit<StyleMap, "borderRightWidth">;
  borderBottomWidth?: MemberAnimatorInit<StyleMap, "borderBottomWidth">;
  borderLeftWidth?: MemberAnimatorInit<StyleMap, "borderLeftWidth">;
  bottom?: MemberAnimatorInit<StyleMap, "bottom">;
  boxShadow?: MemberAnimatorInit<StyleMap, "boxShadow">;
  boxSizing?: MemberAnimatorInit<StyleMap, "boxSizing">;
  color?: MemberAnimatorInit<StyleMap, "color">;
  cursor?: MemberAnimatorInit<StyleMap, "cursor">;
  display?: MemberAnimatorInit<StyleMap, "display">;
  filter?: MemberAnimatorInit<StyleMap, "filter">;
  flexBasis?: MemberAnimatorInit<StyleMap, "flexBasis">;
  flexDirection?: MemberAnimatorInit<StyleMap, "flexDirection">;
  flexGrow?: MemberAnimatorInit<StyleMap, "flexGrow">;
  flexShrink?: MemberAnimatorInit<StyleMap, "flexShrink">;
  flexWrap?: MemberAnimatorInit<StyleMap, "flexWrap">;
  font?: AnyFont;
  fontFamily?: MemberAnimatorInit<StyleMap, "fontFamily">;
  fontSize?: MemberAnimatorInit<StyleMap, "fontSize">;
  fontStretch?: MemberAnimatorInit<StyleMap, "fontStretch">;
  fontStyle?: MemberAnimatorInit<StyleMap, "fontStyle">;
  fontVariant?: MemberAnimatorInit<StyleMap, "fontVariant">;
  fontWeight?: MemberAnimatorInit<StyleMap, "fontWeight">;
  height?: MemberAnimatorInit<StyleMap, "height">;
  justifyContent?: MemberAnimatorInit<StyleMap, "justifyContent">;
  left?: MemberAnimatorInit<StyleMap, "left">;
  lineHeight?: MemberAnimatorInit<StyleMap, "lineHeight">;
  margin?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength;
  marginTop?: MemberAnimatorInit<StyleMap, "marginTop">;
  marginRight?: MemberAnimatorInit<StyleMap, "marginRight">;
  marginBottom?: MemberAnimatorInit<StyleMap, "marginBottom">;
  marginLeft?: MemberAnimatorInit<StyleMap, "marginLeft">;
  maxHeight?: MemberAnimatorInit<StyleMap, "maxHeight">;
  maxWidth?: MemberAnimatorInit<StyleMap, "maxWidth">;
  minHeight?: MemberAnimatorInit<StyleMap, "minHeight">;
  minWidth?: MemberAnimatorInit<StyleMap, "minWidth">;
  opacity?: MemberAnimatorInit<StyleMap, "opacity">;
  order?: MemberAnimatorInit<StyleMap, "order">;
  outlineColor?: MemberAnimatorInit<StyleMap, "outlineColor">;
  outlineStyle?: MemberAnimatorInit<StyleMap, "outlineStyle">;
  outlineWidth?: MemberAnimatorInit<StyleMap, "outlineWidth">;
  overflow?: [Overflow | undefined, Overflow | undefined] | Overflow | undefined;
  overflowX?: MemberAnimatorInit<StyleMap, "overflowX">;
  overflowY?: MemberAnimatorInit<StyleMap, "overflowY">;
  overflowScrolling?: MemberAnimatorInit<StyleMap, "overflowScrolling">;
  overscrollBehavior?: [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined;
  overscrollBehaviorX?: MemberAnimatorInit<StyleMap, "overscrollBehaviorX">;
  overscrollBehaviorY?: MemberAnimatorInit<StyleMap, "overscrollBehaviorY">;
  padding?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null;
  paddingTop?: MemberAnimatorInit<StyleMap, "paddingTop">;
  paddingRight?: MemberAnimatorInit<StyleMap, "paddingRight">;
  paddingBottom?: MemberAnimatorInit<StyleMap, "paddingBottom">;
  paddingLeft?: MemberAnimatorInit<StyleMap, "paddingLeft">;
  pointerEvents?: MemberAnimatorInit<StyleMap, "pointerEvents">;
  position?: MemberAnimatorInit<StyleMap, "position">;
  right?: MemberAnimatorInit<StyleMap, "right">;
  textAlign?: MemberAnimatorInit<StyleMap, "textAlign">;
  textDecorationColor?: MemberAnimatorInit<StyleMap, "textDecorationColor">;
  textDecorationLine?: MemberAnimatorInit<StyleMap, "textDecorationLine">;
  textDecorationStyle?: MemberAnimatorInit<StyleMap, "textDecorationStyle">;
  textOverflow?: MemberAnimatorInit<StyleMap, "textOverflow">;
  textTransform?: MemberAnimatorInit<StyleMap, "textTransform">;
  top?: MemberAnimatorInit<StyleMap, "top">;
  touchAction?: MemberAnimatorInit<StyleMap, "touchAction">;
  transform?: MemberAnimatorInit<StyleMap, "transform">;
  userSelect?: MemberAnimatorInit<StyleMap, "userSelect">;
  verticalAlign?: MemberAnimatorInit<StyleMap, "verticalAlign">;
  visibility?: MemberAnimatorInit<StyleMap, "visibility">;
  whiteSpace?: MemberAnimatorInit<StyleMap, "whiteSpace">;
  width?: MemberAnimatorInit<StyleMap, "width">;
  zIndex?: MemberAnimatorInit<StyleMap, "zIndex">;
}

export interface StyleMap extends StyleContext {
  readonly alignContent: StyleAnimator<this, AlignContent | undefined>;

  readonly alignItems: StyleAnimator<this, AlignItems | undefined>;

  readonly alignSelf: StyleAnimator<this, AlignSelf | undefined>;

  readonly appearance: StyleAnimator<this, Appearance | undefined>;

  readonly backdropFilter: StyleAnimator<this, string | undefined>;

  readonly backgroundClip: StyleAnimator<this, BackgroundClip | undefined>;

  readonly backgroundColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly backgroundImage: StyleAnimator<this, LinearGradient | string | null, AnyLinearGradient | string | null>;

  readonly borderCollapse: StyleAnimator<this, BorderCollapse | undefined>;

  borderColor(): [Color | null, Color | null, Color | null, Color | null] | Color | null;
  borderColor(value: [AnyColor | null, AnyColor | null, AnyColor | null, AnyColor | null] | AnyColor | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly borderTopColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly borderRightColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly borderBottomColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly borderLeftColor: StyleAnimator<this, Color | null, AnyColor | null>;

  borderRadius(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  borderRadius(value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly borderTopLeftRadius: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderTopRightRadius: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderBottomRightRadius: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderBottomLeftRadius: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderSpacing: StyleAnimator<this, string | undefined>;

  borderStyle(): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined;
  borderStyle(value: [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly borderTopStyle: StyleAnimator<this, BorderStyle | undefined>;

  readonly borderRightStyle: StyleAnimator<this, BorderStyle | undefined>;

  readonly borderBottomStyle: StyleAnimator<this, BorderStyle | undefined>;

  readonly borderLeftStyle: StyleAnimator<this, BorderStyle | undefined>;

  borderWidth(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  borderWidth(value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly borderTopWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderRightWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderBottomWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly borderLeftWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly bottom: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly boxShadow: StyleAnimator<this, BoxShadow | null, AnyBoxShadow | null>;

  readonly boxSizing: StyleAnimator<this, BoxSizing | undefined>;

  readonly color: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly cursor: StyleAnimator<this, CssCursor | undefined>;

  readonly display: StyleAnimator<this, CssDisplay | undefined>;

  readonly filter: StyleAnimator<this, string | undefined>;

  readonly flexBasis: StyleAnimator<this, Length | FlexBasis | null, AnyLength | FlexBasis | null>;

  readonly flexDirection: StyleAnimator<this, FlexDirection | string>;

  readonly flexGrow: StyleAnimator<this, number | undefined>;

  readonly flexShrink: StyleAnimator<this, number | undefined>;

  readonly flexWrap: StyleAnimator<this, FlexWrap | undefined>;

  font(): Font | null;
  font(value: AnyFont | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly fontFamily: StyleAnimator<this, FontFamily | FontFamily[] | undefined, FontFamily | ReadonlyArray<FontFamily> | undefined>;

  readonly fontSize: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly fontStretch: StyleAnimator<this, FontStretch | undefined>;

  readonly fontStyle: StyleAnimator<this, FontStyle | undefined>;

  readonly fontVariant: StyleAnimator<this, FontVariant | undefined>;

  readonly fontWeight: StyleAnimator<this, FontWeight | undefined>;

  readonly height: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly justifyContent: StyleAnimator<this, JustifyContent | undefined>;

  readonly left: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly lineHeight: StyleAnimator<this, Length | null, AnyLength | null>;

  margin(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  margin(value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly marginTop: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly marginRight: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly marginBottom: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly marginLeft: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly maxHeight: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly maxWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly minHeight: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly minWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  readonly opacity: StyleAnimator<this, number | undefined>;

  readonly order: StyleAnimator<this, number | undefined>;

  readonly outlineColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly outlineStyle: StyleAnimator<this, BorderStyle | undefined>;

  readonly outlineWidth: StyleAnimator<this, Length | null, AnyLength | null>;

  overflow(): [Overflow | undefined, Overflow | undefined] | Overflow | undefined;
  overflow(value: [Overflow | undefined, Overflow | undefined] | Overflow | undefined, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly overflowX: StyleAnimator<this, Overflow | undefined>;

  readonly overflowY: StyleAnimator<this, Overflow | undefined>;

  readonly overflowScrolling: StyleAnimator<this, "auto" | "touch" | undefined>;

  overscrollBehavior(): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined;
  overscrollBehavior(value: [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly overscrollBehaviorX: StyleAnimator<this, OverscrollBehavior | undefined>;

  readonly overscrollBehaviorY: StyleAnimator<this, OverscrollBehavior | undefined>;

  padding(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  padding(value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): this;

  readonly paddingTop: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly paddingRight: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly paddingBottom: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly paddingLeft: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly pointerEvents: StyleAnimator<this, PointerEvents | undefined>;

  readonly position: StyleAnimator<this, Position | undefined>;

  readonly right: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly textAlign: StyleAnimator<this, TextAlign | undefined>;

  readonly textDecorationColor: StyleAnimator<this, Color | null, AnyColor | null>;

  readonly textDecorationLine: StyleAnimator<this, string | undefined>;

  readonly textDecorationStyle: StyleAnimator<this, TextDecorationStyle | undefined>;

  readonly textOverflow: StyleAnimator<this, string | undefined>;

  readonly textTransform: StyleAnimator<this, TextTransform | undefined>;

  readonly top: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly touchAction: StyleAnimator<this, TouchAction | undefined>;

  readonly transform: StyleAnimator<this, Transform | null, AnyTransform | null>;

  readonly userSelect: StyleAnimator<this, UserSelect | undefined>;

  readonly verticalAlign: StyleAnimator<this, VerticalAlign | undefined, AnyLength | VerticalAlign | undefined>;

  readonly visibility: StyleAnimator<this, Visibility | undefined>;

  readonly whiteSpace: StyleAnimator<this, WhiteSpace | undefined>;

  readonly width: StyleConstraintAnimator<this, Length | null, AnyLength | null>;

  readonly zIndex: StyleAnimator<this, number | undefined>;
}

/** @internal */
export const StyleMap = (function () {
  const StyleMap = {} as {
    /** @internal */
    init(map: StyleMap, init: StyleMapInit): void;

    /** @internal */
    define(prototype: StyleMap): void;
  };

  StyleMap.init = function (map: StyleMap, init: StyleMapInit): void {
    if (init.alignContent !== void 0) {
      const foo = init.alignContent;
      foo;
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

    StyleAnimator({propertyNames: "background-color", type: Color, state: null})(prototype, "backgroundColor");

    StyleAnimator({
      propertyNames: "background-image",
      type: Color,
      state: null,
      parse(value: string): LinearGradient | string | null {
        try {
          return LinearGradient.parse(value);
        } catch (swallow) {
          return value;
        }
      },
      fromAny(value: AnyLinearGradient | string): LinearGradient | string | null {
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

    StyleAnimator({propertyNames: "border-top-color", type: Color, state: null})(prototype, "borderTopColor");

    StyleAnimator({propertyNames: "border-right-color", type: Color, state: null})(prototype, "borderRightColor");

    StyleAnimator({propertyNames: "border-bottom-color", type: Color, state: null})(prototype, "borderBottomColor");

    StyleAnimator({propertyNames: "border-left-color", type: Color, state: null})(prototype, "borderLeftColor");

    prototype.borderRadius = borderRadius;

    StyleAnimator({propertyNames: "border-top-left-radius", type: Length, state: null})(prototype, "borderTopLeftRadius");

    StyleAnimator({propertyNames: "border-top-right-radius", type: Length, state: null})(prototype, "borderTopRightRadius");

    StyleAnimator({propertyNames: "border-bottom-right-radius", type: Length, state: null})(prototype, "borderBottomRightRadius");

    StyleAnimator({propertyNames: "border-bottom-left-radius", type: Length, state: null})(prototype, "borderBottomLeftRadius");

    StyleAnimator({propertyNames: "border-spacing", type: String})(prototype, "borderSpacing");

    prototype.borderStyle = borderStyle;

    StyleAnimator({propertyNames: "border-top-style", type: String})(prototype, "borderTopStyle");

    StyleAnimator({propertyNames: "border-right-style", type: String})(prototype, "borderRightStyle");

    StyleAnimator({propertyNames: "border-bottom-style", type: String})(prototype, "borderBottomStyle");

    StyleAnimator({propertyNames: "border-left-style", type: String})(prototype, "borderLeftStyle");

    prototype.borderWidth = borderWidth;

    StyleAnimator({propertyNames: "border-top-width", type: Length, state: null})(prototype, "borderTopWidth");

    StyleAnimator({propertyNames: "border-right-width", type: Length, state: null})(prototype, "borderRightWidth");

    StyleAnimator({propertyNames: "border-bottom-width", type: Length, state: null})(prototype, "borderBottomWidth");

    StyleAnimator({propertyNames: "border-left-width", type: Length, state: null})(prototype, "borderLeftWidth");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "bottom",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        if (node instanceof HTMLElement) {
          const offsetParent = node.offsetParent;
          const offsetBounds = offsetParent !== null ? offsetParent.getBoundingClientRect()
                             : node === document.body ? node.getBoundingClientRect() : null;
          if (offsetBounds !== null) {
            const bounds = node.getBoundingClientRect();
            return Length.px(bounds.bottom - offsetBounds.bottom);
          }
        }
        return null;
      },
    })(prototype, "bottom");

    StyleAnimator({propertyNames: "box-shadow", type: BoxShadow, state: null})(prototype, "boxShadow");

    StyleAnimator({propertyNames: "box-sizing", type: String})(prototype, "boxSizing");

    StyleAnimator({propertyNames: "color", type: Color, state: null})(prototype, "color");

    StyleAnimator({propertyNames: "cursor", type: String})(prototype, "cursor");

    StyleAnimator({propertyNames: "display", type: String})(prototype, "display");

    StyleAnimator({propertyNames: "filter", type: String})(prototype, "filter");

    StyleAnimator({propertyNames: "flex-basis", type: Length, state: null})(prototype, "flexBasis");

    StyleAnimator({propertyNames: "flex-direction", type: String})(prototype, "flexDirection");

    StyleAnimator({propertyNames: "flex-grow", type: Number})(prototype, "flexGrow");

    StyleAnimator({propertyNames: "flex-shrink", type: Number})(prototype, "flexShrink");

    StyleAnimator({propertyNames: "flex-wrap", type: String})(prototype, "flexWrap");

    prototype.font = font;

    StyleAnimator({propertyNames: "font-family", type: FontFamily})(prototype, "fontFamily");

    StyleAnimator({propertyNames: "font-size", type: Length, state: null})(prototype, "fontSize");

    StyleAnimator({propertyNames: "font-stretch", type: String})(prototype, "fontStretch");

    StyleAnimator({propertyNames: "font-style", type: String})(prototype, "fontStyle");

    StyleAnimator({propertyNames: "font-variant", type: String})(prototype, "fontVariant");

    StyleAnimator({propertyNames: "font-weight", type: String})(prototype, "fontWeight");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "height",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        return node instanceof HTMLElement ? Length.px(node.offsetHeight) : null;
      },
    })(prototype, "height");

    StyleAnimator({propertyNames: "justify-content", type: String})(prototype, "justifyContent");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "left",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        return node instanceof HTMLElement ? Length.px(node.offsetLeft) : null;
      },
    })(prototype, "left");

    StyleAnimator({propertyNames: "line-height", type: Length, state: null})(prototype, "lineHeight");

    prototype.margin = margin;

    StyleConstraintAnimator({propertyNames: "margin-top", type: Length, state: null})(prototype, "marginTop");

    StyleConstraintAnimator({propertyNames: "margin-right", type: Length, state: null})(prototype, "marginRight");

    StyleConstraintAnimator({propertyNames: "margin-bottom", type: Length, state: null})(prototype, "marginBottom");

    StyleConstraintAnimator({propertyNames: "margin-left", type: Length, state: null})(prototype, "marginLeft");

    StyleAnimator({propertyNames: "max-height", type: Length, state: null})(prototype, "maxHeight");

    StyleAnimator({propertyNames: "max-width", type: Length, state: null})(prototype, "maxWidth");

    StyleAnimator({propertyNames: "min-height", type: Length, state: null})(prototype, "minHeight");

    StyleAnimator({propertyNames: "min-width", type: Length, state: null})(prototype, "minWidth");

    StyleAnimator({propertyNames: "opacity", type: Number})(prototype, "opacity");

    StyleAnimator({propertyNames: "order", type: Number})(prototype, "order");

    StyleAnimator({propertyNames: "outline-color", type: Color, state: null})(prototype, "outlineColor");

    StyleAnimator({propertyNames: "outline-style", type: String})(prototype, "outlineStyle");

    StyleAnimator({propertyNames: "outline-width", type: Length, state: null})(prototype, "outlineWidth");

    prototype.overflow = overflow;

    StyleAnimator({propertyNames: "overflow-x", type: String})(prototype, "overflowX");

    StyleAnimator({propertyNames: "overflow-y", type: String})(prototype, "overflowY");

    StyleAnimator({propertyNames: "-webkit-overflow-scrolling", type: String})(prototype, "overflowScrolling");

    prototype.overscrollBehavior = overscrollBehavior;

    StyleAnimator({propertyNames: "overscroll-behavior-x", type: String})(prototype, "overscrollBehaviorX");

    StyleAnimator({propertyNames: "overscroll-behavior-y", type: String})(prototype, "overscrollBehaviorY");

    prototype.padding = padding;

    StyleConstraintAnimator({propertyNames: "padding-top", type: Length, state: null})(prototype, "paddingTop");

    StyleConstraintAnimator({propertyNames: "padding-right", type: Length, state: null})(prototype, "paddingRight");

    StyleConstraintAnimator({propertyNames: "padding-bottom", type: Length, state: null})(prototype, "paddingBottom");

    StyleConstraintAnimator({propertyNames: "padding-left", type: Length, state: null})(prototype, "paddingLeft");

    StyleAnimator({propertyNames: "pointer-events", type: String})(prototype, "pointerEvents");

    StyleAnimator({propertyNames: "position", type: String})(prototype, "position");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "right",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        if (node instanceof HTMLElement) {
          const offsetParent = node.offsetParent;
          const offsetBounds = offsetParent !== null ? offsetParent.getBoundingClientRect()
                             : node === document.body ? node.getBoundingClientRect() : null;
          if (offsetBounds !== null) {
            const bounds = node.getBoundingClientRect();
            return Length.px(bounds.right - offsetBounds.right);
          }
        }
        return null;
      },
    })(prototype, "right");

    StyleAnimator({propertyNames: "text-align", type: String})(prototype, "textAlign");

    StyleAnimator({propertyNames: "text-decoration-color", type: Color, state: null})(prototype, "textDecorationColor");

    StyleAnimator({propertyNames: "text-decoration-line", type: String})(prototype, "textDecorationLine");

    StyleAnimator({propertyNames: "text-decoration-style", type: String})(prototype, "textDecorationStyle");

    StyleAnimator({propertyNames: "text-overflow", type: String})(prototype, "textOverflow");

    StyleAnimator({propertyNames: "text-transform", type: String})(prototype, "textTransform");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "top",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        return node instanceof HTMLElement ? Length.px(node.offsetTop) : null;
      },
    })(prototype, "top");

    StyleAnimator({propertyNames: "touch-action", type: String})(prototype, "touchAction");

    StyleAnimator({propertyNames: "transform", type: Transform, state: null})(prototype, "transform");

    StyleAnimator({propertyNames: ["user-select", "-webkit-user-select", "-moz-user-select", "-ms-user-select"], type: String})(prototype, "userSelect");

    StyleAnimator({propertyNames: "vertical-align", type: String})(prototype, "verticalAlign");

    StyleAnimator({propertyNames: "visibility", type: String})(prototype, "visibility");

    StyleAnimator({propertyNames: "white-space", type: String})(prototype, "whiteSpace");

    StyleConstraintAnimator<StyleMap, Length | null>({
      propertyNames: "width",
      type: Length,
      state: null,
      get constraintValue(): Length | null {
        const node = this.owner.node;
        return node instanceof HTMLElement ? Length.px(node.offsetWidth) : null;
      },
    })(prototype, "width");

    StyleAnimator({propertyNames: "z-index", type: Number})(prototype, "zIndex");
  };

  function borderColor(this: StyleMap): [Color | null, Color | null, Color | null, Color | null] | Color | null;
  function borderColor(this: StyleMap, value: [AnyColor | null, AnyColor | null, AnyColor | null, AnyColor | null] | AnyColor | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function borderColor(this: StyleMap, value?: [AnyColor | null, AnyColor | null, AnyColor | null, AnyColor | null] | AnyColor | null, timing?: AnyTiming | boolean, precedence?: number): [Color | null, Color | null, Color | null, Color | null] | Color | null | StyleMap {
    if (value === void 0) {
      const borderTopColor = this.borderTopColor.value;
      const borderRightColor = this.borderRightColor.value;
      const borderBottomColor = this.borderBottomColor.value;
      const borderLeftColor = this.borderLeftColor.value;
      if (Values.equal(borderTopColor, borderRightColor)
          && Values.equal(borderRightColor, borderBottomColor)
          && Values.equal(borderBottomColor, borderLeftColor)) {
        return borderTopColor;
      } else {
        return [borderTopColor, borderRightColor, borderBottomColor, borderLeftColor];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopColor.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.borderRightColor.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.borderBottomColor.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.borderLeftColor.setState(value[3], timing, precedence);
        }
      } else {
        this.borderTopColor.setState(value, timing, precedence);
        this.borderRightColor.setState(value, timing, precedence);
        this.borderBottomColor.setState(value, timing, precedence);
        this.borderLeftColor.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function borderRadius(this: StyleMap): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  function borderRadius(this: StyleMap, value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function borderRadius(this: StyleMap, value?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null,timing?: AnyTiming | boolean, precedence?: number): [Length | null, Length | null, Length | null, Length | null] | Length | null | StyleMap {
    if (value === void 0) {
      const borderTopLeftRadius = this.borderTopLeftRadius.value;
      const borderTopRightRadius = this.borderTopRightRadius.value;
      const borderBottomRightRadius = this.borderBottomRightRadius.value;
      const borderBottomLeftRadius = this.borderBottomLeftRadius.value;
      if (Equals(borderTopLeftRadius, borderTopRightRadius)
          && Equals(borderTopRightRadius, borderBottomRightRadius)
          && Equals(borderBottomRightRadius, borderBottomLeftRadius)) {
        return borderTopLeftRadius;
      } else {
        return [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopLeftRadius.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.borderTopRightRadius.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.borderBottomRightRadius.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.borderBottomLeftRadius.setState(value[3], timing, precedence);
        }
      } else {
        this.borderTopLeftRadius.setState(value, timing, precedence);
        this.borderTopRightRadius.setState(value, timing, precedence);
        this.borderBottomRightRadius.setState(value, timing, precedence);
        this.borderBottomLeftRadius.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function borderStyle(this: StyleMap): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined;
  function borderStyle(this: StyleMap, value: [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function borderStyle(this: StyleMap, value?: [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined, timing?: AnyTiming | boolean, precedence?: number): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined | StyleMap {
    if (value === void 0) {
      const borderTopStyle = this.borderTopStyle.value;
      const borderRightStyle = this.borderRightStyle.value;
      const borderBottomStyle = this.borderBottomStyle.value;
      const borderLeftStyle = this.borderLeftStyle.value;
      if (borderTopStyle === borderRightStyle
          && borderRightStyle === borderBottomStyle
          && borderBottomStyle === borderLeftStyle) {
        return borderTopStyle;
      } else {
        return [borderTopStyle, borderRightStyle, borderBottomStyle, borderLeftStyle];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopStyle.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.borderRightStyle.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.borderBottomStyle.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.borderLeftStyle.setState(value[3], timing, precedence);
        }
      } else {
        this.borderTopStyle.setState(value, timing, precedence);
        this.borderRightStyle.setState(value, timing, precedence);
        this.borderBottomStyle.setState(value, timing, precedence);
        this.borderLeftStyle.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function borderWidth(this: StyleMap): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  function borderWidth(this: StyleMap, value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function borderWidth(this: StyleMap, value?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): [Length | null, Length | null, Length | null, Length | null] | Length | null | StyleMap {
    if (value === void 0) {
      const borderTopWidth = this.borderTopWidth.value;
      const borderRightWidth = this.borderRightWidth.value;
      const borderBottomWidth = this.borderBottomWidth.value;
      const borderLeftWidth = this.borderLeftWidth.value;
      if (Values.equal(borderTopWidth, borderRightWidth)
          && Values.equal(borderRightWidth, borderBottomWidth)
          && Values.equal(borderBottomWidth, borderLeftWidth)) {
        return borderTopWidth;
      } else {
        return [borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopWidth.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.borderRightWidth.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.borderBottomWidth.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.borderLeftWidth.setState(value[3], timing, precedence);
        }
      } else {
        this.borderTopWidth.setState(value, timing, precedence);
        this.borderRightWidth.setState(value, timing, precedence);
        this.borderBottomWidth.setState(value, timing, precedence);
        this.borderLeftWidth.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function font(this: StyleMap): Font | null;
  function font(this: StyleMap, value: AnyFont | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function font(this: StyleMap, value?: AnyFont | null, timing?: AnyTiming | boolean, precedence?: number): Font | null | StyleMap {
    if (value === void 0) {
      const style = this.fontStyle.value;
      const variant = this.fontVariant.value;
      const weight = this.fontWeight.value;
      const stretch = this.fontStretch.value;
      const size = this.fontSize.value;
      const height = this.lineHeight.value;
      const family = this.fontFamily.value;
      if (family !== void 0) {
        return Font.create(style, variant, weight, stretch, size, height, family);
      } else {
        return null;
      }
    } else {
      if (value !== null) {
        value = Font.fromAny(value);
        if (value.style !== void 0) {
          this.fontStyle.setState(value.style, timing, precedence);
        }
        if (value.variant !== void 0) {
          this.fontVariant.setState(value.variant, timing, precedence);
        }
        if (value.weight !== void 0) {
          this.fontWeight.setState(value.weight, timing, precedence);
        }
        if (value.stretch !== void 0) {
          this.fontStretch.setState(value.stretch, timing, precedence);
        }
        if (value.size !== void 0) {
          this.fontSize.setState(value.size, timing, precedence);
        }
        if (value.height !== void 0) {
          this.lineHeight.setState(value.height, timing, precedence);
        }
        this.fontFamily.setState(value.family, timing, precedence);
      } else {
        this.fontStyle.setState(void 0, timing, precedence);
        this.fontVariant.setState(void 0, timing, precedence);
        this.fontWeight.setState(void 0, timing, precedence);
        this.fontStretch.setState(void 0, timing, precedence);
        this.fontSize.setState(null, timing, precedence);
        this.lineHeight.setState(null, timing, precedence);
        this.fontFamily.setState(void 0, timing, precedence);
      }
      return this;
    }
  }

  function margin(this: StyleMap): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  function margin(this: StyleMap, value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function margin(this: StyleMap, value?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): [Length | null, Length | null, Length | null, Length | null] | Length | null | StyleMap {
    if (value === void 0) {
      const marginTop = this.marginTop.value;
      const marginRight = this.marginRight.value;
      const marginBottom = this.marginBottom.value;
      const marginLeft = this.marginLeft.value;
      if (Values.equal(marginTop, marginRight)
          && Values.equal(marginRight, marginBottom)
          && Values.equal(marginBottom, marginLeft)) {
        return marginTop;
      } else {
        return [marginTop, marginRight, marginBottom, marginLeft];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.marginTop.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.marginRight.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.marginBottom.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.marginLeft.setState(value[3], timing, precedence);
        }
      } else {
        this.marginTop.setState(value, timing, precedence);
        this.marginRight.setState(value, timing, precedence);
        this.marginBottom.setState(value, timing, precedence);
        this.marginLeft.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function overflow(this: StyleMap): [Overflow | undefined, Overflow | undefined] | Overflow | undefined;
  function overflow(this: StyleMap, value: [Overflow | undefined, Overflow | undefined] | Overflow | undefined, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function overflow(this: StyleMap, value?: [Overflow | undefined, Overflow | undefined] | Overflow | undefined, timing?: AnyTiming | boolean, precedence?: number): [Overflow | undefined, Overflow | undefined] | Overflow | undefined | StyleMap {
    if (value === void 0) {
      const overflowX = this.overflowX.value;
      const overflowY = this.overflowY.value;
      if (overflowX === overflowY) {
        return overflowX;
      } else {
        return [overflowX, overflowY];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.overflowX.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.overflowY.setState(value[1], timing, precedence);
        }
      } else {
        this.overflowX.setState(value, timing, precedence);
        this.overflowY.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function overscrollBehavior(this: StyleMap): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined;
  function overscrollBehavior(this: StyleMap, value: [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function overscrollBehavior(this: StyleMap, value?: [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined, timing?: AnyTiming | boolean, precedence?: number): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined | StyleMap {
    if (value === void 0) {
      const overscrollBehaviorX = this.overscrollBehaviorX.value;
      const overscrollBehaviorY = this.overscrollBehaviorY.value;
      if (overscrollBehaviorX === overscrollBehaviorY) {
        return overscrollBehaviorX;
      } else {
        return [overscrollBehaviorX, overscrollBehaviorY];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.overscrollBehaviorX.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.overscrollBehaviorY.setState(value[1], timing, precedence);
        }
      } else {
        this.overscrollBehaviorX.setState(value, timing, precedence);
        this.overscrollBehaviorY.setState(value, timing, precedence);
      }
      return this;
    }
  }

  function padding(this: StyleMap): [Length | null, Length | null, Length | null, Length | null] | Length | null;
  function padding(this: StyleMap, value: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): StyleMap;
  function padding(this: StyleMap, value?: [AnyLength | null, AnyLength | null, AnyLength | null, AnyLength | null] | AnyLength | null, timing?: AnyTiming | boolean, precedence?: number): [Length | null, Length | null, Length | null, Length | null] | Length | null | StyleMap {
    if (value === void 0) {
      const paddingTop = this.paddingTop.value;
      const paddingRight = this.paddingRight.value;
      const paddingBottom = this.paddingBottom.value;
      const paddingLeft = this.paddingLeft.value;
      if (Equals(paddingTop, paddingRight)
          && Equals(paddingRight, paddingBottom)
          && Equals(paddingBottom, paddingLeft)) {
        return paddingTop;
      } else {
        return [paddingTop, paddingRight, paddingBottom, paddingLeft];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.paddingTop.setState(value[0], timing, precedence);
        }
        if (value.length >= 2) {
          this.paddingRight.setState(value[1], timing, precedence);
        }
        if (value.length >= 3) {
          this.paddingBottom.setState(value[2], timing, precedence);
        }
        if (value.length >= 4) {
          this.paddingLeft.setState(value[3], timing, precedence);
        }
      } else {
        this.paddingTop.setState(value, timing, precedence);
        this.paddingRight.setState(value, timing, precedence);
        this.paddingBottom.setState(value, timing, precedence);
        this.paddingLeft.setState(value, timing, precedence);
      }
      return this;
    }
  }

  return StyleMap;
})();
