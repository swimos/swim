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

package swim.io;

import java.net.InetSocketAddress;

public abstract class AbstractIpService implements IpService, FlowContext {
  protected IpServiceContext context;

  @Override
  public IpServiceContext ipServiceContext() {
    return this.context;
  }

  @Override
  public void setIpServiceContext(IpServiceContext context) {
    this.context = context;
  }

  @SuppressWarnings("unchecked")
  @Override
  public IpSocket createSocket() {
    final IpModem<?, ?> modem = createModem();
    if (modem != null) {
      return new IpSocketModem<Object, Object>((IpModem<Object, Object>) modem);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  public IpModem<?, ?> createModem() {
    return null;
  }

  @Override
  public void didBind() {
    // stub
  }

  @Override
  public void didAccept(IpSocket socket) {
    // stub
  }

  @Override
  public void didUnbind() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  public IpSettings ipSettings() {
    return this.context.ipSettings();
  }

  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  public void unbind() {
    this.context.unbind();
  }
}
