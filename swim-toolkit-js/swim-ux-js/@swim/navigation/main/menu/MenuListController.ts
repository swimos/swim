// Copyright 2015-2020 SWIM.AI inc.
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

import {HtmlViewController} from "@swim/view";
import {MenuItem} from "./MenuItem";
import {MenuList} from "./MenuList";
import {MenuListObserver} from "./MenuListObserver";

export class MenuListController<V extends MenuList = MenuList> extends HtmlViewController<V> implements MenuListObserver<V> {
  /** @hidden */
  _selectedItem: MenuItem | null;

  constructor() {
    super();
    this._selectedItem = null;
  }

  get selectedItem(): MenuItem | null {
    return this._selectedItem;
  }

  selectItem(newItem: MenuItem | null): void {
    const oldItem = this._selectedItem;
    if (oldItem !== newItem) {
      this.willSelectItem(newItem, oldItem);
      this._selectedItem = newItem;
      this.onSelectItem(newItem, oldItem);
      this.didSelectItem(newItem, oldItem);
    }
  }

  protected willSelectItem(newItem: MenuItem | null, oldItem: MenuItem | null): void {
    // hook
  }

  protected onSelectItem(newItem: MenuItem | null, oldItem: MenuItem | null): void {
    if (oldItem !== null) {
      oldItem.unhighlight(true);
    }
    if (newItem !== null) {
      newItem.highlight(false);
    }
  }

  protected didSelectItem(newItem: MenuItem | null, oldItem: MenuItem | null): void {
    // hook
  }

  menuDidPressItem(item: MenuItem, view: V): void {
    this.selectItem(item);
  }
}
