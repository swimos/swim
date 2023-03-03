// Copyright 2015-2023 Swim.inc
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
import swim.structure.Value;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostDef;
import swim.system.PartBinding;
import swim.uri.Uri;

public class RemoteKernel extends KernelProxy {

  final double kernelPriority;
  WarpSettings warpSettings;
  boolean autoClose = false;

  public RemoteKernel(double kernelPriority, WarpSettings warpSettings) {
    this.kernelPriority = kernelPriority;
    this.warpSettings = warpSettings;
  }

  public RemoteKernel(double kernelPriority) {
    this(kernelPriority, null);
  }

  public RemoteKernel() {
    this(RemoteKernel.KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  public HttpSettings httpSettings() {
    return HttpSettings.create(this.ipSettings());
  }

  public WsSettings wsSettings() {
    return WsSettings.create(this.httpSettings());
  }

  public final WarpSettings warpSettings() {
    if (this.warpSettings == null) {
      this.warpSettings = WarpSettings.create(this.wsSettings());
    }
    return this.warpSettings;
  }

  public void setAutoClose(boolean autoClose) {
    this.autoClose = autoClose;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    if (hostAddress.hostUri().host().isDefined() && !"swim".equals(hostAddress.partKey().stringValue(null))) {
      final IpInterface endpoint = this.kernelWrapper().unwrapKernel(IpInterface.class);
      RemoteHostClient client = new RemoteHostClient(hostAddress.hostUri(), endpoint, this.warpSettings());
      client.setAutoClose(this.autoClose);
      return client;
    }
    return super.createHost(hostAddress);
  }

  @Override
  public HostBinding createHost(PartBinding part, HostDef hostDef) {
    final Uri hostUri = hostDef.hostUri();
    if (hostUri != null && hostUri.host().isDefined() && !"swim".equals(part.partKey().stringValue(null))) {
      final IpInterface endpoint = this.kernelWrapper().unwrapKernel(IpInterface.class);
      RemoteHostClient client = new RemoteHostClient(hostUri, endpoint, this.warpSettings());
      client.setAutoClose(autoClose);
      return client;
    }
    return super.createHost(part, hostDef);
  }

  private static final double KERNEL_PRIORITY = 0.25;

  public static RemoteKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || RemoteKernel.class.getName().equals(kernelClassName)) {
      Thread.dumpStack();
      final double kernelPriority = header.get("priority").doubleValue(RemoteKernel.KERNEL_PRIORITY);
      final WarpSettings warpSettings = WarpSettings.form().cast(moduleConfig);
      return new RemoteKernel(kernelPriority, warpSettings);
    }
    return null;
  }

}
