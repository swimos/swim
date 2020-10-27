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

import {Tween, Transition} from "@swim/transition";
import {ViewContextType, ViewFlags, View, ViewScope} from "@swim/view";
import {NodeView, SvgViewInit, SvgViewFactory, SvgViewConstructor, SvgView} from "@swim/dom";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {Mood} from "../mood/Mood";
import {MoodVector} from "../mood/MoodVector";
import {MoodMatrix} from "../mood/MoodMatrix";
import {ThemeMatrix} from "../theme/ThemeMatrix";
import {ThemedViewInit, ThemedView} from "./ThemedView";
import {ThemedSvgViewObserver} from "./ThemedSvgViewObserver";
import {ThemedSvgViewController} from "./ThemedSvgViewController";

export interface ThemedSvgViewInit extends SvgViewInit, ThemedViewInit {
  viewController?: ThemedSvgViewController;
}

export interface ThemedSvgViewFactory<V extends ThemedSvgView = ThemedSvgView> extends SvgViewFactory<V> {
}

export interface ThemedSvgViewConstructor<V extends ThemedSvgView = ThemedSvgView> extends SvgViewConstructor<V> {
}

export class ThemedSvgView extends SvgView implements ThemedView {
  // @ts-ignore
  declare readonly viewController: ThemedSvgViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<ThemedSvgViewObserver>;

  initView(init: ThemedSvgViewInit): void {
    super.initView(init);
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

  @ViewScope({type: MoodVector, inherit: true})
  mood: ViewScope<this, MoodVector | undefined>;

  @ViewScope({type: MoodMatrix})
  moodModifier: ViewScope<this, MoodMatrix | undefined>;

  @ViewScope({type: ThemeMatrix, inherit: true})
  theme: ViewScope<this, ThemeMatrix | undefined>;

  @ViewScope({type: MoodMatrix})
  themeModifier: ViewScope<this, MoodMatrix | undefined>;

  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel>): T | undefined {
    const theme = this.theme.state;
    let value: T | undefined;
    if (theme !== void 0) {
      if (mood === void 0) {
        mood = this.mood.state;
      }
      if (mood !== void 0) {
        value = theme.inner(mood, look);
      }
    }
    return value;
  }

  getLookOr<T, V>(look: Look<T, unknown>, elseValue: V, mood?: MoodVector<Feel>): T | V {
    const theme = this.theme.state;
    let value: T | V | undefined;
    if (theme !== void 0) {
      if (mood === void 0) {
        mood = this.mood.state;
      }
      if (mood !== void 0) {
        value = theme.inner(mood, look);
      }
    }
    if (value === void 0) {
      value = elseValue;
    }
    return value;
  }

  modifyMood(feel: Feel, ...entries: [Feel, number | undefined][]): void {
    const oldMoodModifier = this.moodModifier.getStateOr(MoodMatrix.empty());
    const newMoodModifier = oldMoodModifier.updatedCol(feel, true, ...entries);
    if (!newMoodModifier.equals(oldMoodModifier)) {
      this.moodModifier.setState(newMoodModifier);
      this.changeMood();
      this.requireUpdate(View.NeedsChange);
    }
  }

  modifyTheme(feel: Feel, ...entries: [Feel, number | undefined][]): void {
    const oldThemeModifier = this.themeModifier.getStateOr(MoodMatrix.empty());
    const newThemeModifier = oldThemeModifier.updatedCol(feel, true, ...entries);
    if (!newThemeModifier.equals(oldThemeModifier)) {
      this.themeModifier.setState(newThemeModifier);
      this.changeTheme();
      this.requireUpdate(View.NeedsChange);
    }
  }

  applyTheme(theme: ThemeMatrix, mood: MoodVector, tween?: Tween<any>): void {
    if (tween === void 0 || tween === true) {
      tween = theme.inner(Mood.ambient, Look.transition);
      if (tween === void 0) {
        tween = null;
      }
    } else {
      tween = Transition.forTween(tween);
    }
    this.willApplyTheme(theme, mood, tween);
    this.onApplyTheme(theme, mood, tween);
    this.didApplyTheme(theme, mood, tween);
  }

