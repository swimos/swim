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

import type {Timing} from "@swim/mapping";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ComponentViewTrait, CompositeComponent} from "@swim/component";
import type {AxisView} from "./AxisView";
import {AxisTrait} from "./AxisTrait";
import {TopAxisTrait} from "./TopAxisTrait";
import {RightAxisTrait} from "./RightAxisTrait";
import {BottomAxisTrait} from "./BottomAxisTrait";
import {LeftAxisTrait} from "./LeftAxisTrait";
import type {AxisComponentObserver} from "./AxisComponentObserver";
import {TopAxisComponent} from "../"; // forward import
import {RightAxisComponent} from "../"; // forward import
import {BottomAxisComponent} from "../"; // forward import
import {LeftAxisComponent} from "../"; // forward import

export abstract class AxisComponent<D> extends CompositeComponent {
  override readonly componentObservers!: ReadonlyArray<AxisComponentObserver<D>>;

  protected initAxisTrait(axisTrait: AxisTrait<D>): void {
    // hook
  }

  protected attachAxisTrait(axisTrait: AxisTrait<D>): void {
    // hook
  }

  protected detachAxisTrait(axisTrait: AxisTrait<D>): void {
    // hook
  }

  protected willSetAxisTrait(newAxisTrait: AxisTrait<D> | null, oldAxisTrait: AxisTrait<D> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetAxisTrait !== void 0) {
        componentObserver.componentWillSetAxisTrait(newAxisTrait, oldAxisTrait, this);
      }
    }
  }

  protected onSetAxisTrait(newAxisTrait: AxisTrait<D> | null, oldAxisTrait: AxisTrait<D> | null): void {
    if (oldAxisTrait !== null) {
      this.detachAxisTrait(oldAxisTrait);
    }
    if (newAxisTrait !== null) {
      this.attachAxisTrait(newAxisTrait);
      this.initAxisTrait(newAxisTrait);
    }
  }

  protected didSetAxisTrait(newAxisTrait: AxisTrait<D> | null, oldAxisTrait: AxisTrait<D> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetAxisTrait !== void 0) {
        componentObserver.componentDidSetAxisTrait(newAxisTrait, oldAxisTrait, this);
      }
    }
  }

  protected abstract createAxisView(): AxisView<D> | null;

  protected initAxisView(axisView: AxisView<D>): void {
    // hook
  }

  protected attachAxisView(axisView: AxisView<D>): void {
    // hook
  }

  protected detachAxisView(axisView: AxisView<D>): void {
    // hook
  }

  protected willSetAxisView(newAxisView: AxisView<D> | null, oldAxisView: AxisView<D> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetAxisView !== void 0) {
        componentObserver.componentWillSetAxisView(newAxisView, oldAxisView, this);
      }
    }
  }

  protected onSetAxisView(newAxisView: AxisView<D> | null, oldAxisView: AxisView<D> | null): void {
    if (oldAxisView !== null) {
      this.detachAxisView(oldAxisView);
    }
    if (newAxisView !== null) {
      this.attachAxisView(newAxisView);
      this.initAxisView(newAxisView);
    }
  }

  protected didSetAxisView(newAxisView: AxisView<D> | null, oldAxisView: AxisView<D> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetAxisView !== void 0) {
        componentObserver.componentDidSetAxisView(newAxisView, oldAxisView, this);
      }
    }
  }

  protected themeAxisView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, axisView: AxisView<D>): void {
    // hook
  }

  /** @hidden */
  static AxisFastener = ComponentViewTrait.define<AxisComponent<unknown>, AxisView<unknown>, AxisTrait<unknown>>({
    observeView: true,
    willSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.willSetAxisView(newAxisView, oldAxisView);
    },
    onSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.onSetAxisView(newAxisView, oldAxisView);
    },
    didSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.didSetAxisView(newAxisView, oldAxisView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, axisView: AxisView<unknown>): void {
      this.owner.themeAxisView(theme, mood, timing, axisView);
    },
    createView(): AxisView<unknown> | null {
      return this.owner.createAxisView();
    },
    traitType: AxisTrait,
    observeTrait: true,
    willSetTrait(newAxisTrait: AxisTrait<unknown> | null, oldAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetAxisTrait(newAxisTrait, oldAxisTrait);
    },
    onSetTrait(newAxisTrait: AxisTrait<unknown> | null, oldAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetAxisTrait(newAxisTrait, oldAxisTrait);
    },
    didSetTrait(newAxisTrait: AxisTrait<unknown> | null, oldAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.didSetAxisTrait(newAxisTrait, oldAxisTrait);
    },
  });

  @ComponentViewTrait<AxisComponent<D>, AxisView<D>, AxisTrait<D>>({
    extends: AxisComponent.AxisFastener,
  })
  readonly axis!: ComponentViewTrait<this, AxisView<D>, AxisTrait<D>>;

  protected createAxis<D>(axisTrait: AxisTrait<D>): AxisComponent<D> | null {
    if (axisTrait instanceof TopAxisTrait) {
      return new TopAxisComponent<D>();
    } else if (axisTrait instanceof RightAxisTrait) {
      return new RightAxisComponent<D>();
    } else if (axisTrait instanceof BottomAxisTrait) {
      return new BottomAxisComponent<D>();
    } else if (axisTrait instanceof LeftAxisTrait) {
      return new LeftAxisComponent<D>();
    } else {
      return null;
    }
  }
}
