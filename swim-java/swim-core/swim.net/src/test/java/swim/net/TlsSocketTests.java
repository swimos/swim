// Copyright 2015-2022 Swim.inc
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

package swim.net;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.concurrent.CountDownLatch;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.exec.ThreadScheduler;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class TlsSocketTests {

  @Test
  public void testConnect() {
    final CountDownLatch clientOpenLatch = new CountDownLatch(1);
    final CountDownLatch serverOpenLatch = new CountDownLatch(1);
    final CountDownLatch serverBindLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    driver.setTlsOptions(TlsSocketTests.tlsOptions());
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    final AbstractNetSocket clientSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() {
        clientOpenLatch.countDown();
      }
    };

    final AbstractNetSocket serverSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() {
        serverOpenLatch.countDown();
      }
    };

    final AbstractNetListener serverListener = new AbstractNetListener() {
      @Override
      public void didListen() {
        serverBindLatch.countDown();
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        this.accept(serverSocket);
      }
    };

    try {
      scheduler.start();
      driver.start();

      driver.bindTlsListener(serverListener).listen("127.0.0.1", 53556);
      serverBindLatch.await();
      driver.bindTlsSocket(clientSocket).connect("127.0.0.1", 53556);
      serverOpenLatch.await();
      clientOpenLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  public void testClientConnectError() {
    final CountDownLatch clientCloseLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    driver.setTlsOptions(TlsSocketTests.tlsOptions());
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    final AbstractNetSocket clientSocket = new AbstractNetSocket() {
      @Override
      public void didClose() {
        clientCloseLatch.countDown();
      }
    };

    try {
      scheduler.start();
      driver.start();

      driver.bindTlsSocket(clientSocket).connect("127.0.0.1", 53556);
      clientCloseLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  public void testClientCloseOnConnect() {
    final CountDownLatch clientOpenLatch = new CountDownLatch(1);
    final CountDownLatch clientCloseLatch = new CountDownLatch(1);
    final CountDownLatch serverOpenLatch = new CountDownLatch(1);
    final CountDownLatch serverCloseLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    driver.setTlsOptions(TlsSocketTests.tlsOptions());
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    final AbstractNetSocket clientSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() throws IOException {
        clientOpenLatch.countDown();
        this.doneWriting();
        this.requestRead();
      }

      @Override
      public void doRead() throws IOException {
        this.doneReading();
      }

      @Override
      public void didClose() {
        clientCloseLatch.countDown();
      }
    };

    final AbstractNetSocket serverSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() throws IOException {
        serverOpenLatch.countDown();
        this.requestRead();
      }

      @Override
      public void doRead() throws IOException {
        this.doneReading();
        this.doneWriting();
      }

      @Override
      public void didClose() {
        serverCloseLatch.countDown();
      }
    };

    final AbstractNetListener serverListener = new AbstractNetListener() {
      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        this.accept(serverSocket);
      }
    };

    try {
      scheduler.start();
      driver.start();

      driver.bindTlsListener(serverListener).listen("127.0.0.1", 53556);
      driver.bindTlsSocket(clientSocket).connect("127.0.0.1", 53556);
      clientOpenLatch.await();
      clientCloseLatch.await();
      serverOpenLatch.await();
      serverCloseLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  public void testServerCloseOnConnect() {
    final CountDownLatch clientOpenLatch = new CountDownLatch(1);
    final CountDownLatch clientCloseLatch = new CountDownLatch(1);
    final CountDownLatch serverOpenLatch = new CountDownLatch(1);
    final CountDownLatch serverCloseLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    driver.setTlsOptions(TlsSocketTests.tlsOptions());
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    final AbstractNetSocket clientSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() throws IOException {
        clientOpenLatch.countDown();
        this.requestRead();
      }

      @Override
      public void doRead() throws IOException {
        this.doneReading();
        this.doneWriting();
      }

      @Override
      public void didClose() {
        clientCloseLatch.countDown();
      }
    };

    final AbstractNetSocket serverSocket = new AbstractNetSocket() {
      @Override
      public void didOpen() throws IOException {
        serverOpenLatch.countDown();
        this.doneWriting();
        this.requestRead();
      }

      @Override
      public void doRead() throws IOException {
        this.doneReading();
      }

      @Override
      public void didClose() {
        serverCloseLatch.countDown();
      }
    };

    final AbstractNetListener serverListener = new AbstractNetListener() {
      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        this.accept(serverSocket);
      }
    };

    try {
      scheduler.start();
      driver.start();

      driver.bindTlsListener(serverListener).listen("127.0.0.1", 53556);
      driver.bindTlsSocket(clientSocket).connect("127.0.0.1", 53556);
      clientOpenLatch.await();
      clientCloseLatch.await();
      serverOpenLatch.await();
      serverCloseLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @RepeatedTest(100)
  public void testEcho() {
    final CountDownLatch clientWriteLatch = new CountDownLatch(1);
    final CountDownLatch serverReadLatch = new CountDownLatch(1);
    final CountDownLatch serverWriteLatch = new CountDownLatch(1);
    final CountDownLatch clientReadLatch = new CountDownLatch(1);
    final CountDownLatch clientCloseLatch = new CountDownLatch(1);
    final CountDownLatch serverCloseLatch = new CountDownLatch(1);
    final String payload = "Hello, world!";

    final TransportDriver driver = new TransportDriver();
    driver.setTlsOptions(TlsSocketTests.tlsOptions());
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    final AbstractNetSocket clientSocket = new AbstractNetSocket() {
      @Nullable ByteBuffer writeBuffer;
      @Nullable ByteBuffer readBuffer;

      @Override
      public void didOpen() {
        try {
          this.writeBuffer = ByteBuffer.wrap(payload.getBytes("UTF-8"));
        } catch (UnsupportedEncodingException e) {
        }
        this.readBuffer = ByteBuffer.allocate(16 * 1024);
        this.requestRead();
        this.requestWrite();
      }

      @Override
      public void doRead() throws IOException {
        this.readBuffer = Assume.nonNull(this.readBuffer);
        final int count = this.read(this.readBuffer);
        if (count >= 0) {
          if (count != 0) {
            this.requestWrite();
          }
          this.requestRead();
        } else {
          final String received = new String(this.readBuffer.array(), 0, this.readBuffer.position(), "UTF-8");
          assertEquals(received, payload);
          clientReadLatch.countDown();
          this.doneReading();
        }
      }

      @Override
      public void doWrite() throws IOException {
        this.writeBuffer = Assume.nonNull(this.writeBuffer);
        this.write(this.writeBuffer);
        if (this.writeBuffer.hasRemaining()) {
          this.requestWrite();
        } else {
          clientWriteLatch.countDown();
          this.doneWriting();
        }
      }

      @Override
      public void didClose() throws IOException {
        clientCloseLatch.countDown();
      }
    };

    final AbstractNetSocket serverSocket = new AbstractNetSocket() {
      @Nullable ByteBuffer readBuffer;
      @Nullable ByteBuffer writeBuffer;

      @Override
      public void didOpen() {
        this.readBuffer = ByteBuffer.allocateDirect(16 * 1024);
        this.writeBuffer = ByteBuffer.allocateDirect(16 * 1024);
        this.requestRead();
      }

      @Override
      public void doRead() throws IOException {
        this.readBuffer = Assume.nonNull(this.readBuffer);
        this.writeBuffer = Assume.nonNull(this.writeBuffer);
        final int count = this.read(this.readBuffer);
        if (count >= 0) {
          if (count != 0) {
            this.readBuffer.flip();
            this.writeBuffer.put(this.readBuffer);
            this.writeBuffer.flip();
            this.readBuffer.compact();
            this.requestWrite();
          }
          this.requestRead();
        } else {
          serverReadLatch.countDown();
          this.doneReading();
          this.requestWrite();
        }
      }

      @Override
      public void doWrite() throws IOException {
        this.writeBuffer = Assume.nonNull(this.writeBuffer);
        this.write(this.writeBuffer);
        if (this.writeBuffer.hasRemaining()) {
          this.requestWrite();
        } else if (this.isDoneReading()) {
          serverWriteLatch.countDown();
          this.doneWriting();
        }
      }

      @Override
      public void didClose() throws IOException {
        serverCloseLatch.countDown();
      }
    };

    final AbstractNetListener serverListener = new AbstractNetListener() {
      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        this.accept(serverSocket);
      }
    };

    try {
      scheduler.start();
      driver.start();

      driver.bindTlsListener(serverListener).listen("127.0.0.1", 53556);
      driver.bindTlsSocket(clientSocket).connect("127.0.0.1", 53556);
      clientWriteLatch.await();
      serverReadLatch.await();
      serverWriteLatch.await();
      clientReadLatch.await();
      clientCloseLatch.await();
      serverCloseLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  private static @Nullable TlsOptions tlsOptions;

  public static TlsOptions tlsOptions() {
    if (TlsSocketTests.tlsOptions == null) {
      try {
        final KeyStore keystore = KeyStore.getInstance("jks");
        final InputStream keystoreStream = TlsSocketTests.class.getResourceAsStream("/keystore.jks");
        final char[] keystorePassword = "default".toCharArray();
        try {
          keystore.load(keystoreStream, keystorePassword);
        } finally {
          keystoreStream.close();
        }

        final KeyStore cacerts = KeyStore.getInstance("jks");
        final InputStream cacertsStream = TlsSocketTests.class.getResourceAsStream("/cacerts.jks");
        final char[] cacertsPassword = "default".toCharArray();
        try {
          cacerts.load(cacertsStream, cacertsPassword);
        } finally {
          cacertsStream.close();
        }

        final KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance("SunX509");
        keyManagerFactory.init(keystore, keystorePassword);

        final TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance("SunX509");
        trustManagerFactory.init(cacerts);

        final SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.getTrustManagers(), new SecureRandom());

        TlsSocketTests.tlsOptions = new TlsOptions(sslContext, TlsClientAuth.NONE, null, null);
      } catch (IOException | GeneralSecurityException cause) {
        throw new JUnitException("TLS options failure", cause);
      }
    }
    return TlsSocketTests.tlsOptions;
  }

}
