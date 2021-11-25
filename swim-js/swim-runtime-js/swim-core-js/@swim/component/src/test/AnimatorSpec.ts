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

import {Easing} from "@swim/util";
import {Spec, Test, Exam} from "@swim/unit";
import {Affinity, Animator, Component} from "@swim/component";

export class AnimatorSpec extends Spec {
  @Test
  testAnimator(exam: Exam): void {
    const animator = Animator.create(null);
    exam.equal(animator.name, "");
    exam.equal(animator.state, void 0);
    exam.equal(animator.value, void 0);

    animator.setState("bar");
    exam.equal(animator.state, "bar");
    exam.equal(animator.value, "bar");

    exam.identical(animator("baz"), null, "accessor set");
    exam.equal(animator(), "baz", "accessor get");
  }

  @Test
  testAnimatorDefine(exam: Exam): void {
    const testAnimator = Animator.define("foo", {type: Number, state: 0});
    const animator = testAnimator.create(null);
    exam.equal(animator.name, "foo");
    exam.equal(animator.state, 0);
    exam.equal(animator.value, 0);

    animator.setState(1);
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 1);

    exam.identical(animator(0.5), null, "accessor set");
    exam.equal(animator(), 0.5, "accessor get");
  }

  @Test
  testAnimatorDecorator(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({type: Number, state: 0})
      readonly foo!: Animator<this, number>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.state, 0);
    exam.equal(component.foo.value, 0);

    component.foo.setState(1);
    exam.equal(component.foo.state, 1);
    exam.equal(component.foo.value, 1);

    exam.identical(component.foo(0.5), component, "accessor set");
    exam.equal(component.foo(), 0.5, "accessor get");
  }

  @Test
  testAnimatorInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({type: Number, state: 0, inherits: true})
      readonly foo!: Animator<this, number>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.state, 0);
    exam.equal(parent.foo.value, 0);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 0);
    exam.equal(child.foo.value, 0);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setState(1);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 1);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 0);
    exam.equal(child.foo.value, 0);
    exam.true(child.foo.inherited);
    exam.false(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.recohereFasteners();
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 1);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setState(2);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 1);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 2);
    exam.equal(child.foo.value, 2);
    exam.false(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 1);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 1);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }

  @Test
  testAnimatorTweening(exam: Exam): void {
    const testAnimator = Animator.define("foo", {type: Number, state: 0});
    const animator = testAnimator.create(null);
    exam.equal(animator.name, "foo");
    exam.equal(animator.state, 0);
    exam.equal(animator.value, 0);
    exam.false(animator.tweening);

    animator.setState(1, Easing.linear.withDuration(1000));
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 0);
    exam.true(animator.tweening);

    animator.recohere(0);
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 0);
    exam.true(animator.tweening);

    animator.recohere(500);
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 0.5);
    exam.true(animator.tweening);

    animator.recohere(1000);
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 1);
    exam.false(animator.tweening);
  }

  @Test
  testAnimatorTweeningInheritance(exam: Exam): void {
    class TestComponent extends Component {
      @Animator({type: Number, state: 0, inherits: true})
      readonly foo!: Animator<this, number>;
    }
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.state, 0);
    exam.equal(parent.foo.value, 0);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 0);
    exam.equal(child.foo.value, 0);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setState(1, Easing.linear.withDuration(1000));
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 0);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, 0);
    exam.equal(child.foo.value, 0);
    exam.false(parent.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(0);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 0);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, 0);
    exam.equal(child.foo.value, 0);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(0);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 0);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 0);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(500);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 0.5);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 0);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(500);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 0.5);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 0.5);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(1000);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 1);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 0.5);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(1000);
    exam.equal(parent.foo.state, 1);
    exam.equal(parent.foo.value, 1);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, 1);
    exam.equal(child.foo.value, 1);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }
}
