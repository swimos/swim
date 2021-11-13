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
import {Item, Attr, AnyValue, Value, Record} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "./Envelope";

export interface LaneAddressedConstructor<E extends LaneAddressed<E>> {
  new(node: Uri, lane: Uri, body: Value): E;

  readonly tag: string;
}

export abstract class LaneAddressed<E extends LaneAddressed<E>> extends Envelope {
  constructor(node: Uri, lane: Uri, body: Value) {
    super();
    this.node = node;
    this.lane = lane;
    this.body = body;
  }

  override readonly node: Uri;

  override withNode(node: AnyUri): E {
    node = Uri.fromAny(node);
    return this.copy(node as Uri, this.lane, this.body);
  }

  override readonly lane: Uri;

  override withLane(lane: AnyUri): E {
    lane = Uri.fromAny(lane);
    return this.copy(this.node, lane as Uri, this.body);
  }

  override readonly body: Value;

  override withBody(body: AnyValue): E {
    body = Value.fromAny(body);
    return this.copy(this.node, this.lane, body);
  }

  protected abstract copy(node: Uri, lane: Uri, body: Value): E;

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LaneAddressed) {
      return this.constructor === that.constructor
          && this.node.equals(that.node) && this.lane.equals(that.lane)
          && this.body.equals(that.body);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(this.constructor), this.node.hashCode()),
        this.lane.hashCode()), this.body.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write(this.constructor.name).write(46/*'.'*/)
                   .write("create").write(40/*'('*/)
                   .debug(this.node.toString()).write(", ").debug(this.lane.toString());
    if (this.body.isDefined()) {
      output = output.write(", ").debug(this.body);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toValue(): Value {
    const header = Record.create(2)
        .slot("node", this.node.toString())
        .slot("lane", this.lane.toString());
    return Attr.of(this.tag, header).concat(this.body);
  }

  static override fromValue<E extends LaneAddressed<E>>(this: LaneAddressedConstructor<E>,
                                                        value: Value): E | null {
    let node: Uri | undefined;
    let lane: Uri | undefined;
    const header = value.header(this.tag);
    header.forEach(function (header: Item, index: number) {
      const key = header.key.stringValue(void 0);
      if (key !== void 0) {
        if (key === "node") {
          node = Uri.parse(header.toValue().stringValue(""));
        } else if (key === "lane") {
          lane = Uri.parse(header.toValue().stringValue(""));
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
      return new this(node, lane, body);
    }
    return null;
  }
}
