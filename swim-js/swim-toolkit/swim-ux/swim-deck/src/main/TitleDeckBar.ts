// Copyright 2015-2021 Swim.inc
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

import {Lazy, AnyTiming} from "@swim/util";
import {Affinity} from "@swim/component";
import {Length} from "@swim/math";
import {Look} from "@swim/theme";
import {ViewContextType, ViewRef} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Graphics, VectorIcon, SvgIconView} from "@swim/graphics";
import {ButtonMembrane} from "@swim/button";
import {DeckPost} from "./DeckPost";
import {DeckRail} from "./DeckRail";
import {DeckSlider, DeckSliderItem} from "./DeckSlider";
import {DeckButton} from "./DeckButton";
import {DeckBar} from "./DeckBar";

/** @public */
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
    this.rail.setValue(rail, Affinity.Intrinsic);

    this.backMembrane.insertView();
    this.backButton.insertView();
    this.titleSlider.insertView();
    this.moreSlider.insertView();
  }

  get closeIcon(): Graphics {
    return TitleDeckBar.closeIcon;
  }

  createCloseIcon(): SvgIconView | null {
    const closeIcon = SvgIconView.create();
    closeIcon.width.setState(24, Affinity.Intrinsic);
    closeIcon.height.setState(24, Affinity.Intrinsic);
    closeIcon.iconWidth.setState(24, Affinity.Intrinsic);
    closeIcon.iconHeight.setState(24, Affinity.Intrinsic);
    closeIcon.graphics.setState(this.closeIcon, Affinity.Intrinsic);
    return closeIcon;
  }

  protected initBackMembrane(backMembrane: ButtonMembrane): void {
    backMembrane.display.setState("none", Affinity.Intrinsic);
    backMembrane.position.setState("absolute", Affinity.Intrinsic);
    backMembrane.left.setState(0, Affinity.Intrinsic);
    backMembrane.top.setState(0, Affinity.Intrinsic);
    backMembrane.borderTopLeftRadius.setState(4, Affinity.Intrinsic);
    backMembrane.borderTopRightRadius.setState(4, Affinity.Intrinsic);
    backMembrane.borderBottomLeftRadius.setState(4, Affinity.Intrinsic);
    backMembrane.borderBottomRightRadius.setState(4, Affinity.Intrinsic);
    backMembrane.overflowX.setState("hidden", Affinity.Intrinsic);
    backMembrane.overflowY.setState("hidden", Affinity.Intrinsic);
    backMembrane.cursor.setState("pointer", Affinity.Intrinsic);
  }

  get backIcon(): Graphics {
    return TitleDeckBar.backIcon;
  }

  createBackIcon(): SvgIconView | null {
    const backIcon = SvgIconView.create();
    backIcon.width.setState(24, Affinity.Intrinsic);
    backIcon.height.setState(24, Affinity.Intrinsic);
    backIcon.iconWidth.setState(24, Affinity.Intrinsic);
    backIcon.iconHeight.setState(24, Affinity.Intrinsic);
    backIcon.graphics.setState(this.backIcon, Affinity.Intrinsic);
    return backIcon;
  }

  createBackButton(): DeckButton {
    const backButton = DeckButton.create();
    backButton.backIcon.setView(this.createBackIcon());
    backButton.backIcon.insertView();
    return backButton;
  }

  protected initBackButton(backButton: DeckButton): void {
    backButton.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  protected initTitleSlider(titleSlider: DeckSlider): void {
    titleSlider.pointerEvents.setState("none", Affinity.Intrinsic);
  }

  protected initMoreSlider(moreSlider: DeckSlider): void {
    // hook
  }

  pushTitle(title: string, timing?: AnyTiming | boolean): void {
    const titleSlider = this.titleSlider.view;
    const backButton = this.backButton.view;
    if (titleSlider !== null && backButton !== null) {
      const titleRef = titleSlider.item;
      let titleView: HtmlView | null = null;
      if (titleRef !== null) {
        titleView = titleRef.view;
        titleRef.setView(null);
        titleSlider.item = null;
      }
      titleSlider.pushItem(title, timing);
      if (titleView !== null) {
        backButton.pushLabel(titleView, timing);
      } else {
        backButton.labelCount = titleSlider.itemCount;
      }
      //if (!this.deckPhase.inherited) {
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
      //if (!this.deckPhase.inherited) {
      //  this.deckPhase.setState(titleSlider.itemCount, timing);
      //}
    }
  }

  didPopBackButton(newLabelView: HtmlView | null, oldLabelView: HtmlView, backButton: DeckButton): void {
    const backRef = backButton.getFastener(oldLabelView.key!, ViewRef);
    if (backRef !== null) {
      backRef.setView(null);
      backButton.setFastener(backRef.key!, null);
    }
    const titleSlider = this.titleSlider.view;
    if (titleSlider !== null) {
      const titleKey = "item" + titleSlider.itemCount;
      const titleRef = titleSlider.getFastener(titleKey, ViewRef) as DeckSliderItem<DeckSlider, HtmlView> | null;
      if (titleRef !== null) {
        titleRef.setView(oldLabelView);
      }
      titleSlider.item = titleRef;
      titleSlider.appendChild(oldLabelView, titleKey);
    }
  }

  @ViewRef<TitleDeckBar, ButtonMembrane>({
    key: true,
    type: ButtonMembrane,
    binds: true,
    didAttachView(backMembrane: ButtonMembrane): void {
      this.owner.initBackMembrane(backMembrane);
      backMembrane.on("click", this.owner.onBackButtonClick);
    },
    willDetachView(backMembrane: ButtonMembrane): void {
      backMembrane.off("click", this.owner.onBackButtonClick);
    },
  })
  readonly backMembrane!: ViewRef<this, ButtonMembrane>;

  @ViewRef<TitleDeckBar, DeckButton>({
    key: true,
    type: DeckButton,
    binds: true,
    observes: true,
    didAttachView(backButton: DeckButton): void {
      this.owner.initBackButton(backButton);
    },
    createView(): DeckButton {
      return this.owner.createBackButton();
    },
    deckButtonDidPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView, backButton: DeckButton): void {
      this.owner.didPopBackButton(newLabelView, oldLabelView, backButton);
    },
  })
  readonly backButton!: ViewRef<this, DeckButton>;

  @ViewRef<TitleDeckBar, DeckSlider>({
    key: true,
    type: DeckSlider,
    binds: true,
    didAttachView(titleSlider: DeckSlider): void {
      this.owner.initTitleSlider(titleSlider);
    },
  })
  readonly titleSlider!: ViewRef<this, DeckSlider>;

  @ViewRef<TitleDeckBar, DeckSlider>({
    key: true,
    type: DeckSlider,
    binds: true,
    didAttachView(moreSlider: DeckSlider): void {
      this.owner.initMoreSlider(moreSlider);
    },
  })
  readonly moreSlider!: ViewRef<this, DeckSlider>;

  protected override didLayout(viewContext: ViewContextType<this>): void {
    const backMembrane = this.backMembrane.view;
    const backButton = this.backButton.view;
    if (backMembrane !== null && backButton !== null) {
      if (backMembrane.width.hasAffinity(Affinity.Intrinsic)) {
        let backButtonLeft: Length | number | null = backButton.left.state;
        backButtonLeft = backButtonLeft instanceof Length ? backButtonLeft.pxValue() : backButton.node.offsetLeft;
        if (backButton.label !== null) {
          backMembrane.width.setState(backButtonLeft + backButton.label.layoutWidth, Affinity.Intrinsic);
        } else {
          let backButtonWidth: Length | number | null = backButton.height.state;
          backButtonWidth = backButtonWidth instanceof Length ? backButtonWidth.pxValue() : backButton.node.offsetWidth;
          backMembrane.width.setState(backButtonLeft + backButtonWidth, Affinity.Intrinsic);
        }
      }
      if (backMembrane.height.hasAffinity(Affinity.Intrinsic)) {
        let backButtonTop: Length | number | null = backButton.top.state;
        backButtonTop = backButtonTop instanceof Length ? backButtonTop.pxValue() : backButton.node.offsetTop;
        let backButtonHeight: Length | number | null = backButton.height.state;
        backButtonHeight = backButtonHeight instanceof Length ? backButtonHeight.pxValue() : backButton.node.offsetHeight;
        backMembrane.height.setState(backButtonTop + backButtonHeight, Affinity.Intrinsic);
      }
      const backIcon = backButton.backIcon.view;
      if (backIcon !== null) {
        const closeIcon = backButton.closeIcon.view;
        const deckPhase = backButton.deckPhase.getValueOr(0);
        const iconPhase = Math.min(Math.max(0, deckPhase - 1), 1);
        backMembrane.display.setState(closeIcon === null && iconPhase === 0 ? "none" : "block", Affinity.Intrinsic);
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
