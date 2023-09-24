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

import type {Class} from "@swim/util";
import type {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Provider} from "@swim/component";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import {Mood} from "@swim/theme";
import {MoodVector} from "@swim/theme";
import {Theme} from "@swim/theme";
import {ThemeMatrix} from "@swim/theme";
import {View} from "./View";
import {ViewSet} from "./ViewSet";
import type {ViewportColorScheme} from "./Viewport";
import {ViewportService} from "./ViewportService";

/** @public */
export interface StylerServiceObserver<S extends StylerService = StylerService> extends ServiceObserver<S> {
  serviceWillAttachRoot?(rootView: View, service: S): void;

  serviceDidAttachRoot?(rootView: View, service: S): void;

  serviceWillDetachRoot?(rootView: View, service: S): void;

  serviceDidDetachRoot?(rootView: View, service: S): void;

  serviceDidSetTheme?(theme: ThemeMatrix, service: S): void;

  serviceDidSetMood?(mood: MoodVector, service: S): void;

  serviceWillApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, service: S): void;

  serviceDidApplyTheme?(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, service: S): void;
}

/** @public */
export class StylerService extends Service {
  declare readonly observerType?: Class<StylerServiceObserver>;

  @ViewSet({
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

  @Provider({
    serviceType: ViewportService,
    observes: true,
    serviceDidSetViewportColorScheme(colorScheme: ViewportColorScheme): void {
      this.owner.theme.update();
    },
  })
  readonly viewport!: Provider<this, ViewportService> & Observes<ViewportService>;

  @Property({
    valueType: ThemeMatrix,
    initValue(): ThemeMatrix {
      return this.detect();
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        const theme = this.detect();
        this.setIntrinsic(theme);
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

  @Property({
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
