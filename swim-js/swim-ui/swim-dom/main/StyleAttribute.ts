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

import type {Proto} from "@swim/util";
import {Values} from "@swim/util";
import {Equals} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import {Animator} from "@swim/component";
import type {ConstraintExpressionLike} from "@swim/constraint";
import type {ConstraintVariable} from "@swim/constraint";
import type {ConstraintProperty} from "@swim/constraint";
import type {ConstraintRelation} from "@swim/constraint";
import type {ConstraintStrengthLike} from "@swim/constraint";
import type {Constraint} from "@swim/constraint";
import {ConstraintScope} from "@swim/constraint";
import {Length} from "@swim/math";
import {Transform} from "@swim/math";
import type {FontStyle} from "@swim/style";
import type {FontVariant} from "@swim/style";
import type {FontWeight} from "@swim/style";
import type {FontStretch} from "@swim/style";
import {FontFamily} from "@swim/style";
import type {FontLike} from "@swim/style";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import type {LinearGradientLike} from "@swim/style";
import {LinearGradient} from "@swim/style";
import {BoxShadow} from "@swim/style";
import {Look} from "@swim/theme";
import type {LengthOrLookLike} from "@swim/theme";
import type {ColorOrLookLike} from "@swim/theme";
import type {Feel} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeContext} from "@swim/theme";
import {StyleAnimator} from "./StyleAnimator";
import {LengthStyleAnimator} from "./StyleAnimator";
import {LengthStyleConstraintAnimator} from "./StyleConstraintAnimator";
import type {AlignContent} from "./csstypes";
import type {AlignItems} from "./csstypes";
import type {AlignSelf} from "./csstypes";
import type {Appearance} from "./csstypes";
import type {BackgroundClip} from "./csstypes";
import type {BorderCollapse} from "./csstypes";
import type {BorderStyle} from "./csstypes";
import type {BoxSizing} from "./csstypes";
import type {CssCursor} from "./csstypes";
import type {CssDisplay} from "./csstypes";
import type {FlexBasis} from "./csstypes";
import type {FlexDirection} from "./csstypes";
import type {FlexWrap} from "./csstypes";
import type {JustifyContent} from "./csstypes";
import type {Overflow} from "./csstypes";
import type {OverscrollBehavior} from "./csstypes";
import type {PointerEvents} from "./csstypes";
import type {Position} from "./csstypes";
import type {TextAlign} from "./csstypes";
import type {TextDecorationStyle} from "./csstypes";
import type {TextTransform} from "./csstypes";
import type {TouchAction} from "./csstypes";
import type {UserSelect} from "./csstypes";
import type {VerticalAlign} from "./csstypes";
import type {Visibility} from "./csstypes";
import type {WhiteSpace} from "./csstypes";
import type {StyleContext} from "./StyleAnimator";

/** @public */
export interface StyleAttributeDescriptor<R> extends FastenerDescriptor<R> {
  extends?: Proto<StyleAttribute<any>> | boolean | null;
}

/** @public */
export interface StyleAttributeClass<F extends StyleAttribute<any> = StyleAttribute> extends FastenerClass<F> {
  /** @internal */
  pctWidthUnit(node: Node | undefined): number;

  /** @internal */
  pctHeightUnit(node: Node | undefined): number;
}

/** @public */
export interface StyleAttribute<R = any> extends Fastener<R>, ConstraintScope, ThemeContext, StyleContext {
  /** @override */
  get descriptorType(): Proto<StyleAttributeDescriptor<R>>;

  /** @override */
  get fastenerType(): Proto<StyleAttribute<any>>;

  get alignContent(): StyleAnimator<this, AlignContent | undefined>;

  get alignItems(): StyleAnimator<this, AlignItems | undefined>;

  get alignSelf(): StyleAnimator<this, AlignSelf | undefined>;

  get appearance(): StyleAnimator<this, Appearance | undefined>;

  get backdropFilter(): StyleAnimator<this, string | undefined>;

  get backgroundClip(): StyleAnimator<this, BackgroundClip | undefined>;

  get backgroundColor(): StyleAnimator<this, Color | null>;

  get backgroundImage(): StyleAnimator<this, LinearGradient | string | null>;

  get borderCollapse(): StyleAnimator<this, BorderCollapse | undefined>;

