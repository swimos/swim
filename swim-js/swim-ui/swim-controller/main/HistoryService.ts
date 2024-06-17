// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Objects} from "@swim/util";
import {EventHandler} from "@swim/component";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import type {Uri} from "@swim/uri";
import type {HistoryStateInit} from "./HistoryState";
import {HistoryState} from "./HistoryState";

/** @public */
export interface HistoryServiceObserver<S extends HistoryService = HistoryService> extends ServiceObserver<S> {
  serviceWillPushHistory?(newState: HistoryState, oldState: HistoryState, service: S): void;

  serviceDidPushHistory?(newState: HistoryState, oldState: HistoryState, service: S): void;

  serviceWillReplaceHistory?(newState: HistoryState, oldState: HistoryState, service: S): void;

  serviceDidReplaceHistory?(newState: HistoryState, oldState: HistoryState, service: S): void;

  serviceWillPopHistory?(newState: HistoryState, oldState: HistoryState, service: S): void | boolean;

  serviceDidPopHistory?(newState: HistoryState, oldState: HistoryState, service: S): void;
}

/** @public */
export class HistoryService extends Service {
  constructor() {
    super();
    this.historyState = HistoryState.current();
  }

  declare readonly observerType?: Class<HistoryServiceObserver>;

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
    window.history.pushState(newState.environment, "", newUri.toString());
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
    if (Objects.equal(oldState, newState)) {
      return;
    }
    const newUri = HistoryState.toUri(newState);
    this.willReplaceHistory(newState, oldState);
    (this as Mutable<this>).historyState = newState;
    window.history.replaceState(newState.environment, "", newUri.toString());
    this.onReplaceHistory(newState, oldState);
    this.didReplaceHistory(newState, oldState);
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

  @EventHandler({
    eventType: "popstate",
    target: typeof window !== "undefined" ? window : null,
    handle(event: PopStateEvent): void {
      const deltaState: HistoryStateInit = {};
      if (typeof event.state === "object" && event.state !== null) {
        deltaState.environment = event.state;
      }
      const oldState = this.owner.historyState;
      const newState = HistoryState.updated(deltaState, HistoryState.current());
      this.owner.willPopHistory(newState, oldState);
      (this.owner as Mutable<typeof this.owner>).historyState = newState;
      this.owner.onPopHistory(newState, oldState);
      this.owner.didPopHistory(newState, oldState);
    },
  })
  readonly popstate!: EventHandler<this>;

  protected willPopHistory(newState: HistoryState, oldState: HistoryState): void {
    this.callObservers("serviceWillPopHistory", newState, oldState, this);
  }

  protected onPopHistory(newState: HistoryState, oldState: HistoryState): void {
    // hook
  }

  protected didPopHistory(newState: HistoryState, oldState: HistoryState): void {
    this.callObservers("serviceDidPopHistory", newState, oldState, this);
  }
}
