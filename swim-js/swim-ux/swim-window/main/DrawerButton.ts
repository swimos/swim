// Copyright 2015-2024 Nstream, inc.
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

import {Lazy} from "@swim/util";
import type {Mutable} from "@swim/util";
import {EventHandler} from "@swim/component";
import type {Graphics} from "@swim/graphics";
import {VectorIcon} from "@swim/graphics";
import {IconButton} from "@swim/button";
import type {DrawerView} from "./DrawerView";

/** @public */
export class DrawerButton extends IconButton {
  constructor(node: HTMLElement) {
    super(node);
    this.drawerView = null;
    this.initIcon();
  }

  protected override initButton(): void {
    super.initButton();
    this.classList.add("drawer-button");
  }

  protected initIcon(): void {
    this.icon.push(DrawerButton.hamburgerIcon);
  }

  readonly drawerView: DrawerView | null;

  setDrawerView(drawerView: DrawerView | null): void {
    (this as Mutable<this>).drawerView = drawerView;
  }

  @EventHandler({
    extends: true,
    handle(event: MouseEvent): void {
      super.handle(event);
      const drawerView = this.owner.drawerView;
      if (drawerView !== null) {
        drawerView.toggle();
      }
    },
  })
  override readonly click!: EventHandler<this>;

  @Lazy
  static get hamburgerIcon(): Graphics {
    return VectorIcon.create(24, 24, "M21,17L21,19L3,19L3,17L21,17ZM21,11L21,13L3,13L3,11L21,11ZM3,5L3,7L21,7L21,5L3,5Z");
  }
}
