// Copyright 2015-2019 SWIM.AI inc.
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

import {Transition} from "@swim/transition";
import {TweenFrameAnimator} from "@swim/animate";

export class TextAnimator<T = unknown> extends TweenFrameAnimator<T> {
  readonly target: Node;
  formatter: ((value: T) => string) | {format(value: T): string} | null;

  constructor(target: Node, value?: T, transition: Transition<T> | null = null,
              formatter: ((value: T) => string) | {format(value: T): string} | null = null) {
    super(value, transition);
    this.target = target;
    this.formatter = formatter;
  }

  get textValue(): string | null {
    const target = this.target;
    if (target instanceof Text) {
      return target.nodeValue;
    } else if (target instanceof HTMLElement) {
      return target.innerText;
    } else {
      return target.textContent;
    }
  }

  format(value: T): string {
    let formatter = this.formatter;
    if (typeof formatter === "object" && formatter) {
      formatter = formatter.format;
    }
    if (typeof formatter === "function") {
      return formatter(value);
    } else {
      return "" + value;
    }
  }

  update(value: T): void {
    const target = this.target;
    const text = this.format(value);
    if (target instanceof Text) {
      target.nodeValue = text;
    } else if (target instanceof HTMLElement) {
      target.innerText = text;
    } else {
      target.textContent = text;
    }
  }

  delete(): void {
    const target = this.target;
    if (target instanceof Text) {
      target.nodeValue = null;
    } else if (target instanceof HTMLElement) {
      target.innerText = "";
    } else {
      target.textContent = null;
    }
  }
}
