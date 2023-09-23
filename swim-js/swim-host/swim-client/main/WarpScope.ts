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

import type {FastenerTemplate} from "@swim/component";
import {Property} from "@swim/component";
import {Component} from "@swim/component";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import type {WarpDownlinkModel} from "./WarpDownlinkModel";
import {EventDownlink} from "./EventDownlink";
import {ValueDownlink} from "./ValueDownlink";
import {ListDownlink} from "./ListDownlink";
import {MapDownlink} from "./MapDownlink";
import {WarpRef} from "./WarpRef";
import {WarpClient} from "./"; // forward import

/** @public */
export class WarpScope extends Component implements WarpRef {
  /** @override */
  @Property({valueType: Uri, value: null, inherits: true})
  readonly hostUri!: Property<this, Uri | null>;

  /** @override */
  @Property({valueType: Uri, value: null, inherits: true})
  readonly nodeUri!: Property<this, Uri | null>;

  /** @override */
  @Property({valueType: Uri, value: null, inherits: true})
  readonly laneUri!: Property<this, Uri | null>;

  /** @override */
  downlink(template?: FastenerTemplate<EventDownlink<WarpRef>>): EventDownlink<WarpRef> {
    let downlinkClass = EventDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlink", template) as typeof EventDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkValue<V = Value>(template?: FastenerTemplate<ValueDownlink<WarpRef, V>>): ValueDownlink<WarpRef, V> {
    let downlinkClass = ValueDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkValue", template) as typeof ValueDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkList<V = Value>(template?: FastenerTemplate<ListDownlink<WarpRef, V>>): ListDownlink<WarpRef, V> {
    let downlinkClass = ListDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkList", template) as typeof ListDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkMap<K = Value, V = Value>(template?: FastenerTemplate<MapDownlink<WarpRef, K, V>>): MapDownlink<WarpRef, K, V> {
    let downlinkClass = MapDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkMap", template) as typeof MapDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  command(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(body: ValueLike): void;
  command(hostUri: UriLike | ValueLike, nodeUri?: UriLike | ValueLike, laneUri?: UriLike | ValueLike, body?: ValueLike): void {
    if (nodeUri === void 0) {
      body = Value.fromLike(hostUri as ValueLike);
      laneUri = this.laneUri.getValue();
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (laneUri === void 0) {
      body = Value.fromLike(nodeUri as ValueLike);
      laneUri = Uri.fromLike(hostUri as UriLike);
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (body === void 0) {
      body = Value.fromLike(laneUri as ValueLike);
      laneUri = Uri.fromLike(nodeUri as UriLike);
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = this.hostUri.value;
    } else {
      body = Value.fromLike(body);
      laneUri = Uri.fromLike(laneUri as UriLike);
      nodeUri = Uri.fromLike(nodeUri as UriLike);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    const warpRef = this.warpRef.value;
    warpRef.command(hostUri, nodeUri, laneUri, body);
  }

  /** @override */
  authenticate(hostUri: UriLike, credentials: ValueLike): void;
  /** @override */
  authenticate(credentials: ValueLike): void;
  authenticate(hostUri: UriLike | ValueLike, credentials?: ValueLike): void {
    if (credentials === void 0) {
      credentials = Value.fromLike(hostUri as ValueLike);
      hostUri = this.hostUri.getValue();
    } else {
      credentials = Value.fromLike(credentials);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const warpRef = this.warpRef.value;
    warpRef.authenticate(hostUri, credentials);
  }

  /** @override */
  hostRef(hostUri: UriLike): WarpRef {
    hostUri = Uri.fromLike(hostUri);
    const childRef = new WarpScope();
    childRef.hostUri.set(hostUri);
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  nodeRef(hostUri: UriLike, nodeUri: UriLike): WarpRef;
  /** @override */
  nodeRef(nodeUri: UriLike): WarpRef;
  nodeRef(hostUri: UriLike | undefined, nodeUri?: UriLike): WarpRef {
    if (nodeUri === void 0) {
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      nodeUri = Uri.fromLike(nodeUri);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const childRef = new WarpScope();
    if (hostUri !== void 0) {
      childRef.hostUri.set(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.set(nodeUri);
    }
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  laneRef(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike): WarpRef;
  /** @override */
  laneRef(nodeUri: UriLike, laneUri: UriLike): WarpRef;
  /** @override */
  laneRef(laneUri: UriLike): WarpRef;
  laneRef(hostUri: UriLike | undefined, nodeUri?: UriLike, laneUri?: UriLike): WarpRef {
    if (nodeUri === void 0) {
      laneUri = Uri.fromLike(hostUri as UriLike);
      nodeUri = void 0;
      hostUri = void 0;
    } else if (laneUri === void 0) {
      laneUri = Uri.fromLike(nodeUri);
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      laneUri = Uri.fromLike(laneUri);
      nodeUri = Uri.fromLike(nodeUri);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const childRef = new WarpScope();
    if (hostUri !== void 0) {
      childRef.hostUri.set(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.set(nodeUri);
    }
    if (laneUri !== void 0) {
      childRef.laneUri.set(laneUri);
    }
    this.appendChild(childRef);
    return childRef;
  }

  /** @internal @override */
  getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): WarpDownlinkModel | null {
    const warpRef = this.warpRef.value;
    return warpRef.getDownlink(hostUri, nodeUri, laneUri);
  }

  /** @internal @override */
  openDownlink(downlink: WarpDownlinkModel): void {
    const warpRef = this.warpRef.value;
    warpRef.openDownlink(downlink);
  }

  @Property({
    valueType: WarpRef,
    inherits: true,
    initValue(): WarpRef {
      if (this.owner instanceof WarpClient) {
        // Avoid infinite recursion;
        // value will be set when WarpClient initializes.
        return void 0 as unknown as WarpRef;
      }
      return WarpClient.global();
    },
    equalValues(newValue: WarpRef, oldValue: WarpRef): boolean {
      return newValue === oldValue;
    },
  })
  readonly warpRef!: Property<this, WarpRef>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly online!: Property<this, boolean>;
}
