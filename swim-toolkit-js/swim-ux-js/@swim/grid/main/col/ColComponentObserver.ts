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

import type {HtmlView} from "@swim/dom";
import type {ComponentObserver} from "@swim/component";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "./ColView";
import type {ColTrait} from "./ColTrait";
import type {ColComponent} from "./ColComponent";

export interface ColComponentObserver<C extends ColComponent = ColComponent> extends ComponentObserver<C> {
  componentWillSetColView?(newColView: ColView | null, oldColView: ColView | null, component: C): void;

  componentDidSetColView?(newColView: ColView | null, oldColView: ColView | null, component: C): void;

  componentWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, component: C): void;

  componentDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, component: C): void;

  componentWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, component: C): void;

  componentDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, component: C): void;

  componentWillSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, component: C): void;

  componentDidSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, component: C): void;
}
