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

package swim.js;

import swim.api.plane.PlaneDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.uri.UriPath;
import swim.util.Murmur3;

public class JsPlaneDef implements PlaneDef, Debug {
  final String planeName;
  final UriPath modulePath;

  public JsPlaneDef(String planeName, UriPath modulePath) {
    this.planeName = planeName;
    this.modulePath = modulePath;
  }

  @Override
  public final String planeName() {
    return this.planeName;
  }

  public JsPlaneDef planeName(String planeName) {
    return copy(planeName, this.modulePath);
  }

  public final UriPath modulePath() {
    return this.modulePath;
  }

  public JsPlaneDef modulePath(UriPath modulePath) {
    return copy(this.planeName, modulePath);
  }

  protected JsPlaneDef copy(String planeName, UriPath modulePath) {
    return new JsPlaneDef(planeName, modulePath);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsPlaneDef) {
      final JsPlaneDef that = (JsPlaneDef) other;
      return (this.planeName == null ? that.planeName == null : this.planeName.equals(that.planeName))
          && (this.modulePath == null ? that.modulePath == null : this.modulePath.equals(that.modulePath));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsPlaneDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.planeName)), Murmur3.hash(this.modulePath)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("JsPlaneDef").write('.').write("from").write('(')
        .debug(this.planeName).write(", ").debug(this.modulePath).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JsPlaneDef from(String planeName, UriPath modulePath) {
    return new JsPlaneDef(planeName, modulePath);
  }

  public static JsPlaneDef from(String planeName, String modulePath) {
    return new JsPlaneDef(planeName, UriPath.parse(modulePath));
  }

  public static JsPlaneDef fromModulePath(UriPath modulePath) {
    return new JsPlaneDef(modulePath.toString(), modulePath);
  }

  public static JsPlaneDef fromModulePath(String modulePath) {
    return new JsPlaneDef(modulePath, UriPath.parse(modulePath));
  }
}
