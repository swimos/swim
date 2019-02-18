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

package swim.linker;

import swim.api.agent.AgentTypeContext;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.UriPattern;
import swim.util.Murmur3;

public final class AgentTypeDef implements AgentTypeContext, Debug {
  final String name;
  final UriPattern route;
  String className;

  public AgentTypeDef(String name, UriPattern route, String className) {
    this.name = name;
    this.route = route;
    this.className = className;
  }

  @Override
  public String name() {
    return this.name;
  }

  public AgentTypeDef name(String name) {
    return new AgentTypeDef(name, this.route, this.className);
  }

  @Override
  public UriPattern route() {
    return this.route;
  }

  public AgentTypeDef route(UriPattern route) {
    return new AgentTypeDef(this.name, route, this.className);
  }

  public String className() {
    return this.className;
  }

  public AgentTypeDef className(String className) {
    return new AgentTypeDef(this.name, this.route, className);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AgentTypeDef) {
      final AgentTypeDef that = (AgentTypeDef) other;
      return (this.name == null ? that.name == null : this.name.equals(that.name))
          && (this.route == null ? that.route == null : this.route.equals(that.route))
          && (this.className == null ? that.className == null : this.className.equals(that.className));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(AgentTypeDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.name)), Murmur3.hash(this.route)), Murmur3.hash(this.className)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("AgentTypeDef").write('.').write("of").write('(').debug(this.name).write(')');
    if (this.route != null) {
      output = output.write('.').write("route").write('(').debug(this.route).write(')');
    }
    if (this.className != null) {
      output = output.write('.').write("className").write('(').debug(this.className).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<AgentTypeDef> form;

  public static AgentTypeDef of(String name) {
    return new AgentTypeDef(name, null, null);
  }

  @Kind
  public static Form<AgentTypeDef> form() {
    if (form == null) {
      form = new AgentTypeForm();
    }
    return form;
  }
}

final class AgentTypeForm extends Form<AgentTypeDef> {
  @Override
  public String tag() {
    return "agent";
  }

  @Override
  public Class<?> type() {
    return AgentTypeDef.class;
  }

  @Override
  public Item mold(AgentTypeDef agentType) {
    if (agentType != null) {
      final Record record = Record.create(3)
          .attr(tag(), agentType.name)
          .slot("route", agentType.route.toUri().toString());
      if (agentType.className != null) {
        record.slot("class", agentType.className);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public AgentTypeDef cast(Item value) {
    final String name = value.getAttr(tag()).stringValue(null);
    if (name != null) {
      final UriPattern route = value.get("route").cast(UriPattern.form());
      final String className = value.get("class").cast(Form.forString());
      return new AgentTypeDef(name, route, className);
    }
    return null;
  }
}
