// Copyright 2015-2023 Swim.inc
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

import {Spec, Test, Exam} from "@swim/unit";
import {Lazy} from "@swim/util";

export class LazySpec extends Spec {
  @Lazy
  static get foo(): object {
    return {};
  }

  @Lazy
  static get bar(): object {
    return {};
  }

  @Test
  memoizeLazyGetters(exam: Exam): void {
    exam.identical(LazySpec.foo, LazySpec.foo);
    exam.identical(LazySpec.foo, LazySpec.foo);
    exam.notIdentical(LazySpec.foo, LazySpec.bar);
    exam.identical(LazySpec.bar, LazySpec.bar);
    exam.identical(LazySpec.bar, LazySpec.bar);
  }

  @Lazy
  static baz(): object {
    return {};
  }

  @Lazy
  static qux(): object {
    return {};
  }

  @Test
  memoizeLazyMethods(exam: Exam): void {
    exam.identical(LazySpec.baz(), LazySpec.baz());
    exam.identical(LazySpec.baz(), LazySpec.baz());
    exam.notIdentical(LazySpec.baz(), LazySpec.qux());
    exam.identical(LazySpec.qux(), LazySpec.qux());
    exam.identical(LazySpec.qux(), LazySpec.qux());
  }
}
