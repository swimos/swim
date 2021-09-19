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

import {Controller} from "../Controller";
import type {HistoryStateInit, HistoryState} from "../history/HistoryState";
import {HistoryManager} from "../history/HistoryManager";
import {ControllerService} from "./ControllerService";
import {ControllerManagerService} from "./ControllerManagerService";

export abstract class HistoryService<C extends Controller, CM extends HistoryManager<C> | null | undefined = HistoryManager<C>> extends ControllerManagerService<C, CM> {
  get historyState(): HistoryState {
    let manager: HistoryManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = HistoryManager.global();
    }
    return manager.historyState;
  }

  pushHistory(deltaState: HistoryStateInit): void {
    let manager: HistoryManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = HistoryManager.global();
    }
    manager.pushHistory(deltaState);
  }

  replaceHistory(deltaState: HistoryStateInit): void {
    let manager: HistoryManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = HistoryManager.global();
    }
    manager.replaceHistory(deltaState);
  }

  override initManager(): CM {
    return HistoryManager.global() as CM;
  }
}

ControllerService({
  extends: HistoryService,
  type: HistoryManager,
  observe: false,
  manager: HistoryManager.global(),
})(Controller.prototype, "historyService");
