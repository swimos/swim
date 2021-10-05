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
import {Affinity} from "@swim/fastener";
import {Spec, Test, Exam} from "@swim/unit";
import {Color} from "@swim/style";
import {Look, Mood, Theme, ThemeAnimator} from "@swim/theme";
import {TestThemeHierarchy} from "./TestThemeHierarchy";

export class ThemeAnimatorSpec extends Spec {
  @Test
  testThemeAnimator(exam: Exam): void {
    const animator = ThemeAnimator.create(null, "foo");
    exam.equal(animator.name, "foo");
    exam.equal(animator.look, null);
    exam.equal(animator.state, void 0);
    exam.equal(animator.value, void 0);

    animator.setState("bar");
    exam.equal(animator.look, null);
    exam.equal(animator.state, "bar");
    exam.equal(animator.value, "bar");

    exam.identical(animator("baz"), null, "accessor set");
    exam.equal(animator(), "baz", "accessor get");
  }

  @Test
  testThemeAnimatorDefine(exam: Exam): void {
    const testAnimator = ThemeAnimator.define({type: Number, state: 0});
    const animator = testAnimator.create(null, "foo");
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
  testThemeAnimatorDecorator(exam: Exam): void {
    class TestHierarchy extends TestThemeHierarchy {
      @ThemeAnimator({type: Number, state: 0})
      readonly foo!: ThemeAnimator<this, number>;
    }
    const hierarchy = new TestHierarchy();
    hierarchy.mount();

    exam.equal(hierarchy.foo.name, "foo");
    exam.equal(hierarchy.foo.state, 0);
    exam.equal(hierarchy.foo.value, 0);

    hierarchy.foo.setState(1);
    exam.equal(hierarchy.foo.state, 1);
    exam.equal(hierarchy.foo.value, 1);

    exam.identical(hierarchy.foo(0.5), hierarchy, "accessor set");
    exam.equal(hierarchy.foo(), 0.5, "accessor get");
  }

  @Test
  testThemeAnimatorLook(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.color, mood)!;

    class TestHierarchy extends TestThemeHierarchy {
      @ThemeAnimator({type: Color, state: null})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const hierarchy = new TestHierarchy();
    hierarchy.theme.setState(theme);
    hierarchy.mood.setState(mood);
    hierarchy.mount();

    exam.equal(hierarchy.foo.name, "foo");
    exam.equal(hierarchy.foo.look, null);
    exam.equal(hierarchy.foo.state, null);
    exam.equal(hierarchy.foo.value, null);

    hierarchy.foo.setLook(Look.color);
    exam.equal(hierarchy.foo.look, Look.color);
    exam.equal(hierarchy.foo.state, color);
    exam.equal(hierarchy.foo.value, color);
  }

  @Test
  testThemeAnimatorLookInheritance(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.color, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;

    class TestHierarchy extends TestThemeHierarchy {
      @ThemeAnimator({type: Color, state: null, inherits: true})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const parent = new TestHierarchy();
    parent.theme.setState(theme);
    parent.mood.setState(mood);
    const child = new TestHierarchy();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.look, null);
    exam.equal(parent.foo.state, null);
    exam.equal(parent.foo.value, null);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, null);
    exam.equal(child.foo.state, null);
    exam.equal(child.foo.value, null);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setLook(Look.color, false);
    exam.equal(parent.foo.look, Look.color);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, null);
    exam.equal(child.foo.state, null);
    exam.equal(child.foo.value, null);
    exam.true(child.foo.inherited);
    exam.false(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.recohereFasteners();
    exam.equal(child.foo.look, Look.color);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setLook(Look.backgroundColor, false);
    exam.equal(parent.foo.look, Look.color);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, Look.backgroundColor);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, backgroundColor);
    exam.false(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.look, Look.color);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.inherited);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, Look.color);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.true(child.foo.inherited);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }

  @Test
  testThemeAnimatorLookTweening(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.color, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;
    const colorInterpolator = color.interpolateTo(backgroundColor);

    class TestHierarchy extends TestThemeHierarchy {
      @ThemeAnimator({type: Color, look: Look.color})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const hierarchy = new TestHierarchy();
    hierarchy.theme.setState(theme);
    hierarchy.mood.setState(mood);
    hierarchy.mount();

    exam.equal(hierarchy.foo.look, Look.color);
    exam.equal(hierarchy.foo.state, color);
    exam.equal(hierarchy.foo.value, color);
    exam.false(hierarchy.foo.tweening);

    hierarchy.foo.setLook(Look.backgroundColor, Easing.linear.withDuration(1000));
    exam.equal(hierarchy.foo.look, Look.backgroundColor);
    exam.equal(hierarchy.foo.state, backgroundColor);
    exam.equal(hierarchy.foo.value, color);
    exam.true(hierarchy.foo.tweening);

    hierarchy.recohereFasteners(0);
    exam.equal(hierarchy.foo.look, Look.backgroundColor);
    exam.equal(hierarchy.foo.state, backgroundColor);
    exam.equal(hierarchy.foo.value, color);
    exam.true(hierarchy.foo.tweening);

    hierarchy.recohereFasteners(500);
    exam.equal(hierarchy.foo.look, Look.backgroundColor);
    exam.equal(hierarchy.foo.state, backgroundColor);
    exam.equal(hierarchy.foo.value, colorInterpolator(0.5));
    exam.true(hierarchy.foo.tweening);

    hierarchy.recohereFasteners(1000);
    exam.equal(hierarchy.foo.look, Look.backgroundColor);
    exam.equal(hierarchy.foo.state, backgroundColor);
    exam.equal(hierarchy.foo.value, backgroundColor);
    exam.false(hierarchy.foo.tweening);
  }

  @Test
  testThemeAnimatorLookTweeningInheritance(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.color, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;
    const colorInterpolator = color.interpolateTo(backgroundColor);

    class TestHierarchy extends TestThemeHierarchy {
      @ThemeAnimator({type: Color, look: Look.color, inherits: true})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const parent = new TestHierarchy();
    parent.theme.setState(theme);
    parent.mood.setState(mood);
    const child = new TestHierarchy();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.superFastener, parent.foo);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setLook(Look.backgroundColor, Easing.linear.withDuration(1000));
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.false(parent.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(0);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(0);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, color);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(500);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, colorInterpolator(0.5));
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, color);
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(500);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, colorInterpolator(0.5));
    exam.false(parent.foo.coherent);
    exam.true(parent.foo.tweening);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, colorInterpolator(0.5));
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    parent.recohereFasteners(1000);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, backgroundColor);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, colorInterpolator(0.5));
    exam.false(child.foo.coherent);
    exam.true(child.foo.tweening);

    child.recohereFasteners(1000);
    exam.equal(parent.foo.state, backgroundColor);
    exam.equal(parent.foo.value, backgroundColor);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, backgroundColor);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }
}
