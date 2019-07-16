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
import swim.io.FlowContext;
import swim.io.FlowControl;
import swim.io.FlowModifier;

public abstract class AbstractMqttService implements MqttService, FlowContext {
  protected MqttServiceContext context;

  @Override
  public MqttServiceContext mqttServiceContext() {
    return this.context;
  }

  @Override
  public void setMqttServiceContext(MqttServiceContext context) {
    this.context = context;
  }

  @Override
  public abstract MqttSocket<?, ?> createSocket();

  @Override
  public void didBind() {
    // stub
  }

  @Override
  public void didAccept(MqttSocket<?, ?> socket) {
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

  public MqttSettings mqttSettings() {
    return this.context.mqttSettings();
  }

  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  public void unbind() {
    this.context.unbind();
  }
}
