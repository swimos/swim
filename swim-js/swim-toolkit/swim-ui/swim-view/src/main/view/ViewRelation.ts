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

import type {Mutable, Proto, Observes} from "@swim/util";
import {FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "@swim/component";
import {AnyView, ViewFactory, View} from "./View";

/** @public */
export type ViewRelationView<F extends ViewRelation<any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export interface ViewRelationDescriptor<V extends View = View> extends FastenerDescriptor {
  extends?: Proto<ViewRelation<any, any>> | string | boolean | null;
  viewType?: ViewFactory<V>;
  binds?: boolean;
  observes?: boolean;
}

/** @public */
export type ViewRelationTemplate<F extends ViewRelation<any, any>> =
  ThisType<F> &
  ViewRelationDescriptor<ViewRelationView<F>> &
  Partial<Omit<F, keyof ViewRelationDescriptor>>;

/** @public */
export interface ViewRelationClass<F extends ViewRelation<any, any> = ViewRelation<any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: ViewRelationDescriptor<any>): ViewRelationClass<F>;

  /** @override */
  refine(fastenerClass: ViewRelationClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ViewRelationTemplate<F2>): ViewRelationClass<F2>;
  extend<F2 extends F>(className: string, template: ViewRelationTemplate<F2>): ViewRelationClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ViewRelationTemplate<F2>): ViewRelationClass<F2>;
  define<F2 extends F>(className: string, template: ViewRelationTemplate<F2>): ViewRelationClass<F2>;

  /** @override */
  <F2 extends F>(template: ViewRelationTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface ViewRelation<O = unknown, V extends View = View> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<ViewRelation<any, any>>;

  /** @internal */
  readonly observes?: boolean; // optional prototype property

  /** @internal @override */
  getSuper(): ViewRelation<unknown, V> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  willDerive(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  onDerive(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  didDerive(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  willUnderive(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  onUnderive(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  didUnderive(inlet: ViewRelation<unknown, V>): void;

  /** @override */
  readonly inlet: ViewRelation<unknown, V> | null;

  /** @protected @override */
  willBindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  onBindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  didBindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ViewRelation<unknown, V>): void;

  /** @internal */
  readonly outlets: ReadonlyArray<ViewRelation<unknown, V>> | null;

  /** @internal @override */
  attachOutlet(outlet: ViewRelation<unknown, V>): void;

  /** @internal @override */
  detachOutlet(outlet: ViewRelation<unknown, V>): void;

  /** @internal */
  readonly viewType?: ViewFactory<V>; // optional prototype property

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

  /** @internal @protected */
  get parentView(): View | null;

  /** @internal @protected */
  insertChild(parent: View, child: V, target: View | null, key: string | undefined): void;

  /** @internal */
  bindView(view: View, target: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  createView(): V;

  /** @internal @protected */
  fromAny(value: AnyView<V>): V;
}

/** @public */
export const ViewRelation = (function (_super: typeof Fastener) {
  const ViewRelation = _super.extend("ViewRelation", {
    lazy: false,
    static: true,
  }) as ViewRelationClass;

  Object.defineProperty(ViewRelation.prototype, "fastenerType", {
    value: ViewRelation,
    configurable: true,
  });

  ViewRelation.prototype.onBindInlet = function <V extends View>(this: ViewRelation<unknown, V>, inlet: ViewRelation<unknown, V>): void {
    (this as Mutable<typeof this>).inlet = inlet;
    _super.prototype.onBindInlet.call(this, inlet);
  };

  ViewRelation.prototype.onUnbindInlet = function <V extends View>(this: ViewRelation<unknown, V>, inlet: ViewRelation<unknown, V>): void {
    _super.prototype.onUnbindInlet.call(this, inlet);
    (this as Mutable<typeof this>).inlet = null;
  };

  ViewRelation.prototype.attachOutlet = function <V extends View>(this: ViewRelation<unknown, V>, outlet: ViewRelation<unknown, V>): void {
    let outlets = this.outlets as ViewRelation<unknown, V>[] | null;
    if (outlets === null) {
      outlets = [];
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.push(outlet);
  };

  ViewRelation.prototype.detachOutlet = function <V extends View>(this: ViewRelation<unknown, V>, outlet: ViewRelation<unknown, V>): void {
    const outlets = this.outlets as ViewRelation<unknown, V>[] | null;
    if (outlets !== null) {
      const index = outlets.indexOf(outlet);
      if (index >= 0) {
        outlets.splice(index, 1);
      }
    }
  };

  ViewRelation.prototype.initView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.willAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, target: View | null): void {
    // hook
  };

  ViewRelation.prototype.onAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, target: View | null): void {
    if (this.observes === true) {
      view.observe(this as Observes<V>);
    }
  };

  ViewRelation.prototype.didAttachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V, target: View | null): void {
    // hook
  };

  ViewRelation.prototype.deinitView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.willDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  ViewRelation.prototype.onDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    if (this.observes === true) {
      view.unobserve(this as Observes<V>);
    }
  };

  ViewRelation.prototype.didDetachView = function <V extends View>(this: ViewRelation<unknown, V>, view: V): void {
    // hook
  };

  Object.defineProperty(ViewRelation.prototype, "parentView", {
    get(this: ViewRelation): View | null {
      const owner = this.owner;
      return owner instanceof View ? owner : null;
    },
    configurable: true,
  });

  ViewRelation.prototype.insertChild = function <V extends View>(this: ViewRelation<unknown, V>, parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ViewRelation.prototype.bindView = function <V extends View>(this: ViewRelation<unknown, V>, view: View, target: View | null): void {
    // hook
  };

  ViewRelation.prototype.unbindView = function <V extends View>(this: ViewRelation<unknown, V>, view: View): void {
    // hook
  };

  ViewRelation.prototype.detectView = function <V extends View>(this: ViewRelation<unknown, V>, view: View): V | null {
    return null;
  };

  ViewRelation.prototype.createView = function <V extends View>(this: ViewRelation<unknown, V>): V {
    let view: V | undefined;
    const viewType = this.viewType;
    if (viewType !== void 0) {
      view = viewType.create();
    }
    if (view === void 0 || view === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  };

  ViewRelation.prototype.fromAny = function <V extends View>(this: ViewRelation<unknown, V>, value: AnyView<V>): V {
    const viewType = this.viewType;
    if (viewType !== void 0) {
      return viewType.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  ViewRelation.construct = function <F extends ViewRelation<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    Object.defineProperty(fastener, "inlet", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (fastener as Mutable<typeof fastener>).outlets = null;
    return fastener;
  };

  return ViewRelation;
})(Fastener);
