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

import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Observes} from "@swim/util";
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {ToolController} from "@swim/toolbar";
import type {BarView} from "@swim/toolbar";
import {BarController} from "@swim/toolbar";
import type {SheetView} from "./SheetView";
import {SheetController} from "./SheetController";
import {NavBarController} from "./NavBarController";
import {StackView} from "./StackView";

/** @public */
export interface StackControllerObserver<C extends StackController = StackController> extends ControllerObserver<C> {
  controllerWillAttachStackTrait?(stackTrait: Trait, controller: C): void;

  controllerDidDetachStackTrait?(stackTrait: Trait, controller: C): void;

  controllerWillAttachStackView?(stackView: StackView, controller: C): void;

  controllerDidDetachStackView?(stackView: StackView, controller: C): void;

  controllerWillAttachNavBar?(navBarController: BarController, controller: C): void;

  controllerDidDetachNavBar?(navBarController: BarController, controller: C): void;

  controllerWillAttachNavBarView?(navBarView: BarView, controller: C): void;

  controllerDidDetachNavBarView?(navBarView: BarView, controller: C): void;

  controllerDidPressCloseButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressBackButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressSearchButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerWillAttachSheet?(sheetController: SheetController, controller: C): void;

  controllerDidDetachSheet?(sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetTrait?(sheetTrait: Trait, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetTrait?(sheetTrait: Trait, sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetView?(sheetView: SheetView, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetView?(sheetView: SheetView, sheetController: SheetController, controller: C): void;

  controllerWillAttachSheetTitle?(titleController: ToolController, sheetController: SheetController, controller: C): void;

  controllerDidDetachSheetTitle?(titleController: ToolController, sheetController: SheetController, controller: C): void;

  controllerWillAttachRoot?(rootController: SheetController, controller: C): void;

  controllerDidDetachRoot?(rootController: SheetController, controller: C): void;

  controllerWillAttachRootTrait?(rootTrait: Trait, controller: C): void;

  controllerDidDetachRootTrait?(rootTrait: Trait, controller: C): void;

  controllerWillAttachRootView?(rootView: SheetView, controller: C): void;

  controllerDidDetachRootView?(rootView: SheetView, controller: C): void;

  controllerWillAttachFront?(frontController: SheetController, controller: C): void;

  controllerDidDetachFront?(frontController: SheetController, controller: C): void;

  controllerWillAttachFrontTrait?(frontTrait: Trait, controller: C): void;

  controllerDidDetachFrontTrait?(frontTrait: Trait, controller: C): void;

  controllerWillAttachFrontView?(frontView: SheetView, controller: C): void;

  controllerDidDetachFrontView?(frontView: SheetView, controller: C): void;
}

/** @public */
export class StackController extends Controller {
  declare readonly observerType?: Class<StackControllerObserver>;

  @Property({valueType: Number, value: -(1 / 3)})
  readonly backAlign!: Property<this, number>;

  @TraitViewRef({
    willAttachTrait(stackTrait: Trait): void {
      this.owner.callObservers("controllerWillAttachStackTrait", stackTrait, this.owner);
    },
    didDetachTrait(stackTrait: Trait): void {
      this.owner.callObservers("controllerDidDetachStackTrait", stackTrait, this.owner);
    },
    viewType: StackView,
    observesView: true,
    initView(stackView: StackView): void {
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        navBarController.bar.insertView(stackView);
        if (stackView.navBar.view === null) {
          stackView.navBar.setView(navBarController.bar.view);
        }
      }
      const sheetControllers = this.owner.sheets.controllers;
      for (const controllerId in sheetControllers) {
        const sheetController = sheetControllers[controllerId]!;
        const sheetView = sheetController.sheet.view;
        if (sheetView !== null && sheetView.parent === null) {
          const sheetTrait = sheetController.sheet.trait;
          if (sheetTrait !== null) {
            sheetController.sheet.insertView(stackView, void 0, void 0, sheetTrait.key);
          }
        }
      }
    },
    willAttachView(stackView: StackView): void {
      this.owner.callObservers("controllerWillAttachStackView", stackView, this.owner);
    },
    didDetachView(stackView: StackView): void {
      this.owner.callObservers("controllerDidDetachStackView", stackView, this.owner);
    },
    viewWillAttachNavBar(navBarView: BarView): void {
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        navBarController.bar.setView(navBarView);
      }
    },
    viewDidDetachNavBar(navBarView: BarView): void {
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        navBarController.bar.setView(null);
      }
    },
  })
  readonly stack!: TraitViewRef<this, Trait, StackView> & Observes<StackView>;

  protected didPressCloseButton(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("controllerDidPressCloseButton", input, event, this);
  }

  protected didPressBackButton(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("controllerDidPressBackButton", input, event, this);
    if (!input.defaultPrevented) {
      this.front.dismiss();
    }
  }

  protected didPressSearchButton(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("controllerDidPressSearchButton", input, event, this);
  }

  @TraitViewControllerRef({
    controllerType: BarController,
    binds: true,
    observes: true,
    get parentView(): StackView | null {
      return this.owner.stack.view;
    },
    getTraitViewRef(navBarController: BarController): TraitViewRef<unknown, Trait, BarView> {
      return navBarController.bar;
    },
    willAttachController(navBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachNavBar", navBarController, this.owner);
    },
    didAttachController(navBarController: BarController): void {
      navBarController.bar.insertView();
    },
    willDetachController(navBarController: BarController): void {
      const navBarView = navBarController.bar.view;
      if (navBarView !== null) {
        this.detachNavBarView(navBarView, navBarController);
      }
    },
    didDetachController(navBarController: BarController): void {
      this.owner.callObservers("controllerDidDetachNavBar", navBarController, this.owner);
    },
    controllerWillAttachBarView(navBarView: BarView, navBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachNavBarView", navBarView, this.owner);
      this.attachNavBarView(navBarView, navBarController);
    },
    controllerDidDetachBarView(navBarView: BarView, navBarController: BarController): void {
      this.detachNavBarView(navBarView, navBarController);
      this.owner.callObservers("controllerDidDetachNavBarView", navBarView, this.owner);
    },
    attachNavBarView(navBarView: BarView, navBarController: BarController): void {
      const stackView = this.owner.stack.view;
      if (stackView !== null && stackView.navBar.view === null) {
        stackView.navBar.setView(navBarView);
      }
      const frontView = this.owner.front.view;
      if (frontView !== null) {
        this.frontViewDidScroll(frontView, navBarController);
      }
    },
    detachNavBarView(navBarView: BarView, navBarController: BarController): void {
      navBarView.remove();
    },
    controllerDidPressCloseButton(input: PositionGestureInput, event: Event | null): void {
      this.owner.didPressCloseButton(input, event);
    },
    controllerDidPressBackButton(input: PositionGestureInput, event: Event | null): void {
      this.owner.didPressBackButton(input, event);
    },
    controllerDidPressSearchButton(input: PositionGestureInput, event: Event | null): void {
      this.owner.didPressSearchButton(input, event);
    },
    frontViewDidScroll(frontView: SheetView, navBarController: BarController): void {
      // hook
    },
    createController(): BarController {
      return new NavBarController();
    },
  })
  readonly navBar!: TraitViewControllerRef<this, Trait, BarView, BarController> & Observes<NavBarController> & {
    attachNavBarView(navBarView: BarView, navBarController: BarController): void;
    detachNavBarView(navBarView: BarView, navBarController: BarController): void;
    frontViewDidScroll(frontView: SheetView, navBarController: BarController): void;
  };

  @TraitViewControllerSet({
    controllerType: SheetController,
    binds: false,
    observes: true,
    get parentView(): StackView | null {
      return this.owner.stack.view;
    },
    getTraitViewRef(sheetController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return sheetController.sheet;
    },
    willAttachController(sheetController: SheetController): void {
      const backController = this.owner.front.controller;
      if (sheetController !== backController) {
        sheetController.back.setController(backController);
        if (backController !== null) {
          backController.forward.setController(sheetController);
        }
        if (this.owner.root.controller === null) {
          this.owner.root.setController(sheetController);
        }
        this.owner.front.setController(sheetController);
      }
      this.owner.callObservers("controllerWillAttachSheet", sheetController, this.owner);
    },
    didAttachController(sheetController: SheetController): void {
      const sheetTrait = sheetController.sheet.trait;
      if (sheetTrait !== null) {
        this.attachSheetTrait(sheetTrait, sheetController);
      }
      const sheetView = sheetController.sheet.view;
      if (sheetView !== null) {
        this.attachSheetView(sheetView, sheetController);
      }
    },
    willDetachController(sheetController: SheetController): void {
      const sheetView = sheetController.sheet.view;
      if (sheetView !== null) {
        this.detachSheetView(sheetView, sheetController);
      }
      const sheetTrait = sheetController.sheet.trait;
      if (sheetTrait !== null) {
        this.detachSheetTrait(sheetTrait, sheetController);
      }
    },
    didDetachController(sheetController: SheetController): void {
      const backController = sheetController.back.controller;
      const forwardController = sheetController.forward.controller;
      if (sheetController === this.owner.front.controller) {
        this.owner.front.setController(backController, forwardController);
      }
      if (backController !== null) {
        backController.forward.setController(forwardController);
        sheetController.back.setController(null);
      }
      if (forwardController !== null) {
        sheetController.forward.setController(null);
        forwardController.back.setController(backController);
      }
      this.owner.callObservers("controllerDidDetachSheet", sheetController, this.owner);
    },
    controllerWillAttachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void {
      this.owner.callObservers("controllerWillAttachSheetTrait", sheetTrait, sheetController, this.owner);
      this.attachSheetTrait(sheetTrait, sheetController);
    },
    controllerDidDetachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void {
      this.detachSheetTrait(sheetTrait, sheetController);
      this.owner.callObservers("controllerDidDetachSheetTrait", sheetTrait, sheetController, this.owner);
    },
    attachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void {
      // hook
    },
    detachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(sheetView: SheetView, sheetController: SheetController): void {
      this.owner.callObservers("controllerWillAttachSheetView", sheetView, sheetController, this.owner);
      this.attachSheetView(sheetView, sheetController);
    },
    controllerDidDetachSheetView(sheetView: SheetView, sheetController: SheetController): void {
      this.detachSheetView(sheetView, sheetController);
      this.owner.callObservers("controllerDidDetachSheetView", sheetView, sheetController, this.owner);
    },
    attachSheetView(sheetView: SheetView, sheetController: SheetController): void {
      const titleController = sheetController.title.controller;
      if (titleController !== null) {
        this.attachTitle(titleController, sheetController);
      }
      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        stackView.sheets.addView(sheetView);
      }
    },
    detachSheetView(sheetView: SheetView, sheetController: SheetController): void {
      const titleController = sheetController.title.controller;
      if (titleController !== null) {
        this.detachTitle(titleController, sheetController);
      }
      sheetView.remove();
    },
    controllerWillAttachTitle(titleController: ToolController, sheetController: SheetController): void {
      this.owner.callObservers("controllerWillAttachSheetTitle", titleController, sheetController, this.owner);
      this.attachTitle(titleController, sheetController);
    },
    controllerDidDetachTitle(titleController: ToolController, sheetController: SheetController): void {
      this.detachTitle(titleController, sheetController);
      this.owner.callObservers("controllerDidDetachSheetTitle", titleController, sheetController, this.owner);
    },
    attachTitle(titleController: ToolController, sheetController: SheetController): void {
      // hook
    },
    detachTitle(titleController: ToolController, sheetController: SheetController): void {
      titleController.remove();
    },
    controllerWillPresentSheetView(sheetView: SheetView, sheetController: SheetController): void {
      // hook
    },
    controllerDidPresentSheetView(sheetView: SheetView, sheetController: SheetController): void {
      // hook
    },
    controllerWillDismissSheetView(sheetView: SheetView, sheetController: SheetController): void {
      if (sheetController === this.owner.front.controller) {
        this.owner.front.setController(null);
        const backController = sheetController.back.controller;
        if (backController !== null) {
          this.owner.front.setController(backController, sheetController);
          backController.forward.setController(null);
          sheetController.back.setController(null);
        }
      }
    },
    controllerDidDismissSheetView(sheetView: SheetView, sheetController: SheetController): void {
      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        if (sheetController.forward.controller !== null) {
          stackView.sheets.removeView(sheetView);
        } else {
          stackView.sheets.deleteView(sheetView);
        }
      }
      if (sheetController.forward.controller === null) {
        this.deleteController(sheetController);
      }
    },
  })
  readonly sheets!: TraitViewControllerSet<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void;
    detachSheetTrait(sheetTrait: Trait, sheetController: SheetController): void;
    attachSheetView(sheetView: SheetView, sheetController: SheetController): void;
    detachSheetView(sheetView: SheetView, sheetController: SheetController): void;
    attachTitle(titleController: ToolController, sheetController: SheetController): void;
    detachTitle(titleController: ToolController, sheetController: SheetController): void;
  };

  @TraitViewControllerRef({
    controllerType: SheetController,
    binds: false,
    observes: true,
    getTraitViewRef(rootController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return rootController.sheet;
    },
    willAttachController(rootController: SheetController, targetController: Controller | null): void {
      this.owner.callObservers("controllerWillAttachRoot", rootController, this.owner);
    },
    didAttachController(rootController: SheetController, targetController: Controller | null): void {
      const rootTrait = rootController.sheet.trait;
      if (rootTrait !== null) {
        this.attachRootTrait(rootTrait, rootController);
      }
      const rootView = rootController.sheet.view;
      if (rootView !== null) {
        this.attachRootView(rootView, rootController);
      }
    },
    willDetachController(rootController: SheetController): void {
      const rootView = rootController.sheet.view;
      if (rootView !== null) {
        this.detachRootView(rootView, rootController);
      }
      const rootTrait = rootController.sheet.trait;
      if (rootTrait !== null) {
        this.detachRootTrait(rootTrait, rootController);
      }
    },
    didDetachController(rootController: SheetController): void {
      this.owner.callObservers("controllerDidDetachRoot", rootController, this.owner);
    },
    controllerWillAttachSheetTrait(rootTrait: Trait, rootController: SheetController): void {
      this.owner.callObservers("controllerWillAttachRootTrait", rootTrait, this.owner);
      this.attachRootTrait(rootTrait, rootController);
    },
    controllerDidDetachSheetTrait(rootTrait: Trait, rootController: SheetController): void {
      this.detachRootTrait(rootTrait, rootController);
      this.owner.callObservers("controllerDidDetachRootTrait", rootTrait, this.owner);
    },
    attachRootTrait(rootTrait: Trait, rootController: SheetController): void {
      // hook
    },
    detachRootTrait(rootTrait: Trait, rootController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(rootView: SheetView, rootController: SheetController): void {
      this.owner.callObservers("controllerWillAttachRootView", rootView, this.owner);
      this.attachRootView(rootView, rootController);
    },
    controllerDidDetachSheetView(rootView: SheetView, rootController: SheetController): void {
      this.detachRootView(rootView, rootController);
      this.owner.callObservers("controllerDidDetachRootView", rootView, this.owner);
    },
    attachRootView(rootView: SheetView, rootController: SheetController): void {
      // hook
    },
    detachRootView(rootView: SheetView, rootController: SheetController): void {
      // hook
    },
  })
  readonly root!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachRootTrait(rootTrait: Trait, rootController: SheetController): void;
    detachRootTrait(rootTrait: Trait, rootController: SheetController): void;
    attachRootView(rootView: SheetView, rootController: SheetController): void;
    detachRootView(rootView: SheetView, rootController: SheetController): void;
  };

  @TraitViewControllerRef({
    controllerType: SheetController,
    binds: false,
    observes: true,
    getTraitViewRef(frontController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return frontController.sheet;
    },
    willAttachController(frontController: SheetController, targetController: Controller | null): void {
      this.owner.callObservers("controllerWillAttachFront", frontController, this.owner);
    },
    didAttachController(frontController: SheetController, targetController: Controller | null): void {
      const frontTrait = frontController.sheet.trait;
      if (frontTrait !== null) {
        this.attachFrontTrait(frontTrait, frontController);
      }
      const frontView = frontController.sheet.view;
      if (frontView !== null) {
        const targetView = targetController instanceof SheetController ? targetController.sheet.view : null;
        this.attachFrontView(frontView, targetView, frontController);
      }
    },
    willDetachController(frontController: SheetController): void {
      const frontView = frontController.sheet.view;
      if (frontView !== null) {
        this.detachFrontView(frontView, frontController);
      }
      const frontTrait = frontController.sheet.trait;
      if (frontTrait !== null) {
        this.detachFrontTrait(frontTrait, frontController);
      }
    },
    didDetachController(frontController: SheetController): void {
      this.owner.callObservers("controllerDidDetachFront", frontController, this.owner);
    },
    controllerWillAttachSheetTrait(frontTrait: Trait, frontController: SheetController): void {
      this.owner.callObservers("controllerWillAttachFrontTrait", frontTrait, this.owner);
      this.attachFrontTrait(frontTrait, frontController);
    },
    controllerDidDetachSheetTrait(frontTrait: Trait, frontController: SheetController): void {
      this.detachFrontTrait(frontTrait, frontController);
      this.owner.callObservers("controllerDidDetachFrontTrait", frontTrait, this.owner);
    },
    attachFrontTrait(frontTrait: Trait, frontController: SheetController): void {
      // hook
    },
    detachFrontTrait(frontTrait: Trait, frontController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(frontView: SheetView, frontController: SheetController): void {
      this.owner.callObservers("controllerWillAttachFrontView", frontView, this.owner);
      const targetController = frontController.nextSibling;
      const targetView = targetController instanceof SheetController ? targetController.sheet.view : null;
      this.attachFrontView(frontView, targetView, frontController);
    },
    controllerDidDetachSheetView(frontView: SheetView, frontController: SheetController): void {
      this.detachFrontView(frontView, frontController);
      this.owner.callObservers("controllerDidDetachFrontView", frontView, this.owner);
    },
    attachFrontView(frontView: SheetView, targetView: SheetView | null, frontController: SheetController): void {
      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        stackView.front.attachView(frontView, targetView);
      }
      this.presentFrontView(frontView, targetView, frontController);
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        this.owner.navBar.frontViewDidScroll(frontView, navBarController);
      }
    },
    detachFrontView(frontView: SheetView, frontController: SheetController): void {
      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        stackView.front.detachView();
      }
      this.dismissFrontView(frontView, frontController);
    },
    presentFrontView(frontView: SheetView, targetView: SheetView | null, frontController: SheetController): void {
      let stackView: StackView | null;
      if (frontView.parent === null && (stackView = this.owner.stack.view) !== null) {
        stackView.insertChild(frontView, targetView);
      }
      if (frontController.forward.controller === null) {
        frontView.sheetAlign.setIntrinsic(1);
        frontView.present(frontController.back.controller !== null);
      } else {
        frontView.sheetAlign.setIntrinsic(this.owner.backAlign.value);
        frontView.present();
      }
    },
    dismissFrontView(frontView: SheetView, frontController: SheetController): void {
      if (frontController.forward.controller !== null) {
        frontView.sheetAlign.setIntrinsic(this.owner.backAlign.value);
        frontView.dismiss();
      } else {
        frontView.sheetAlign.setIntrinsic(1);
        frontView.dismiss();
      }
    },
    controllerDidScrollSheetView(frontView: SheetView, frontController: SheetController): void {
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        this.owner.navBar.frontViewDidScroll(frontView, navBarController);
      }
    },
    dismiss(timing?: TimingLike | boolean | null): SheetView | null {
      const frontView = this.view;
      if (frontView !== null) {
        frontView.dismiss(timing);
      }
      return frontView;
    },
  })
  readonly front!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachFrontTrait(frontTrait: Trait, frontController: SheetController): void;
    detachFrontTrait(frontTrait: Trait, frontController: SheetController): void;
    attachFrontView(frontView: SheetView, targetView: SheetView | null, frontController: SheetController): void;
    detachFrontView(frontView: SheetView, frontController: SheetController): void;
    presentFrontView(frontView: SheetView, targetView: SheetView | null, frontController: SheetController): void;
    dismissFrontView(frontView: SheetView, frontController: SheetController): void;
    dismiss(timing?: TimingLike | boolean | null): SheetView | null;
  };
}
