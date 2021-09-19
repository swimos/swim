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

import {View} from "../View";
import {LayoutManager} from "../layout/LayoutManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class LayoutService<V extends View, VM extends LayoutManager<V> | null | undefined = LayoutManager<V>> extends ViewManagerService<V, VM> {
  override initManager(): VM {
    return LayoutManager.global() as VM;
  }
}

ViewService({
  extends: LayoutService,
  type: LayoutManager,
  observe: false,
  manager: LayoutManager.global(),
})(View.prototype, "layoutService");
