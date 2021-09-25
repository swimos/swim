// Copyright 2015-2021 Swim Inc.
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

import {Murmur3, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {AnyValue, Value, Attr} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "./Envelope";

export interface HostAddressedConstructor<E extends HostAddressed<E>> {
  new(body: Value): E;

  readonly tag: string;
}

export abstract class HostAddressed<E extends HostAddressed<E>> extends Envelope {
  constructor(body: Value) {
    super();
    this.body = body;
  }

  override get node(): Uri {
    return Uri.empty();
  }

  override withNode(node: AnyUri): E {
    return this as unknown as E;
  }

  override get lane(): Uri {
    return Uri.empty();
  }

  override withLane(lane: AnyUri): E {
    return this as unknown as E;
  }

  override readonly body: Value;

  override withBody(body: AnyValue): E {
    body = Value.fromAny(body);
    return this.copy(body);
  }

  protected abstract copy(body: Value): E;

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

  static override fromValue<E extends HostAddressed<E>>(this: HostAddressedConstructor<E>,
                                                        value: Value): E | null {
    const header = value.header(this.tag);
    if (header.isDefined()) {
      const body = value.body();
      return new this(body);
    }
    return null;
  }
}
