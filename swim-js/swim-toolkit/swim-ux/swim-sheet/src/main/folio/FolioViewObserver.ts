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

import type {View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {BarView} from "@swim/toolbar";
import type {DrawerView} from "@swim/window";
import type {SheetView} from "../sheet/SheetView";
import type {StackView} from "../stack/StackView";
import type {FolioStyle, FolioView} from "./FolioView";

/** @public */
export interface FolioViewObserver<V extends FolioView = FolioView> extends HtmlViewObserver<V> {
  viewDidSetFolioStyle?(folioStyle: FolioStyle | undefined, view: V): void;

  viewDidSetFullBleed?(fullBleed: boolean, view: V): void;

  viewWillAttachAppBar?(appBarView: BarView, targetView: View | null, view: V): void;

  viewDidDetachAppBar?(appBarView: BarView, view: V): void;

  viewWillAttachDrawer?(drawerView: DrawerView, targetView: View | null, view: V): void;

  viewDidDetachDrawer?(drawerView: DrawerView, view: V): void;

  viewWillAttachStack?(stackView: StackView, targetView: View | null, view: V): void;

  viewDidDetachStack?(stackView: StackView, view: V): void;

  viewWillAttachCover?(coverView: SheetView, targetView: View | null, view: V): void;

  viewDidDetachCover?(coverView: SheetView, view: V): void;
}
