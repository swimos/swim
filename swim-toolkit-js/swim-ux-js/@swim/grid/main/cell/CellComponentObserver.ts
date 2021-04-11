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
import type {CellView} from "./CellView";
import type {CellTrait} from "./CellTrait";
import type {CellComponent} from "./CellComponent";

export interface CellComponentObserver<C extends CellComponent = CellComponent> extends ComponentObserver<C> {
  componentWillSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, component: C): void;

  componentDidSetCellView?(newCellView: CellView | null, oldCellView: CellView | null, component: C): void;

  componentWillSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, component: C): void;

  componentDidSetCellTrait?(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, component: C): void;

  componentWillSetCellContentView?(cellContentView: HtmlView | null, oldCellContentView: HtmlView | null, component: C): void;

  componentDidSetCellContentView?(cellContentView: HtmlView | null, oldCellContentView: HtmlView | null, component: C): void;
}
