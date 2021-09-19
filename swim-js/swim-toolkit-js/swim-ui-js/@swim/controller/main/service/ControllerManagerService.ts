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

import type {Controller} from "../Controller";
import type {ControllerManager} from "../manager/ControllerManager";
import type {ControllerManagerObserver} from "../manager/ControllerManagerObserver";
import {ControllerService} from "./ControllerService";

/** @hidden */
export abstract class ControllerManagerService<C extends Controller, CM extends ControllerManager<C> | null | undefined> extends ControllerService<C, CM> {
  override didMount(): void {
    const manager = this.manager;
    if (manager !== void 0 && manager !== null) {
      if (!this.isInherited()) {
        manager.insertRootController(this.owner);
      }
      if (this.observe !== false) {
        manager.addControllerManagerObserver(this as ControllerManagerObserver);
      }
    }
    super.didMount();
  }

  override willUnmount(): void {
    super.willUnmount();
    const manager = this.manager;
    if (manager !== void 0 && manager !== null) {
      if (this.observe !== false) {
        manager.removeControllerManagerObserver(this as ControllerManagerObserver);
      }
      if (!this.isInherited()) {
        manager.removeRootController(this.owner);
      }
    }
  }
}
