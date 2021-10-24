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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
import {FastenerContext, FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/fastener";
import type {
  AnyConstraintExpression,
  ConstraintVariable,
  ConstraintProperty,
  ConstraintRelation,
  AnyConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import {Look, Feel, Mood, MoodVector, ThemeMatrix, ThemeContext} from "@swim/theme";
import type {CssContext} from "./CssContext";
import {CssRule} from "./CssRule";

export interface StyleSheetInit extends FastenerInit {
  extends?: {prototype: StyleSheet<any>} | string | boolean | null;
  css?: string | (() => string | undefined);

  createStylesheet?(): CSSStyleSheet;
  initStylesheet?(stylesheet: CSSStyleSheet): void;
}

export type StyleSheetDescriptor<O = unknown, I = {}> = ThisType<StyleSheet<O> & I> & StyleSheetInit & Partial<I>;

export interface StyleSheetClass<F extends StyleSheet<any> = StyleSheet<any>> extends FastenerClass<F> {
}

export interface StyleSheetFactory<F extends StyleSheet<any> = StyleSheet<any>> extends StyleSheetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): StyleSheetFactory<F> & I;

  define<O>(className: string, descriptor: StyleSheetDescriptor<O>): StyleSheetFactory<StyleSheet<any>>;
  define<O, I = {}>(className: string, descriptor: StyleSheetDescriptor<O, I>): StyleSheetFactory<StyleSheet<any> & I>;

  <O>(descriptor: StyleSheetDescriptor<O>): PropertyDecorator;
  <O, I = {}>(descriptor: StyleSheetDescriptor<O, I>): PropertyDecorator;
}

export interface StyleSheet<O = unknown> extends Fastener<O>, FastenerContext, ConstraintScope, ThemeContext, CssContext {
  /** @override */
  get familyType(): Class<StyleSheet<any>> | null;

  readonly stylesheet: CSSStyleSheet;

  /** @override */
  getRule(index: number): CSSRule | null;

  /** @override */
  insertRule(cssText: string, index?: number): number;

  /** @override */
  removeRule(index: number): void;

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean;

  /** @override */
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  /** @override */
  setFastener(fastenerName: string, fastener: Fastener | null): void;

  /** @override */
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  /** @internal @override */
  getSuperFastener(): Fastener | null;

  /** @internal @protected */
  mountFasteners(): void;

  /** @internal @protected */
  unmountFasteners(): void;

  /** @override */
  requireUpdate(updateFlags: number): void;

  /** @internal */
  readonly decoherent: ReadonlyArray<Fastener> | null;

  /** @override */
  decohereFastener(fastener: Fastener): void;

  /** @override */
  recohere(t: number): void

  /** @internal @protected */
  recohereFasteners(t: number): void

  /** @override */
  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  /** @override */
  hasConstraint(constraint: Constraint): boolean;

  /** @override */
  addConstraint(constraint: Constraint): void;

  /** @override */
  removeConstraint(constraint: Constraint): void;

  /** @override */
  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number>;

  /** @override */
  hasConstraintVariable(variable: ConstraintVariable): boolean;

  /** @override */
  addConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @override */
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal */
  createStylesheet(): CSSStyleSheet;

  /** @internal */
  initStylesheet?(stylesheet: CSSStyleSheet): void;

  /** @internal */
  initCss?(): string | undefined;
}

