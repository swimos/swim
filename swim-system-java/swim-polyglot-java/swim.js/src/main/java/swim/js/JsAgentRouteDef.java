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

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.kernel.AgentRouteDef;
import swim.uri.UriPath;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public class JsAgentRouteDef implements JsAgentDef, AgentRouteDef, Debug {
  protected final String routeName;
  protected final UriPath modulePath;
  protected final UriPattern pattern;

  public JsAgentRouteDef(String routeName, UriPath modulePath, UriPattern pattern) {
    this.routeName = routeName;
    this.modulePath = modulePath;
    this.pattern = pattern;
  }

  @Override
  public final String routeName() {
    return this.routeName;
  }

  public JsAgentRouteDef routeName(String routeName) {
    return copy(routeName, this.modulePath, this.pattern);
  }

  @Override
  public final UriPath modulePath() {
    return this.modulePath;
  }

  public JsAgentRouteDef modulePath(UriPath modulePath) {
    return copy(this.routeName, modulePath, this.pattern);
  }

  @Override
  public final UriPattern pattern() {
    return this.pattern;
  }

  @Override
  public JsAgentRouteDef pattern(UriPattern pattern) {
    return copy(this.routeName, this.modulePath, pattern);
  }

  public JsAgentRouteDef pattern(String pattern) {
    return pattern(UriPattern.parse(pattern));
  }

  protected JsAgentRouteDef copy(String routeName, UriPath modulePath, UriPattern pattern) {
    return new JsAgentRouteDef(routeName, modulePath, pattern);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsAgentRouteDef) {
      final JsAgentRouteDef that = (JsAgentRouteDef) other;
      return (this.routeName == null ? that.routeName == null : this.routeName.equals(that.routeName))
          && (this.modulePath == null ? that.modulePath == null : this.modulePath.equals(that.modulePath))
          && (this.pattern == null ? that.pattern == null : this.pattern.equals(that.pattern));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsAgentRouteDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.routeName)), Murmur3.hash(this.modulePath)), Murmur3.hash(this.pattern)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("JsAgentRouteDef").write('(')
        .debug(this.routeName).write(", ").debug(this.modulePath).write(", ")
        .debug(this.pattern).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JsAgentRouteDef fromModulePath(UriPath modulePath) {
    return new JsAgentRouteDef(null, modulePath, null);
  }

  public static JsAgentRouteDef fromModulePath(String modulePath) {
    return fromModulePath(UriPath.parse(modulePath));
  }
}
