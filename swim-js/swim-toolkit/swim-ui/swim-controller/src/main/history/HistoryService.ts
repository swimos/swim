// Copyright 2015-2022 Swim.inc
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

import {Mutable, Class, Objects} from "@swim/util";
import {Service} from "@swim/component";
import type {Uri} from "@swim/uri";
import {HistoryStateInit, HistoryState} from "./HistoryState";
import type {HistoryServiceObserver} from "./HistoryServiceObserver";

/** @public */
export class HistoryService extends Service {
  constructor() {
    super();
    this.historyState = HistoryState.current();
    this.popHistory = this.popHistory.bind(this);
  }

  override readonly observerType?: Class<HistoryServiceObserver>;

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
    this.callObservers("serviceWillPushHistory", newState, oldState, this);
  }

  protected onPushHistory(newState: HistoryState, oldState: HistoryState): void {
    // hook
  }

  protected didPushHistory(newState: HistoryState, oldState: HistoryState): void {
    this.callObservers("serviceDidPushHistory", newState, oldState, this);
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
    this.callObservers("serviceWillReplaceHistory", newState, oldState, this);
  }

  protected onReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    // hook
  }

  protected didReplaceHistory(newState: HistoryState, oldState: HistoryState): void {
    this.callObservers("serviceDidReplaceHistory", newState, oldState, this);
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
    this.callObservers("serviceWillPopHistory", newState, oldState, this);
  }

  protected onPopHistory(newState: HistoryState, oldState: HistoryState): void {
    // hook
  }

  protected didPopHistory(newState: HistoryState, oldState: HistoryState): void {
    this.callObservers("serviceDidPopHistory", newState, oldState, this);
  }

  protected override onMount(): void {
    super.onMount();
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.popHistory);
    }
  }

  protected override onUnmount(): void {
    super.onUnmount();
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.popHistory);
    }
  }
}