  protected willApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                           transition: Transition<any> | null): void {
    this.willObserve(function (viewObserver: ThemedSvgViewObserver): void {
      if (viewObserver.viewWillApplyTheme !== void 0) {
        viewObserver.viewWillApplyTheme(theme, mood, transition, this);
      }
    });
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    // hook
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                          transition: Transition<any> | null): void {
    this.didObserve(function (viewObserver: ThemedSvgViewObserver): void {
      if (viewObserver.viewDidApplyTheme !== void 0) {
        viewObserver.viewDidApplyTheme(theme, mood, transition, this);
      }
    });
  }

  protected onMount(): void {
    super.onMount();
    this.initTheme();
  }

  protected initTheme(): void {
    if (NodeView.isRootView(this._node)) {
      const themeManager = this.themeService.manager;
      if (themeManager !== void 0) {
        if (this.mood.isAuto() && this.mood.state === void 0) {
          this.mood.setAutoState(themeManager.mood);
        }
        if (this.theme.isAuto() && this.theme.state === void 0) {
          this.theme.setAutoState(themeManager.theme);
        }
      }
    }
  }

  protected changeMood(): void {
    const moodModifierScope = this.getViewScope("moodModifier") as ViewScope<this, MoodMatrix> | null;
    if (moodModifierScope !== null && this.mood.isAuto()) {
      const moodModifier = moodModifierScope.state;
      if (moodModifier !== void 0) {
        let superMood = this.mood.superState;
        if (superMood === void 0) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superMood = themeManager.mood;
          }
        }
        if (superMood !== void 0) {
          const mood = moodModifier.transform(superMood, true);
          this.mood.setAutoState(mood);
        }
      } else {
        this.mood.setInherited(true);
      }
    }
  }

  protected changeTheme(): void {
    const themeModifierScope = this.getViewScope("themeModifier") as ViewScope<this, MoodMatrix> | null;
    if (themeModifierScope !== null && this.theme.isAuto()) {
      const themeModifier = themeModifierScope.state;
      if (themeModifier !== void 0) {
        let superTheme = this.theme.superState;
        if (superTheme === void 0) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superTheme = themeManager.theme;
          }
        }
        if (superTheme !== void 0) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setAutoState(theme);
        }
      } else {
        this.theme.setInherited(true);
      }
    }
  }

  protected updateTheme(): void {
    if (this.theme.isChanging() || this.mood.isChanging()) {
      this.changeMood();
      this.changeTheme();

      const theme = this.theme.state;
      const mood = this.mood.state;
      if (theme !== void 0 && mood !== void 0) {
        this.applyTheme(theme, mood);
      }
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.updateTheme();
  }

  protected onUncull(): void {
    super.onUncull();
    if (this.theme.isInherited()) {
      this.theme.change();
    }
    if (this.mood.isInherited()) {
      this.mood.change();
    }
  }

  static readonly mountFlags: ViewFlags = SvgView.mountFlags | View.NeedsChange;

  /** @hidden */
  static readonly tags: {[tag: string]: typeof ThemedSvgView | undefined} = {};

  /** @hidden */
  static decorateTag(tag: string, constructor: typeof ThemedSvgView, name: string): void {
    const tagConstructor = constructor.forTag(tag);
    Object.defineProperty(ThemedSvgView, name, {
      value: tagConstructor,
      configurable: true,
      enumerable: true,
    });
    if (!(tag in ThemedSvgView.tags)) {
      ThemedSvgView.tags[tag] = tagConstructor;
    }
  }

  @ThemedSvgView.Tag("a")
  static a: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("animate")
  static animate: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("animateMotion")
  static animateMotion: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("animateTransform")
  static animateTransform: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("audio")
  static audio: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("canvas")
  static canvas: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("circle")
  static circle: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("clipPath")
  static clipPath: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("defs")
  static defs: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("desc")
  static desc: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("discard")
  static discard: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("ellipse")
  static ellipse: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feBlend")
  static feBlend: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feColorMatrix")
  static feColorMatrix: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feComponentTransfer")
  static feComponentTransfer: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feComposite")
  static feComposite: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feConvolveMatrix")
  static feConvolveMatrix: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feDiffuseLighting")
  static feDiffuseLighting: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feDisplacementMap")
  static feDisplacementMap: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feDistantLight")
  static feDistantLight: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feDropShadow")
  static feDropShadow: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feFlood")
  static feFlood: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feFuncA")
  static feFuncA: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feFuncB")
  static feFuncB: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feFuncG")
  static feFuncG: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feFuncR")
  static feFuncR: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feGaussianBlur")
  static feGaussianBlur: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feImage")
  static feImage: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feMerge")
  static feMerge: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feMergeNode")
  static feMergeNode: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feMorphology")
  static feMorphology: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feOffset")
  static feOffset: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("fePointLight")
  static fePointLight: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feSpecularLighting")
  static feSpecularLighting: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feSpotLight")
  static feSpotLight: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feTile")
  static feTile: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("feTurbulence")
  static feTurbulence: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("filter")
  static filter: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("foreignObject")
  static foreignObject: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("g")
  static g: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("iframe")
  static iframe: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("image")
  static image: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("line")
  static line: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("linearGradient")
  static linearGradient: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("marker")
  static marker: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("mask")
  static mask: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("metadata")
  static metadata: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("mpath")
  static mpath: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("path")
  static path: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("pattern")
  static pattern: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("polygon")
  static polygon: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("polyline")
  static polyline: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("radialGradient")
  static radialGradient: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("rect")
  static rect: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("script")
  static script: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("set")
  static set: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("stop")
  static stop: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("style")
  static style: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("svg")
  static svg: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("switch")
  static switch: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("symbol")
  static symbol: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("text")
  static text: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("textPath")
  static textPath: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("title")
  static title: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("tspan")
  static tspan: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("unknown")
  static unknown: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("use")
  static use: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("video")
  static video: ThemedSvgViewFactory;

  @ThemedSvgView.Tag("view")
  static view: ThemedSvgViewFactory;
}
