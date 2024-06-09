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

import {Easing} from "@swim/util";
import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Component} from "@swim/component";

export class AnimatorSpec extends Suite {
  @Test
  testAnimator(exam: Exam): void {
    const animator = Animator.create(null);
    exam.equal(animator.name, "Animator");
    exam.equal(animator.value, void 0);
    exam.equal(animator.state, void 0);

    animator.setState("bar");
    exam.equal(animator.value, "bar");
    exam.equal(animator.state, "bar");
  }

  @Test
  testAnimatorDefine(exam: Exam): void {
    const testAnimator = Animator.define("foo", {valueType: Number, value: 0});
    const animator = testAnimator.create(null);
    exam.equal(animator.name, "foo");
    exam.equal(animator.value, 0);
    exam.equal(animator.state, 0);

    animator.setState(1);
    exam.equal(animator.value, 1);
    exam.equal(animator.state, 1);
  }

  @Test
  testAnimatorDecorator(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({valueType: Number, value: 0})
      readonly foo!: Animator<this, number>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.value, 0);
    exam.equal(component.foo.state, 0);

    component.foo.setState(1);
    exam.equal(component.foo.value, 1);
    exam.equal(component.foo.state, 1);
  }

  @Test
  testAnimatorInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({valueType: Number, value: 0, inherits: true})
      readonly foo!: Animator<this, number>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.value, 0);
    exam.equal(parent.foo.state, 0);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 0);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setState(1);
    exam.equal(parent.foo.value, 1);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 0);
    exam.true(child.foo.derived);
    exam.false(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.recohereFasteners();
    exam.equal(child.foo.value, 1);
    exam.equal(child.foo.state, 1);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setState(2);
    exam.equal(parent.foo.value, 1);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 2);
    exam.equal(child.foo.state, 2);
    exam.false(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.value, 1);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 1);
    exam.equal(child.foo.state, 1);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }

  @Test
  testAnimatorTweening(exam: Exam): void {
    const testAnimator = Animator.define("foo", {valueType: Number, value: 0});
    const animator = testAnimator.create(null);
    exam.equal(animator.name, "foo");
    exam.equal(animator.value, 0);
    exam.equal(animator.state, 0);
    exam.false(animator.tweening);

    animator.setState(1, Easing.linear.withDuration(1000));
    exam.equal(animator.value, 0);
    exam.equal(animator.state, 1);
    exam.true(animator.tweening);

    animator.recohere(0);
    exam.equal(animator.value, 0);
    exam.equal(animator.state, 1);
    exam.true(animator.tweening);

    animator.recohere(500);
    exam.equal(animator.value, 0.5);
    exam.equal(animator.state, 1);
    exam.true(animator.tweening);

    animator.recohere(1000);
    exam.equal(animator.value, 1);
    exam.equal(animator.state, 1);
    exam.false(animator.tweening);
  }

  @Test
  testAnimatorTweeningInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({valueType: Number, value: 0, inherits: true})
      readonly foo!: Animator<this, number>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.value, 0);
    exam.equal(parent.foo.state, 0);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 0);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setState(1, Easing.linear.withDuration(1000));
    exam.equal(parent.foo.value, 0);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 0);
    exam.false(parent.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(0);
    exam.equal(parent.foo.value, 0);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 0);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(0);
    exam.equal(parent.foo.value, 0);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 1);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(500);
    exam.equal(parent.foo.value, 0.5);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.value, 0);
    exam.equal(child.foo.state, 1);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(500);
    exam.equal(parent.foo.value, 0.5);
    exam.equal(parent.foo.state, 1);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.value, 0.5);
    exam.equal(child.foo.state, 1);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(1000);
    exam.equal(parent.foo.value, 1);
    exam.equal(parent.foo.state, 1);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 0.5);
    exam.equal(child.foo.state, 1);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(1000);
    exam.equal(parent.foo.value, 1);
    exam.equal(parent.foo.state, 1);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.value, 1);
    exam.equal(child.foo.state, 1);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }
}
