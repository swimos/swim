// Copyright 2015-2023 Swim.inc
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

import type {View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {BarView} from "@swim/toolbar";
import type {SheetView} from "../sheet/SheetView";
import type {StackView} from "./StackView";

/** @public */
export interface StackViewObserver<V extends StackView = StackView> extends HtmlViewObserver<V> {
  viewWillAttachNavBar?(navBarView: BarView, targetView: View | null, view: V): void;

  viewDidDetachNavBar?(navBarView: BarView, view: V): void;

  viewWillAttachSheet?(sheetView: SheetView, targetView: View | null, view: V): void;

  viewDidDetachSheet?(sheetView: SheetView, view: V): void;

  viewWillAttachFront?(frontView: SheetView, targetView: View | null, view: V): void;

  viewDidDetachFront?(frontView: SheetView, view: V): void;

  viewWillPresentSheet?(sheetView: SheetView, view: V): void;

  viewDidPresentSheet?(sheetView: SheetView, view: V): void;

  viewWillDismissSheet?(sheetView: SheetView, view: V): void;

  viewDidDismissSheet?(sheetView: SheetView, view: V): void;
}
