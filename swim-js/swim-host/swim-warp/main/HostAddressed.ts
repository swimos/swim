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

import type {Instance} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import {Attr} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import {Envelope} from "./Envelope";

/** @public */
export interface HostAddressedConstructor<E extends HostAddressed<E> = HostAddressed<any>> {
  new(body: Value): E;

  readonly tag: string;
}

/** @public */
export abstract class HostAddressed<E extends HostAddressed<E> = HostAddressed<any>> extends Envelope<E> {
  constructor(body: Value) {
    super();
    this.body = body;
  }

  override get node(): Uri {
    return Uri.empty();
  }

  override withNode(node: UriLike): E
  override withNode(this: E, node: UriLike): E {
    return this;
  }

  override get lane(): Uri {
    return Uri.empty();
  }

  override withLane(lane: UriLike): E
  override withLane(this: E, lane: UriLike): E {
    return this;
  }

  override readonly body: Value;

  override withBody(body: ValueLike): E {
    body = Value.fromLike(body);
    return this.copy(body);
  }

  protected copy(body: Value): E {
    return new (this.constructor as HostAddressedConstructor<E>)(body);
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof HostAddressed) {
      return this.constructor === that.constructor
          && this.body.equals(that.body);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(this.constructor),
          this.body.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write(this.constructor.name).write(46/*'.'*/)
                   .write("create").write(40/*'('*/);
    if (this.body.isDefined()) {
      output = output.debug(this.body);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toValue(): Value {
    return Attr.of(this.tag).concat(this.body);
  }

  static override fromValue<S extends HostAddressedConstructor<Instance<S, HostAddressed<any>>>>(this: S, value: Value): InstanceType<S> | null {
    const header = value.header(this.tag);
    if (!header.isDefined()) {
      return null;
    }
    const body = value.body();
    return new this(body);
  }

  static create<S extends HostAddressedConstructor<Instance<S, HostAddressed<any>>>>(this: S, body?: ValueLike): InstanceType<S> {
    if (body === void 0) {
      body = Value.absent();
    } else {
      body = Value.fromLike(body);
    }
    return new this(body);
  }
}
