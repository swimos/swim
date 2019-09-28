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

package swim.service;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.policy.Policy;
import swim.api.service.Service;
import swim.api.service.ServiceContext;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.kernel.KernelContext;
import swim.runtime.ServiceAddress;
import swim.util.Log;

public class ServicePort implements ServiceContext {
  protected final String serviceName;
  protected final KernelContext kernel;
  protected Service service;
  protected volatile int status;

  protected Log log;
  protected Policy policy;
  protected Stage stage;

  public ServicePort(String serviceName, KernelContext kernel) {
    this.serviceName = serviceName;
    this.kernel = kernel;
  }

  public final String serviceName() {
    return this.serviceName;
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

  public final Service service() {
    return this.service;
  }

  public void setService(Service service) {
    this.service = service;
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
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | STARTED;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & STARTED) == 0) {
      willStart();
      didStart();
    }
  }

  public void stop() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~STARTED;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & STARTED) != 0) {
      willStop();
      didStop();
    }
  }

  @Override
  public void close() {
    // TODO
  }

  protected void willStart() {
    final ServiceAddress serviceAddress = new ServiceAddress(this.serviceName);
    this.log = this.kernel.createLog(serviceAddress);
    this.policy = this.kernel.createPolicy(serviceAddress);
    this.stage = this.kernel.createStage(serviceAddress);
    this.service.willStart();
  }

  protected void didStart() {
    this.service.didStart();
  }

  protected void willStop() {
    this.service.willStop();
  }

  protected void didStop() {
    this.service.didStop();
    final Stage stage = this.stage;
    if (stage instanceof MainStage) {
      ((MainStage) stage).stop();
    }
    this.stage = null;
    this.policy = null;
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

  protected static final AtomicIntegerFieldUpdater<ServicePort> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(ServicePort.class, "status");
}
