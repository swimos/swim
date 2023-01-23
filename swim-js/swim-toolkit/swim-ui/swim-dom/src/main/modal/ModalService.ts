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

import type {Class, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property, EventHandler, Service} from "@swim/component";
import {View, ViewRef, ViewSet} from "@swim/view";
import {ViewElement, ElementView} from "../element/ElementView";
import type {ModalOptions, ModalView} from "./ModalView";
import type {ModalServiceObserver} from "./ModalServiceObserver";

/** @public */
export class ModalService extends Service {
  /** @override */
  override readonly observerType?: Class<ModalServiceObserver>;

  @ViewRef<ModalService["matte"]>({
    viewType: ElementView,
  })
  readonly matte!: ViewRef<this, ElementView>;
  static readonly matte: FastenerClass<ModalService["matte"]>;

  @ViewSet<ModalService["modals"]>({
    observes: true,
    get parentView(): ElementView | null {
      let parentView = this.owner.matte.view;
      if (parentView === null) {
        const bodyNode = document.body as ViewElement;
        const bodyView = bodyNode.view;
        if (bodyView !== void 0) {
          parentView = bodyView;
        }
      }
      return parentView;
    },
    insertChild(parent: View, child: ElementView, target: View | null, key: string | undefined): void {
      ViewSet.prototype.insertChild.call(this, parent, child, target, key);
      if (child.parent === null && !child.mounted) {
        document.body.appendChild(child.node);
        child.mount();
      }
    },
    initView(modalView: ModalView): void {
      this.owner.modality.update();
    },
    willAttachView(modalView: ModalView): void {
      this.owner.callObservers("serviceWillAttachModal", modalView, this.owner);
    },
    didAttachView(modalView: ModalView): void {
      this.owner.callObservers("serviceDidAttachModal", modalView, this.owner);
    },
    deinitView(modalView: ModalView): void {
      this.owner.modality.update();
    },
    willDetachView(modalView: ModalView): void {
      this.owner.callObservers("serviceWillDetachModal", modalView, this.owner);
    },
    didDetachView(modalView: ModalView): void {
      this.owner.callObservers("serviceDidDetachModal", modalView, this.owner);
    },
    viewWillPresent(modalView: ModalView): void {
      this.owner.callObservers("serviceWillPresentModal", modalView, this.owner);
    },
    viewDidPresent(modalView: ModalView): void {
      this.owner.callObservers("serviceDidPresentModal", modalView, this.owner);
    },
    viewWillDismiss(modalView: ModalView): void {
      this.owner.callObservers("serviceWillDismissModal", modalView, this.owner);
    },
    viewDidDismiss(modalView: ModalView): void {
      this.owner.callObservers("serviceDidDismissModal", modalView, this.owner);
      this.detachView(modalView);
    },
    viewDidSetModality(modality: number, modalView: ModalView): void {
      this.owner.modality.update();
    },
  })
  readonly modals!: ViewSet<this, ModalView> & Observes<ModalView>;
  static readonly modals: FastenerClass<ModalService["modals"]>;

  presentModal(modalView: ModalView, options: ModalOptions = {}): void {
    if (!options.multi) {
      this.dismissModals();
    }
    this.modals.insertView(null, modalView);
    modalView.presence.present(true);
  }

  dismissModal(modalView: ModalView): void {
    if (this.modals.hasView(modalView)) {
      modalView.presence.dismiss(true);
    }
  }

  dismissModals(): void {
    const modalViews = this.modals.views;
    for (const viewId in modalViews) {
      const modalView = modalViews[viewId]!;
      this.dismissModal(modalView);
    }
  }

  displaceModals(): void {
    const modalViews = this.modals.views;
    for (const viewId in modalViews) {
      const modalView = modalViews[viewId]!;
      if (modalView.presence.presented) {
        this.dismissModal(modalView);
      }
    }
  }

  toggleModal(modalView: ModalView, options?: ModalOptions): void {
    const presence = modalView.presence.value;
    if (presence.dismissed || presence.dismissing) {
      this.presentModal(modalView, options);
    } else if (presence.presented || presence.presenting) {
      this.dismissModal(modalView);
    }
  }

  @Property<ModalService["modality"]>({
    valueType: Number,
    value: 0,
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        let modality = 0;
        const modalViews = this.owner.modals.views;
        for (const viewId in modalViews) {
          const modalView = modalViews[viewId]!;
          modality = Math.min(Math.max(modality, modalView.modality.value), 1);
        }
        this.setValue(modality, Affinity.Intrinsic);
      }
    },
    didSetValue(newModality: number, oldModality: number): void {
      this.owner.callObservers("serviceDidSetModality", newModality, oldModality, this.owner);
    },
  })
  readonly modality!: Property<this, number> & {
    /** @internal */
    update(): void,
  };

  @EventHandler<ModalService["fallthrough"]>({
    type: "click",
    initTarget(): EventTarget | null {
      if (typeof document !== "undefined") {
        return document;
      } else {
        return null;
      }
    },
    handle(event: Event): void {
      this.owner.displaceModals();
    },
  })
  readonly fallthrough!: EventHandler<this>;
  static readonly fallthrough: FastenerClass<ModalService["fallthrough"]>;
}
