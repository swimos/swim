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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item, Attr, AnyValue, Value, Record} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "./Envelope";

export interface LinkAddressedConstructor<E extends LinkAddressed<E>> {
  new(node: Uri, lane: Uri, prio: number, rate: number, body: Value): E;

  readonly tag: string;
}

export abstract class LinkAddressed<E extends LinkAddressed<E>> extends Envelope {
  constructor(node: Uri, lane: Uri, prio: number, rate: number, body: Value) {
    super();
    this.node = node;
    this.lane = lane;
    Object.defineProperty(this, "prio", {
      value: prio,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "rate", {
      value: rate,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.body = body;
  }

  override readonly node: Uri;

  override withNode(node: AnyUri): E {
    node = Uri.fromAny(node);
    return this.copy(node as Uri, this.lane, this.prio, this.rate, this.body);
  }

  override readonly lane: Uri;

  override withLane(lane: AnyUri): E {
    lane = Uri.fromAny(lane);
    return this.copy(this.node, lane as Uri, this.prio, this.rate, this.body);
  }

  override readonly prio!: number;

  override withPrio(prio: number): E {
    return this.copy(this.node, this.lane, prio, this.rate, this.body);
  }

  override readonly rate!: number;

  override withRate(rate: number): E {
    return this.copy(this.node, this.lane, this.prio, rate, this.body);
  }

  override readonly body: Value;

  override withBody(body: AnyValue): E {
    body = Value.fromAny(body);
    return this.copy(this.node, this.lane, this.prio, this.rate, body);
  }

  protected abstract copy(node: Uri, lane: Uri, prio: number, rate: number, body: Value): E;

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinkAddressed) {
      return this.constructor === that.constructor
          && this.node.equals(that.node) && this.lane.equals(that.lane)
          && this.prio === that.prio && this.rate === that.rate
          && this.body.equals(that.body);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(this.constructor), this.node.hashCode()), this.lane.hashCode()),
        Numbers.hash(this.prio)), Numbers.hash(this.rate)), this.body.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write(this.constructor.name).write(46/*'.'*/)
                   .write("create").write(40/*'('*/)
                   .debug(this.node.toString()).write(", ").debug(this.lane.toString());
    if (this.prio !== 0 || this.rate !== 0) {
      output = output.write(", ").debug(this.prio).write(", ").debug(this.rate);
    }
    if (this.body.isDefined()) {
      output = output.write(", ").debug(this.body);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toValue(): Value {
    const header = Record.create(4)
        .slot("node", this.node.toString())
        .slot("lane", this.lane.toString());
    if (this.prio !== 0) {
      header.slot("prio", this.prio);
    }
    if (this.rate !== 0) {
      header.slot("rate", this.rate);
    }
    return Attr.of(this.tag, header).concat(this.body);
  }

  static override fromValue<E extends LinkAddressed<E>>(this: LinkAddressedConstructor<E>,
                                                        value: Value): E | null {
    let node: Uri | undefined;
    let lane: Uri | undefined;
    let prio = 0;
    let rate = 0;
    const header = value.header(this.tag);
    header.forEach(function (header: Item, index: number) {
      const key = header.key.stringValue(void 0);
      if (key !== void 0) {
        if (key === "node") {
          node = Uri.parse(header.toValue().stringValue(""));
        } else if (key === "lane") {
          lane = Uri.parse(header.toValue().stringValue(""));
        } else if (key === "prio") {
          prio = header.numberValue(prio);
        } else if (key === "rate") {
          rate = header.numberValue(rate);
        }
      } else if (header instanceof Value) {
        if (index === 0) {
          node = Uri.parse(header.stringValue(""));
        } else if (index === 1) {
          lane = Uri.parse(header.stringValue(""));
        }
      }
    });
    if (node !== void 0 && lane !== void 0) {
      const body = value.body();
      return new this(node, lane, prio, rate, body);
    }
    return null;
  }
}
