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
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Murmur3;

public class JavaAgentDef implements AgentDef, Debug {
  final String className;
  final Value id;
  final Value props;

  public JavaAgentDef(String className, Value id, Value props) {
    this.className = className;
    this.id = id;
    this.props = props;
  }

  public final String className() {
    return this.className;
  }

  public JavaAgentDef className(String className) {
    return copy(className, this.id, this.props);
  }

  @Override
  public final Value id() {
    return this.id;
  }

  public JavaAgentDef id(Value id) {
    return copy(this.className, id, this.props);
  }

  @Override
  public final Value props() {
    return this.props;
  }

  public JavaAgentDef props(Value props) {
    return copy(this.className, this.id, props);
  }

  protected JavaAgentDef copy(String className, Value id, Value props) {
    return new JavaAgentDef(className, id, props);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JavaAgentDef) {
      final JavaAgentDef that = (JavaAgentDef) other;
      return (this.className == null ? that.className == null : this.className.equals(that.className))
          && this.id.equals(that.id) && this.props.equals(that.props);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JavaAgentDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.className)), this.id.hashCode()), this.props.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("JavaAgentDef").write('.').write("fromClassName").write('(')
        .debug(this.className).write(')');
    if (this.id.isDefined()) {
      output = output.write('.').write("id").write('(').debug(this.id).write(')');
    }
    if (this.props.isDefined()) {
      output = output.write('.').write("props").write('(').debug(this.props).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JavaAgentDef fromClassName(String className) {
    return new JavaAgentDef(className, Text.from(className), Value.absent());
  }
}
