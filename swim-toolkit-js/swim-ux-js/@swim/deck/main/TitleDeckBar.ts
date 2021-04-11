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

import {Lazy} from "@swim/util";
import type {AnyTiming} from "@swim/mapping";
import {Length} from "@swim/math";
import {Look} from "@swim/theme";
import {ViewContextType, View, ViewFastener} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics, VectorIcon, SvgIconView} from "@swim/graphics";
import {ButtonMembrane} from "@swim/button";
import {DeckPost} from "./DeckPost";
import {DeckRail} from "./DeckRail";
import {DeckSlider, DeckSliderItem} from "./DeckSlider";
import {DeckButton} from "./DeckButton";
import {DeckBar} from "./DeckBar";

export class TitleDeckBar extends DeckBar {
  constructor(node: HTMLElement) {
    super(node);
    this.onBackButtonClick = this.onBackButtonClick.bind(this);
    this.initRail();
  }

  protected initRail(): void {
    const backPost = DeckPost.create("backButton", 0, 0, 48);
    const titlePost = DeckPost.create("titleSlider", 1, 1);
    const morePost = DeckPost.create("moreSlider", 0, 0, 48);
    const rail = DeckRail.create([backPost, titlePost, morePost]);
    this.rail.setState(rail, View.Intrinsic);

    this.backMembrane.injectView();
    this.backButton.injectView();
    this.titleSlider.injectView();
    this.moreSlider.injectView();
  }

  get closeIcon(): Graphics {
    return TitleDeckBar.closeIcon;
  }

  createCloseIcon(): SvgIconView | null {
    const closeIcon = SvgIconView.create();
    closeIcon.width.setState(24, View.Intrinsic);
    closeIcon.height.setState(24, View.Intrinsic);
    closeIcon.iconWidth.setState(24, View.Intrinsic);
    closeIcon.iconHeight.setState(24, View.Intrinsic);
    closeIcon.graphics.setState(this.closeIcon, View.Intrinsic);
    return closeIcon;
  }

  protected initBackMembrane(backMembrane: ButtonMembrane): void {
    backMembrane.display.setState("none", View.Intrinsic);
    backMembrane.position.setState("absolute", View.Intrinsic);
    backMembrane.left.setState(0, View.Intrinsic);
    backMembrane.top.setState(0, View.Intrinsic);
    backMembrane.borderTopLeftRadius.setState(4, View.Intrinsic);
    backMembrane.borderTopRightRadius.setState(4, View.Intrinsic);
    backMembrane.borderBottomLeftRadius.setState(4, View.Intrinsic);
    backMembrane.borderBottomRightRadius.setState(4, View.Intrinsic);
    backMembrane.overflowX.setState("hidden", View.Intrinsic);
    backMembrane.overflowY.setState("hidden", View.Intrinsic);
    backMembrane.cursor.setState("pointer", View.Intrinsic);
  }

  get backIcon(): Graphics {
    return TitleDeckBar.backIcon;
  }

  createBackIcon(): SvgIconView | null {
    const backIcon = SvgIconView.create();
    backIcon.width.setState(24, View.Intrinsic);
    backIcon.height.setState(24, View.Intrinsic);
    backIcon.iconWidth.setState(24, View.Intrinsic);
    backIcon.iconHeight.setState(24, View.Intrinsic);
    backIcon.graphics.setState(this.backIcon, View.Intrinsic);
    return backIcon;
  }

  createBackButton(): DeckButton | null {
    const backButton = DeckButton.create();
    backButton.backIcon.setView(this.createBackIcon());
    backButton.backIcon.injectView();
    return backButton;
  }

  protected initBackButton(backButton: DeckButton): void {
    backButton.pointerEvents.setState("none", View.Intrinsic);
  }

  protected initTitleSlider(titleSlider: DeckSlider): void {
    titleSlider.pointerEvents.setState("none", View.Intrinsic);
  }

  protected initMoreSlider(moreSlider: DeckSlider): void {
    // hook
  }

  pushTitle(title: string, timing?: AnyTiming | boolean): void {
    const titleSlider = this.titleSlider.view;
    const backButton = this.backButton.view;
    if (titleSlider !== null && backButton !== null) {
      const titleFastener = titleSlider.item;
      let titleView: HtmlView | null = null;
      if (titleFastener !== null) {
        titleView = titleFastener.view;
        titleFastener.setView(null);
        titleSlider.item = null;
      }
      titleSlider.pushItem(title, timing);
      if (titleView !== null) {
        backButton.pushLabel(titleView, timing);
      } else {
        backButton.labelCount = titleSlider.itemCount;
      }
      //if (!this.deckPhase.isInherited()) {
      //  this.deckPhase.setState(titleSlider.itemCount, timing);
      //}
    }
  }

  popTitle(timing?: AnyTiming | boolean): void {
    const titleSlider = this.titleSlider.view;
    const backButton = this.backButton.view;
    if (titleSlider !== null && backButton !== null) {
      titleSlider.popItem(timing);
      backButton.popLabel(timing);
      //if (!this.deckPhase.isInherited()) {
      //  this.deckPhase.setState(titleSlider.itemCount, timing);
      //}
    }
  }

