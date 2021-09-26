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

import {Lazy, Mutable} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {Look, Mood, MoodVector, Theme, ThemeMatrix} from "@swim/theme";
import {View} from "../View";
import {ViewManager} from "../manager/ViewManager";
import {Viewport} from "../viewport/Viewport";
import type {ThemeManagerObserver} from "./ThemeManagerObserver";

export class ThemeManager<V extends View = View> extends ViewManager<V> {
  constructor() {
    super();
    this.mood = this.initMood();
    this.theme = this.initTheme();
  }

  readonly mood: MoodVector;

  protected initMood(): MoodVector {
    return Mood.default;
  }

  setMood(mood: MoodVector): void {
    (this as Mutable<this>).mood = mood;
    this.applyTheme(this.theme, mood);
    const rootViews = this.rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i]!;
      if (rootView.mood.takesPrecedence(View.Intrinsic)) {
        rootView.mood.setState(mood, View.Intrinsic);
        rootView.requireUpdate(View.NeedsChange);
      }
    }
  }

  readonly theme: ThemeMatrix;

  protected initTheme(): ThemeMatrix {
    const viewport = Viewport.detect();
    const colorScheme = viewport.colorScheme;
    if (colorScheme === "dark") {
      return Theme.dark;
    } else {
      return Theme.light;
    }
  }

  setTheme(theme: ThemeMatrix): void {
    (this as Mutable<this>).theme = theme;
    this.applyTheme(theme, this.mood);
    const rootViews = this.rootViews;
    for (let i = 0, n = rootViews.length; i < n; i += 1) {
      const rootView = rootViews[i]!;
      if (rootView.theme.takesPrecedence(View.Intrinsic)) {
        rootView.theme.setState(theme, View.Intrinsic);
        rootView.requireUpdate(View.NeedsChange);
      }
    }
  }

  protected applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.willApplyTheme(theme, mood, timing as Timing | boolean);
    this.onApplyTheme(theme, mood, timing as Timing | boolean);
    this.didApplyTheme(theme, mood, timing as Timing | boolean);
  }

  protected willApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.themeManagerWillApplyTheme !== void 0) {
        viewManagerObserver.themeManagerWillApplyTheme(theme, mood, timing, this);
      }
    }
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const viewManagerObservers = this.viewManagerObservers;
    for (let i = 0, n = viewManagerObservers.length; i < n; i += 1) {
      const viewManagerObserver = viewManagerObservers[i]!;
      if (viewManagerObserver.themeManagerDidApplyTheme !== void 0) {
        viewManagerObserver.themeManagerDidApplyTheme(theme, mood, timing, this);
      }
    }
  }

  override readonly viewManagerObservers!: ReadonlyArray<ThemeManagerObserver>;

  protected override onInsertRootView(rootView: V): void {
    super.onInsertRootView(rootView);
    this.applyTheme(this.theme, this.mood);
  }

  @Lazy
  static global<V extends View>(): ThemeManager<V> {
    return new ThemeManager();
  }
}
