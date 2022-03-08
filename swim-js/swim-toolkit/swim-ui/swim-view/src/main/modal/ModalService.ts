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

import {Mutable, Class, Lazy, Arrays} from "@swim/util";
import {Service} from "@swim/component";
import type {ModalOptions, Modal} from "./Modal";
import type {ModalServiceObserver} from "./ModalServiceObserver";
import type {View} from "../view/View";

/** @public */
export class ModalService<V extends View = View> extends Service<V> {
  constructor() {
    super();
    this.modals = Arrays.empty;
    this.modality = 0;
    this.matteView = null;
    this.onClick = this.onClick.bind(this);
  }

  /** @override */
  override readonly observerType?: Class<ModalServiceObserver<V>>;

  readonly modals: ReadonlyArray<Modal>;

  isModal(): boolean {
    return this.modality !== 0;
  }

  readonly modality: number;

  readonly matteView: View | null;

  setMatteView(matteView: View | null): void {
    (this as Mutable<this>).matteView = matteView;
  }

  protected insertModalView(modalView: View): void {
    const matteView = this.matteView;
    if (matteView !== null) {
      matteView.appendChild(modalView);
    } else {
      const serviceClass = this.constructor as typeof ModalService;
      serviceClass.insertModalView(modalView);
    }
  }

  presentModal(modal: Modal, options: ModalOptions = {}): void {
    const oldModals = this.modals;
    const newModals = Arrays.inserted(modal, oldModals);
    if (oldModals !== newModals) {
      if (!options.multi) {
        this.dismissModals();
      }
      this.willPresentModal(modal, options);
      (this as Mutable<this>).modals = newModals;
      const modalView = modal.modalView;
      if (modalView !== null && !modalView.mounted) {
        this.insertModalView(modalView);
      }
      modal.showModal(options, true);
      this.onPresentModal(modal, options);
      this.updateModality();
      this.didPresentModal(modal, options);
    }
  }

  protected willPresentModal(modal: Modal, options: ModalOptions): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillPresentModal !== void 0) {
        observer.serviceWillPresentModal(modal, options, this);
      }
    }
  }

  protected onPresentModal(modal: Modal, options: ModalOptions): void {
    // hook
  }

  protected didPresentModal(modal: Modal, options: ModalOptions): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidPresentModal !== void 0) {
        observer.serviceDidPresentModal(modal, options, this);
      }
    }
  }

  dismissModal(modal: Modal): void {
    const oldModals = this.modals;
    const newModals = Arrays.removed(modal, oldModals);
    if (oldModals !== newModals) {
      this.willDismissModal(modal);
      (this as Mutable<this>).modals = newModals;
      modal.hideModal(true);
      this.onDismissModal(modal);
      this.updateModality();
      this.didDismissModal(modal);
    }
  }

  protected willDismissModal(modal: Modal): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillDismissModal !== void 0) {
        observer.serviceWillDismissModal(modal, this);
      }
    }
  }

  protected onDismissModal(modal: Modal): void {
    // hook
  }

  protected didDismissModal(modal: Modal): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidDismissModal !== void 0) {
        observer.serviceDidDismissModal(modal, this);
      }
    }
  }

  dismissModals(): void {
    const modals = this.modals;
    for (let i = 0, n = modals.length; i < n; i += 1) {
      this.dismissModal(this.modals[i]!);
    }
  }

  toggleModal(modal: Modal, options?: ModalOptions): void {
    const modalState = modal.modalState;
    if (modalState === "hidden" || modalState === "hiding") {
      this.presentModal(modal, options);
    } else if (modalState === "shown" || modalState === "showing") {
      this.dismissModal(modal);
    }
  }

  updateModality(): void {
    const oldModality = this.modality;
    let newModality = 0;
    const modals = this.modals;
    for (let i = 0, n = modals.length; i < n; i += 1) {
      const modal = modals[i]!;
      const modality = +modal.modality;
      newModality = Math.min(Math.max(newModality, modality), 1);
    }
    if (oldModality !== newModality) {
      this.willUpdateModality(newModality, oldModality);
      (this as Mutable<this>).modality = newModality;
      this.onUpdateModality(newModality, oldModality);
      this.didUpdateModality(newModality, oldModality);
    }
  }

  protected willUpdateModality(newModality: number, oldModality: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillUpdateModality !== void 0) {
        observer.serviceWillUpdateModality(newModality, oldModality, this);
      }
    }
  }

  protected onUpdateModality(newModality: number, oldModality: number): void {
    // hook
  }

  protected didUpdateModality(newModality: number, oldModality: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidUpdateModality !== void 0) {
        observer.serviceDidUpdateModality(newModality, oldModality, this);
      }
    }
  }

  displaceModals(event: Event | null): void {
    const handled = this.willDisplaceModals(event);
    if (!handled) {
      this.onDisplaceModals(event);
      this.didDisplaceModals(event);
    }
  }

  protected willDisplaceModals(event: Event | null): boolean {
    let handled: boolean | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceWillDisplaceModals !== void 0) {
        handled = observer.serviceWillDisplaceModals(event, this) as boolean | undefined;
      }
    }
    return handled !== void 0 ? handled : false;
  }

  protected onDisplaceModals(event: Event | null): void {
    const modals = this.modals;
    let i = 0;
    while (i < modals.length) {
      const modal = modals[i]!;
      if (modal.modalState === "shown") {
        this.dismissModal(modal);
      } else {
        i += 1;
      }
    }
  }

  protected didDisplaceModals(event: Event | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.serviceDidDisplaceModals !== void 0) {
        observer.serviceDidDisplaceModals(event, this);
      }
    }
  }

  protected override onAttachRoot(root: V): void {
    super.onAttachRoot(root);
    this.attachEvents(root);
  }

  protected override onDetachRoot(root: V): void {
    super.onDetachRoot(root);
    this.detachEvents(root);
  }

  protected attachEvents(view: V): void {
    view.on('click', this.onClick);
  }

  protected detachEvents(view: V): void {
    view.off('click', this.onClick);
  }

  protected onClick(event: Event): void {
    this.displaceModals(event);
  }

  static insertModalView(modalView: View): void { // overwritten by NodeView
    throw new TypeError("" + modalView);
  }

  @Lazy
  static global<V extends View>(): ModalService<V> {
    return new ModalService();
  }
}
