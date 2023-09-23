// Copyright 2015-2023 Nstream, inc.
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
import {Affinity} from "@swim/component";
import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import {Theme} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {TestThemeComponent} from "./TestThemeComponent";

export class ThemeAnimatorSpec extends Suite {
  @Test
  testThemeAnimator(exam: Exam): void {
    const animator = ThemeAnimator.create(null);
    exam.equal(animator.name, "ThemeAnimator");
    exam.equal(animator.look, null);
    exam.equal(animator.state, void 0);
    exam.equal(animator.value, void 0);

    animator.setState("bar");
    exam.equal(animator.look, null);
    exam.equal(animator.state, "bar");
    exam.equal(animator.value, "bar");
  }

  @Test
  testThemeAnimatorDefine(exam: Exam): void {
    const testAnimator = ThemeAnimator.define("foo", {valueType: Number, value: 0});
    const animator = testAnimator.create(null);
    exam.equal(animator.name, "foo");
    exam.equal(animator.state, 0);
    exam.equal(animator.value, 0);

    animator.setState(1);
    exam.equal(animator.state, 1);
    exam.equal(animator.value, 1);
  }

  @Test
  testThemeAnimatorDecorator(exam: Exam): void {
    class TestComponent extends TestThemeComponent {
      @ThemeAnimator({valueType: Number, value: 0})
      readonly foo!: ThemeAnimator<this, number>;
    }
    const component = new TestComponent();
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.state, 0);
    exam.equal(component.foo.value, 0);

    component.foo.setState(1);
    exam.equal(component.foo.state, 1);
    exam.equal(component.foo.value, 1);
  }

  @Test
  testThemeAnimatorLook(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.textColor, mood)!;

    class TestComponent extends TestThemeComponent {
      @ThemeAnimator({valueType: Color, value: null})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const component = new TestComponent();
    component.theme.setValue(theme);
    component.mood.setValue(mood);
    component.mount();

    exam.equal(component.foo.name, "foo");
    exam.equal(component.foo.look, null);
    exam.equal(component.foo.state, null);
    exam.equal(component.foo.value, null);

    component.foo.setLook(Look.textColor);
    exam.equal(component.foo.look, Look.textColor);
    exam.equal(component.foo.state, color);
    exam.equal(component.foo.value, color);
  }

  @Test
  testThemeAnimatorLookInheritance(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.textColor, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;

    class TestComponent extends TestThemeComponent {
      @ThemeAnimator({valueType: Color, value: null, inherits: true})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const parent = new TestComponent();
    parent.theme.setValue(theme);
    parent.mood.setValue(mood);
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.look, null);
    exam.equal(parent.foo.state, null);
    exam.equal(parent.foo.value, null);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, null);
    exam.equal(child.foo.state, null);
    exam.equal(child.foo.value, null);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    parent.foo.setLook(Look.textColor, false);
    exam.equal(parent.foo.look, Look.textColor);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, null);
    exam.equal(child.foo.state, null);
    exam.equal(child.foo.value, null);
    exam.true(child.foo.derived);
    exam.false(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.recohereFasteners();
    exam.equal(child.foo.look, Look.textColor);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setLook(Look.backgroundColor, false);
    exam.equal(parent.foo.look, Look.textColor);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, Look.backgroundColor);
    exam.equal(child.foo.state, backgroundColor);
    exam.equal(child.foo.value, backgroundColor);
    exam.false(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);

    child.foo.setAffinity(Affinity.Inherited);
    exam.equal(parent.foo.look, Look.textColor);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.false(parent.foo.derived);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.look, Look.textColor);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.true(child.foo.derived);
    exam.true(child.foo.coherent);
    exam.false(child.foo.tweening);
  }

  @Test
  testThemeAnimatorLookTweening(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.textColor, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;
    const colorInterpolator = color.interpolateTo(backgroundColor);

    class TestComponent extends TestThemeComponent {
      @ThemeAnimator({valueType: Color, look: Look.textColor})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const component = new TestComponent();
    component.theme.setValue(theme);
    component.mood.setValue(mood);
    component.mount();

    exam.equal(component.foo.look, Look.textColor);
    exam.equal(component.foo.state, color);
    exam.equal(component.foo.value, color);
    exam.false(component.foo.tweening);

    component.foo.setLook(Look.backgroundColor, Easing.linear.withDuration(1000));
    exam.equal(component.foo.look, Look.backgroundColor);
    exam.equal(component.foo.state, backgroundColor);
    exam.equal(component.foo.value, color);
    exam.true(component.foo.tweening);

    component.recohereFasteners(0);
    exam.equal(component.foo.look, Look.backgroundColor);
    exam.equal(component.foo.state, backgroundColor);
    exam.equal(component.foo.value, color);
    exam.true(component.foo.tweening);

    component.recohereFasteners(500);
    exam.equal(component.foo.look, Look.backgroundColor);
    exam.equal(component.foo.state, backgroundColor);
    exam.equal(component.foo.value, colorInterpolator(0.5));
    exam.true(component.foo.tweening);

    component.recohereFasteners(1000);
    exam.equal(component.foo.look, Look.backgroundColor);
    exam.equal(component.foo.state, backgroundColor);
    exam.equal(component.foo.value, backgroundColor);
    exam.false(component.foo.tweening);
  }

  @Test
  testThemeAnimatorLookTweeningInheritance(exam: Exam): void {
    const theme = Theme.dark;
    const mood = Mood.default;
    const color = theme.get(Look.textColor, mood)!;
    const backgroundColor = theme.get(Look.backgroundColor, mood)!;
    const colorInterpolator = color.interpolateTo(backgroundColor);

    class TestComponent extends TestThemeComponent {
      @ThemeAnimator({valueType: Color, look: Look.textColor, inherits: true})
      readonly foo!: ThemeAnimator<this, Color | null>;
    }
    const parent = new TestComponent();
    parent.theme.setValue(theme);
    parent.mood.setValue(mood);
    const child = new TestComponent();
    parent.appendChild(child);
    parent.mount();

    exam.equal(child.foo.inlet, parent.foo);
    exam.equal(parent.foo.state, color);
    exam.equal(parent.foo.value, color);
    exam.true(parent.foo.coherent);
    exam.false(parent.foo.tweening);
    exam.equal(child.foo.state, color);
    exam.equal(child.foo.value, color);
    exam.false(child.foo.coherent);
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
