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

import {ControllerViewTrait, CompositeController} from "@swim/controller";
import type {AxisView} from "./AxisView";
import {AxisTrait} from "./AxisTrait";
import {TopAxisTrait} from "./TopAxisTrait";
import {RightAxisTrait} from "./RightAxisTrait";
import {BottomAxisTrait} from "./BottomAxisTrait";
import {LeftAxisTrait} from "./LeftAxisTrait";
import type {AxisControllerObserver} from "./AxisControllerObserver";
import {TopAxisController} from "../"; // forward import
import {RightAxisController} from "../"; // forward import
import {BottomAxisController} from "../"; // forward import
import {LeftAxisController} from "../"; // forward import

export abstract class AxisController<D> extends CompositeController {
  override readonly controllerObservers!: ReadonlyArray<AxisControllerObserver<D>>;

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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetAxisTrait !== void 0) {
        controllerObserver.controllerWillSetAxisTrait(newAxisTrait, oldAxisTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetAxisTrait !== void 0) {
        controllerObserver.controllerDidSetAxisTrait(newAxisTrait, oldAxisTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetAxisView !== void 0) {
        controllerObserver.controllerWillSetAxisView(newAxisView, oldAxisView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetAxisView !== void 0) {
        controllerObserver.controllerDidSetAxisView(newAxisView, oldAxisView, this);
      }
    }
  }

  /** @hidden */
  static AxisFastener = ControllerViewTrait.define<AxisController<unknown>, AxisView<unknown>, AxisTrait<unknown>>({
    willSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.willSetAxisView(newAxisView, oldAxisView);
    },
    onSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.onSetAxisView(newAxisView, oldAxisView);
    },
    didSetView(newAxisView: AxisView<unknown> | null, oldAxisView: AxisView<unknown> | null): void {
      this.owner.didSetAxisView(newAxisView, oldAxisView);
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

  @ControllerViewTrait<AxisController<D>, AxisView<D>, AxisTrait<D>>({
    extends: AxisController.AxisFastener,
  })
  readonly axis!: ControllerViewTrait<this, AxisView<D>, AxisTrait<D>>;

  protected createAxis<D>(axisTrait: AxisTrait<D>): AxisController<D> | null {
    if (axisTrait instanceof TopAxisTrait) {
      return new TopAxisController<D>();
    } else if (axisTrait instanceof RightAxisTrait) {
      return new RightAxisController<D>();
    } else if (axisTrait instanceof BottomAxisTrait) {
      return new BottomAxisController<D>();
    } else if (axisTrait instanceof LeftAxisTrait) {
      return new LeftAxisController<D>();
    } else {
      return null;
    }
  }
}
