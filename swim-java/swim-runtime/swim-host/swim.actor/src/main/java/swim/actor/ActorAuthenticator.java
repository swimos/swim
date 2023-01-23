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

package swim.actor;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.auth.Authenticator;
import swim.api.auth.AuthenticatorContext;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.kernel.KernelContext;
import swim.system.AuthenticatorAddress;
import swim.util.Log;

public class ActorAuthenticator implements AuthenticatorContext {

  final String authenticatorName;
  final KernelContext kernel;
  Authenticator authenticator;
  volatile int status;
  Log log;
  Stage stage;

  public ActorAuthenticator(String authenticatorName, Authenticator authenticator, KernelContext kernel) {
    this.authenticatorName = authenticatorName;
    this.kernel = kernel;
    this.authenticator = authenticator;
    this.status = 0;
    this.log = null;
    this.stage = null;
    this.authenticator.setAuthenticatorContext(this);
    this.start();
  }

  public final String authenticatorName() {
    return this.authenticatorName;
  }

  @Override
  public Schedule schedule() {
    return this.stage;
  }

  @Override
  public final Stage stage() {
    return this.stage;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final Authenticator authenticator() {
    return this.authenticator;
  }

  @Override
  public IpSettings ipSettings() {
    return this.kernel.ipSettings();
  }

  @Override
  public IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.kernel.bindTcp(localAddress, service, ipSettings);
  }

  @Override
  public IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.kernel.bindTls(localAddress, service, ipSettings);
  }

  @Override
  public IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.kernel.connectTcp(remoteAddress, socket, ipSettings);
  }

  @Override
  public IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.kernel.connectTls(remoteAddress, socket, ipSettings);
  }

  public void start() {
    do {
      final int oldStatus = ActorAuthenticator.STATUS.get(this);
      final int newStatus = oldStatus | ActorAuthenticator.STARTED;
      if (ActorAuthenticator.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        this.willStart();
        this.didStart();
        break;
      }
    } while (true);
  }

  public void stop() {
    do {
      final int oldStatus = ActorAuthenticator.STATUS.get(this);
      final int newStatus = oldStatus & ~ActorAuthenticator.STARTED;
      if (ActorAuthenticator.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        this.willStop();
        this.didStop();
        break;
      }
    } while (true);
  }

  protected void willStart() {
    final AuthenticatorAddress authenticatorAddress = new AuthenticatorAddress(this.authenticatorName);
    this.log = this.kernel.createLog(authenticatorAddress);
    this.stage = this.kernel.createStage(authenticatorAddress);
    this.authenticator.willStart();
  }

  protected void didStart() {
    this.authenticator.didStart();
  }

  protected void willStop() {
    this.authenticator.willStop();
  }

  protected void didStop() {
    this.authenticator.didStop();
    final Stage stage = this.stage;
    if (stage instanceof MainStage) {
      ((MainStage) stage).stop();
    }
    this.stage = null;
    this.log = null;
  }

  @Override
  public void trace(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.trace(message);
    } else {
      this.kernel.trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.debug(message);
    } else {
      this.kernel.debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.info(message);
    } else {
      this.kernel.info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.warn(message);
    } else {
      this.kernel.warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.error(message);
    } else {
      this.kernel.error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.fail(message);
    } else {
      this.kernel.fail(message);
    }
  }

  protected static final int STARTED = 0x01;

  protected static final AtomicIntegerFieldUpdater<ActorAuthenticator> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(ActorAuthenticator.class, "status");

}
