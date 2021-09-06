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

import type {ControllerContextType} from "../ControllerContext";
import {ControllerFlags, Controller} from "../Controller";
import {GenericController} from "./GenericController";

export class CompositeController extends GenericController {
  constructor() {
    super();
    Object.defineProperty(this, "childControllers", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "childControllerMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly childControllers!: ReadonlyArray<Controller>;

  override get childControllerCount(): number {
    return this.childControllers.length;
  }

  override forEachChildController<T>(callback: (childController: Controller) => T | void): T | undefined;
  override forEachChildController<T, S>(callback: (this: S, childController: Controller) => T | void,
                                        thisArg: S): T | undefined;
  override forEachChildController<T, S>(callback: (this: S | undefined, childController: Controller) => T | void,
                                         thisArg?: S): T | undefined {
    let result: T | undefined;
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      result = callback.call(thisArg, childController) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (childControllers[i] === childController) {
        i += 1;
      }
    }
    return result;
  }

  override firstChildController(): Controller | null {
    const childControllers = this.childControllers;
    return childControllers.length !== 0 ? childControllers[0]! : null;
  }

  override lastChildController(): Controller | null {
    const childControllers = this.childControllers;
    return childControllers.length !== 0 ? childControllers[childControllers.length - 1]! : null;
  }

  override nextChildController(targetController: Controller): Controller | null {
    const childControllers = this.childControllers;
    const targetIndex = childControllers.indexOf(targetController);
    return targetIndex >= 0 && targetIndex + 1 < childControllers.length ? childControllers[targetIndex + 1]! : null;
  }

  override previousChildController(targetController: Controller): Controller | null {
    const childControllers = this.childControllers;
    const targetIndex = childControllers.indexOf(targetController);
    return targetIndex - 1 >= 0 ? childControllers[targetIndex - 1]! : null;
  }

  /** @hidden */
  readonly childControllerMap!: {[key: string]: Controller | undefined} | null;

  override getChildController(key: string): Controller | null {
    const childControllerMap = this.childControllerMap;
    if (childControllerMap !== null) {
      const childController = childControllerMap[key];
      if (childController !== void 0) {
        return childController;
      }
    }
    return null;
  }

  override setChildController(key: string, newChildController: Controller | null): Controller | null {
    let targetController: Controller | null = null;
    const childControllers = this.childControllers as Controller[];
    if (newChildController !== null) {
      if (newChildController.parentController === this) {
        targetController = childControllers[childControllers.indexOf(newChildController) + 1] || null;
      }
      newChildController.remove();
    }
    let index = -1;
    const oldChildController = this.getChildController(key);
    if (oldChildController !== null) {
      index = childControllers.indexOf(oldChildController);
      // assert(index >= 0);
      targetController = childControllers[index + 1] || null;
      this.willRemoveChildController(oldChildController);
      oldChildController.setParentController(null, this);
      this.removeChildControllerMap(oldChildController);
      childControllers.splice(index, 1);
      this.onRemoveChildController(oldChildController);
      this.didRemoveChildController(oldChildController);
      oldChildController.setKey(void 0);
    }
    if (newChildController !== null) {
      newChildController.setKey(key);
      this.willInsertChildController(newChildController, targetController);
      if (index >= 0) {
        childControllers.splice(index, 0, newChildController);
      } else {
        childControllers.push(newChildController);
      }
      this.insertChildControllerMap(newChildController);
      newChildController.setParentController(this, null);
      this.onInsertChildController(newChildController, targetController);
      this.didInsertChildController(newChildController, targetController);
      newChildController.cascadeInsert();
    }
    return oldChildController;
  }

  /** @hidden */
  protected insertChildControllerMap(childController: Controller): void {
    const key = childController.key;
    if (key !== void 0) {
      let childControllerMap = this.childControllerMap;
      if (childControllerMap === null) {
        childControllerMap = {};
        Object.defineProperty(this, "childControllerMap", {
          value: childControllerMap,
          enumerable: true,
          configurable: true,
        });
      }
      childControllerMap[key] = childController;
    }
  }

  /** @hidden */
  protected removeChildControllerMap(childController: Controller): void {
    const key = childController.key;
    if (key !== void 0) {
      const childControllerMap = this.childControllerMap;
      if (childControllerMap !== null) {
        delete childControllerMap[key];
      }
    }
  }

  override appendChildController(childController: Controller, key?: string): void {
    childController.remove();
    if (key !== void 0) {
      this.removeChildController(key);
      childController.setKey(key);
    }
    this.willInsertChildController(childController, null);
    (this.childControllers as Controller[]).push(childController);
    this.insertChildControllerMap(childController);
    childController.setParentController(this, null);
    this.onInsertChildController(childController, null);
    this.didInsertChildController(childController, null);
    childController.cascadeInsert();
  }

  override prependChildController(childController: Controller, key?: string): void {
    childController.remove();
    if (key !== void 0) {
      this.removeChildController(key);
      childController.setKey(key);
    }
    const childControllers = this.childControllers as Controller[];
    const targetController = childControllers.length !== 0 ? childControllers[0]! : null;
    this.willInsertChildController(childController, targetController);
    childControllers.unshift(childController);
    this.insertChildControllerMap(childController);
    childController.setParentController(this, null);
    this.onInsertChildController(childController, targetController);
    this.didInsertChildController(childController, targetController);
    childController.cascadeInsert();
  }

  override insertChildController(childController: Controller, targetController: Controller | null, key?: string): void {
    if (targetController !== null && targetController.parentController !== this) {
      throw new TypeError("" + targetController);
    }
    childController.remove();
    if (key !== void 0) {
      this.removeChildController(key);
      childController.setKey(key);
    }
    this.willInsertChildController(childController, targetController);
    const childControllers = this.childControllers as Controller[];
    const index = targetController !== null ? childControllers.indexOf(targetController) : -1;
    if (index >= 0) {
      childControllers.splice(index, 0, childController);
    } else {
      childControllers.push(childController);
    }
    this.insertChildControllerMap(childController);
    childController.setParentController(this, null);
    this.onInsertChildController(childController, targetController);
    this.didInsertChildController(childController, targetController);
    childController.cascadeInsert();
  }

  override removeChildController(key: string): Controller | null;
  override removeChildController(childController: Controller): void;
  override removeChildController(key: string | Controller): Controller | null | void {
    let childController: Controller | null;
    if (typeof key === "string") {
      childController = this.getChildController(key);
      if (childController === null) {
        return null;
      }
    } else {
      childController = key;
    }
    if (childController.parentController !== this) {
      throw new Error("not a child controller");
    }
    this.willRemoveChildController(childController);
    childController.setParentController(null, this);
    this.removeChildControllerMap(childController);
    const childControllers = this.childControllers as Controller[];
    const index = childControllers.indexOf(childController);
    if (index >= 0) {
      childControllers.splice(index, 1);
    }
    this.onRemoveChildController(childController);
    this.didRemoveChildController(childController);
    childController.setKey(void 0);
    if (typeof key === "string") {
      return childController;
    }
  }

  override removeAll(): void {
    const childControllers = this.childControllers as Controller[];
    do {
      const count = childControllers.length;
      if (count > 0) {
        const childController = childControllers[count - 1]!;
        this.willRemoveChildController(childController);
        childController.setParentController(null, this);
        this.removeChildControllerMap(childController);
        childControllers.pop();
        this.onRemoveChildController(childController);
        this.didRemoveChildController(childController);
        childController.setKey(void 0);
        continue;
      }
      break;
    } while (true);
  }

  /** @hidden */
  protected override doMountChildControllers(): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      childController.cascadeMount();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected override doUnmountChildControllers(): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      childController.cascadeUnmount();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected override doPowerChildControllers(): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      childController.cascadePower();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected override doUnpowerChildControllers(): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      childController.cascadeUnpower();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }

  protected override compileChildControllers(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                             compileChildController: (this: this, childController: Controller, compileFlags: ControllerFlags,
                                                                      controllerContext: ControllerContextType<this>) => void): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      compileChildController.call(this, childController, compileFlags, controllerContext);
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }

  protected override executeChildControllers(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                             executeChildController: (this: this, childController: Controller, executeFlags: ControllerFlags,
                                                                      controllerContext: ControllerContextType<this>) => void): void {
    const childControllers = this.childControllers;
    let i = 0;
    while (i < childControllers.length) {
      const childController = childControllers[i]!;
      executeChildController.call(this, childController, executeFlags, controllerContext);
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
        continue;
      }
      i += 1;
    }
  }
}
