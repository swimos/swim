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

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.io.TlsSettings;
import swim.io.warp.WarpSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public final class PlaneDef implements Debug {
  final String name;
  final String className;
  final HashTrieMap<String, AgentTypeDef> agentTypeDefs;
  final FingerTrieSeq<AuthDef> authDefs;
  final WarpSettings warpSettings;
  final Record record;

  public PlaneDef(String name, String className, HashTrieMap<String, AgentTypeDef> agentTypeDefs,
                  FingerTrieSeq<AuthDef> authDefs, WarpSettings warpSettings) {
    this(name, className, agentTypeDefs, authDefs, warpSettings, Record.empty());
  }

  public PlaneDef(String name, String className, HashTrieMap<String, AgentTypeDef> agentTypeDefs,
                  FingerTrieSeq<AuthDef> authDefs, WarpSettings warpSettings, Record record) {
    this.name = name;
    this.className = className;
    this.agentTypeDefs = agentTypeDefs;
    this.authDefs = authDefs;
    this.warpSettings = warpSettings;
    this.record = record;
  }

  public String name() {
    return this.name;
  }

  public PlaneDef name(String name) {
    return new PlaneDef(name, this.className, this.agentTypeDefs, this.authDefs, this.warpSettings);
  }

  public String className() {
    return this.className;
  }

  public PlaneDef className(String className) {
    return new PlaneDef(this.name, className, this.agentTypeDefs, this.authDefs, this.warpSettings);
  }

  public HashTrieMap<String, AgentTypeDef> agentTypeDefs() {
    return this.agentTypeDefs;
  }

  public AgentTypeDef getAgentTypeDef(String agentName) {
    return this.agentTypeDefs.get(agentName);
  }

  public PlaneDef agentTypeDef(AgentTypeDef agentTypeDef) {
    return new PlaneDef(this.name, this.className, this.agentTypeDefs.updated(agentTypeDef.name(), agentTypeDef),
        this.authDefs, this.warpSettings);
  }

  public FingerTrieSeq<AuthDef> authDefs() {
    return this.authDefs;
  }

  public PlaneDef authDef(AuthDef authDef) {
    return new PlaneDef(this.name, this.className, this.agentTypeDefs, this.authDefs.appended(authDef),
        this.warpSettings);
  }

  public WarpSettings warpSettings() {
    return this.warpSettings;
  }

  public PlaneDef warpSettings(WarpSettings warpSettings) {
    return new PlaneDef(this.name, this.className, this.agentTypeDefs, this.authDefs, warpSettings);
  }

  public Record record() {
    return record;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof PlaneDef) {
      final PlaneDef that = (PlaneDef) other;
      return this.name.equals(that.name)
          && (this.className == null ? that.className == null : this.className.equals(that.className))
          && this.agentTypeDefs.equals(that.agentTypeDefs) && this.authDefs.equals(that.authDefs)
          && this.warpSettings.equals(that.warpSettings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), Murmur3.hash(this.className)), this.agentTypeDefs.hashCode()),
        this.authDefs.hashCode()), this.warpSettings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("PlaneDef").write('(')
        .debug(this.name).write(", ").debug(this.agentTypeDefs).write(", ")
        .debug(this.authDefs).write(", ").debug(this.warpSettings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<PlaneDef> form;

  @Kind
  public static Form<PlaneDef> form() {
    if (form == null) {
      form = new PlaneForm();
    }
    return form;
  }
}

final class PlaneForm extends Form<PlaneDef> {
  @Override
  public String tag() {
    return "plane";
  }

  @Override
  public Class<?> type() {
    return PlaneDef.class;
  }

  @Override
  public Item mold(PlaneDef planeDef) {
    if (planeDef != null) {
      final Record record = Record.create().attr(tag(), planeDef.name);
      if (planeDef.className != null) {
        record.slot("class", planeDef.className);
      }
      for (AgentTypeDef agentTypeDef : planeDef.agentTypeDefs.values()) {
        record.item(agentTypeDef.toValue());
      }
      for (AuthDef authDef : planeDef.authDefs) {
        record.item(authDef.toValue());
      }
      record.addAll((Record) planeDef.warpSettings.toValue());
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public PlaneDef cast(Item value) {
    final String name = value.getAttr(tag()).stringValue(null);
    if (name != null) {
      final String className = value.get("class").stringValue(null);
      HashTrieMap<String, AgentTypeDef> agentTypeDefs = HashTrieMap.empty();
      FingerTrieSeq<AuthDef> authDefs = FingerTrieSeq.empty();
      for (int i = 0, n = value.length(); i < n; i += 1) {
        final Value item = value.getItem(i).toValue();
        final AgentTypeDef agentTypeDef = AgentTypeDef.form().cast(item);
        if (agentTypeDef != null) {
          agentTypeDefs = agentTypeDefs.updated(agentTypeDef.name(), agentTypeDef);
          continue;
        }
        final AuthDef authDef = AuthDef.authForm().cast(item);
        if (authDef != null) {
          authDefs = authDefs.appended(authDef);
          continue;
        }
      }
      WarpSettings warpSettings = WarpSettings.form().cast(value);
      if (warpSettings.tlsSettings() == null) {
        warpSettings = warpSettings.tlsSettings(TlsSettings.standard());
      }
      return new PlaneDef(name, className, agentTypeDefs, authDefs, warpSettings, (Record) value);
    }
    return null;
  }
}
