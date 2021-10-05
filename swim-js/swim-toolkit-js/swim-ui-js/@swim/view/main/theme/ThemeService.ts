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

import {Mutable, Class, Lazy, AnyTiming, Timing, Service} from "@swim/util";
import {Affinity} from "@swim/fastener";
import {Look, Mood, MoodVector, Theme, ThemeMatrix} from "@swim/theme";
import {Viewport} from "../viewport/Viewport";
import type {ThemeServiceObserver} from "./ThemeServiceObserver";
import {View} from "../"; // forward import

export class ThemeService<V extends View = View> extends Service<V> {
  constructor() {
    super();
    this.mood = this.initMood();
    this.theme = this.initTheme();
  }

  override readonly observerType?: Class<ThemeServiceObserver<V>>;

  readonly mood: MoodVector;

  protected initMood(): MoodVector {
    return Mood.default;
  }

  setMood(mood: MoodVector): void {
    (this as Mutable<this>).mood = mood;
    this.applyTheme(this.theme, mood);
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      const root = roots[i]!;
      if (root.mood.hasAffinity(Affinity.Intrinsic)) {
        root.mood.setState(mood, Affinity.Intrinsic);
        root.requireUpdate(View.NeedsChange);
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
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      const root = roots[i]!;
      if (root.theme.hasAffinity(Affinity.Intrinsic)) {
        root.theme.setState(theme, Affinity.Intrinsic);
        root.requireUpdate(View.NeedsChange);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillApplyTheme !== void 0) {
        observer.serviceWillApplyTheme(theme, mood, timing, this);
      }
    }
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidApplyTheme !== void 0) {
        observer.serviceDidApplyTheme(theme, mood, timing, this);
      }
    }
  }

  @Lazy
  static global<V extends View>(): ThemeService<V> {
    return new ThemeService();
  }
}
