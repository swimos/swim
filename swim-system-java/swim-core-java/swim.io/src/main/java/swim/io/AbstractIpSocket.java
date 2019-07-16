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
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;

public abstract class AbstractIpSocket implements IpSocket, IpContext, FlowContext {
  protected IpSocketContext context;

  @Override
  public IpSocketContext ipSocketContext() {
    return this.context;
  }

  @Override
  public void setIpSocketContext(IpSocketContext context) {
    this.context = context;
  }

  @Override
  public long idleTimeout() {
    return -1L; // default timeout
  }

  @Override
  public void doRead() {
    // stub
  }

  @Override
  public void doWrite() {
    // stub
  }

  @Override
  public void didWrite() {
    // stub
  }

  @Override
  public void willConnect() {
    // stub
  }

  @Override
  public void didConnect() {
    // stub
  }

  @Override
  public void willSecure() {
    // stub
  }

  @Override
  public void didSecure() {
    // stub
  }

  @Override
  public void willBecome(IpSocket socket) {
    // stub
  }

  @Override
  public void didBecome(IpSocket socket) {
    // stub
  }

  @Override
  public void didTimeout() {
    // stub
  }

  @Override
  public void didDisconnect() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @Override
  public boolean isConnected() {
    return this.context.isConnected();
  }

  @Override
  public boolean isClient() {
    return this.context.isClient();
  }

  @Override
  public boolean isServer() {
    return this.context.isServer();
  }

  @Override
  public boolean isSecure() {
    return this.context.isSecure();
  }

  @Override
  public String securityProtocol() {
    return this.context.securityProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.context.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public Principal localPrincipal() {
    return this.context.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.context.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.context.remoteAddress();
  }

  @Override
  public Principal remotePrincipal() {
    return this.context.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.context.remoteCertificates();
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

  public InputBuffer inputBuffer() {
    return this.context.inputBuffer();
  }

  public OutputBuffer<?> outputBuffer() {
    return this.context.outputBuffer();
  }

  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  public void close() {
    this.context.close();
  }
}
