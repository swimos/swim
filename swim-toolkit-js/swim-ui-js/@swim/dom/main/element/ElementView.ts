// Copyright 2015-2021 Swim inc.
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

import {Arrays} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {R2Box} from "@swim/math";
import {Look, Feel, MoodVectorUpdates, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";
import {ToAttributeString, ToStyleString, ToCssValue} from "@swim/style";
import {
  ViewContextType,
  ViewPrecedence,
  ViewPrototype,
  ViewConstructor,
  View,
  ViewObserverType,
  ViewProperty,
  ViewAnimator,
} from "@swim/view";
import {StyleContextPrototype, StyleContext} from "../style/StyleContext";
import type {StyleAnimator} from "../style/StyleAnimator";
import {NodeViewInit, NodeViewConstructor, NodeView} from "../node/NodeView";
import type {AttributeAnimatorConstructor, AttributeAnimator} from "../attribute/AttributeAnimator";
import type {
  ElementViewObserver,
  ElementViewObserverCache,
  ViewWillSetAttribute,
  ViewDidSetAttribute,
  ViewWillSetStyle,
  ViewDidSetStyle,
} from "./ElementViewObserver";
import type {ElementViewController} from "./ElementViewController";

export interface ViewElement extends Element, ElementCSSInlineStyle {
  view?: ElementView;
}

export type ElementViewMemberType<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, any> ? T :
  V[K] extends ViewAnimator<any, infer T, any> ? T :
  V[K] extends StyleAnimator<any, infer T, any> ? T :
  V[K] extends AttributeAnimator<any, infer T, any> ? T :
  never;

export type ElementViewMemberInit<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, infer U> ? T | U :
  V[K] extends ViewAnimator<any, infer T, infer U> ? T | U :
  V[K] extends StyleAnimator<any, infer T, infer U> ? T | U :
  V[K] extends AttributeAnimator<any, infer T, infer U> ? T | U :
  never;

export type ElementViewMemberKey<V, K extends keyof V> =
  V[K] extends ViewProperty<any, any> ? K :
  V[K] extends ViewAnimator<any, any> ? K :
  V[K] extends StyleAnimator<any, any> ? K :
  V[K] extends AttributeAnimator<any, any> ? K :
  never;

export type ElementViewMemberMap<V> = {
  -readonly [K in keyof V as ElementViewMemberKey<V, K>]?: ElementViewMemberInit<V, K>;
};

export interface ElementViewInit extends NodeViewInit {
  viewController?: ElementViewController;
  id?: string;
  classList?: string[];
  mood?: MoodVector;
  moodModifier?: MoodMatrix;
  theme?: ThemeMatrix;
  themeModifier?: MoodMatrix;
}

export interface ElementViewPrototype extends ViewPrototype, StyleContextPrototype {
  /** @hidden */
  attributeAnimatorConstructors?: {[animatorName: string]: AttributeAnimatorConstructor<ElementView, unknown> | undefined};
}

export interface ElementViewConstructor<V extends ElementView = ElementView> extends NodeViewConstructor<V> {
  readonly tag: string;
  readonly namespace?: string;
}

export class ElementView extends NodeView implements StyleContext {
  constructor(node: Element) {
    super(node);
    Object.defineProperty(this, "attributeAnimators", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "styleAnimators", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly node!: Element & ElementCSSInlineStyle;

  override readonly viewController!: ElementViewController | null;

  override readonly viewObservers!: ReadonlyArray<ElementViewObserver>;

  override initView(init: ElementViewInit): void {
    super.initView(init);
    if (init.id !== void 0) {
      this.id(init.id);
    }
    if (init.classList !== void 0) {
      this.addClass(...init.classList);
    }
    if (init.mood !== void 0) {
      this.mood(init.mood);
    }
    if (init.moodModifier !== void 0) {
      this.moodModifier(init.moodModifier);
    }
    if (init.theme !== void 0) {
      this.theme(init.theme);
    }
    if (init.themeModifier !== void 0) {
      this.themeModifier(init.themeModifier);
    }
  }

  /** @hidden */
  override readonly viewObserverCache!: ElementViewObserverCache<this>;

  protected override onAddViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onAddViewObserver(viewObserver);
    if (viewObserver.viewWillSetAttribute !== void 0) {
      this.viewObserverCache.viewWillSetAttributeObservers = Arrays.inserted(viewObserver as ViewWillSetAttribute, this.viewObserverCache.viewWillSetAttributeObservers);
    }
    if (viewObserver.viewDidSetAttribute !== void 0) {
      this.viewObserverCache.viewDidSetAttributeObservers = Arrays.inserted(viewObserver as ViewDidSetAttribute, this.viewObserverCache.viewDidSetAttributeObservers);
    }
    if (viewObserver.viewWillSetStyle !== void 0) {
      this.viewObserverCache.viewWillSetStyleObservers = Arrays.inserted(viewObserver as ViewWillSetStyle, this.viewObserverCache.viewWillSetStyleObservers);
    }
    if (viewObserver.viewDidSetStyle !== void 0) {
      this.viewObserverCache.viewDidSetStyleObservers = Arrays.inserted(viewObserver as ViewDidSetStyle, this.viewObserverCache.viewDidSetStyleObservers);
    }
  }

  protected override onRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onRemoveViewObserver(viewObserver);
    if (viewObserver.viewWillSetAttribute !== void 0) {
      this.viewObserverCache.viewWillSetAttributeObservers = Arrays.removed(viewObserver as ViewWillSetAttribute, this.viewObserverCache.viewWillSetAttributeObservers);
    }
    if (viewObserver.viewDidSetAttribute !== void 0) {
      this.viewObserverCache.viewDidSetAttributeObservers = Arrays.removed(viewObserver as ViewDidSetAttribute, this.viewObserverCache.viewDidSetAttributeObservers);
    }
    if (viewObserver.viewWillSetStyle !== void 0) {
      this.viewObserverCache.viewWillSetStyleObservers = Arrays.removed(viewObserver as ViewWillSetStyle, this.viewObserverCache.viewWillSetStyleObservers);
    }
    if (viewObserver.viewDidSetStyle !== void 0) {
      this.viewObserverCache.viewDidSetStyleObservers = Arrays.removed(viewObserver as ViewDidSetStyle, this.viewObserverCache.viewDidSetStyleObservers);
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountTheme();
  }

  protected override onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.updateTheme();
  }

  protected override onUncull(): void {
    super.onUncull();
    if (this.mood.isInherited()) {
      this.mood.change();
    }
    if (this.theme.isInherited()) {
      this.theme.change();
    }
  }

  @ViewProperty({type: MoodMatrix, state: null})
  readonly moodModifier!: ViewProperty<this, MoodMatrix | null>;

  @ViewProperty({type: MoodMatrix, state: null})
  readonly themeModifier!: ViewProperty<this, MoodMatrix | null>;

  override getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const theme = this.theme.state;
    let value: T | undefined;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.state;
      }
      if (mood !== null) {
        value = theme.get(look, mood);
      }
    }
    return value;
  }

  override getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (arguments.length === 2) {
      elseValue = mood as E;
      mood = null;
    }
    const theme = this.theme.state;
    let value: T | E;
    if (theme !== null) {
      if (mood === void 0 || mood === null) {
        mood = this.mood.state;
      }
      if (mood !== null) {
        value = theme.getOr(look, mood as MoodVector<Feel>, elseValue as E);
      } else {
        value = elseValue as E;
      }
    } else {
      value = elseValue as E;
    }
    return value;
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.moodModifier.takesPrecedence(View.Intrinsic)) {
      const oldMoodModifier = this.moodModifier.getStateOr(MoodMatrix.empty());
      const newMoodModifier = oldMoodModifier.updatedCol(feel, updates, true);
      if (!newMoodModifier.equals(oldMoodModifier)) {
        this.moodModifier.setState(newMoodModifier, View.Intrinsic);
        this.changeMood();
        if (timing !== void 0) {
          const theme = this.theme.state;
          const mood = this.mood.state;
          if (theme !== null && mood !== null) {
            if (timing === true) {
              timing = theme.getOr(Look.timing, mood, false);
            } else {
              timing = Timing.fromAny(timing);
            }
            this.applyTheme(theme, mood, timing);
          }
        } else {
          this.requireUpdate(View.NeedsChange);
        }
      }
    }
  }

  override modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    if (this.themeModifier.takesPrecedence(View.Intrinsic)) {
      const oldThemeModifier = this.themeModifier.getStateOr(MoodMatrix.empty());
      const newThemeModifier = oldThemeModifier.updatedCol(feel, updates, true);
      if (!newThemeModifier.equals(oldThemeModifier)) {
        this.themeModifier.setState(newThemeModifier, View.Intrinsic);
        this.changeTheme();
        if (timing !== void 0) {
          const theme = this.theme.state;
          const mood = this.mood.state;
          if (theme !== null && mood !== null) {
            if (timing === true) {
              timing = theme.getOr(Look.timing, mood, false);
            } else {
              timing = Timing.fromAny(timing);
            }
            this.applyTheme(theme, mood, timing);
          }
        } else {
          this.requireUpdate(View.NeedsChange);
        }
      }
    }
  }

  protected changeMood(): void {
    const moodModifierProperty = this.getViewProperty("moodModifier") as ViewProperty<this, MoodMatrix | null> | null;
    if (moodModifierProperty !== null && this.mood.takesPrecedence(View.Intrinsic)) {
      const moodModifier = moodModifierProperty.state;
      if (moodModifier !== null) {
        let superMood = this.mood.superState;
        if (superMood === void 0 || superMood === null) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superMood = themeManager.mood;
          }
        }
        if (superMood !== void 0 && superMood !== null) {
          const mood = moodModifier.timesCol(superMood, true);
          this.mood.setState(mood, View.Intrinsic);
        }
      } else {
        this.mood.setInherited(true);
      }
    }
  }

  protected changeTheme(): void {
    const themeModifierProperty = this.getViewProperty("themeModifier") as ViewProperty<this, MoodMatrix | null> | null;
    if (themeModifierProperty !== null && this.theme.takesPrecedence(View.Intrinsic)) {
      const themeModifier = themeModifierProperty.state;
      if (themeModifier !== null) {
        let superTheme = this.theme.superState;
        if (superTheme === void 0 || superTheme === null) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superTheme = themeManager.theme;
          }
        }
        if (superTheme !== void 0 && superTheme !== null) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setState(theme, View.Intrinsic);
        }
      } else {
        this.theme.setInherited(true);
      }
    }
  }

  protected updateTheme(): void {
    this.changeMood();
    this.changeTheme();
    const theme = this.theme.state;
    const mood = this.mood.state;
    if (theme !== null && mood !== null) {
      this.applyTheme(theme, mood);
    }
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    this.themeViewAnimators(theme, mood, timing);
  }

  /** @hidden */
  protected mountTheme(): void {
    if (NodeView.isRootView(this.node)) {
      const themeManager = this.themeService.manager;
      if (themeManager !== void 0) {
        if (this.mood.takesPrecedence(View.Intrinsic) && this.mood.state === null) {
          this.mood.setState(themeManager.mood, View.Intrinsic);
        }
        if (this.theme.takesPrecedence(View.Intrinsic) && this.theme.state === null) {
          this.theme.setState(themeManager.theme, View.Intrinsic);
        }
      }
    }
  }

  getAttribute(attributeName: string): string | null {
    return this.node.getAttribute(attributeName);
  }

  setAttribute(attributeName: string, value: unknown): this {
    this.willSetAttribute(attributeName, value);
    if (value !== void 0 && value !== null) {
      this.node.setAttribute(attributeName, ToAttributeString(value));
    } else {
      this.node.removeAttribute(attributeName);
    }
    this.onSetAttribute(attributeName, value);
    this.didSetAttribute(attributeName, value);
    return this;
  }

  protected willSetAttribute(attributeName: string, value: unknown): void {
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewWillSetAttribute(attributeName, value, this);
    }
    const viewObservers = this.viewObserverCache.viewWillSetAttributeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillSetAttribute(attributeName, value, this);
      }
    }
  }

  protected onSetAttribute(attributeName: string, value: unknown): void {
    // hook
  }

  protected didSetAttribute(attributeName: string, value: unknown): void {
    const viewObservers = this.viewObserverCache.viewDidSetAttributeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidSetAttribute(attributeName, value, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewDidSetAttribute(attributeName, value, this);
    }
  }

  /** @hidden */
  readonly attributeAnimators!: {[animatorName: string]: AttributeAnimator<ElementView, unknown> | undefined} | null;

  hasAttributeAnimator(animatorName: string): boolean {
    const attributeAnimators = this.attributeAnimators;
    return attributeAnimators !== null && attributeAnimators[animatorName] !== void 0;
  }

  getAttributeAnimator(animatorName: string): AttributeAnimator<this, unknown> | null {
    const attributeAnimators = this.attributeAnimators;
    if (attributeAnimators !== null) {
      const attributeAnimator = attributeAnimators[animatorName];
      if (attributeAnimator !== void 0) {
        return attributeAnimator as AttributeAnimator<this, unknown>;
      }
    }
    return null;
  }

  setAttributeAnimator(animatorName: string, newAttributeAnimator: AttributeAnimator<this, unknown> | null): void {
    let attributeAnimators = this.attributeAnimators;
    if (attributeAnimators === null) {
      attributeAnimators = {};
      Object.defineProperty(this, "attributeAnimators", {
        value: attributeAnimators,
        enumerable: true,
        configurable: true,
      });
    }
    const oldAttributedAnimator = attributeAnimators[animatorName];
    if (oldAttributedAnimator !== void 0 && this.isMounted()) {
      oldAttributedAnimator.unmount();
    }
    if (newAttributeAnimator !== null) {
      attributeAnimators[animatorName] = newAttributeAnimator;
      if (this.isMounted()) {
        newAttributeAnimator.mount();
      }
    } else {
      delete attributeAnimators[animatorName];
    }
  }

  /** @hidden */
  getLazyAttributeAnimator(animatorName: string): AttributeAnimator<this, unknown> | null {
    let attributeAnimator = this.getAttributeAnimator(animatorName);
    if (attributeAnimator === null) {
      const constructor = ElementView.getAttributeAnimatorConstructor(animatorName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        attributeAnimator = new constructor(this, animatorName);
        this.setAttributeAnimator(animatorName, attributeAnimator);
      }
    }
    return attributeAnimator;
  }

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      const style = this.node.attributeStyleMap;
      if (typeof propertyNames === "string") {
        try {
          return style.get(propertyNames);
        } catch (e) {
          return void 0;
        }
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.get(propertyNames[i]!);
          if (value !== "") {
            return value;
          }
        }
        return "";
      }
    } else {
      const style = this.node.style;
      if (typeof propertyNames === "string") {
        return style.getPropertyValue(propertyNames);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.getPropertyValue(propertyNames[i]!);
          if (value !== "") {
            return value;
          }
        }
        return "";
      }
    }
  }

  setStyle(propertyName: string, value: unknown, priority?: string): this {
    this.willSetStyle(propertyName, value, priority);
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      if (value !== void 0 && value !== null) {
        const cssValue = ToCssValue(value);
        if (cssValue !== null) {
          try {
            this.node.attributeStyleMap.set(propertyName, cssValue);
          } catch (e) {
            // swallow
          }
        } else {
          this.node.style.setProperty(propertyName, ToStyleString(value), priority);
        }
      } else {
        this.node.attributeStyleMap.delete(propertyName);
      }
    } else {
      if (value !== void 0 && value !== null) {
        this.node.style.setProperty(propertyName, ToStyleString(value), priority);
      } else {
        this.node.style.removeProperty(propertyName);
      }
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  }

  protected willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewWillSetStyle(propertyName, value, priority, this);
    }
    const viewObservers = this.viewObserverCache.viewWillSetStyleObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillSetStyle(propertyName, value, priority, this);
      }
    }
  }

  protected onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  }

  protected didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    const viewObservers = this.viewObserverCache.viewDidSetStyleObservers;
    if (viewObservers !== void 0) {
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidSetStyle(propertyName, value, priority, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null) {
      viewController.viewDidSetStyle(propertyName, value, priority, this);
    }
  }

  /** @hidden */
  readonly styleAnimators!: {[animatorName: string]: StyleAnimator<ElementView, unknown> | undefined} | null;

  hasStyleAnimator(animatorName: string): boolean {
    const styleAnimators = this.styleAnimators;
    return styleAnimators !== null && styleAnimators[animatorName] !== void 0;
  }

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null {
    const styleAnimators = this.styleAnimators;
    if (styleAnimators !== null) {
      const styleAnimator = styleAnimators[animatorName];
      if (styleAnimator !== void 0) {
        return styleAnimator as StyleAnimator<this, unknown>;
      }
    }
    return null;
  }

  setStyleAnimator(animatorName: string, newStyleAnimator: StyleAnimator<this, unknown> | null): void {
    let styleAnimators = this.styleAnimators;
    if (styleAnimators === null) {
      styleAnimators = {};
      Object.defineProperty(this, "styleAnimators", {
        value: styleAnimators,
        enumerable: true,
        configurable: true,
      });
    }
    const oldStyleAnimator = styleAnimators[animatorName];
    if (oldStyleAnimator !== void 0 && this.isMounted()) {
      oldStyleAnimator.unmount();
    }
    if (newStyleAnimator !== null) {
      styleAnimators[animatorName] = newStyleAnimator;
      if (this.isMounted()) {
        newStyleAnimator.mount();
      }
    } else {
      delete styleAnimators[animatorName];
    }
  }

  /** @hidden */
  getLazyStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null {
    let styleAnimator = this.getStyleAnimator(animatorName);
    if (styleAnimator === null) {
      const constructor = StyleContext.getStyleAnimatorConstructor(animatorName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        styleAnimator = new constructor(this, animatorName);
        this.setStyleAnimator(animatorName, styleAnimator);
      }
    }
    return styleAnimator;
  }

  /** @hidden */
  protected themeViewAnimators(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.applyTheme(theme, mood, timing);
    }
    const attributeAnimators = this.attributeAnimators;
    for (const animatorName in attributeAnimators) {
      const attributeAnimator = attributeAnimators[animatorName]!;
      attributeAnimator.applyTheme(theme, mood, timing);
    }
    const styleAnimators = this.styleAnimators;
    for (const animatorName in styleAnimators) {
      const styleAnimator = styleAnimators[animatorName]!;
      styleAnimator.applyTheme(theme, mood, timing);
    }
  }

  /** @hidden */
  protected override mountViewAnimators(): void {
    super.mountViewAnimators();
    const attributeAnimators = this.attributeAnimators;
    for (const animatorName in attributeAnimators) {
      const attributeAnimator = attributeAnimators[animatorName]!;
      attributeAnimator.mount();
    }
    const styleAnimators = this.styleAnimators;
    for (const animatorName in styleAnimators) {
      const styleAnimator = styleAnimators[animatorName]!;
      styleAnimator.mount();
    }
  }

  /** @hidden */
  protected override unmountViewAnimators(): void {
    const styleAnimators = this.styleAnimators;
    for (const animatorName in styleAnimators) {
      const styleAnimator = styleAnimators[animatorName]!;
      styleAnimator.unmount();
    }
    const attributeAnimators = this.attributeAnimators;
    for (const animatorName in attributeAnimators) {
      const attributeAnimator = attributeAnimators[animatorName]!;
      attributeAnimator.unmount();
    }
    super.unmountViewAnimators();
  }

  id(): string | undefined;
  id(value: string | undefined): this;
  id(value?: string | undefined): string | undefined | this {
    if (arguments.length == 0) {
      const id = this.getAttribute("id");
      return id !== null ? id : void 0;
    } else {
      this.setAttribute("id", value);
      return this;
    }
  }

  className(): string | undefined;
  className(value: string | undefined): this;
  className(value?: string | undefined): string | undefined | this {
    if (arguments.length === 0) {
      const className = this.getAttribute("class");
      return className !== null ? className : void 0;
    } else {
      this.setAttribute("class", value);
      return this;
    }
  }

  get classList(): DOMTokenList {
    return this.node.classList;
  }

  hasClass(className: string): boolean {
    return this.node.classList.contains(className);
  }

  addClass(...classNames: string[]): this {
    const classList = this.node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.add(classNames[i]!);
    }
    return this;
  }

  removeClass(...classNames: string[]): this {
    const classList = this.node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.remove(classNames[i]!);
    }
    return this;
  }

  toggleClass(className: string, state?: boolean): this {
    const classList = this.node.classList;
    if (state === void 0) {
      classList.toggle(className);
    } else if (state === true) {
      classList.add(className);
    } else if (state === false) {
      classList.remove(className);
    }
    return this;
  }

  /** @hidden */
  override setViewMember(key: string, value: unknown, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const viewProperty = this.getLazyViewProperty(key);
    if (viewProperty !== null) {
      viewProperty.setState(value, precedence);
      return;
    }
    const viewAnimator = this.getLazyViewAnimator(key);
    if (viewAnimator !== null) {
      viewAnimator.setState(value, timing, precedence);
      return;
    }
    const styleAnimator = this.getLazyStyleAnimator(key);
    if (styleAnimator !== null) {
      styleAnimator.setState(value, timing, precedence);
      return;
    }
    const attributeAnimator = this.getLazyAttributeAnimator(key);
    if (attributeAnimator !== null) {
      attributeAnimator.setState(value, timing, precedence);
      return;
    }
  }

  override setViewState<S extends ElementView>(this: S, state: ElementViewMemberMap<S>, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  override setViewState<S extends ElementView>(this: S, state: ElementViewMemberMap<S>, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  override setViewState<S extends ElementView>(this: S, state: ElementViewMemberMap<S>, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    if (typeof timing === "number") {
      precedence = timing;
      timing = void 0;
    } else if (precedence === void 0) {
      precedence = View.Extrinsic;
    }
    for (const key in state) {
      const value = state[key];
      this.setViewMember(key, value, timing, precedence);
    }
  }

  override get clientBounds(): R2Box {
    const bounds = this.node.getBoundingClientRect();
    return new R2Box(bounds.left, bounds.top, bounds.right, bounds.bottom);
  }

  override get pageBounds(): R2Box {
    const bounds = this.node.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    return new R2Box(bounds.left + scrollX, bounds.top + scrollY,
                     bounds.right + scrollX, bounds.bottom + scrollY);
  }

  override on<T extends keyof ElementEventMap>(type: T, listener: (this: Element, event: ElementEventMap[T]) => unknown,
                                               options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off<T extends keyof ElementEventMap>(type: T, listener: (this: Element, event: ElementEventMap[T]) => unknown,
                                                options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  /** @hidden */
  static readonly tags: {[tag: string]: ElementViewConstructor<any> | undefined} = {};

  /** @hidden */
  static readonly tag?: string;

  /** @hidden */
  static readonly namespace?: string;

  static fromTag(tag: string): ElementView {
    let viewConstructor: ElementViewConstructor | undefined;
    if (Object.prototype.hasOwnProperty.call(this, "tags")) {
      viewConstructor = this.tags[tag];
    }
    if (viewConstructor === void 0) {
      viewConstructor = this as ElementViewConstructor;
    }
    let node: Element;
    const namespace = viewConstructor.namespace;
    if (namespace !== void 0) {
      node = document.createElementNS(namespace, tag);
    } else {
      node = document.createElement(tag);
    }
    return new viewConstructor(node as Element & ElementCSSInlineStyle);
  }

  static override fromNode(node: ViewElement): ElementView {
    if (node.view instanceof this) {
      return node.view;
    } else {
      let viewConstructor: ElementViewConstructor | undefined;
      if (Object.prototype.hasOwnProperty.call(this, "tags")) {
        viewConstructor = this.tags[node.tagName];
      }
      if (viewConstructor === void 0) {
        viewConstructor = this as ElementViewConstructor;
      }
      const view = new viewConstructor(node);
      this.mount(view);
      return view;
    }
  }

  static override fromConstructor<V extends NodeView>(viewConstructor: NodeViewConstructor<V>): V;
  static override fromConstructor<V extends View>(viewConstructor: ViewConstructor<V>): V;
  static override fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View;
  static override fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View {
    if (viewConstructor.prototype instanceof ElementView) {
      let node: Element;
      const tag = (viewConstructor as unknown as ElementViewConstructor).tag;
      if (typeof tag === "string") {
        const namespace = (viewConstructor as unknown as ElementViewConstructor).namespace;
        if (namespace !== void 0) {
          node = document.createElementNS(namespace, tag);
        } else {
          node = document.createElement(tag);
        }
        return new viewConstructor(node);
      } else {
        throw new TypeError("" + viewConstructor);
      }
    } else {
      return super.fromConstructor(viewConstructor);
    }
  }

  static override fromAny(value: ElementView | Element): ElementView {
    if (value instanceof ElementView) {
      return value;
    } else if (value instanceof Element) {
      return this.fromNode(value as ViewElement);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static getAttributeAnimatorConstructor(animatorName: string, viewPrototype: ElementViewPrototype | null): AttributeAnimatorConstructor<any, unknown> | null {
    if (viewPrototype === null) {
      viewPrototype = this.prototype as ElementViewPrototype;
    }
    while (viewPrototype !== null) {
      if (Object.prototype.hasOwnProperty.call(viewPrototype, "attributeAnimatorConstructors")) {
        const constructor = viewPrototype.attributeAnimatorConstructors![animatorName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      viewPrototype = Object.getPrototypeOf(viewPrototype);
    }
    return null;
  }

  /** @hidden */
  static decorateAttributeAnimator(constructor: AttributeAnimatorConstructor<ElementView, unknown>,
                                   target: Object, propertyKey: string | symbol): void {
    const viewPrototype = target as ElementViewPrototype;
    if (!Object.prototype.hasOwnProperty.call(viewPrototype, "attributeAnimatorConstructors")) {
      viewPrototype.attributeAnimatorConstructors = {};
    }
    viewPrototype.attributeAnimatorConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: ElementView): AttributeAnimator<ElementView, unknown> {
        let attributeAnimator = this.getAttributeAnimator(propertyKey.toString());
        if (attributeAnimator === null) {
          attributeAnimator = new constructor(this, propertyKey.toString());
          this.setAttributeAnimator(propertyKey.toString(), attributeAnimator);
        }
        return attributeAnimator;
      },
      configurable: true,
      enumerable: true,
    });
  }
}
