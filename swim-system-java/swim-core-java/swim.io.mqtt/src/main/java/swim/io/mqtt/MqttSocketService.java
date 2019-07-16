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

package swim.io.mqtt;

import java.net.InetSocketAddress;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpService;
import swim.io.IpServiceContext;
import swim.io.IpSocket;
import swim.io.IpSocketModem;

public class MqttSocketService implements IpService, MqttServiceContext {
  protected final MqttService service;
  protected final MqttSettings mqttSettings;
  protected IpServiceContext context;

  public MqttSocketService(MqttService service, MqttSettings mqttSettings) {
    this.service = service;
    this.mqttSettings = mqttSettings;
  }

  @Override
  public IpServiceContext ipServiceContext() {
    return this.context;
  }

  @Override
  public void setIpServiceContext(IpServiceContext context) {
    this.context = context;
    this.service.setMqttServiceContext(this);
  }

  @Override
  public IpSocket createSocket() {
    final MqttSocket<?, ?> socket = this.service.createSocket();
    final MqttSocketModem<?, ?> modem = new MqttSocketModem<>(socket, mqttSettings);
    return new IpSocketModem<>(modem);
  }

  @Override
  public void didBind() {
    this.service.didBind();
  }

  @Override
  public void didAccept(IpSocket socket) {
    if (socket instanceof MqttSocketModem) {
      this.service.didAccept(((MqttSocketModem) socket).socket);
    }
  }

  @Override
  public void didUnbind() {
    this.service.didUnbind();
  }

  @Override
  public void didFail(Throwable error) {
    this.service.didFail(error);
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

  @Override
  public MqttSettings mqttSettings() {
    return this.mqttSettings;
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public void unbind() {
    this.context.unbind();
  }
}
