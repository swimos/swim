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
import swim.collections.HashTrieMap;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Murmur3;

public final class ServerDef implements Debug {
  final HashTrieMap<String, PlaneDef> planeDefs;
  final HashTrieMap<Uri, ServiceDef> serviceDefs;
  final StoreDef storeDef;

  public ServerDef(HashTrieMap<String, PlaneDef> planeDefs,
                   HashTrieMap<Uri, ServiceDef> serviceDefs, StoreDef storeDef) {
    this.planeDefs = planeDefs;
    this.serviceDefs = serviceDefs;
    this.storeDef = storeDef;
  }

  public HashTrieMap<String, PlaneDef> planeDefs() {
    return this.planeDefs;
  }

  public PlaneDef getPlaneDef(String planeName) {
    return this.planeDefs.get(planeName);
  }

  public ServerDef planeDef(PlaneDef planeDef) {
    return new ServerDef(this.planeDefs.updated(planeDef.name(), planeDef), this.serviceDefs, this.storeDef);
  }

  public HashTrieMap<Uri, ServiceDef> serviceDefs() {
    return this.serviceDefs;
  }

  public ServiceDef getServiceDef(Uri serviceUri) {
    return this.serviceDefs.get(serviceUri);
  }

  public ServerDef serviceDef(ServiceDef serviceDef) {
    return new ServerDef(this.planeDefs, this.serviceDefs.updated(serviceDef.uri(), serviceDef), this.storeDef);
  }

  public StoreDef storeDef() {
    return this.storeDef;
  }

  public ServerDef storeDef(StoreDef storeDef) {
    return new ServerDef(this.planeDefs, this.serviceDefs, this.storeDef);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ServerDef) {
      final ServerDef that = (ServerDef) other;
      return this.planeDefs.equals(that.planeDefs)
          && this.serviceDefs.equals(that.serviceDefs)
          && this.storeDef.equals(that.storeDef);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ServerDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.planeDefs.hashCode()), this.serviceDefs.hashCode()),
        this.storeDef.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("ServerDef").write('(')
        .debug(this.planeDefs).write(", ").debug(this.serviceDefs).write(", ")
        .debug(this.storeDef).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<ServerDef> form;

  @Kind
  public static Form<ServerDef> form() {
    if (form == null) {
      form = new ServerForm();
    }
    return form;
  }
}

final class ServerForm extends Form<ServerDef> {
  @Override
  public String tag() {
    return "server";
  }

  @Override
  public Class<?> type() {
    return ServerDef.class;
  }

  @Override
  public Item mold(ServerDef serverDef) {
    if (serverDef != null) {
      final Record record = Record.create().attr(tag());
      for (PlaneDef planeDef : serverDef.planeDefs.values()) {
        record.add(planeDef.toValue());
      }
      for (ServiceDef serviceDef : serverDef.serviceDefs.values()) {
        record.add(serviceDef.toValue());
      }
      record.add(serverDef.storeDef.toValue());
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public ServerDef cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(tag());
    if (header.isDefined()) {
      HashTrieMap<String, PlaneDef> planeDefs = HashTrieMap.empty();
      HashTrieMap<Uri, ServiceDef> serviceDefs = HashTrieMap.empty();
      StoreDef storeDef = null;
      for (int i = 0, n = value.length(); i < n; i += 1) {
        final Item member = value.getItem(i);
        final PlaneDef planeDef = PlaneDef.form().cast(member);
        if (planeDef != null) {
          planeDefs = planeDefs.updated(planeDef.name(), planeDef);
        }
        final HttpServiceDef httpServiceDef = HttpServiceDef.form().cast(member);
        if (httpServiceDef != null) {
          serviceDefs = serviceDefs.updated(httpServiceDef.uri(), httpServiceDef);
        }
        final HttpsServiceDef httpsServiceDef = HttpsServiceDef.form().cast(member);
        if (httpsServiceDef != null) {
          serviceDefs = serviceDefs.updated(httpsServiceDef.uri(), httpsServiceDef);
        }
        final StoreDef newStoreDef = StoreDef.form().cast(member);
        if (newStoreDef != null) {
          storeDef = newStoreDef;
        }
      }
      if (storeDef == null) {
        storeDef = new StoreDef(null);
      }
      return new ServerDef(planeDefs, serviceDefs, storeDef);
    }
    return null;
  }
}
