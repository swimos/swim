// Copyright 2015-2023 Nstream, inc.
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

package swim.api.auth;

import java.net.InetSocketAddress;
import swim.api.policy.PolicyDirective;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.io.IpInterface;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.util.Log;

public abstract class AbstractAuthenticator implements Authenticator, IpInterface, Log {

  protected AuthenticatorContext context;

  public AbstractAuthenticator() {
    // nop
  }

  @Override
  public AuthenticatorContext authenticatorContext() {
    return this.context;
  }

  @Override
  public void setAuthenticatorContext(AuthenticatorContext context) {
    this.context = context;
  }

  public Schedule schedule() {
    return this.context.schedule();
  }

  public Stage stage() {
    return this.context.stage();
  }

  @Override
  public IpSettings ipSettings() {
    return this.context.ipSettings();
  }

  @Override
  public IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.context.bindTcp(localAddress, service, ipSettings);
  }

  @Override
  public IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.context.bindTls(localAddress, service, ipSettings);
  }

  @Override
  public IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.context.connectTcp(remoteAddress, socket, ipSettings);
  }

  @Override
  public IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.context.connectTls(remoteAddress, socket, ipSettings);
  }

  @Override
  public abstract PolicyDirective<Identity> authenticate(Credentials credentials);

  @Override
  public void trace(Object message) {
    this.context.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.context.debug(message);
  }

  @Override
  public void info(Object message) {
    this.context.info(message);
  }

  @Override
  public void warn(Object message) {
    this.context.warn(message);
  }

  @Override
  public void error(Object message) {
    this.context.error(message);
  }

  @Override
  public void fail(Object message) {
    this.context.fail(message);
  }

  @Override
  public void willStart() {
    // hook
  }

  @Override
  public void didStart() {
    // hook
  }

  @Override
  public void willStop() {
    // hook
  }

  @Override
  public void didStop() {
    // hook
  }

  @Override
  public void didFail(Throwable error) {
    // hook
  }

}
