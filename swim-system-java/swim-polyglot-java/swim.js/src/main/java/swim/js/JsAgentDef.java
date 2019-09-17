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

import swim.api.agent.AgentDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.UriPath;
import swim.util.Murmur3;

public class JsAgentDef implements AgentDef, Debug {
  final UriPath modulePath;
  final Value id;
  final Value props;

  public JsAgentDef(UriPath modulePath, Value id, Value props) {
    this.modulePath = modulePath;
    this.id = id;
    this.props = props;
  }

  public final UriPath modulePath() {
    return this.modulePath;
  }

  public JsAgentDef modulePath(UriPath modulePath) {
    return copy(modulePath, this.id, this.props);
  }

  @Override
  public final Value id() {
    return this.id;
  }

  public JsAgentDef id(Value id) {
    return copy(this.modulePath, id, this.props);
  }

  @Override
  public final Value props() {
    return this.props;
  }

  public JsAgentDef props(Value props) {
    return copy(this.modulePath, this.id, props);
  }

  protected JsAgentDef copy(UriPath modulePath, Value id, Value props) {
    return new JsAgentDef(modulePath, id, props);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsAgentDef) {
      final JsAgentDef that = (JsAgentDef) other;
      return (this.modulePath == null ? that.modulePath == null : this.modulePath.equals(that.modulePath))
          && this.id.equals(that.id) && this.props.equals(that.props);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsAgentDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.modulePath)), this.id.hashCode()), this.props.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("JsAgentDef").write('.').write("fromModulePath").write('(')
        .debug(this.modulePath).write(')');
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

  public static JsAgentDef fromModulePath(UriPath modulePath) {
    return new JsAgentDef(modulePath, Text.from(modulePath.toString()), Value.absent());
  }

  public static JsAgentDef fromModulePath(String modulePath) {
    return new JsAgentDef(UriPath.parse(modulePath), Text.from(modulePath), Value.absent());
  }
}
