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
import java.util.concurrent.ConcurrentLinkedQueue;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.concurrent.Conts;

/**
 * Adapter from a flow-controlled {@link IpSocket} to a decoder/encoder
 * controlled {@link IpModem}.
 */
public class IpSocketModem<I, O> implements IpSocket, IpModemContext<I, O> {
  final IpModem<I, O> modem;
  final ConcurrentLinkedQueue<Decoder<? extends I>> readerQueue;
  final ConcurrentLinkedQueue<Encoder<?, ? extends O>> writerQueue;
  volatile Decoder<? extends I> reading;
  volatile Encoder<?, ? extends O> writing;
  protected volatile IpSocketContext context;

  public IpSocketModem(IpModem<I, O> modem) {
    this.modem = modem;
    this.readerQueue = new ConcurrentLinkedQueue<Decoder<? extends I>>();
    this.writerQueue = new ConcurrentLinkedQueue<Encoder<?, ? extends O>>();
  }

  @Override
  public IpSocketContext ipSocketContext() {
    return this.context;
  }

  @Override
  public void setIpSocketContext(IpSocketContext context) {
    this.context = context;
    this.modem.setIpModemContext(this);
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
  public IpSettings ipSettings() {
    return this.context.ipSettings();
  }

  @Override
  public <I2 extends I> void read(Decoder<I2> reader) {
    this.readerQueue.add(reader);
    if (this.reading == null) {
      final IpSocketContext context = this.context;
      if (context != null) {
        context.flowControl(FlowModifier.ENABLE_READ);
      }
    }
  }

  @Override
  public <O2 extends O> void write(Encoder<?, O2> writer) {
    this.writerQueue.add(writer);
    if (this.writing == null) {
      final IpSocketContext context = this.context;
      if (context != null) {
        context.flowControl(FlowModifier.ENABLE_WRITE);
      }
    }
  }

  @Override
  public long idleTimeout() {
    return this.modem.idleTimeout();
  }

  @Override
  public void doRead() {
    IpSocketContext context = this.context;
    if (context == null) {
      return;
    }
    InputBuffer inputBuffer = context.inputBuffer();
    Decoder<? extends I> reader = this.reading;
    int oldIndex;
    int newIndex;
    do {
      if (reader != null) {
        do {
          oldIndex = inputBuffer.index();
          inputBuffer = inputBuffer.isPart(true);
          reader = reader.feed(inputBuffer);
          newIndex = inputBuffer.index();
        } while (oldIndex != newIndex && inputBuffer.isCont() && reader.isCont());
        if (reader.isCont()) {
          this.reading = reader;
          break;
        } else if (reader.isDone()) {
          this.modem.didRead(reader.bind());
        } else if (reader.isError()) {
          this.modem.didFail(reader.trap());
        }
      }
      reader = this.readerQueue.poll();
      if (reader != null) {
        this.reading = reader;
      } else {
        this.modem.doRead();
        reader = this.readerQueue.poll();
        this.reading = reader;
        if (reader == null) {
          context = this.context;
          if (context != null) {
            context.flowControl(FlowModifier.DISABLE_READ);
            // Reconcile read flow control race.
            reader = this.readerQueue.poll();
            this.reading = reader;
            if (reader != null) {
              context.flowControl(FlowModifier.ENABLE_READ);
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }
    } while (inputBuffer.isCont());
  }

  @Override
  public void doWrite() {
    Encoder<?, ? extends O> writer = this.writing;
    if (writer == null) {
      writer = this.writerQueue.poll();
      if (writer == null) {
        final IpSocketContext context = this.context;
        if (context != null) {
          context.flowControl(FlowModifier.DISABLE_WRITE);
          // Reconcile write flow control race.
          writer = this.writerQueue.poll();
          this.writing = writer;
          if (writer != null) {
            context.flowControl(FlowModifier.ENABLE_WRITE);
          } else {
            return;
          }
        } else {
          return;
        }
      }
    }
    OutputBuffer<?> outputBuffer = this.context.outputBuffer();
    int oldIndex;
    int newIndex;
    do {
      oldIndex = outputBuffer.index();
      outputBuffer = outputBuffer.isPart(true);
      writer = writer.pull(outputBuffer);
      newIndex = outputBuffer.index();
    } while (oldIndex != newIndex && outputBuffer.isCont() && writer.isCont());
    this.writing = writer;
    if (newIndex == 0) {
      didWrite();
    }
  }

  @Override
  public void didWrite() {
    Encoder<?, ? extends O> writer = this.writing;
    if (!writer.isCont()) {
      if (writer.isDone()) {
        this.modem.didWrite(writer.bind());
      } else if (writer.isError()) {
        this.modem.didFail(writer.trap());
      }
      writer = this.writerQueue.poll();
      if (writer != null) {
        this.writing = writer;
      } else {
        this.modem.doWrite();
        writer = this.writerQueue.poll();
        this.writing = writer;
        if (writer == null) {
          final IpSocketContext context = this.context;
          if (context != null) {
            context.flowControl(FlowModifier.DISABLE_WRITE);
            // Reconcile write flow control race.
            writer = this.writerQueue.poll();
            this.writing = writer;
            if (writer != null) {
              context.flowControl(FlowModifier.ENABLE_WRITE);
            }
          }
        }
      }
    }
  }

  @Override
  public void willConnect() {
    this.modem.willConnect();
  }

  @Override
  public void didConnect() {
    if (this.reading != null) {
      if (this.writing != null) {
        this.context.flowControl(FlowModifier.ENABLE_READ_WRITE);
      } else {
        this.context.flowControl(FlowModifier.DISABLE_WRITE_ENABLE_READ);
      }
    } else if (this.writing != null) {
      this.context.flowControl(FlowModifier.DISABLE_READ_ENABLE_WRITE);
    }
    this.modem.didConnect();
  }

  @Override
  public void willSecure() {
    this.modem.willSecure();
  }

  @Override
  public void didSecure() {
    this.modem.didSecure();
  }

  @Override
  public void willBecome(IpSocket socket) {
    this.modem.willBecome(socket);
  }

  @Override
  public void didBecome(IpSocket socket) {
    this.modem.didBecome(socket);
  }

  @Override
  public void didTimeout() {
    this.modem.didTimeout();
  }

  @Override
  public void didDisconnect() {
    this.context.flowControl(FlowModifier.DISABLE_READ_WRITE);
    Decoder<? extends I> reader = this.reading;
    this.reading = null;
    do {
      if (reader != null) {
        try {
          reader.feed(InputBuffer.done());
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            // swallow
          } else {
            // Rethrow fatal exception.
            throw error;
          }
        }
      }
      reader = this.readerQueue.poll();
    } while (reader != null);
    Encoder<?, ? extends O> writer = this.writing;
    this.writing = null;
    do {
      if (writer != null) {
        try {
          writer.pull(OutputBuffer.done());
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            // swallow
          } else {
            // Rethrow fatal exception.
            throw error;
          }
        }
      }
      writer = this.writerQueue.poll();
    } while (writer != null);
    this.modem.didDisconnect();
    close();
  }

  @Override
  public void didFail(Throwable error) {
    this.modem.didFail(error);
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
  public void become(IpSocket socket) {
    final IpSocketContext context = this.context;
    this.context = null;
    context.become(socket);
  }

  @Override
  public void close() {
    this.context.close();
  }
}
