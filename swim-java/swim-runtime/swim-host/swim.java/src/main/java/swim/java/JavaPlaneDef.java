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

package swim.java;

import swim.api.plane.PlaneDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public class JavaPlaneDef implements PlaneDef, Debug {

  final String planeName;
  final String className;

  public JavaPlaneDef(String planeName, String className) {
    this.planeName = planeName;
    this.className = className;
  }

  @Override
  public final String planeName() {
    return this.planeName;
  }

  public JavaPlaneDef planeName(String planeName) {
    return this.copy(planeName, this.className);
  }

  public final String className() {
    return this.className;
  }

  public JavaPlaneDef className(String className) {
    return this.copy(this.planeName, className);
  }

  protected JavaPlaneDef copy(String planeName, String className) {
    return new JavaPlaneDef(planeName, className);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JavaPlaneDef) {
      final JavaPlaneDef that = (JavaPlaneDef) other;
      return (this.planeName == null ? that.planeName == null : this.planeName.equals(that.planeName))
          && (this.className == null ? that.className == null : this.className.equals(that.className));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (JavaPlaneDef.hashSeed == 0) {
      JavaPlaneDef.hashSeed = Murmur3.seed(JavaPlaneDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(JavaPlaneDef.hashSeed,
        Murmur3.hash(this.planeName)), Murmur3.hash(this.className)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("JavaPlaneDef").write('.').write("create").write('(')
                   .debug(this.planeName).write(", ").debug(this.className).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static JavaPlaneDef create(String planeName, String className) {
    return new JavaPlaneDef(planeName, className);
  }

  public static JavaPlaneDef fromClassName(String className) {
    return new JavaPlaneDef(className, className);
  }

}
