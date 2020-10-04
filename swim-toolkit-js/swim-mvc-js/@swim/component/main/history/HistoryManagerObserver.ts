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
import {ComponentManagerObserver} from "../manager/ComponentManagerObserver";
import {HistoryState} from "./HistoryState";
import {HistoryManager} from "./HistoryManager";

export interface HistoryManagerObserver<C extends Component = Component, CM extends HistoryManager<C> = HistoryManager<C>> extends ComponentManagerObserver<C, CM> {
  historyManagerWillPushHistory?(historyState: HistoryState, historyManager: CM): void;

  historyManagerDidPushHistory?(historyState: HistoryState, historyManager: CM): void;

  historyManagerWillReplaceHistory?(historyState: HistoryState, historyManager: CM): void;

  historyManagerDidReplaceHistory?(historyState: HistoryState, historyManager: CM): void;

  historyManagerWillPopHistory?(historyState: HistoryState, historyManager: CM): void | boolean;

  historyManagerDidPopHistory?(historyState: HistoryState, historyManager: CM): void;
}
