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

import {__extends} from "tslib";
import {Mutable, Arrays} from "@swim/util";
import type {AnyTiming} from "@swim/mapping";
import type {
  AnyConstraintExpression,
  ConstraintVariable,
  ConstraintBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import type {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import type {AnimationTrack, AnimationTimeline} from "@swim/view";
import {CssContext} from "./CssContext";
import {
  StyleRuleDescriptorExtends,
  StyleRuleDescriptor,
  StyleRuleConstructor,
  StyleRule,
} from "../"; // forward import
import {
  MediaRuleDescriptorExtends,
  MediaRuleDescriptor,
  MediaRuleConstructor,
  MediaRule,
} from "../"; // forward import

export type CssRuleType = "style" | "media";

export interface CssRuleInit {
  extends?: CssRuleClass;
  type?: CssRuleType;

  css?: string | (() => string | undefined);

  initRule?(rule: CSSRule): CSSRule;
}

export type CssRuleDescriptor<V extends CssContext, I = {}> = CssRuleInit & ThisType<CssRule<V> & I> & Partial<I>;

export type CssRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: CssRuleClass | undefined} & CssRuleDescriptor<V, I>;

export interface CssRuleConstructor<V extends CssContext, I = {}> {
  new(owner: V, ruleName: string | undefined): CssRule<V> & I;
  prototype: CssRule<any> & I;
}

export interface CssRuleClass extends Function {
  readonly prototype: CssRule<any>;
}

export interface CssRule<V extends CssContext> extends AnimationTrack, AnimationTimeline, ConstraintScope {
  readonly name: string | undefined;

  readonly owner: V;

  readonly rule: CSSRule;

  onAnimate(t: number): void;

  /** @hidden */
  updateAnimations(t: number): void;

  /** @hidden */
  readonly animationTracks: ReadonlyArray<AnimationTrack>;

  trackWillStartAnimating(track: AnimationTrack): void;

  trackDidStartAnimating(track: AnimationTrack): void;

  trackWillStopAnimating(track: AnimationTrack): void;

  trackDidStopAnimating(track: AnimationTrack): void;

  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintBinding;

  hasConstraintVariable(variable: ConstraintVariable): boolean;

  addConstraintVariable(variable: ConstraintVariable): void;

  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  initCss?(): string | undefined;

  /** @hidden */
  createRule(cssText?: string): CSSRule;

  /** @hidden */
  initRule?(rule: CSSRule): CSSRule;
}

export const CssRule = function <V extends CssContext>(
    this: CssRule<V> | typeof CssRule,
    owner: V | CssRuleDescriptor<V>,
    ruleName?: string,
  ): CssRule<V> | PropertyDecorator {
  if (this instanceof CssRule) { // constructor
    return CssRuleConstructor.call(this, owner as V, ruleName) as CssRule<V>;
  } else { // decorator factory
    return CssRuleDecoratorFactory(owner as CssRuleDescriptor<V>);
  }
} as {
  /** @hidden */
  new<V extends CssContext>(owner: V, ruleName: string | undefined): CssRule<V>;

  <V extends CssContext, I = {}>(descriptor: {type: "style"} & StyleRuleDescriptorExtends<V, I>): PropertyDecorator;
  <V extends CssContext>(descriptor: {type: "style"} & StyleRuleDescriptor<V>): PropertyDecorator;

  <V extends CssContext, I = {}>(descriptor: {type: "media"} & MediaRuleDescriptorExtends<V, I>): PropertyDecorator;
  <V extends CssContext>(descriptor: {type: "media"} & MediaRuleDescriptor<V>): PropertyDecorator;

  <V extends CssContext, I = {}>(descriptor: CssRuleDescriptorExtends<V, I>): PropertyDecorator;
  <V extends CssContext>(descriptor: CssRuleDescriptor<V>): PropertyDecorator;

  /** @hidden */
  prototype: CssRule<any>;

  define<V extends CssContext, I = {}>(descriptor: {type: "style"} & StyleRuleDescriptorExtends<V, I>): StyleRuleConstructor<V, I>;
  define<V extends CssContext>(descriptor: {type: "style"} & StyleRuleDescriptor<V>): StyleRuleConstructor<V>;

  define<V extends CssContext, I = {}>(descriptor: {type: "media"} & MediaRuleDescriptorExtends<V, I>): MediaRuleConstructor<V, I>;
  define<V extends CssContext>(descriptor: {type: "media"} & MediaRuleDescriptor<V>): MediaRuleConstructor<V>;

  define<V extends CssContext, I = {}>(descriptor: CssRuleDescriptorExtends<V, I>): CssRuleConstructor<V, I>;
  define<V extends CssContext>(descriptor: CssRuleDescriptor<V>): CssRuleConstructor<V>;
};
__extends(CssRule, Object);

function CssRuleConstructor<V extends CssContext>(this: CssRule<V>, owner: V, ruleName: string | undefined): CssRule<V> {
  if (ruleName !== void 0) {
    Object.defineProperty(this, "name", {
      value: ruleName,
      enumerable: true,
      configurable: true,
    });
  }
  (this as Mutable<typeof this>).owner = owner;
  (this as Mutable<typeof this>).animationTracks = Arrays.empty;
  return this;
}

function CssRuleDecoratorFactory<V extends CssContext>(descriptor: CssRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, CssRule.define(descriptor as CssRuleDescriptor<CssContext>));
}

CssRule.prototype.onAnimate = function (this: CssRule<CssContext>, t: number): void {
  this.updateAnimations(t);
};

CssRule.prototype.updateAnimations = function (t: number): void {
  const animationTracks = this.animationTracks;
  for (let i = 0, n = animationTracks.length; i < n; i += 1) {
    const track = animationTracks[i]!;
    track.onAnimate(t);
  }
};

