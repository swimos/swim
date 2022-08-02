// Copyright 2015-2022 Swim.inc
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

package swim.service.web;

import swim.api.service.ServiceDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.io.warp.WarpSettings;
import swim.uri.UriPath;
import swim.util.Murmur3;

public class WebServiceDef implements ServiceDef, Debug {

  final String serviceName;
  final String address;
  final int port;
  final boolean isSecure;
  final String spaceName;
  final String routerClass;
  final UriPath documentRoot;
  final UriPath resourceRoot;
  final WarpSettings warpSettings;

  public WebServiceDef(String serviceName, String address, int port, boolean isSecure,
                       String spaceName, String routerClass, UriPath documentRoot,
                       UriPath resourceRoot, WarpSettings warpSettings) {
    this.serviceName = serviceName;
    this.address = address;
    this.port = port;
    this.isSecure = isSecure;
    this.spaceName = spaceName;
    this.routerClass = routerClass;
    this.documentRoot = documentRoot;
    this.resourceRoot = resourceRoot;
    this.warpSettings = warpSettings;
  }

  @Override
  public final String serviceName() {
    return this.serviceName;
  }

  public WebServiceDef serviceName(String serviceName) {
    return this.copy(serviceName, this.address, this.port, this.isSecure,
                     this.spaceName, this.routerClass, this.documentRoot, this.resourceRoot, this.warpSettings);
  }

  public final String address() {
    return this.address;
  }

  public WebServiceDef address(String address) {
    return this.copy(this.serviceName, address, this.port, this.isSecure,
                     this.spaceName, this.routerClass, this.documentRoot, this.resourceRoot, this.warpSettings);
  }

  public final int port() {
    return this.port;
  }

  public WebServiceDef port(int port) {
    return this.copy(this.serviceName, this.address, port, this.isSecure,
                     this.spaceName, this.routerClass, this.documentRoot, this.resourceRoot, this.warpSettings);
  }

  public final String spaceName() {
    return this.spaceName;
  }

  public WebServiceDef spaceName(String spaceName) {
    return this.copy(this.serviceName, this.address, this.port, this.isSecure,
                     spaceName, this.routerClass, this.documentRoot, this.resourceRoot, this.warpSettings);
  }

  public final UriPath documentRoot() {
    return this.documentRoot;
  }

  public WebServiceDef documentRoot(UriPath documentRoot) {
    return this.copy(this.serviceName, this.address, this.port, this.isSecure,
                     this.spaceName, this.routerClass, documentRoot, this.resourceRoot, this.warpSettings);
  }

  public final UriPath resourceRoot() {
    return this.resourceRoot;
  }

  public WebServiceDef resourceRoot(UriPath resourceRoot) {
    return this.copy(this.serviceName, this.address, this.port, this.isSecure,
                     this.spaceName, this.routerClass, this.documentRoot, resourceRoot, this.warpSettings);
  }

  public final WarpSettings warpSettings() {
    return this.warpSettings;
  }

  public WebServiceDef warpSettings(WarpSettings warpSettings) {
    return this.copy(this.serviceName, this.address, this.port, this.isSecure,
                     this.spaceName, this.routerClass, this.documentRoot, this.resourceRoot, warpSettings);
  }

  protected WebServiceDef copy(String serviceName, String address, int port, boolean isSecure,
                               String spaceName, String routerClass, UriPath documentRoot, UriPath resourceRoot,
                               WarpSettings warpSettings) {
    return new WebServiceDef(serviceName, address, port, isSecure, spaceName, routerClass,
                             documentRoot, resourceRoot, warpSettings);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WebServiceDef) {
      final WebServiceDef that = (WebServiceDef) other;
      return (this.serviceName == null ? that.serviceName == null : this.serviceName.equals(that.serviceName))
          && this.address.equals(that.address) && this.port == that.port && this.isSecure == that.isSecure
          && (this.spaceName == null ? that.spaceName == null : this.spaceName.equals(that.spaceName))
          && (this.routerClass == null ? that.routerClass == null : this.routerClass.equals(that.routerClass))
          && (this.documentRoot == null ? that.documentRoot == null : this.documentRoot.equals(that.documentRoot))
          && (this.resourceRoot == null ? that.resourceRoot == null : this.resourceRoot.equals(that.resourceRoot))
          && this.warpSettings.equals(that.warpSettings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WebServiceDef.hashSeed == 0) {
      WebServiceDef.hashSeed = Murmur3.seed(WebServiceDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(WebServiceDef.hashSeed, Murmur3.hash(this.serviceName)),
        this.address.hashCode()), this.port), Murmur3.hash(this.isSecure)),
        Murmur3.hash(this.spaceName)), Murmur3.hash(this.routerClass)),
        Murmur3.hash(this.documentRoot)), Murmur3.hash(this.resourceRoot)), this.warpSettings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WebServiceDef").write('.')
                   .write(this.isSecure ? "secure" : "standard").write('(').write(')');
    if (!"web".equals(this.serviceName)) {
      output = output.write('.').write("serviceName").write('(').debug(this.serviceName).write(')');
    }
    if (!"0.0.0.0".equals(this.address)) {
      output = output.write('.').write("address").write('(').debug(this.address).write(')');
    }
    if (this.isSecure && this.port != 443 || !this.isSecure && this.port != 80) {
      output = output.write('.').write("port").write('(').debug(this.port).write(')');
    }
    if (this.spaceName != null) {
      output = output.write('.').write("spaceName").write('(').debug(this.spaceName).write(')');
    }
    if (this.routerClass != null) {
      output = output.write('.').write("routerClass").write('(').debug(this.routerClass).write(')');
    }
    if (this.documentRoot != null) {
      output = output.write('.').write("documentRoot").write('(').debug(this.documentRoot).write(')');
    }
    if (this.resourceRoot != null) {
      output = output.write('.').write("resourceRoot").write('(').debug(this.resourceRoot).write(')');
    }
    if (this.warpSettings != WarpSettings.standard()) {
      output = output.write('.').write("warpSettings").write('(').debug(this.warpSettings).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static WebServiceDef standard() {
    return new WebServiceDef("web", "0.0.0.0", 80, false, null, null, null, null, WarpSettings.standard());
  }

  public static WebServiceDef secure() {
    return new WebServiceDef("web", "0.0.0.0", 443, true, null, null, null, null, WarpSettings.standard());
  }

}
