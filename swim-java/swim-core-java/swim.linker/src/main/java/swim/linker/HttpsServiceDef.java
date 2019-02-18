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
import swim.io.warp.WarpSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriScheme;
import swim.util.Murmur3;

public final class HttpsServiceDef extends WarpServiceDef implements Debug {
  final String address;
  final int port;
  final String planeName;
  final Uri documentRoot;
  final WarpSettings warpSettings;

  public HttpsServiceDef(String address, int port, String planeName, Uri documentRoot,
                         WarpSettings warpSettings) {
    this.address = address;
    this.port = port;
    this.planeName = planeName;
    this.documentRoot = documentRoot;
    this.warpSettings = warpSettings;
  }

  @Override
  public UriScheme scheme() {
    return UriScheme.from("https");
  }

  @Override
  public String address() {
    return this.address;
  }

  @Override
  public int port() {
    return this.port;
  }

  @Override
  public String planeName() {
    return this.planeName;
  }

  @Override
  public Uri documentRoot() {
    return this.documentRoot;
  }

  @Override
  public WarpSettings warpSettings() {
    return this.warpSettings;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpsServiceDef) {
      final HttpsServiceDef that = (HttpsServiceDef) other;
      return this.address.equals(that.address) && this.port == that.port
          && (this.planeName == null ? that.planeName == null : this.planeName.equals(that.planeName))
          && (this.documentRoot == null ? that.documentRoot == null : this.documentRoot.equals(that.documentRoot))
          && this.warpSettings.equals(that.warpSettings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpsServiceDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, this.address.hashCode()), this.port), Murmur3.hash(this.planeName)),
        Murmur3.hash(this.documentRoot)), this.warpSettings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("HttpsServiceDef").write('(')
        .debug(this.address).write(", ").debug(this.port).write(", ")
        .debug(this.planeName).write(", ").debug(this.documentRoot).write(", ")
        .debug(this.warpSettings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<HttpsServiceDef> form;

  @Kind
  public static Form<HttpsServiceDef> form() {
    if (form == null) {
      form = new HttpsServiceForm();
    }
    return form;
  }
}

final class HttpsServiceForm extends Form<HttpsServiceDef> {
  @Override
  public String tag() {
    return "https";
  }

  @Override
  public Class<?> type() {
    return HttpsServiceDef.class;
  }

  @Override
  public Item mold(HttpsServiceDef serviceDef) {
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
      final Record record = Record.create().attr(tag(), headers);
      if (serviceDef.planeName != null) {
        record.slot("plane", serviceDef.planeName);
      }
      if (serviceDef.documentRoot != null) {
        record.slot("documentRoot", serviceDef.documentRoot.toString());
      }
      return record.concat(serviceDef.warpSettings.toValue());
    } else {
      return Item.extant();
    }
  }

  @Override
  public HttpsServiceDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(tag());
    if (headers.isDefined()) {
      final String address = headers.get("address").stringValue("0.0.0.0");
      final int port = headers.get("port").intValue(443);
      final String planeName = value.get("plane").stringValue(null);
      final WarpSettings swimSettings = WarpSettings.form().cast(value);
      final Uri documentRoot = value.get("documentRoot").cast(Uri.form());
      return new HttpsServiceDef(address, port, planeName, documentRoot, swimSettings);
    }
    return null;
  }
}
