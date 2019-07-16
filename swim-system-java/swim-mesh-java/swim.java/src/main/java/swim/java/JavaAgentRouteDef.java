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

package swim.java;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.kernel.AgentRouteDef;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public class JavaAgentRouteDef implements JavaAgentDef, AgentRouteDef, Debug {
  protected final String routeName;
  protected final String className;
  protected final UriPattern pattern;

  public JavaAgentRouteDef(String routeName, String className, UriPattern pattern) {
    this.routeName = routeName;
    this.className = className;
    this.pattern = pattern;
  }

  @Override
  public final String routeName() {
    return this.routeName;
  }

  public JavaAgentRouteDef routeName(String routeName) {
    return copy(routeName, this.className, this.pattern);
  }

  @Override
  public final String className() {
    return this.className;
  }

  public JavaAgentRouteDef className(String className) {
    return copy(this.routeName, className, this.pattern);
  }

  @Override
  public final UriPattern pattern() {
    return this.pattern;
  }

  @Override
  public JavaAgentRouteDef pattern(UriPattern pattern) {
    return copy(this.routeName, this.className, pattern);
  }

  protected JavaAgentRouteDef copy(String routeName, String className, UriPattern pattern) {
    return new JavaAgentRouteDef(routeName, className, pattern);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JavaAgentRouteDef) {
      final JavaAgentRouteDef that = (JavaAgentRouteDef) other;
      return (this.routeName == null ? that.routeName == null : this.routeName.equals(that.routeName))
          && (this.className == null ? that.className == null : this.className.equals(that.className))
          && (this.pattern == null ? that.pattern == null : this.pattern.equals(that.pattern));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JavaAgentRouteDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.routeName)), Murmur3.hash(this.className)), Murmur3.hash(this.pattern)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("JavaAgentRouteDef").write('(')
        .debug(this.routeName).write(", ").debug(this.className).write(", ")
        .debug(this.pattern).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;
}
