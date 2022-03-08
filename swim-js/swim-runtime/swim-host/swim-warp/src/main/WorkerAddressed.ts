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

import {Murmur3, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item, Attr, AnyValue, Value, Record} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {Signal} from "./Signal";

/** @public */
export interface WorkerAddressedConstructor<S extends WorkerAddressed<S> = WorkerAddressed<any>> {
  new(host: Uri, body: Value): S;

  readonly tag: string;
}

/** @public */
export abstract class WorkerAddressed<S extends WorkerAddressed<S> = WorkerAddressed<any>> extends Signal {
  constructor(host: Uri, body: Value) {
    super();
    this.host = host;
    this.body = body;
  }

  override readonly host: Uri;

  override withHost(host: AnyUri): S {
    host = Uri.fromAny(host);
    return this.copy(host, this.body);
  }

  override readonly body: Value;

  override withBody(body: AnyValue): S {
    body = Value.fromAny(body);
    return this.copy(this.host, body);
  }

  protected copy(host: Uri, body: Value): S {
    return new (this.constructor as WorkerAddressedConstructor<S>)(host, body);
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof WorkerAddressed) {
      return this.constructor === that.constructor
          && this.host.equals(that.host) && this.body.equals(that.body);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(this.constructor),
        this.host.hashCode()), this.body.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write(this.constructor.name).write(46/*'.'*/)
                   .write("create").write(40/*'('*/)
                   .debug(this.host.toString());
    if (this.body.isDefined()) {
      output = output.write(", ").debug(this.body);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toValue(): Value {
    const header = Record.create(1)
        .slot("host", this.host.toString());
    return Attr.of(this.tag, header).concat(this.body);
  }

  static override fromValue<S extends WorkerAddressedConstructor<InstanceType<S>>>(this: S, value: Value): InstanceType<S> | null {
    let host: Uri | undefined;
    const header = value.header(this.tag);
    header.forEach(function (header: Item, index: number) {
      const key = header.key.stringValue(void 0);
      if (key !== void 0) {
        if (key === "host") {
          host = Uri.parse(header.toValue().stringValue(""));
        }
      } else if (header instanceof Value) {
        if (index === 0) {
          host = Uri.parse(header.stringValue(""));
        }
      }
    });
    if (host !== void 0) {
      const body = value.body();
      return new this(host, body);
    }
    return null;
  }

  static create<S extends WorkerAddressedConstructor<InstanceType<S>>>(this: S, host: AnyUri, body?: AnyValue): InstanceType<S> {
    host = Uri.fromAny(host);
    if (body === void 0) {
      body = Value.absent();
    } else {
      body = Value.fromAny(body);
    }
    return new this(host, body);
  }
}