export const StyleSheet = (function (_super: typeof Fastener) {
  const StyleSheet: StyleSheetFactory = _super.extend("StyleSheet");

  Object.defineProperty(StyleSheet.prototype, "familyType", {
    get: function (this: StyleSheet): Class<StyleSheet<any>> | null {
      return StyleSheet;
    },
    configurable: true,
  });

  StyleSheet.prototype.getRule = function (this: StyleSheet, index: number): CSSRule | null {
    return this.stylesheet.cssRules.item(index);
  };

  StyleSheet.prototype.insertRule = function (this: StyleSheet, cssText: string, index?: number): number {
    return this.stylesheet.insertRule(cssText, index);
  };

  StyleSheet.prototype.removeRule = function (this: StyleSheet, index: number): void {
    this.stylesheet.deleteRule(index);
  };

  StyleSheet.prototype.hasFastener = function (this: StyleSheet, fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return true;
      }
    }
    return false;
  };

  StyleSheet.prototype.getFastener = function (this: StyleSheet, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return fastener;
      }
    }
    return null;
  };

  StyleSheet.prototype.setFastener = function (this: StyleSheet, fastenerName: string, newFastener: Fastener | null): void {
    let fasteners = this.fasteners;
    if (fasteners === null) {
      fasteners = {};
      (this as Mutable<typeof this>).fasteners = fasteners;
    }
    const oldFastener = fasteners[fastenerName];
    if (oldFastener !== void 0 && this.mounted) {
      oldFastener.unmount();
    }
    if (newFastener !== null) {
      fasteners[fastenerName] = newFastener;
      if (this.mounted) {
        newFastener.mount();
      }
    } else {
      delete fasteners[fastenerName];
    }
  };

  StyleSheet.prototype.getLazyFastener = function (this: StyleSheet, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  };

  StyleSheet.prototype.getSuperFastener = function (this: StyleSheet, fastenerName?: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    if (arguments.length === 0) {
      return _super.prototype.getSuperFastener.call(this);
    } else {
      return null;
    }
  };

  StyleSheet.prototype.mountFasteners = function (this: StyleSheet): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.mount();
    }
    FastenerContext.init(this);
  };

  StyleSheet.prototype.unmountFasteners = function (this: StyleSheet): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.unmount();
    }
  };

  StyleSheet.prototype.requireUpdate = function (this: StyleSheet, updateFlags: number): void {
    const fastenerContext = this.owner;
    if (FastenerContext.has(fastenerContext, "requireUpdate")) {
      fastenerContext.requireUpdate(updateFlags);
    }
  };

  StyleSheet.prototype.decohereFastener = function (this: StyleSheet, fastener: Fastener): void {
    let decoherent = this.decoherent as Fastener[];
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<typeof this>).decoherent = decoherent;
    }
    decoherent.push(fastener);

    if (this.coherent) {
      this.setCoherent(false);
      this.decohere();
    }
  };

  StyleSheet.prototype.recohereFasteners = function (this: StyleSheet, t: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        (this as Mutable<typeof this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          fastener.recohere(t);
        }
      }
    }
  };

  StyleSheet.prototype.recohere = function (this: StyleSheet, t: number): void {
    this.recohereFasteners(t);
    if (this.decoherent === null || this.decoherent.length === 0) {
      this.setCoherent(true);
    } else {
      this.setCoherent(false);
      this.decohere();
    }
  };

  StyleSheet.prototype.constraint = function (this: StyleSheet<ConstraintScope>, lhs: AnyConstraintExpression, relation: ConstraintRelation,
                                              rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
    return this.owner.constraint(lhs, relation, rhs, strength);
  };

  StyleSheet.prototype.hasConstraint = function (this: StyleSheet<ConstraintScope>, constraint: Constraint): boolean {
    return this.owner.hasConstraint(constraint);
  };

  StyleSheet.prototype.addConstraint = function (this: StyleSheet<ConstraintScope>, constraint: Constraint): void {
    this.owner.addConstraint(constraint);
  };

  StyleSheet.prototype.removeConstraint = function (this: StyleSheet<ConstraintScope>, constraint: Constraint): void {
    this.owner.removeConstraint(constraint);
  };

  StyleSheet.prototype.constraintVariable = function (this: StyleSheet<ConstraintScope>, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    return this.owner.constraintVariable(name, value, strength);
  };

  StyleSheet.prototype.hasConstraintVariable = function (this: StyleSheet<ConstraintScope>, constraintVariable: ConstraintVariable): boolean {
    return this.owner.hasConstraintVariable(constraintVariable);
  };

  StyleSheet.prototype.addConstraintVariable = function (this: StyleSheet<ConstraintScope>, constraintVariable: ConstraintVariable): void {
    this.owner.addConstraintVariable(constraintVariable);
  };

  StyleSheet.prototype.removeConstraintVariable = function (this: StyleSheet<ConstraintScope>, constraintVariable: ConstraintVariable): void {
    this.owner.removeConstraintVariable(constraintVariable);
  };

  StyleSheet.prototype.setConstraintVariable = function (this: StyleSheet<ConstraintScope>, constraintVariable: ConstraintVariable, state: number): void {
    this.owner.setConstraintVariable(constraintVariable, state);
  };

  StyleSheet.prototype.getLook = function <T>(this: StyleSheet, look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const themeContext = this.owner;
    if (ThemeContext.is(themeContext)) {
      return themeContext.getLook(look, mood);
    } else {
      return void 0;
    }
  };

  StyleSheet.prototype.getLookOr = function <T, E>(this: StyleSheet, look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    const themeContext = this.owner;
    if (ThemeContext.is(themeContext)) {
      if (arguments.length === 2) {
        return themeContext.getLookOr(look, mood as E);
      } else {
        return themeContext.getLookOr(look, mood as MoodVector<Feel> | null, elseValue!);
      }
    } else if (arguments.length === 2) {
      return mood as E;
    } else {
      return elseValue!;
    }
  };

  StyleSheet.prototype.applyTheme = function (this: StyleSheet, theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void {
    if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof CssRule) {
        fastener.applyTheme(theme, mood, timing);
      }
    }
  };

  StyleSheet.prototype.onMount = function (this: StyleSheet): void {
    _super.prototype.onMount.call(this);
    this.mountFasteners();
  };

  StyleSheet.prototype.onUnmount = function (this: StyleSheet): void {
    this.unmountFasteners();
    _super.prototype.onUnmount.call(this);
  };

  StyleSheet.prototype.createStylesheet = function (this: StyleSheet): CSSStyleSheet {
    return new CSSStyleSheet();
  };

  StyleSheet.construct = function <F extends StyleSheet<any>>(sheetClass: {prototype: F}, sheet: F | null, owner: FastenerOwner<F>): F {
    sheet = _super.construct(sheetClass, sheet, owner) as F;
    (sheet as Mutable<typeof sheet>).fasteners = null;
    (sheet as Mutable<typeof sheet>).decoherent = null;
    (sheet as Mutable<typeof sheet>).stylesheet = null as unknown as CSSStyleSheet;
    return sheet;
  };

  StyleSheet.define = function <O>(className: string, descriptor: StyleSheetDescriptor<O>): StyleSheetFactory<StyleSheet<any>> {
    let superClass = descriptor.extends as StyleSheetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let css = descriptor.css;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.css;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const sheetClass = superClass.extend(className, descriptor);

    if (typeof css === "function") {
      sheetClass.prototype.initCss = css;
      css = void 0;
    }

    sheetClass.construct = function (sheetClass: {prototype: StyleSheet<any>}, sheet: StyleSheet<O> | null, owner: O): StyleSheet<O> {
      sheet = superClass!.construct(sheetClass, sheet, owner);

      if (affinity !== void 0) {
        sheet.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        sheet.initInherits(inherits);
      }

      //let cssText: string | undefined;
      //if (css !== void 0) {
      //  cssText = css as string;
      //} else if (sheet.initCss !== void 0) {
      //  cssText = sheet.initCss();
      //}

      (sheet as Mutable<typeof sheet>).stylesheet = sheet.createStylesheet();
      if (sheet.initStylesheet !== void 0) {
        sheet.initStylesheet(sheet.stylesheet);
      }

      return sheet;
    };

    return sheetClass;
  };

  return StyleSheet;
})(Fastener);