  get borderColor(): Fastener<this> & {
    get(): [Color | null, Color | null, Color | null, Color | null] | Color | null;
    set(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get borderTopColor(): StyleAnimator<this, Color | null>;

  get borderRightColor(): StyleAnimator<this, Color | null>;

  get borderBottomColor(): StyleAnimator<this, Color | null>;

  get borderLeftColor(): StyleAnimator<this, Color | null>;

  get borderRadius(): Fastener<this> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get borderTopLeftRadius(): LengthStyleAnimator<this, Length | null>;

  get borderTopRightRadius(): LengthStyleAnimator<this, Length | null>;

  get borderBottomRightRadius(): LengthStyleAnimator<this, Length | null>;

  get borderBottomLeftRadius(): LengthStyleAnimator<this, Length | null>;

  get borderSpacing(): StyleAnimator<this, string | undefined>;

  get borderStyle(): Fastener<this> & {
    get(): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined;
    set(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get borderTopStyle(): StyleAnimator<this, BorderStyle | undefined>;

  get borderRightStyle(): StyleAnimator<this, BorderStyle | undefined>;

  get borderBottomStyle(): StyleAnimator<this, BorderStyle | undefined>;

  get borderLeftStyle(): StyleAnimator<this, BorderStyle | undefined>;

  get borderWidth(): Fastener<this> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get borderTopWidth(): LengthStyleAnimator<this, Length | null>;

  get borderRightWidth(): LengthStyleAnimator<this, Length | null>;

  get borderBottomWidth(): LengthStyleAnimator<this, Length | null>;

  get borderLeftWidth(): LengthStyleAnimator<this, Length | null>;

  get bottom(): LengthStyleConstraintAnimator<this, Length | null>;

  get boxShadow(): StyleAnimator<this, BoxShadow | null>;

  get boxSizing(): StyleAnimator<this, BoxSizing | undefined>;

  get color(): StyleAnimator<this, Color | null>;

  get cursor(): StyleAnimator<this, CssCursor | undefined>;

  get display(): StyleAnimator<this, CssDisplay | undefined>;

  get filter(): StyleAnimator<this, string | undefined>;

  get flexBasis(): StyleAnimator<this, Length | FlexBasis | null>;

  get flexDirection(): StyleAnimator<this, FlexDirection | string>;

  get flexGrow(): StyleAnimator<this, number | undefined>;

  get flexShrink(): StyleAnimator<this, number | undefined>;

  get flexWrap(): StyleAnimator<this, FlexWrap | undefined>;

  get font(): Fastener<this> & {
    get(): Font | null;
    set(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: FontLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get fontFamily(): StyleAnimator<this, FontFamily | readonly FontFamily[] | undefined>;

  get fontSize(): LengthStyleAnimator<this, Length | null>;

  get fontStretch(): StyleAnimator<this, FontStretch | undefined>;

  get fontStyle(): StyleAnimator<this, FontStyle | undefined>;

  get fontVariant(): StyleAnimator<this, FontVariant | undefined>;

  get fontWeight(): StyleAnimator<this, FontWeight | undefined>;

  get height(): LengthStyleConstraintAnimator<this, Length | null>;

  get justifyContent(): StyleAnimator<this, JustifyContent | undefined>;

  get left(): LengthStyleConstraintAnimator<this, Length | null>;

  get lineHeight(): LengthStyleAnimator<this, Length | null>;

  get margin(): Fastener<this> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get marginTop(): LengthStyleConstraintAnimator<this, Length | null>;

  get marginRight(): LengthStyleConstraintAnimator<this, Length | null>;

  get marginBottom(): LengthStyleConstraintAnimator<this, Length | null>;

  get marginLeft(): LengthStyleConstraintAnimator<this, Length | null>;

  get maxHeight(): LengthStyleAnimator<this, Length | null>;

  get maxWidth(): LengthStyleAnimator<this, Length | null>;

  get minHeight(): LengthStyleAnimator<this, Length | null>;

  get minWidth(): LengthStyleAnimator<this, Length | null>;

  get opacity(): StyleAnimator<this, number | undefined>;

  get order(): StyleAnimator<this, number | undefined>;

  get outlineColor(): StyleAnimator<this, Color | null>;

  get outlineOffset(): LengthStyleAnimator<this, Length | null>;

  get outlineStyle(): StyleAnimator<this, BorderStyle | undefined>;

  get outlineWidth(): LengthStyleAnimator<this, Length | null>;

  get overflow(): Fastener<this> & {
    get(): [Overflow | undefined, Overflow | undefined] | Overflow | undefined;
    set(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get overflowX(): StyleAnimator<this, Overflow | undefined>;

  get overflowY(): StyleAnimator<this, Overflow | undefined>;

  get overflowScrolling(): StyleAnimator<this, "auto" | "touch" | undefined>;

  get overscrollBehavior(): Fastener<this> & {
    get(): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined;
    set(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get overscrollBehaviorX(): StyleAnimator<this, OverscrollBehavior | undefined>;

  get overscrollBehaviorY(): StyleAnimator<this, OverscrollBehavior | undefined>;

  get padding(): Fastener<this> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  };

  get paddingTop(): LengthStyleConstraintAnimator<this, Length | null>;

  get paddingRight(): LengthStyleConstraintAnimator<this, Length | null>;

  get paddingBottom(): LengthStyleConstraintAnimator<this, Length | null>;

  get paddingLeft(): LengthStyleConstraintAnimator<this, Length | null>;

  get pointerEvents(): StyleAnimator<this, PointerEvents | undefined>;

  get position(): StyleAnimator<this, Position | undefined>;

  get right(): LengthStyleConstraintAnimator<this, Length | null>;

  get textAlign(): StyleAnimator<this, TextAlign | undefined>;

  get textDecorationColor(): StyleAnimator<this, Color | null>;

  get textDecorationLine(): StyleAnimator<this, string | undefined>;

  get textDecorationStyle(): StyleAnimator<this, TextDecorationStyle | undefined>;

  get textOverflow(): StyleAnimator<this, string | undefined>;

  get textTransform(): StyleAnimator<this, TextTransform | undefined>;

  get top(): LengthStyleConstraintAnimator<this, Length | null>;

  get touchAction(): StyleAnimator<this, TouchAction | undefined>;

  get transform(): StyleAnimator<this, Transform | null>;

  get userSelect(): StyleAnimator<this, UserSelect | undefined>;

  get verticalAlign(): StyleAnimator<this, VerticalAlign | undefined>;

  get visibility(): StyleAnimator<this, Visibility | undefined>;

  get whiteSpace(): StyleAnimator<this, WhiteSpace | undefined>;

  get width(): LengthStyleConstraintAnimator<this, Length | null>;

  get zIndex(): StyleAnimator<this, number | undefined>;

  set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  set(properties: {[K in keyof StyleAttribute as StyleAttribute[K] extends {set(value: any): any} ? K : never]?: StyleAttribute[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;

  setIntrinsic<S>(this: S, properties: {[K in keyof S as S[K] extends {setIntrinsic(value: any): any} ? K : never]?: S[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  setIntrinsic(properties: {[K in keyof StyleAttribute as StyleAttribute[K] extends {setIntrinsic(value: any): any} ? K : never]?: StyleAttribute[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;

  get node(): Node | undefined;

  /** @override */
  getStyle(propertyNames: string | readonly string[]): CSSStyleValue | string | undefined;

  /** @override */
  setStyle(propertyName: string, value: unknown, priority?: string): this;

  /** @protected */
  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @internal */
  applyStyles(): void;

  /** @override */
  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint;

  /** @override */
  hasConstraint(constraint: Constraint): boolean;

  /** @override */
  addConstraint(constraint: Constraint): void;

  /** @override */
  removeConstraint(constraint: Constraint): void;

  /** @override */
  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<any, number>;

  /** @override */
  hasConstraintVariable(variable: ConstraintVariable): boolean;

  /** @override */
  addConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @override */
  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined;

  /** @override */
  getLookOr<T, E>(look: Look<T>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  /** @override */
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void;
}

/** @public */
export const StyleAttribute = (<R, F extends StyleAttribute<any>>() => Fastener.extend<StyleAttribute<R>, StyleAttributeClass<F>>("StyleAttribute", {
  get fastenerType(): Proto<StyleAttribute<any>> {
    return StyleAttribute;
  },

  set(properties: {[K in keyof StyleAttribute as StyleAttribute[K] extends {set(value: any): any} ? K : never]?: StyleAttribute[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R {
    for (const key in properties) {
      const value = properties[key as keyof typeof properties];
      const property = (this as any)[key] as {set?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.set === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.set(value, timing);
      } else {
        property.set(value);
      }
    }
    return this.owner;
  },

  setIntrinsic(properties: {[K in keyof StyleAttribute as StyleAttribute[K] extends {setIntrinsic(value: any): any} ? K : never]?: StyleAttribute[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R {
    for (const key in properties) {
      const value = properties[key as keyof typeof properties];
      const property = (this as any)[key] as {setIntrinsic?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.setIntrinsic === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.setIntrinsic(value, timing);
      } else {
        property.setIntrinsic(value);
      }
    }
    return this.owner;
  },

  get node(): Node | undefined {
    return (this.owner as StyleContext).node;
  },

  getStyle(propertyNames: string | readonly string[]): CSSStyleValue | string | undefined {
    return (this.owner as StyleContext).getStyle(propertyNames);
  },

  setStyle(propertyName: string, value: unknown, priority?: string): StyleAttribute {
    (this.owner as StyleContext).setStyle(propertyName, value, priority);
    return this;
  },

  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  applyStyles(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof StyleAnimator) {
        fastener.applyStyle(fastener.value, fastener.priority);
      }
    }
  },

  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.constraint(lhs, relation, rhs, strength);
  },

  hasConstraint(constraint: Constraint): boolean {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.hasConstraint(constraint);
  },

  addConstraint(constraint: Constraint): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.addConstraint(constraint);
  },

  removeConstraint(constraint: Constraint): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.removeConstraint(constraint);
  },

  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<any, number> {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.constraintVariable(name, value, strength);
  },

  hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.hasConstraintVariable(constraintVariable);
  },

  addConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.addConstraintVariable(constraintVariable);
  },

  removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.removeConstraintVariable(constraintVariable);
  },

  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.setConstraintVariable(constraintVariable, state);
  },

  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined {
    if (!ThemeContext[Symbol.hasInstance](this.owner)) {
      return void 0;
    }
    return this.owner.getLook(look, mood);
  },

  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (ThemeContext[Symbol.hasInstance](this.owner)) {
      if (arguments.length === 2) {
        return this.owner.getLookOr(look, mood as E);
      } else {
        return this.owner.getLookOr(look, mood as MoodVector<Feel> | null, elseValue!);
      }
    } else if (arguments.length === 2) {
      return mood as E;
    }
    return elseValue!;
  },

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    } else if (timing === void 0 || timing === null || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!] as Fastener<any, any, any> | undefined;
      if (fastener !== void 0 && "applyTheme" in (fastener as any)) {
        (fastener as any).applyTheme(theme, mood, timing);
      }
    }
  },
},
{
  pctWidthUnit(node: Node | undefined): number {
    if (node instanceof HTMLElement) {
      const offsetParent = node.offsetParent;
      if (offsetParent instanceof HTMLElement) {
        return offsetParent.offsetWidth;
      }
    }
    if (node === document.body || node === document.documentElement) {
      return window.innerWidth;
    }
    return 0;
  },

  pctHeightUnit(node: Node | undefined): number {
    if (node instanceof HTMLElement) {
      const offsetParent = node.offsetParent;
      if (offsetParent instanceof HTMLElement) {
        return offsetParent.offsetHeight;
      }
    }
    if (node === document.body || node === document.documentElement) {
      return window.innerHeight;
    }
    return 0;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    StyleAttribute.initFasteners(fastener);
    return fastener;
  },
}))();

StyleAttribute.defineGetter("alignContent", [StyleAnimator({
  propertyNames: "align-content",
  valueType: String,
})]);

StyleAttribute.defineGetter("alignItems", [StyleAnimator({
  propertyNames: "align-items",
  valueType: String,
})]);

StyleAttribute.defineGetter("alignSelf", [StyleAnimator({
  propertyNames: "align-self",
  valueType: String,
})]);

StyleAttribute.defineGetter("appearance", [StyleAnimator({
  propertyNames: ["appearance", "-webkit-appearance"],
  valueType: String,
})]);

StyleAttribute.defineGetter("backdropFilter", [StyleAnimator({
  propertyNames: ["backdrop-filter", "-webkit-backdrop-filter"],
  valueType: String,
})]);

StyleAttribute.defineGetter("backgroundClip", [StyleAnimator({
  propertyNames: ["background-clip", "-webkit-background-clip"],
  valueType: String,
})]);

StyleAttribute.defineGetter("backgroundColor", [StyleAnimator({
  propertyNames: "background-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("backgroundImage", [StyleAnimator({
  propertyNames: "background-image",
  value: null,
  parse(value: string): LinearGradient | string | null {
    try {
      return LinearGradient.parse(value);
    } catch (swallow) {
      return value;
    }
  },
  fromLike(value: LinearGradientLike | string | null): LinearGradient | string | null {
    if (typeof value === "string") {
      try {
        return LinearGradient.parse(value);
      } catch (swallow) {
        return value;
      }
    } else {
      return LinearGradient.fromLike(value);
    }
  },
})]);

StyleAttribute.defineGetter("borderCollapse", [StyleAnimator({
  propertyNames: "border-collapse",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderColor", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Color | null, Color | null, Color | null, Color | null] | Color | null;
    set(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Color | null, Color | null, Color | null, Color | null] | Color | null {
    const borderTopColor = this.owner.borderTopColor.value;
    const borderRightColor = this.owner.borderRightColor.value;
    const borderBottomColor = this.owner.borderBottomColor.value;
    const borderLeftColor = this.owner.borderLeftColor.value;
    if (Values.equal(borderTopColor, borderRightColor)
        && Values.equal(borderRightColor, borderBottomColor)
        && Values.equal(borderBottomColor, borderLeftColor)) {
      return borderTopColor;
    }
    return [borderTopColor, borderRightColor, borderBottomColor, borderLeftColor];
  },
  set(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | Color | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [ColorOrLookLike | null, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?, (ColorOrLookLike | null)?] | ColorOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    let borderTopColor: ColorOrLookLike | null;
    let borderRightColor: ColorOrLookLike | null;
    let borderBottomColor: ColorOrLookLike | null;
    let borderLeftColor: ColorOrLookLike | null;
    if (!Array.isArray(value)) {
      borderTopColor = value as ColorOrLookLike | null;
      borderRightColor = value as ColorOrLookLike | null;
      borderBottomColor = value as ColorOrLookLike | null;
      borderLeftColor = value as ColorOrLookLike | null;
    } else if (value.length === 1) {
      borderTopColor = value[0];
      borderRightColor = value[0];
      borderBottomColor = value[0];
      borderLeftColor = value[0];
    } else if (value.length === 2) {
      borderTopColor = value[0];
      borderRightColor = value[1];
      borderBottomColor = value[0];
      borderLeftColor = value[1];
    } else if (value.length === 3) {
      borderTopColor = value[0];
      borderRightColor = value[1];
      borderBottomColor = value[2];
      borderLeftColor = value[1];
    } else if (value.length === 4) {
      borderTopColor = value[0];
      borderRightColor = value[1];
      borderBottomColor = value[2];
      borderLeftColor = value[3];
    } else {
      throw new TypeError("" + value);
    }
    if (borderTopColor instanceof Look) {
      this.owner.borderTopColor.setLook(borderTopColor, timing, affinity);
    } else {
      this.owner.borderTopColor.setState(borderTopColor, timing, affinity);
    }
    if (borderRightColor instanceof Look) {
      this.owner.borderRightColor.setLook(borderRightColor, timing, affinity);
    } else {
      this.owner.borderRightColor.setState(borderRightColor, timing, affinity);
    }
    if (borderBottomColor instanceof Look) {
      this.owner.borderBottomColor.setLook(borderBottomColor, timing, affinity);
    } else {
      this.owner.borderBottomColor.setState(borderBottomColor, timing, affinity);
    }
    if (borderLeftColor instanceof Look) {
      this.owner.borderLeftColor.setLook(borderLeftColor, timing, affinity);
    } else {
      this.owner.borderLeftColor.setState(borderLeftColor, timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("borderTopColor", [StyleAnimator({
  propertyNames: "border-top-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("borderRightColor", [StyleAnimator({
  propertyNames: "border-right-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("borderBottomColor", [StyleAnimator({
  propertyNames: "border-bottom-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("borderLeftColor", [StyleAnimator({
  propertyNames: "border-left-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("borderRadius", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Length | null, Length | null, Length | null, Length | null] | Length | null {
    const borderTopLeftRadius = this.owner.borderTopLeftRadius.value;
    const borderTopRightRadius = this.owner.borderTopRightRadius.value;
    const borderBottomRightRadius = this.owner.borderBottomRightRadius.value;
    const borderBottomLeftRadius = this.owner.borderBottomLeftRadius.value;
    if (Equals(borderTopLeftRadius, borderTopRightRadius)
        && Equals(borderTopRightRadius, borderBottomRightRadius)
        && Equals(borderBottomRightRadius, borderBottomLeftRadius)) {
      return borderTopLeftRadius;
    }
    return [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius];
  },
  set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    let borderTopLeftRadius: LengthOrLookLike | null;
    let borderTopRightRadius: LengthOrLookLike | null;
    let borderBottomRightRadius: LengthOrLookLike | null;
    let borderBottomLeftRadius: LengthOrLookLike | null;
    if (!Array.isArray(value)) {
      borderTopLeftRadius = value as LengthOrLookLike | null;
      borderTopRightRadius = value as LengthOrLookLike | null;
      borderBottomRightRadius = value as LengthOrLookLike | null;
      borderBottomLeftRadius = value as LengthOrLookLike | null;
    } else if (value.length === 1) {
      borderTopLeftRadius = value[0];
      borderTopRightRadius = value[0];
      borderBottomRightRadius = value[0];
      borderBottomLeftRadius = value[0];
    } else if (value.length === 2) {
      borderTopLeftRadius = value[0];
      borderTopRightRadius = value[1];
      borderBottomRightRadius = value[0];
      borderBottomLeftRadius = value[1];
    } else if (value.length === 3) {
      borderTopLeftRadius = value[0];
      borderTopRightRadius = value[1];
      borderBottomRightRadius = value[2];
      borderBottomLeftRadius = value[1];
    } else if (value.length === 4) {
      borderTopLeftRadius = value[0];
      borderTopRightRadius = value[1];
      borderBottomRightRadius = value[2];
      borderBottomLeftRadius = value[3];
    } else {
      throw new TypeError("" + value);
    }
    if (borderTopLeftRadius instanceof Look) {
      this.owner.borderTopLeftRadius.setLook(borderTopLeftRadius, timing, affinity);
    } else {
      this.owner.borderTopLeftRadius.setState(borderTopLeftRadius, timing, affinity);
    }
    if (borderTopRightRadius instanceof Look) {
      this.owner.borderTopRightRadius.setLook(borderTopRightRadius, timing, affinity);
    } else {
      this.owner.borderTopRightRadius.setState(borderTopRightRadius, timing, affinity);
    }
    if (borderBottomRightRadius instanceof Look) {
      this.owner.borderBottomRightRadius.setLook(borderBottomRightRadius, timing, affinity);
    } else {
      this.owner.borderBottomRightRadius.setState(borderBottomRightRadius, timing, affinity);
    }
    if (borderBottomLeftRadius instanceof Look) {
      this.owner.borderBottomLeftRadius.setLook(borderBottomLeftRadius, timing, affinity);
    } else {
      this.owner.borderBottomLeftRadius.setState(borderBottomLeftRadius, timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("borderTopLeftRadius", [LengthStyleAnimator({
  propertyNames: "border-top-left-radius",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderTopRightRadius", [LengthStyleAnimator({
  propertyNames: "border-top-right-radius",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderBottomRightRadius", [LengthStyleAnimator({
  propertyNames: "border-bottom-right-radius",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderBottomLeftRadius", [LengthStyleAnimator({
  propertyNames: "border-bottom-left-radius",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderSpacing", [StyleAnimator({
  propertyNames: "border-spacing",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderStyle", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined;
    set(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined, BorderStyle | undefined] | BorderStyle | undefined {
    const borderTopStyle = this.owner.borderTopStyle.value;
    const borderRightStyle = this.owner.borderRightStyle.value;
    const borderBottomStyle = this.owner.borderBottomStyle.value;
    const borderLeftStyle = this.owner.borderLeftStyle.value;
    if (borderTopStyle === borderRightStyle
        && borderRightStyle === borderBottomStyle
        && borderBottomStyle === borderLeftStyle) {
      return borderTopStyle;
    }
    return [borderTopStyle, borderRightStyle, borderBottomStyle, borderLeftStyle];
  },
  set(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [BorderStyle | undefined, (BorderStyle | undefined)?, (BorderStyle | undefined)?, (BorderStyle | undefined)?] | BorderStyle | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    if (!Array.isArray(value)) {
      this.owner.borderTopStyle.setState(value as BorderStyle | undefined, timing, affinity);
      this.owner.borderRightStyle.setState(value as BorderStyle | undefined, timing, affinity);
      this.owner.borderBottomStyle.setState(value as BorderStyle | undefined, timing, affinity);
      this.owner.borderLeftStyle.setState(value as BorderStyle | undefined, timing, affinity);
    } else if (value.length === 1) {
      this.owner.borderTopStyle.setState(value[0], timing, affinity);
      this.owner.borderRightStyle.setState(value[0], timing, affinity);
      this.owner.borderBottomStyle.setState(value[0], timing, affinity);
      this.owner.borderLeftStyle.setState(value[0], timing, affinity);
    } else if (value.length === 2) {
      this.owner.borderTopStyle.setState(value[0], timing, affinity);
      this.owner.borderRightStyle.setState(value[1], timing, affinity);
      this.owner.borderBottomStyle.setState(value[0], timing, affinity);
      this.owner.borderLeftStyle.setState(value[1], timing, affinity);
    } else if (value.length === 3) {
      this.owner.borderTopStyle.setState(value[0], timing, affinity);
      this.owner.borderRightStyle.setState(value[1], timing, affinity);
      this.owner.borderBottomStyle.setState(value[2], timing, affinity);
      this.owner.borderLeftStyle.setState(value[1], timing, affinity);
    } else if (value.length === 4) {
      this.owner.borderTopStyle.setState(value[0], timing, affinity);
      this.owner.borderRightStyle.setState(value[1], timing, affinity);
      this.owner.borderBottomStyle.setState(value[2], timing, affinity);
      this.owner.borderLeftStyle.setState(value[3], timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("borderTopStyle", [StyleAnimator({
  propertyNames: "border-top-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderRightStyle", [StyleAnimator({
  propertyNames: "border-right-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderBottomStyle", [StyleAnimator({
  propertyNames: "border-bottom-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderLeftStyle", [StyleAnimator({
  propertyNames: "border-left-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("borderWidth", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Length | null, Length | null, Length | null, Length | null] | Length | null {
    const borderTopWidth = this.owner.borderTopWidth.value;
    const borderRightWidth = this.owner.borderRightWidth.value;
    const borderBottomWidth = this.owner.borderBottomWidth.value;
    const borderLeftWidth = this.owner.borderLeftWidth.value;
    if (Values.equal(borderTopWidth, borderRightWidth)
        && Values.equal(borderRightWidth, borderBottomWidth)
        && Values.equal(borderBottomWidth, borderLeftWidth)) {
      return borderTopWidth;
    }
    return [borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth];
  },
  set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    let borderTopWidth: LengthOrLookLike | null;
    let borderRightWidth: LengthOrLookLike | null;
    let borderBottomWidth: LengthOrLookLike | null;
    let borderLeftWidth: LengthOrLookLike | null;
    if (!Array.isArray(value)) {
      borderTopWidth = value as LengthOrLookLike | null;
      borderRightWidth = value as LengthOrLookLike | null;
      borderBottomWidth = value as LengthOrLookLike | null;
      borderLeftWidth = value as LengthOrLookLike | null;
    } else if (value.length === 1) {
      borderTopWidth = value[0];
      borderRightWidth = value[0];
      borderBottomWidth = value[0];
      borderLeftWidth = value[0];
    } else if (value.length === 2) {
      borderTopWidth = value[0];
      borderRightWidth = value[1];
      borderBottomWidth = value[0];
      borderLeftWidth = value[1];
    } else if (value.length === 3) {
      borderTopWidth = value[0];
      borderRightWidth = value[1];
      borderBottomWidth = value[2];
      borderLeftWidth = value[1];
    } else if (value.length === 4) {
      borderTopWidth = value[0];
      borderRightWidth = value[1];
      borderBottomWidth = value[2];
      borderLeftWidth = value[3];
    } else {
      throw new TypeError("" + value);
    }
    if (borderTopWidth instanceof Look) {
      this.owner.borderTopWidth.setLook(borderTopWidth, timing, affinity);
    } else {
      this.owner.borderTopWidth.setState(borderTopWidth, timing, affinity);
    }
    if (borderRightWidth instanceof Look) {
      this.owner.borderRightWidth.setLook(borderRightWidth, timing, affinity);
    } else {
      this.owner.borderRightWidth.setState(borderRightWidth, timing, affinity);
    }
    if (borderBottomWidth instanceof Look) {
      this.owner.borderBottomWidth.setLook(borderBottomWidth, timing, affinity);
    } else {
      this.owner.borderBottomWidth.setState(borderBottomWidth, timing, affinity);
    }
    if (borderLeftWidth instanceof Look) {
      this.owner.borderLeftWidth.setLook(borderLeftWidth, timing, affinity);
    } else {
      this.owner.borderLeftWidth.setState(borderLeftWidth, timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("borderTopWidth", [LengthStyleAnimator({
  propertyNames: "border-top-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderRightWidth", [LengthStyleAnimator({
  propertyNames: "border-right-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderBottomWidth", [LengthStyleAnimator({
  propertyNames: "border-bottom-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("borderLeftWidth", [LengthStyleAnimator({
  propertyNames: "border-left-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("bottom", [LengthStyleConstraintAnimator({
  propertyNames: "bottom",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctHeightUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("boxShadow", [StyleAnimator({
  propertyNames: "box-shadow",
  valueType: BoxShadow,
  value: null,
})]);

StyleAttribute.defineGetter("boxSizing", [StyleAnimator({
  propertyNames: "box-sizing",
  valueType: String,
})]);

StyleAttribute.defineGetter("color", [StyleAnimator({
  propertyNames: "color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("cursor", [StyleAnimator({
  propertyNames: "cursor",
  valueType: String,
})]);

StyleAttribute.defineGetter("display", [StyleAnimator({
  propertyNames: "display",
  valueType: String,
})]);

StyleAttribute.defineGetter("filter", [StyleAnimator({
  propertyNames: "filter",
  valueType: String,
})]);

StyleAttribute.defineGetter("flexBasis", [StyleAnimator({
  propertyNames: "flex-basis",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("flexDirection", [StyleAnimator({
  propertyNames: "flex-direction",
  valueType: String,
})]);

StyleAttribute.defineGetter("flexGrow", [StyleAnimator({
  propertyNames: "flex-grow",
  valueType: Number,
})]);

StyleAttribute.defineGetter("flexShrink", [StyleAnimator({
  propertyNames: "flex-shrink",
  valueType: Number,
})]);

StyleAttribute.defineGetter("flexWrap", [StyleAnimator({
  propertyNames: "flex-wrap",
  valueType: Number,
})]);

StyleAttribute.defineGetter("font", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): Font | null;
    set(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: FontLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): Font | null {
    const style = this.owner.fontStyle.value;
    const variant = this.owner.fontVariant.value;
    const weight = this.owner.fontWeight.value;
    const stretch = this.owner.fontStretch.value;
    const size = this.owner.fontSize.value;
    const height = this.owner.lineHeight.value;
    const family = this.owner.fontFamily.value;
    if (family === void 0) {
      return null;
    }
    return Font.create(style, variant, weight, stretch, size, height, family);
  },
  set(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: FontLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: FontLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    if (value === null) {
      this.owner.fontStyle.setState(void 0, timing, affinity);
      this.owner.fontVariant.setState(void 0, timing, affinity);
      this.owner.fontWeight.setState(void 0, timing, affinity);
      this.owner.fontStretch.setState(void 0, timing, affinity);
      this.owner.fontSize.setState(null, timing, affinity);
      this.owner.lineHeight.setState(null, timing, affinity);
      this.owner.fontFamily.setState(void 0, timing, affinity);
      return;
    }
    value = Font.fromLike(value);
    this.owner.fontStyle.setState(value.style, timing, affinity);
    this.owner.fontVariant.setState(value.variant, timing, affinity);
    this.owner.fontWeight.setState(value.weight, timing, affinity);
    this.owner.fontStretch.setState(value.stretch, timing, affinity);
    this.owner.fontSize.setState(value.size, timing, affinity);
    this.owner.lineHeight.setState(value.height, timing, affinity);
    this.owner.fontFamily.setState(value.family, timing, affinity);
  },
})]);

StyleAttribute.defineGetter("fontFamily", [StyleAnimator({
  propertyNames: "font-family",
  valueType: FontFamily,
})]);

StyleAttribute.defineGetter("fontSize", [LengthStyleAnimator({
  propertyNames: "font-size",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("fontStretch", [StyleAnimator({
  propertyNames: "font-stretch",
  valueType: String,
})]);

StyleAttribute.defineGetter("fontStyle", [StyleAnimator({
  propertyNames: "font-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("fontVariant", [StyleAnimator({
  propertyNames: "font-variant",
  valueType: String,
})]);

StyleAttribute.defineGetter("fontWeight", [StyleAnimator({
  propertyNames: "font-weight",
  valueType: String,
})]);

StyleAttribute.defineGetter("height", [LengthStyleConstraintAnimator({
  propertyNames: "height",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctHeightUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("justifyContent", [StyleAnimator({
  propertyNames: "justify-content",
  valueType: String,
})]);

StyleAttribute.defineGetter("left", [LengthStyleConstraintAnimator({
  propertyNames: "left",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("lineHeight", [LengthStyleAnimator({
  propertyNames: "line-height",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("margin", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Length | null, Length | null, Length | null, Length | null] | Length | null {
    const marginTop = this.owner.marginTop.value;
    const marginRight = this.owner.marginRight.value;
    const marginBottom = this.owner.marginBottom.value;
    const marginLeft = this.owner.marginLeft.value;
    if (Values.equal(marginTop, marginRight)
        && Values.equal(marginRight, marginBottom)
        && Values.equal(marginBottom, marginLeft)) {
      return marginTop;
    }
    return [marginTop, marginRight, marginBottom, marginLeft];
  },
  set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    let marginTop: LengthOrLookLike | null;
    let marginRight: LengthOrLookLike | null;
    let marginBottom: LengthOrLookLike | null;
    let marginLeft: LengthOrLookLike | null;
    if (!Array.isArray(value)) {
      marginTop = value as LengthOrLookLike | null;
      marginRight = value as LengthOrLookLike | null;
      marginBottom = value as LengthOrLookLike | null;
      marginLeft = value as LengthOrLookLike | null;
    } else if (value.length === 1) {
      marginTop = value[0];
      marginRight = value[0];
      marginBottom = value[0];
      marginLeft = value[0];
    } else if (value.length === 2) {
      marginTop = value[0];
      marginRight = value[1];
      marginBottom = value[0];
      marginLeft = value[1];
    } else if (value.length === 3) {
      marginTop = value[0];
      marginRight = value[1];
      marginBottom = value[2];
      marginLeft = value[1];
    } else if (value.length === 4) {
      marginTop = value[0];
      marginRight = value[1];
      marginBottom = value[2];
      marginLeft = value[3];
    } else {
      throw new TypeError("" + value);
    }
    if (marginTop instanceof Look) {
      this.owner.marginTop.setLook(marginTop, timing, affinity);
    } else {
      this.owner.marginTop.setState(marginTop, timing, affinity);
    }
    if (marginRight instanceof Look) {
      this.owner.marginRight.setLook(marginRight, timing, affinity);
    } else {
      this.owner.marginRight.setState(marginRight, timing, affinity);
    }
    if (marginBottom instanceof Look) {
      this.owner.marginBottom.setLook(marginBottom, timing, affinity);
    } else {
      this.owner.marginBottom.setState(marginBottom, timing, affinity);
    }
    if (marginLeft instanceof Look) {
      this.owner.marginLeft.setLook(marginLeft, timing, affinity);
    } else {
      this.owner.marginLeft.setState(marginLeft, timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("marginTop", [LengthStyleConstraintAnimator({
  propertyNames: "margin-top",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("marginRight", [LengthStyleConstraintAnimator({
  propertyNames: "margin-right",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("marginBottom", [LengthStyleConstraintAnimator({
  propertyNames: "margin-bottom",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("marginLeft", [LengthStyleConstraintAnimator({
  propertyNames: "margin-left",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("maxHeight", [LengthStyleAnimator({
  propertyNames: "max-height",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("maxWidth", [LengthStyleAnimator({
  propertyNames: "max-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("minHeight", [LengthStyleAnimator({
  propertyNames: "min-height",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("minWidth", [LengthStyleAnimator({
  propertyNames: "min-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("opacity", [StyleAnimator({
  propertyNames: "opacity",
  valueType: Number,
})]);

StyleAttribute.defineGetter("order", [StyleAnimator({
  propertyNames: "order",
  valueType: Number,
})]);

StyleAttribute.defineGetter("outlineColor", [StyleAnimator({
  propertyNames: "outline-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("outlineOffset", [LengthStyleAnimator({
  propertyNames: "outline-offset",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("outlineStyle", [StyleAnimator({
  propertyNames: "outline-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("outlineWidth", [LengthStyleAnimator({
  propertyNames: "outline-width",
  valueType: Length,
  value: null,
})]);

StyleAttribute.defineGetter("overflow", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Overflow | undefined, Overflow | undefined] | Overflow | undefined;
    set(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Overflow | undefined, Overflow | undefined] | Overflow | undefined {
    const overflowX = this.owner.overflowX.value;
    const overflowY = this.owner.overflowY.value;
    if (overflowX === overflowY) {
      return overflowX;
    }
    return [overflowX, overflowY];
  },
  set(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [Overflow | undefined, (Overflow | undefined)?] | Overflow | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    if (!Array.isArray(value)) {
      this.owner.overflowX.setState(value as Overflow | undefined, timing, affinity);
      this.owner.overflowY.setState(value as Overflow | undefined, timing, affinity);
    } else if (value.length === 1) {
      this.owner.overflowX.setState(value[0], timing, affinity);
      this.owner.overflowY.setState(value[0], timing, affinity);
    } else if (value.length === 2) {
      this.owner.overflowX.setState(value[0], timing, affinity);
      this.owner.overflowY.setState(value[1], timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("overflowX", [StyleAnimator({
  propertyNames: "overflow-x",
  valueType: String,
})]);

StyleAttribute.defineGetter("overflowY", [StyleAnimator({
  propertyNames: "overflow-y",
  valueType: String,
})]);

StyleAttribute.defineGetter("overflowScrolling", [StyleAnimator({
  propertyNames: "-webkit-overflow-scrolling",
  valueType: String,
})]);

StyleAttribute.defineGetter("overscrollBehavior", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined;
    set(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [OverscrollBehavior | undefined, OverscrollBehavior | undefined] | OverscrollBehavior | undefined {
    const overscrollBehaviorX = this.owner.overscrollBehaviorX.value;
    const overscrollBehaviorY = this.owner.overscrollBehaviorY.value;
    if (overscrollBehaviorX === overscrollBehaviorY) {
      return overscrollBehaviorX;
    }
    return [overscrollBehaviorX, overscrollBehaviorY];
  },
  set(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [OverscrollBehavior | undefined, (OverscrollBehavior | undefined)?] | OverscrollBehavior | undefined, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    if (!Array.isArray(value)) {
      this.owner.overscrollBehaviorX.setState(value as OverscrollBehavior | undefined, timing, affinity);
      this.owner.overscrollBehaviorY.setState(value as OverscrollBehavior | undefined, timing, affinity);
    } else if (value.length === 1) {
      this.owner.overscrollBehaviorX.setState(value[0], timing, affinity);
      this.owner.overscrollBehaviorY.setState(value[0], timing, affinity);
    } else if (value.length === 2) {
      this.owner.overscrollBehaviorX.setState(value[0], timing, affinity);
      this.owner.overscrollBehaviorY.setState(value[1], timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("overscrollBehaviorX", [StyleAnimator({
  propertyNames: "overscroll-behavior-x",
  valueType: String,
})]);

StyleAttribute.defineGetter("overscrollBehaviorY", [StyleAnimator({
  propertyNames: "overscroll-behavior-y",
  valueType: String,
})]);

StyleAttribute.defineGetter("padding", [Fastener<Fastener<StyleAttribute<unknown>> & {
    get(): [Length | null, Length | null, Length | null, Length | null] | Length | null;
    set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute;
    setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void;
  }>({
  get(): [Length | null, Length | null, Length | null, Length | null] | Length | null {
    const paddingTop = this.owner.paddingTop.value;
    const paddingRight = this.owner.paddingRight.value;
    const paddingBottom = this.owner.paddingBottom.value;
    const paddingLeft = this.owner.paddingLeft.value;
    if (Values.equal(paddingTop, paddingRight)
        && Values.equal(paddingRight, paddingBottom)
        && Values.equal(paddingBottom, paddingLeft)) {
      return paddingTop;
    }
    return [paddingTop, paddingRight, paddingBottom, paddingLeft];
  },
  set(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Extrinsic);
    return this.owner;
  },
  setIntrinsic(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing?: TimingLike | boolean | null): StyleAttribute {
    this.setState(value, timing, Affinity.Intrinsic);
    return this.owner;
  },
  setState(value: readonly [LengthOrLookLike | null, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?, (LengthOrLookLike | null)?] | LengthOrLookLike | null, timing: TimingLike | boolean | null | undefined, affinity: Affinity): void {
    let paddingTop: LengthOrLookLike | null;
    let paddingRight: LengthOrLookLike | null;
    let paddingBottom: LengthOrLookLike | null;
    let paddingLeft: LengthOrLookLike | null;
    if (!Array.isArray(value)) {
      paddingTop = value as LengthOrLookLike | null;
      paddingRight = value as LengthOrLookLike | null;
      paddingBottom = value as LengthOrLookLike | null;
      paddingLeft = value as LengthOrLookLike | null;
    } else if (value.length === 1) {
      paddingTop = value[0];
      paddingRight = value[0];
      paddingBottom = value[0];
      paddingLeft = value[0];
    } else if (value.length === 2) {
      paddingTop = value[0];
      paddingRight = value[1];
      paddingBottom = value[0];
      paddingLeft = value[1];
    } else if (value.length === 3) {
      paddingTop = value[0];
      paddingRight = value[1];
      paddingBottom = value[2];
      paddingLeft = value[1];
    } else if (value.length === 4) {
      paddingTop = value[0];
      paddingRight = value[1];
      paddingBottom = value[2];
      paddingLeft = value[3];
    } else {
      throw new TypeError("" + value);
    }
    if (paddingTop instanceof Look) {
      this.owner.paddingTop.setLook(paddingTop, timing, affinity);
    } else {
      this.owner.paddingTop.setState(paddingTop, timing, affinity);
    }
    if (paddingRight instanceof Look) {
      this.owner.paddingRight.setLook(paddingRight, timing, affinity);
    } else {
      this.owner.paddingRight.setState(paddingRight, timing, affinity);
    }
    if (paddingBottom instanceof Look) {
      this.owner.paddingBottom.setLook(paddingBottom, timing, affinity);
    } else {
      this.owner.paddingBottom.setState(paddingBottom, timing, affinity);
    }
    if (paddingLeft instanceof Look) {
      this.owner.paddingLeft.setLook(paddingLeft, timing, affinity);
    } else {
      this.owner.paddingLeft.setState(paddingLeft, timing, affinity);
    }
  },
})]);

StyleAttribute.defineGetter("paddingTop", [LengthStyleConstraintAnimator({
  propertyNames: "padding-top",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("paddingRight", [LengthStyleConstraintAnimator({
  propertyNames: "padding-right",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("paddingBottom", [LengthStyleConstraintAnimator({
  propertyNames: "padding-bottom",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("paddingLeft", [LengthStyleConstraintAnimator({
  propertyNames: "padding-left",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("pointerEvents", [StyleAnimator({
  propertyNames: "pointer-events",
  valueType: String,
})]);

StyleAttribute.defineGetter("position", [StyleAnimator({
  propertyNames: "position",
  valueType: String,
})]);

StyleAttribute.defineGetter("right", [LengthStyleConstraintAnimator({
  propertyNames: "right",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("textAlign", [StyleAnimator({
  propertyNames: "text-align",
  valueType: String,
})]);

StyleAttribute.defineGetter("textDecorationColor", [StyleAnimator({
  propertyNames: "text-decoration-color",
  valueType: Color,
  value: null,
})]);

StyleAttribute.defineGetter("textDecorationLine", [StyleAnimator({
  propertyNames: "text-decoration-line",
  valueType: String,
})]);

StyleAttribute.defineGetter("textDecorationStyle", [StyleAnimator({
  propertyNames: "text-decoration-style",
  valueType: String,
})]);

StyleAttribute.defineGetter("textOverflow", [StyleAnimator({
  propertyNames: "text-overflow",
  valueType: String,
})]);

StyleAttribute.defineGetter("textTransform", [StyleAnimator({
  propertyNames: "text-transform",
  valueType: String,
})]);

StyleAttribute.defineGetter("top", [LengthStyleConstraintAnimator({
  propertyNames: "top",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctHeightUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("touchAction", [StyleAnimator({
  propertyNames: "touch-action",
  valueType: String,
})]);

StyleAttribute.defineGetter("transform", [StyleAnimator({
  propertyNames: "transform",
  valueType: Transform,
  value: null,
})]);

StyleAttribute.defineGetter("userSelect", [StyleAnimator({
  propertyNames: ["user-select", "-webkit-user-select", "-moz-user-select", "-ms-user-select"],
  valueType: String,
})]);

StyleAttribute.defineGetter("verticalAlign", [StyleAnimator({
  propertyNames: "vertical-align",
  valueType: String,
})]);

StyleAttribute.defineGetter("visibility", [StyleAnimator({
  propertyNames: "visibility",
  valueType: String,
})]);

StyleAttribute.defineGetter("whiteSpace", [StyleAnimator({
  propertyNames: "white-space",
  valueType: String,
})]);

StyleAttribute.defineGetter("width", [LengthStyleConstraintAnimator({
  propertyNames: "width",
  valueType: Length,
  value: null,
  get pctUnit(): number {
    return StyleAttribute.pctWidthUnit(this.owner.node);
  },
})]);

StyleAttribute.defineGetter("zIndex", [StyleAnimator({
  propertyNames: "z-index",
  valueType: Number,
})]);
