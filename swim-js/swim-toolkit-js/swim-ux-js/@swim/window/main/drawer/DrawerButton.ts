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

import {Lazy} from "@swim/util";
import {Graphics, VectorIcon} from "@swim/graphics";
import {IconButton} from "@swim/button";
import type {DrawerView} from "./DrawerView";

export class DrawerButton extends IconButton {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "drawerView", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.initIcon();
  }

  protected override initButton(): void {
    super.initButton();
    this.addClass("drawer-button");
  }

  protected initIcon(): void {
    this.pushIcon(DrawerButton.hamburgerIcon);
  }

  readonly drawerView!: DrawerView | null;

  setDrawerView(drawerView: DrawerView | null): void {
    Object.defineProperty(this, "drawerView", {
      value: drawerView,
      enumerable: true,
      configurable: true,
    });
  }

  protected override onClick(event: MouseEvent): void {
    super.onClick(event);
    const drawerView = this.drawerView;
    if (drawerView !== null) {
      drawerView.toggle();
    }
  }

  @Lazy
  static get hamburgerIcon(): Graphics {
    return VectorIcon.create(24, 24, "M21,17L21,19L3,19L3,17L21,17ZM21,11L21,13L3,13L3,11L21,11ZM3,5L3,7L21,7L21,5L3,5Z");
  }
}
