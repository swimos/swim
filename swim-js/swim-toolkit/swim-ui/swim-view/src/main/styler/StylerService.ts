// Copyright 2015-2023 Swim.inc
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

import type {Class, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property, Provider, Service} from "@swim/component";
import {Mood, MoodVector, Theme, ThemeMatrix} from "@swim/theme";
import {View} from "../view/View";
import {ViewSet} from "../view/ViewSet";
import type {ViewportColorScheme} from "../viewport/ViewportColorScheme";
import {ViewportService} from "../viewport/ViewportService";
import type {StylerServiceObserver} from "./StylerServiceObserver";

/** @public */
export class StylerService extends Service {
  override readonly observerType?: Class<StylerServiceObserver>;

  @ViewSet<StylerService["roots"]>({
    initView(rootView: View): void {
      rootView.mood.setValue(this.owner.mood.value, Affinity.Inherited);
      rootView.theme.setValue(this.owner.theme.value, Affinity.Inherited);
      rootView.requireUpdate(View.NeedsChange);
    },
    willAttachView(rootView: View): void {
      this.owner.callObservers("serviceWillAttachRoot", rootView, this.owner);
    },
    didAttachView(rootView: View): void {
      this.owner.callObservers("serviceDidAttachRoot", rootView, this.owner);
    },
    willDetachView(rootView: View): void {
      this.owner.callObservers("serviceWillDetachRoot", rootView, this.owner);
    },
    didDetachView(rootView: View): void {
      this.owner.callObservers("serviceDidDetachRoot", rootView, this.owner);
    },
  })
  readonly roots!: ViewSet<this, View>;
  static readonly roots: FastenerClass<StylerService["roots"]>;

  @Provider<StylerService["viewport"]>({
    serviceType: ViewportService,
    observes: true,
    lazy: false,
    serviceDidSetViewportColorScheme(colorScheme: ViewportColorScheme): void {
      this.owner.theme.update();
    },
  })
  readonly viewport!: Provider<this, ViewportService> & Observes<ViewportService>;
  static readonly viewport: FastenerClass<StylerService["viewport"]>;

  @Property<StylerService["theme"]>({
    valueType: ThemeMatrix,
    initValue(): ThemeMatrix {
      return this.detect();
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        const theme = this.detect();
        this.setValue(theme, Affinity.Intrinsic);
      }
    },
    detect(): ThemeMatrix {
      const viewportService = this.owner.viewport.getService();
      const colorScheme = viewportService.colorScheme.value;
      if (colorScheme === "dark") {
        return Theme.dark;
      } else {
        return Theme.light;
      }
    },
    didSetValue(theme: ThemeMatrix): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.theme.setValue(theme, Affinity.Inherited);
        rootView.requireUpdate(View.NeedsChange);
      }
      this.owner.callObservers("serviceDidSetTheme", theme, this.owner);
    },
  })
  readonly theme!: Property<this, ThemeMatrix> & {
    update(): void,
    detect(): ThemeMatrix,
  };

  @Property<StylerService["mood"]>({
    valueType: MoodVector,
    initValue(): MoodVector {
      return Mood.default;
    },
    didSetValue(mood: MoodVector): void {
      const rootViews = this.owner.roots.views;
      for (const viewId in rootViews) {
        const rootView = rootViews[viewId]!;
        rootView.mood.setValue(mood, Affinity.Inherited);
        rootView.requireUpdate(View.NeedsChange);
      }
      this.owner.callObservers("serviceDidSetMood", mood, this.owner);
    },
  })
  readonly mood!: Property<this, MoodVector>;
}
