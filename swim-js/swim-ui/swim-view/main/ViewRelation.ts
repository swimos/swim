// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Observes} from "@swim/util";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {ViewFactory} from "./View";
import {View} from "./View";

/** @public */
export interface ViewRelationDescriptor<R, V extends View> extends FastenerDescriptor<R> {
  extends?: Proto<ViewRelation<any, any, any>> | boolean | null;
}

/** @public */
export interface ViewRelationClass<F extends ViewRelation<any, any, any> = ViewRelation<any, any, any>> extends FastenerClass<F> {
}

/** @public */
export interface ViewRelation<R = any, V extends View = View, I extends any[] = [V | null]> extends Fastener<R, V | null, I> {
  /** @override */
  get descriptorType(): Proto<ViewRelationDescriptor<R, V>>;

  /** @override */
  get fastenerType(): Proto<ViewRelation<any, any, any>>;

  get viewType(): ViewFactory<V> | null;

  get observes(): boolean;

  /** @override */
  get parent(): ViewRelation<any, V, any> | null;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V, target: View | null): void;

  /** @protected */
  onAttachView(view: V, target: View | null): void;

  /** @protected */
  didAttachView(view: V, target: View | null): void;

  /** @protected */
  deinitView(view: V): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  get parentView(): View | null;

  /** @protected */
  insertChild(parent: View, child: V, target: View | null, key: string | undefined): void;

  /** @internal */
  bindView(view: View, target: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  createView(): V;

  fromLike(value: V | LikeType<V>): V;
}

/** @public */
export const ViewRelation = (<R, V extends View, I extends any[], F extends ViewRelation<any, any, any>>() => Fastener.extend<ViewRelation<R, V, I>, ViewRelationClass<F>>("ViewRelation", {
  get fastenerType(): Proto<ViewRelation<any, any, any>> {
    return ViewRelation;
  },

  viewType: null,

  observes: false,

  attachOutlet(outlet: Fastener<any, any, any>): void {
    let outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      outlets = new Set<Fastener<any, any, any>>();
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.add(outlet);
  },

  detachOutlet(outlet: Fastener<any, any, any>): void {
    const outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      return;
    }
    outlets.delete(outlet);
  },

  decohereOutlets(): void {
    const outlets = this.outlets;
    if (outlets !== null) {
      for (const outlet of outlets) {
        outlet.decohere(this);
      }
    }
  },

  initView(view: V): void {
    // hook
  },

  willAttachView(view: V, target: View | null): void {
    // hook
  },

  onAttachView(view: V, target: View | null): void {
    if (this.observes) {
      view.observe(this as Observes<V>);
    }
  },

  didAttachView(view: V, target: View | null): void {
    // hook
  },

  deinitView(view: V): void {
    // hook
  },

  willDetachView(view: V): void {
    // hook
  },

  onDetachView(view: V): void {
    if (this.observes) {
      view.unobserve(this as Observes<V>);
    }
  },

  didDetachView(view: V): void {
    // hook
  },

  get parentView(): View | null {
    const owner = this.owner;
    return owner instanceof View ? owner : null;
  },

  insertChild(parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  bindView(view: View, target: View | null): void {
    // hook
  },

  unbindView(view: View): void {
    // hook
  },

  detectView(view: View): V | null {
    return null;
  },

  createView(): V {
    let view: V | undefined;
    const viewType = this.viewType;
    if (viewType !== null) {
      view = viewType.create();
    }
    if (view === void 0 || view === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  },

  fromLike(value: V | LikeType<V>): V {
    const viewType = this.viewType;
    if (viewType !== null) {
      return viewType.fromLike(value);
    }
    return View.fromLike(value) as V;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).outlets = null;
    return fastener;
  },
}))();
