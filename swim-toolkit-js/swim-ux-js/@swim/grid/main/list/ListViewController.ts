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

import {HtmlViewController} from "@swim/dom";
import type {ListItem} from "./ListItem";
import type {ListView} from "./ListView";
import type {ListViewObserver} from "./ListViewObserver";

export class ListViewController<V extends ListView = ListView> extends HtmlViewController<V> implements ListViewObserver<V> {
  constructor() {
    super();
    Object.defineProperty(this, "selectedItem", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly selectedItem: ListItem | null;

  selectItem(newItem: ListItem | null): void {
    const oldItem = this.selectedItem;
    if (oldItem !== newItem) {
      this.willSelectItem(newItem, oldItem);
      Object.defineProperty(this, "selectedItem", {
        value: newItem,
        enumerable: true,
        configurable: true,
      });
      this.onSelectItem(newItem, oldItem);
      this.didSelectItem(newItem, oldItem);
    }
  }

  protected willSelectItem(newItem: ListItem | null, oldItem: ListItem | null): void {
    // hook
  }

  protected onSelectItem(newItem: ListItem | null, oldItem: ListItem | null): void {
    if (oldItem !== null) {
      oldItem.unhighlight(true);
    }
    if (newItem !== null) {
      newItem.highlight(false);
    }
  }

  protected didSelectItem(newItem: ListItem | null, oldItem: ListItem | null): void {
    // hook
  }

  listDidPressItem(item: ListItem, view: V): void {
    this.selectItem(item);
  }
}
