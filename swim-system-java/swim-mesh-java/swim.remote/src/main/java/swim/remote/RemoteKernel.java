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

package swim.remote;

import swim.io.IpInterface;
import swim.io.http.HttpSettings;
import swim.io.warp.WarpSettings;
import swim.io.ws.WsSettings;
import swim.kernel.KernelProxy;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.PartBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class RemoteKernel extends KernelProxy {
  final double kernelPriority;
  WarpSettings warpSettings;

  public RemoteKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public RemoteKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  public HttpSettings httpSettings() {
    return HttpSettings.from(ipSettings());
  }

  public WsSettings wsSettings() {
    return WsSettings.from(httpSettings());
  }

  public final WarpSettings warpSettings() {
    if (this.warpSettings == null) {
      this.warpSettings = WarpSettings.from(wsSettings()); // TODO: use moduleConfig
    }
    return this.warpSettings;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    if (hostAddress.hostUri().host().isDefined() && !"swim".equals(hostAddress.partKey().stringValue(null))) {
      final IpInterface endpoint = kernelWrapper().unwrapKernel(IpInterface.class);
      return new RemoteHostClient(hostAddress.hostUri(), endpoint, warpSettings());
    }
    return super.createHost(hostAddress);
  }

  @Override
  public HostBinding createHost(PartBinding part, HostDef hostDef) {
    final Uri hostUri = hostDef.hostUri();
    if (hostUri != null && hostUri.host().isDefined() && !"swim".equals(part.partKey().stringValue(null))) {
      final IpInterface endpoint = kernelWrapper().unwrapKernel(IpInterface.class);
      return new RemoteHostClient(hostUri, endpoint, warpSettings());
    }
    return super.createHost(part, hostDef);
  }

  private static final double KERNEL_PRIORITY = 0.25;

  public static RemoteKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || RemoteKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new RemoteKernel(kernelPriority);
    }
    return null;
  }
}
