// Copyright 2015-2020 Swim inc.
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

import {Component} from "../Component";
import type {HistoryStateInit, HistoryState} from "../history/HistoryState";
import {HistoryManager} from "../history/HistoryManager";
import {ComponentService} from "./ComponentService";
import {ComponentManagerService} from "./ComponentManagerService";

export abstract class HistoryService<C extends Component> extends ComponentManagerService<C, HistoryManager<C>> {
  get historyState(): HistoryState {
    return this.manager.historyState;
  }

  pushHistory(deltaState: HistoryStateInit): void {
    this.manager.pushHistory(deltaState);
  }

  replaceHistory(deltaState: HistoryStateInit): void {
    this.manager.replaceHistory(deltaState);
  }

  initManager(): HistoryManager<C> {
    return HistoryManager.global();
  }
}

ComponentService({type: HistoryManager, observe: false})(Component.prototype, "historyService");
