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
import swim.structure.Value;
import swim.uri.UriPath;
import swim.util.Murmur3;

public class JsAgentDef implements AgentDef, Debug {
  final String agentName;
  final UriPath modulePath;
  final Value props;

  public JsAgentDef(String agentName, UriPath modulePath, Value props) {
    this.agentName = agentName;
    this.modulePath = modulePath;
    this.props = props;
  }

  @Override
  public final String agentName() {
    return this.agentName;
  }

  public JsAgentDef agentName(String agentName) {
    return copy(agentName, this.modulePath, this.props);
  }

  public final UriPath modulePath() {
    return this.modulePath;
  }

  public JsAgentDef modulePath(UriPath modulePath) {
    return copy(this.agentName, modulePath, this.props);
  }

  @Override
  public final Value props() {
    return this.props;
  }

  public JsAgentDef props(Value props) {
    return copy(this.agentName, this.modulePath, props);
  }

  protected JsAgentDef copy(String agentName, UriPath modulePath, Value props) {
    return new JsAgentDef(agentName, modulePath, props);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsAgentDef) {
      final JsAgentDef that = (JsAgentDef) other;
      return (this.agentName == null ? that.agentName == null : this.agentName.equals(that.agentName))
          && (this.modulePath == null ? that.modulePath == null : this.modulePath.equals(that.modulePath))
          && this.props.equals(that.props);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsAgentDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.agentName)), Murmur3.hash(this.modulePath)), this.props.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("JsAgentDef").write('.').write("from").write('(')
        .debug(this.agentName).write(", ").debug(this.modulePath).write(')');
    if (this.props.isDefined()) {
      output = output.write('.').write("props").write('(').debug(this.props).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JsAgentDef from(String agentName, UriPath modulePath) {
    return new JsAgentDef(agentName, modulePath, Value.absent());
  }

  public static JsAgentDef from(String agentName, String modulePath) {
    return new JsAgentDef(agentName, UriPath.parse(modulePath), Value.absent());
  }

  public static JsAgentDef fromModulePath(UriPath modulePath) {
    return new JsAgentDef(modulePath.toString(), modulePath, Value.absent());
  }

  public static JsAgentDef fromModulePath(String modulePath) {
    return new JsAgentDef(modulePath, UriPath.parse(modulePath), Value.absent());
  }
}