CssRule.prototype.trackWillStartAnimating = function (track: AnimationTrack): void {
  const oldTracks = this.animationTracks;
  const newTracks = Arrays.inserted(track, oldTracks);
  if (oldTracks !== newTracks) {
    (this as Mutable<typeof this>).animationTracks = newTracks;
    if (oldTracks.length === 0) {
      this.owner.trackWillStartAnimating(this);
      this.owner.trackDidStartAnimating(this);
    }
  }
};

CssRule.prototype.trackDidStartAnimating = function (track: AnimationTrack): void {
  // hook
};

CssRule.prototype.trackWillStopAnimating = function (track: AnimationTrack): void {
  // hook
};

CssRule.prototype.trackDidStopAnimating = function (track: AnimationTrack): void {
  const oldTracks = this.animationTracks;
  const newTracks = Arrays.removed(track, oldTracks);
  if (oldTracks !== newTracks) {
    (this as Mutable<typeof this>).animationTracks = newTracks;
    if (newTracks.length === 0) {
      this.owner.trackWillStopAnimating(this);
      this.owner.trackDidStopAnimating(this);
    }
  }
};

CssRule.prototype.constraint = function (this: CssRule<CssContext>, lhs: AnyConstraintExpression, relation: ConstraintRelation,
                                         rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
  return this.owner.constraint(lhs, relation, rhs, strength);
};

CssRule.prototype.hasConstraint = function (this: CssRule<CssContext>, constraint: Constraint): boolean {
  return this.owner.hasConstraint(constraint);
};

CssRule.prototype.addConstraint = function (this: CssRule<CssContext>, constraint: Constraint): void {
  this.owner.addConstraint(constraint);
};

CssRule.prototype.removeConstraint = function (this: CssRule<CssContext>, constraint: Constraint): void {
  this.owner.removeConstraint(constraint);
};

CssRule.prototype.constraintVariable = function (this: CssRule<CssContext>, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintBinding {
  return this.owner.constraintVariable(name, value, strength);
};

CssRule.prototype.hasConstraintVariable = function (this: CssRule<CssContext>, constraintVariable: ConstraintVariable): boolean {
  return this.owner.hasConstraintVariable(constraintVariable);
};

CssRule.prototype.addConstraintVariable = function (this: CssRule<CssContext>, constraintVariable: ConstraintVariable): void {
  this.owner.addConstraintVariable(constraintVariable);
};

CssRule.prototype.removeConstraintVariable = function (this: CssRule<CssContext>, constraintVariable: ConstraintVariable): void {
  this.owner.removeConstraintVariable(constraintVariable);
};

CssRule.prototype.setConstraintVariable = function (this: CssRule<CssContext>, constraintVariable: ConstraintVariable, state: number): void {
  this.owner.setConstraintVariable(constraintVariable, state);
};

CssRule.prototype.getLook = function <T>(this: CssRule<CssContext>, look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
  return this.owner.getLook(look, mood);
};

CssRule.prototype.getLookOr = function <T, E>(this: CssRule<CssContext>, look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
  if (arguments.length === 2) {
    return this.owner.getLookOr(look, mood as E);
  } else {
    return this.owner.getLookOr(look, mood as MoodVector<Feel> | null, elseValue!);
  }
};

CssRule.prototype.applyTheme = function (theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void {
  // hook
};

CssRule.prototype.mount = function (): void {
  // hook
};

CssRule.prototype.unmount = function (): void {
  // hook
};

CssRule.prototype.createRule = function (this: CssRule<CssContext>, cssText?: string): CSSRule {
  if (cssText !== void 0) {
    const index = this.owner.insertRule(cssText);
    const rule = this.owner.getRule(index);
    if (rule instanceof CSSRule) {
      return rule;
    } else {
      throw new TypeError("" + rule);
    }
  } else {
    throw new Error("undefined css rule");
  }
};

CssRule.define = function <V extends CssContext, I>(descriptor: CssRuleDescriptor<V, I>): CssRuleConstructor<V, I> {
  const type = descriptor.type;
  delete descriptor.type;

  if (type === void 0 || type === "style") {
    return StyleRule.define(descriptor as unknown as StyleRuleDescriptor<V>) as unknown as CssRuleConstructor<V, I>;
  } else if (type === "media") {
    return MediaRule.define(descriptor as unknown as MediaRuleDescriptor<V>) as unknown as CssRuleConstructor<V, I>;
  } else {
    let _super = descriptor.extends;
    let css = descriptor.css;
    delete descriptor.extends;
    delete descriptor.css;

    if (_super === void 0) {
      _super = CssRule;
    }

    const _constructor = function DecoratedCssRule(this: CssRule<V>, owner: V, ruleName: string | undefined): CssRule<V> {
      const _this: CssRule<V> = _super!.call(this, owner, ruleName) || this;
      let cssText: string | undefined;
      if (css !== void 0) {
        cssText = css as string;
      } else if (_this.initCss !== void 0) {
        cssText = _this.initCss();
      }
      let rule = _this.createRule(cssText);
      if (_this.initRule !== void 0) {
        rule = _this.initRule(rule);
      }
      (_this as Mutable<typeof _this>).rule = rule;
      return _this;
    } as unknown as CssRuleConstructor<V, I>;

    const _prototype = descriptor as unknown as CssRule<V> & I;
    Object.setPrototypeOf(_constructor, _super);
    _constructor.prototype = _prototype;
    _constructor.prototype.constructor = _constructor;
    Object.setPrototypeOf(_constructor.prototype, _super.prototype);

    if (typeof css === "function") {
      _prototype.initCss = css;
      css = void 0;
    }

    return _constructor;
  }
};
