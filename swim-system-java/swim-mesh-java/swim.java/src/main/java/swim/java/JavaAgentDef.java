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

import swim.api.agent.AgentDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Value;
import swim.util.Murmur3;

public class JavaAgentDef implements AgentDef, Debug {
  final String agentName;
  final String className;
  final Value props;

  public JavaAgentDef(String agentName, String className, Value props) {
    this.agentName = agentName;
    this.className = className;
    this.props = props;
  }

  @Override
  public final String agentName() {
    return this.agentName;
  }

  public JavaAgentDef agentName(String agentName) {
    return copy(agentName, this.className, this.props);
  }

  public final String className() {
    return this.className;
  }

  public JavaAgentDef className(String className) {
    return copy(this.agentName, className, this.props);
  }

  @Override
  public final Value props() {
    return this.props;
  }

  public JavaAgentDef props(Value props) {
    return copy(this.agentName, this.className, props);
  }

  protected JavaAgentDef copy(String agentName, String className, Value props) {
    return new JavaAgentDef(agentName, className, props);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JavaAgentDef) {
      final JavaAgentDef that = (JavaAgentDef) other;
      return (this.agentName == null ? that.agentName == null : this.agentName.equals(that.agentName))
          && (this.className == null ? that.className == null : this.className.equals(that.className))
          && this.props.equals(that.props);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JavaAgentDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.agentName)), Murmur3.hash(this.className)), this.props.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("JavaAgentDef").write('.').write("from").write('(')
        .debug(this.agentName).write(", ").debug(this.className).write(')');
    if (this.props.isDefined()) {
      output = output.write('.').write("props").write('(').debug(this.props).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JavaAgentDef from(String agentName, String className) {
    return new JavaAgentDef(agentName, className, Value.absent());
  }

  public static JavaAgentDef fromClassName(String className) {
    return new JavaAgentDef(className, className, Value.absent());
  }
}
