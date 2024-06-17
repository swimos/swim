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

import type {Proto} from "@swim/util";
import {Objects} from "@swim/util";
import type {Fastener} from "@swim/component";
import type {AnimatorDescriptor} from "@swim/component";
import type {AnimatorClass} from "@swim/component";
import {Animator} from "@swim/component";

/** @public */
export interface TextContext {
  get textContent(): string | null | undefined;

  set textContent(textContent: string | null | undefined);
}

/** @public */
export const TextContext = {
  [Symbol.hasInstance](instance: unknown): instance is TextContext {
    return Objects.hasAllKeys<TextContext>(instance, "textContent");
  },
};

/** @public */
export interface TextAnimatorDescriptor<R, T> extends AnimatorDescriptor<R, T> {
  extends?: Proto<TextAnimator<any, any, any>> | boolean | null;
}

/** @public */
export interface TextAnimatorClass<A extends TextAnimator<any, any, any> = TextAnimator<any, any, any>> extends AnimatorClass<A> {
}

/** @public */
export interface TextAnimator<R = any, T = any, I extends any[] = [T]> extends Animator<R, T, I> {
  /** @override */
  get descriptorType(): Proto<TextAnimatorDescriptor<R, T>>;

  get textContent(): string | null | undefined;

  set textContent(textContent: string | null | undefined);

  format: (value: T) => string | null | undefined;
}

/** @public */
export const TextAnimator = (<R, T, I extends any[], A extends TextAnimator<any, any, any>>() => Animator.extend<TextAnimator<R, T, I>, TextAnimatorClass<A>>("TextAnimator", {
  get textContent(): string | null | undefined {
    if (TextContext[Symbol.hasInstance](this.owner)) {
      return this.owner.textContent;
    }
    return void 0;
  },

  set textContent(textContent: string | null | undefined) {
    if (TextContext[Symbol.hasInstance](this.owner)) {
      this.owner.textContent = textContent;
    }
  },

  onSetValue(newValue: T, oldValue: T): void {
    if (TextContext[Symbol.hasInstance](this.owner)) {
      this.owner.textContent = this.format(newValue);
    }
    super.onSetValue(newValue, oldValue);
  },

  format(value: T): string | null | undefined {
    return String(value);
  },
},
{
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    animator.format = (Object.getPrototypeOf(animator) as TextAnimator).format;
    return animator;
  },
}))();
