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
import {Component} from "../Component";
import {ComponentManager} from "../manager/ComponentManager";
import {HistoryStateInit, HistoryState} from "./HistoryState";
import type {HistoryManagerObserver} from "./HistoryManagerObserver";

export class HistoryManager<C extends Component = Component> extends ComponentManager<C> {
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
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerWillPushHistory !== void 0) {
        componentManagerObserver.historyManagerWillPushHistory(newState, oldState, this);
      }
    }
  }

  protected onPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      rootComponents[i]!.requireUpdate(Component.NeedsRevise);
    }
  }

  protected didPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerDidPushHistory !== void 0) {
        componentManagerObserver.historyManagerDidPushHistory(newState, oldState, this);
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
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerWillReplaceHistory !== void 0) {
        componentManagerObserver.historyManagerWillReplaceHistory(newState, oldState, this);
      }
    }
  }

  protected onReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      rootComponents[i]!.requireUpdate(Component.NeedsRevise);
    }
  }

  protected didReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerDidReplaceHistory !== void 0) {
        componentManagerObserver.historyManagerDidReplaceHistory(newState, oldState, this);
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
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerWillPopHistory !== void 0) {
        componentManagerObserver.historyManagerWillPopHistory(newState, oldState, this);
      }
    }
  }

  protected onPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const rootComponents = this.rootComponents;
    for (let i = 0, n = rootComponents.length; i < n; i += 1) {
      rootComponents[i]!.requireUpdate(Component.NeedsRevise);
    }
  }

  protected didPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const componentManagerObservers = this.componentManagerObservers;
    for (let i = 0, n = componentManagerObservers.length; i < n; i += 1) {
      const componentManagerObserver = componentManagerObservers[i]!;
      if (componentManagerObserver.historyManagerDidPopHistory !== void 0) {
        componentManagerObserver.historyManagerDidPopHistory(newState, oldState, this);
      }
    }
  }

  override readonly componentManagerObservers!: ReadonlyArray<HistoryManagerObserver>;

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
  static global<C extends Component>(): HistoryManager<C> {
    return new HistoryManager();
  }
}
