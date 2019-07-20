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

package swim.service.warp;

import swim.api.service.ServiceDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.io.warp.WarpSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.uri.UriPath;
import swim.uri.UriScheme;
import swim.util.Murmur3;

public class WarpServiceDef implements ServiceDef, Debug {
  final String serviceName;
  final UriScheme scheme;
  final String address;
  final int port;
  final String spaceName;
  final UriPath documentRoot;
  final WarpSettings warpSettings;

  public WarpServiceDef(String serviceName, UriScheme scheme, String address, int port,
                        String spaceName, UriPath documentRoot, WarpSettings warpSettings) {
    this.serviceName = serviceName;
    this.scheme = scheme;
    this.address = address;
    this.port = port;
    this.spaceName = spaceName;
    this.documentRoot = documentRoot;
    this.warpSettings = warpSettings;
  }

  @Override
  public final String serviceName() {
    return this.serviceName;
  }

  public WarpServiceDef serviceName(String serviceName) {
    return copy(serviceName, this.scheme, this.address, this.port,
                this.spaceName, this.documentRoot, this.warpSettings);
  }

  @Override
  public final UriScheme scheme() {
    return this.scheme;
  }

  public WarpServiceDef scheme(UriScheme scheme) {
    return copy(this.serviceName, scheme, this.address, this.port,
                this.spaceName, this.documentRoot, this.warpSettings);
  }

  public final String address() {
    return this.address;
  }

  public WarpServiceDef address(String address) {
    return copy(this.serviceName, this.scheme, address, this.port,
                this.spaceName, this.documentRoot, this.warpSettings);
  }

  public final int port() {
    return this.port;
  }

  public WarpServiceDef port(int port) {
    return copy(this.serviceName, this.scheme, this.address, port,
                this.spaceName, this.documentRoot, this.warpSettings);
  }

  public final String spaceName() {
    return this.spaceName;
  }

  public WarpServiceDef spaceName(String spaceName) {
    return copy(this.serviceName, this.scheme, this.address, this.port,
                spaceName, this.documentRoot, this.warpSettings);
  }

  public final UriPath documentRoot() {
    return this.documentRoot;
  }

  public WarpServiceDef documentRoot(UriPath documentRoot) {
    return copy(this.serviceName, this.scheme, this.address, this.port,
                this.spaceName, documentRoot, this.warpSettings);
  }

  public final WarpSettings warpSettings() {
    return this.warpSettings;
  }

  public WarpServiceDef warpSettings(WarpSettings warpSettings) {
    return copy(this.serviceName, this.scheme, this.address, this.port,
                this.spaceName, this.documentRoot, warpSettings);
  }

  protected WarpServiceDef copy(String serviceName, UriScheme scheme, String address, int port,
                                String spaceName, UriPath documentRoot, WarpSettings warpSettings) {
    return new WarpServiceDef(serviceName, scheme, address, port, spaceName, documentRoot, warpSettings);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WarpServiceDef) {
      final WarpServiceDef that = (WarpServiceDef) other;
      return (this.serviceName == null ? that.serviceName == null : this.serviceName.equals(that.serviceName))
          && this.scheme.equals(that.scheme) && this.address.equals(that.address) && this.port == that.port
          && (this.spaceName == null ? that.spaceName == null : this.spaceName.equals(that.spaceName))
          && (this.documentRoot == null ? that.documentRoot == null : this.documentRoot.equals(that.documentRoot))
          && this.warpSettings.equals(that.warpSettings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WarpServiceDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.serviceName)), this.address.hashCode()), this.port),
        Murmur3.hash(this.spaceName)), Murmur3.hash(this.documentRoot)), this.warpSettings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("WarpServiceDef").write('(')
        .debug(this.serviceName).write(", ").debug(this.scheme).write(", ")
        .debug(this.address).write(", ").debug(this.port).write(", ")
        .debug(this.spaceName).write(", ").debug(this.documentRoot).write(", ")
        .debug(this.warpSettings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<WarpServiceDef> warpForm;
  private static Form<WarpServiceDef> warpsForm;

  public static WarpServiceDef standard() {
    return new WarpServiceDef("warp", UriScheme.from("warp"), "0.0.0.0", 80,
                              null, null, WarpSettings.standard());
  }

  @Kind
  public static Form<WarpServiceDef> warpForm() {
    if (warpForm == null) {
      warpForm = new WarpServiceForm(UriScheme.from("warp"));
    }
    return warpForm;
  }

  public static Form<WarpServiceDef> warpsForm() {
    if (warpsForm == null) {
      warpsForm = new WarpServiceForm(UriScheme.from("warps"));
    }
    return warpsForm;
  }
}

final class WarpServiceForm extends Form<WarpServiceDef> {
  final UriScheme scheme;

  WarpServiceForm(UriScheme scheme) {
    this.scheme = scheme;
  }

  @Override
  public String tag() {
    return this.scheme.name();
  }

  @Override
  public Class<?> type() {
    return WarpServiceDef.class;
  }

  @Override
  public Item mold(WarpServiceDef serviceDef) {
    if (serviceDef != null) {
      Value headers = Value.absent();
      if (!"0.0.0.0".equals(serviceDef.address)) {
        headers = headers.updated("address", serviceDef.address);
      }
      if (serviceDef.port != 443) {
        headers = headers.updated("port", serviceDef.port);
      }
      if (!headers.isDefined()) {
        headers = Value.extant();
      }
      final Record record = Record.create().attr(serviceDef.scheme.name(), headers);
      if (serviceDef.spaceName != null) {
        record.slot("space", serviceDef.spaceName);
      }
      if (serviceDef.documentRoot != null) {
        record.slot("documentRoot", serviceDef.documentRoot.toString());
      }
      final Value value = record.concat(serviceDef.warpSettings.toValue());
      return serviceDef.serviceName != null ? Slot.of(serviceDef.serviceName, value) : value;
    } else {
      return Item.extant();
    }
  }

  @Override
  public WarpServiceDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(tag());
    if (headers.isDefined()) {
      final String serviceName = item.key().stringValue(tag());
      final String address = headers.get("address").stringValue("0.0.0.0");
      final int port = headers.get("port").intValue(443);
      String spaceName = value.get("space").stringValue(null);
      if (spaceName == null) {
        spaceName = value.get("plane").stringValue(null); // deprecated
      }
      final UriPath documentRoot = value.get("documentRoot").cast(UriPath.pathForm());
      final WarpSettings warpSettings = WarpSettings.form().cast(value);
      return new WarpServiceDef(serviceName, this.scheme, address, port, spaceName,
                                documentRoot, warpSettings);
    }
    return null;
  }
}
