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
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {EventHandler} from "@swim/component";
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import type {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import {ElementView} from "./ElementView";
import type {ModalOptions} from "./ModalView";
import type {ModalView} from "./ModalView";

/** @public */
export interface ModalServiceObserver<S extends ModalService = ModalService> extends ServiceObserver<S> {
  serviceWillAttachModal?(modalView: ModalView, service: S): void;

  serviceDidAttachModal?(modalView: ModalView, service: S): void;

  serviceWillDetachModal?(modalView: ModalView, service: S): void;

  serviceDidDetachModal?(modalView: ModalView, service: S): void;

  serviceWillPresentModal?(modalView: ModalView, service: S): void;

  serviceDidPresentModal?(modalView: ModalView, service: S): void;

  serviceWillDismissModal?(modalView: ModalView, service: S): void;

  serviceDidDismissModal?(modalView: ModalView, service: S): void;

  serviceDidSetModality?(newModality: number, oldModality: number, service: S): void;
}

/** @public */
export class ModalService extends Service {
  /** @override */
  declare readonly observerType?: Class<ModalServiceObserver>;

  @ViewRef({
    viewType: ElementView,
  })
  readonly matte!: ViewRef<this, ElementView>;

  @ViewSet({
    observes: true,
    get parentView(): ElementView | null {
      const parentView = this.owner.matte.view;
      if (parentView !== null) {
        return parentView;
      }
      return ElementView.get(document.body);
    },
    insertChild(parent: View, child: ElementView, target: View | null, key: string | undefined): void {
      super.insertChild(parent, child, target, key);
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

  @Property({
    valueType: Number,
    value: 0,
    update(): void {
      if (!this.hasAffinity(Affinity.Intrinsic)) {
        return;
      }
      let modality = 0;
      const modalViews = this.owner.modals.views;
      for (const viewId in modalViews) {
        const modalView = modalViews[viewId]!;
        modality = Math.min(Math.max(modality, modalView.modality.value), 1);
      }
      this.setIntrinsic(modality);
    },
    didSetValue(newModality: number, oldModality: number): void {
      this.owner.callObservers("serviceDidSetModality", newModality, oldModality, this.owner);
    },
  })
  readonly modality!: Property<this, number> & {
    /** @internal */
    update(): void,
  };

  @EventHandler({
    eventType: "click",
    target: typeof document !== "undefined" ? document : null,
    handle(event: Event): void {
      this.owner.displaceModals();
    },
  })
  readonly fallthrough!: EventHandler<this>;
}
