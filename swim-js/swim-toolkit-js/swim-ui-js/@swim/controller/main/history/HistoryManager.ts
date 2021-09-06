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

import {Lazy, Objects} from "@swim/util";
import type {Uri} from "@swim/uri";
import {Controller} from "../Controller";
import {ControllerManager} from "../manager/ControllerManager";
import {HistoryStateInit, HistoryState} from "./HistoryState";
import type {HistoryManagerObserver} from "./HistoryManagerObserver";

export class HistoryManager<C extends Controller = Controller> extends ControllerManager<C> {
  constructor() {
    super();
    Object.defineProperty(this, "historyState", {
      value: HistoryState.current(),
      enumerable: true,
      configurable: true,
    });
    this.popHistory = this.popHistory.bind(this);
  }

  /** @hidden */
  readonly historyState!: HistoryState;

  get historyUri(): Uri {
    return HistoryState.toUri(this.historyState);
  }

  pushHistory(deltaState: HistoryStateInit): void {
    const oldState = this.historyState;
    const newState = HistoryState.updated(deltaState, HistoryState.cloned(oldState));
    const newUri = HistoryState.toUri(newState);
    this.willPushHistory(newState, oldState);
    Object.defineProperty(this, "historyState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    window.history.pushState(newState.ephemeral, "", newUri.toString());
    this.onPushHistory(newState, oldState);
    this.didPushHistory(newState, oldState);
  }

  protected willPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerWillPushHistory !== void 0) {
        controllerManagerObserver.historyManagerWillPushHistory(newState, oldState, this);
      }
    }
  }

  protected onPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      rootControllers[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerDidPushHistory !== void 0) {
        controllerManagerObserver.historyManagerDidPushHistory(newState, oldState, this);
      }
    }
  }

  replaceHistory(deltaState: HistoryStateInit): void {
    const oldState = this.historyState;
    const newState = HistoryState.updated(deltaState, HistoryState.cloned(oldState));
    if (!Objects.equal(oldState, newState)) {
      const newUri = HistoryState.toUri(newState);
      this.willReplaceHistory(newState, oldState);
      Object.defineProperty(this, "historyState", {
        value: newState,
        enumerable: true,
        configurable: true,
      });
      window.history.replaceState(newState.ephemeral, "", newUri.toString());
      this.onReplaceHistory(newState, oldState);
      this.didReplaceHistory(newState, oldState);
    }
  }

  protected willReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerWillReplaceHistory !== void 0) {
        controllerManagerObserver.historyManagerWillReplaceHistory(newState, oldState, this);
      }
    }
  }

  protected onReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      rootControllers[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerDidReplaceHistory !== void 0) {
        controllerManagerObserver.historyManagerDidReplaceHistory(newState, oldState, this);
      }
    }
  }

  /** @hidden */
  popHistory(event: PopStateEvent): void {
    const deltaState: HistoryStateInit = {};
    if (typeof event.state === "object" && event.state !== null) {
      deltaState.ephemeral = event.state;
    }
    const oldState = HistoryState.current();
    const newState = HistoryState.updated(deltaState, oldState);
    this.willPopHistory(newState, oldState);
    Object.defineProperty(this, "historyState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    this.onPopHistory(newState, oldState);
    this.didPopHistory(newState, oldState);
  }

  protected willPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerWillPopHistory !== void 0) {
        controllerManagerObserver.historyManagerWillPopHistory(newState, oldState, this);
      }
    }
  }

  protected onPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootControllers = this.rootControllers;
    for (let i = 0, n = rootControllers.length; i < n; i += 1) {
      rootControllers[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const controllerManagerObservers = this.controllerManagerObservers;
    for (let i = 0, n = controllerManagerObservers.length; i < n; i += 1) {
      const controllerManagerObserver = controllerManagerObservers[i]!;
      if (controllerManagerObserver.historyManagerDidPopHistory !== void 0) {
        controllerManagerObserver.historyManagerDidPopHistory(newState, oldState, this);
      }
    }
  }

  override readonly controllerManagerObservers!: ReadonlyArray<HistoryManagerObserver>;

  protected override onAttach(): void {
    super.onAttach();
    this.attachEvents();
  }

  protected override onDetach(): void {
    this.detachEvents();
    super.onDetach();
  }

  protected attachEvents(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.popHistory);
    }
  }

  protected detachEvents(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.popHistory);
    }
  }

  @Lazy
  static global<C extends Controller>(): HistoryManager<C> {
    return new HistoryManager();
  }
}