  didPopBackButton(newLabelView: HtmlView | null, oldLabelView: HtmlView, backButton: DeckButton): void {
    const backFastener = backButton.getViewFastener(oldLabelView.key!);
    if (backFastener !== null) {
      backFastener.setView(null);
      backButton.setViewFastener(backFastener.key!, null);
    }
    const titleSlider = this.titleSlider.view;
    if (titleSlider !== null) {
      const titleKey = "item" + titleSlider.itemCount;
      const titleFastener = titleSlider.getViewFastener(titleKey) as DeckSliderItem<DeckSlider, HtmlView> | null;
      if (titleFastener !== null) {
        titleFastener.setView(oldLabelView);
      }
      titleSlider.item = titleFastener;
      titleSlider.appendChildView(oldLabelView, titleKey);
    }
  }

  @ViewFastener<TitleDeckBar, ButtonMembrane>({
    key: true,
    type: ButtonMembrane,
    onSetView(newBackMembrane: ButtonMembrane | null, oldBackMembrane: ButtonMembrane | null): void {
      if (oldBackMembrane !== null) {
        oldBackMembrane.off("click", this.owner.onBackButtonClick);
      }
      if (newBackMembrane !== null) {
        this.owner.initBackMembrane(newBackMembrane);
        newBackMembrane.on("click", this.owner.onBackButtonClick);
      }
    },
  })
  declare backMembrane: ViewFastener<this, ButtonMembrane>;

  @ViewFastener<TitleDeckBar, DeckButton>({
    key: true,
    type: DeckButton,
    observe: true,
    onSetView(backButton: DeckButton | null): void {
      if (backButton !== null) {
        this.owner.initBackButton(backButton);
      }
    },
    createView(): DeckButton | null {
      return this.owner.createBackButton();
    },
    deckButtonDidPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView, backButton: DeckButton): void {
      this.owner.didPopBackButton(newLabelView, oldLabelView, backButton);
    },
  })
  declare backButton: ViewFastener<this, DeckButton>;

  @ViewFastener<TitleDeckBar, DeckSlider>({
    key: true,
    type: DeckSlider,
    onSetView(titleSlider: DeckSlider | null): void {
      if (titleSlider !== null) {
        this.owner.initTitleSlider(titleSlider);
      }
    },
  })
  declare titleSlider: ViewFastener<this, DeckSlider>;

  @ViewFastener<TitleDeckBar, DeckSlider>({
    key: true,
    type: DeckSlider,
    onSetView(moreSlider: DeckSlider | null): void {
      if (moreSlider !== null) {
        this.owner.initMoreSlider(moreSlider);
      }
    },
  })
  declare moreSlider: ViewFastener<this, DeckSlider>;

  protected didLayout(viewContext: ViewContextType<this>): void {
    const backMembrane = this.backMembrane.view;
    const backButton = this.backButton.view;
    if (backMembrane !== null && backButton !== null) {
      if (backMembrane.width.takesPrecedence(View.Intrinsic)) {
        let backButtonLeft: Length | number | null = backButton.left.state;
        backButtonLeft = backButtonLeft instanceof Length ? backButtonLeft.pxValue() : backButton.node.offsetLeft;
        if (backButton.label !== null) {
          backMembrane.width.setState(backButtonLeft + backButton.label.layoutWidth, View.Intrinsic);
        } else {
          let backButtonWidth: Length | number | null = backButton.height.state;
          backButtonWidth = backButtonWidth instanceof Length ? backButtonWidth.pxValue() : backButton.node.offsetWidth;
          backMembrane.width.setState(backButtonLeft + backButtonWidth, View.Intrinsic);
        }
      }
      if (backMembrane.height.takesPrecedence(View.Intrinsic)) {
        let backButtonTop: Length | number | null = backButton.top.state;
        backButtonTop = backButtonTop instanceof Length ? backButtonTop.pxValue() : backButton.node.offsetTop;
        let backButtonHeight: Length | number | null = backButton.height.state;
        backButtonHeight = backButtonHeight instanceof Length ? backButtonHeight.pxValue() : backButton.node.offsetHeight;
        backMembrane.height.setState(backButtonTop + backButtonHeight, View.Intrinsic);
      }
      const backIcon = backButton.backIcon.view;
      if (backIcon !== null) {
        const closeIcon = backButton.closeIcon.view;
        const deckPhase = backButton.deckPhase.getValueOr(0);
        const iconPhase = Math.min(Math.max(0, deckPhase - 1), 1);
        backMembrane.display.setState(closeIcon === null && iconPhase === 0 ? "none" : "block", View.Intrinsic);
      }
    }
    super.didLayout(viewContext);
  }

  protected onBackButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    const deckPhase = this.deckPhase.getStateOr(0);
    if (deckPhase > 1) {
      this.didPressBackButton(event);
    } else {
      this.didPressCloseButton(event);
    }
  }

  @Lazy
  static get closeIcon(): Graphics {
    return VectorIcon.create(24, 24, "M19,6.4L17.6,5L12,10.6L6.4,5L5,6.4L10.6,12L5,17.6L6.4,19L12,13.4L17.6,19L19,17.6L13.4,12Z");
  }

  @Lazy
  static get backIcon(): Graphics {
    return VectorIcon.create(24, 24, "M11.7,3.9L9.9,2.1L0,12L9.9,21.9L11.7,20.1L3.5,12Z").withFillLook(Look.accentColor);
  }
}
