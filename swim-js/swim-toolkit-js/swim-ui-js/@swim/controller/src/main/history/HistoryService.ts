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

import {Mutable, Class, Lazy, Objects, Service} from "@swim/util";
import type {Uri} from "@swim/uri";
import {HistoryStateInit, HistoryState} from "./HistoryState";
import type {HistoryServiceObserver} from "./HistoryServiceObserver";
import {Controller} from "../"; // forward import

export class HistoryService<C extends Controller = Controller> extends Service<C> {
  constructor() {
    super();
    this.historyState = HistoryState.current();
    this.popHistory = this.popHistory.bind(this);
  }

  override readonly observerType?: Class<HistoryServiceObserver<C>>;

  /** @internal */
  readonly historyState: HistoryState;

  get historyUri(): Uri {
    return HistoryState.toUri(this.historyState);
  }

  pushHistory(deltaState: HistoryStateInit): void {
    const oldState = this.historyState;
    const newState = HistoryState.updated(deltaState, HistoryState.cloned(oldState));
    const newUri = HistoryState.toUri(newState);
    this.willPushHistory(newState, oldState);
    (this as Mutable<this>).historyState = newState;
    window.history.pushState(newState.ephemeral, "", newUri.toString());
    this.onPushHistory(newState, oldState);
    this.didPushHistory(newState, oldState);
  }

  protected willPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillPushHistory !== void 0) {
        observer.serviceWillPushHistory(newState, oldState, this);
      }
    }
  }

  protected onPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didPushHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidPushHistory !== void 0) {
        observer.serviceDidPushHistory(newState, oldState, this);
      }
    }
  }

  replaceHistory(deltaState: HistoryStateInit): void {
    const oldState = this.historyState;
    const newState = HistoryState.updated(deltaState, HistoryState.cloned(oldState));
    if (!Objects.equal(oldState, newState)) {
      const newUri = HistoryState.toUri(newState);
      this.willReplaceHistory(newState, oldState);
      (this as Mutable<this>).historyState = newState;
      window.history.replaceState(newState.ephemeral, "", newUri.toString());
      this.onReplaceHistory(newState, oldState);
      this.didReplaceHistory(newState, oldState);
    }
  }

  protected willReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillReplaceHistory !== void 0) {
        observer.serviceWillReplaceHistory(newState, oldState, this);
      }
    }
  }

  protected onReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidReplaceHistory !== void 0) {
        observer.serviceDidReplaceHistory(newState, oldState, this);
      }
    }
  }

  /** @internal */
  popHistory(event: PopStateEvent): void {
    const deltaState: HistoryStateInit = {};
    if (typeof event.state === "object" && event.state !== null) {
      deltaState.ephemeral = event.state;
    }
    const oldState = HistoryState.current();
    const newState = HistoryState.updated(deltaState, oldState);
    this.willPopHistory(newState, oldState);
    (this as Mutable<this>).historyState = newState;
    this.onPopHistory(newState, oldState);
    this.didPopHistory(newState, oldState);
  }

  protected willPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillPopHistory !== void 0) {
        observer.serviceWillPopHistory(newState, oldState, this);
      }
    }
  }

  protected onPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      roots[i]!.requireUpdate(Controller.NeedsRevise);
    }
  }

  protected didPopHistory(newState: HistoryState, oldState: HistoryState): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidPopHistory !== void 0) {
        observer.serviceDidPopHistory(newState, oldState, this);
      }
    }
  }

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
  static global<C extends Controller>(): HistoryService<C> {
    return new HistoryService();
  }
}
